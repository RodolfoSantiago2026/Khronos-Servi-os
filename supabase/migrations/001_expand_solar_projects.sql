-- =====================================================================
-- MIGRAÇÃO 001: Expansão do Módulo de Projetos Solares
-- Data: 2026-06-07
-- Descrição: Adiciona novos campos gerenciais, atualiza ENUM de etapas
--            para 11 estágios e atualiza triggers relacionados.
-- 
-- INSTRUÇÃO: Execute este script no SQL Editor do Supabase Dashboard.
-- =====================================================================


-- =====================================================================
-- PARTE 1: ATUALIZAR O ENUM DE ETAPAS (etapa_projeto)
--
-- PostgreSQL não permite reordenar/renomear valores de um ENUM diretamente.
-- Estratégia:
--   1. Criar novo ENUM etapa_projeto_v2 com todos os 11 valores
--   2. Mapear/atualizar valores existentes na coluna etapa_atual
--   3. Alterar a coluna para o novo ENUM
--   4. Remover ENUM antigo e renomear o novo
-- =====================================================================

-- Passo 1: Criar o novo ENUM com os 11 estágios na ordem correta
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'etapa_projeto_v2') THEN
        CREATE TYPE public.etapa_projeto_v2 AS ENUM (
            'assinatura_financiamento',
            'visita_tecnica',
            'adequacao_padrao',
            'projeto_engenharia',
            'aprovacao_concessionaria',
            'suprimentos_faturamento',
            'logistica_entrega',
            'instalacao_fisica',
            'solicitacao_vistoria',
            'troca_medidor',
            'startup_pos_venda'
        );
    END IF;
END$$;

-- Passo 2: Remover defaults temporariamente (se existirem) para permitir ALTER COLUMN
ALTER TABLE public.projetos_solares
    ALTER COLUMN etapa_atual DROP DEFAULT;

-- Passo 3: Mapear valores antigos → novos antes de alterar o tipo
-- (suprimentos → suprimentos_faturamento, logistica → logistica_entrega,
--  instalacao → instalacao_fisica, homologacao → solicitacao_vistoria)
UPDATE public.projetos_solares
SET etapa_atual = CASE etapa_atual::text
    WHEN 'suprimentos'  THEN 'suprimentos_faturamento'
    WHEN 'logistica'    THEN 'logistica_entrega'
    WHEN 'instalacao'   THEN 'instalacao_fisica'
    WHEN 'homologacao'  THEN 'solicitacao_vistoria'
    ELSE etapa_atual::text
END;

-- Passo 4: Alterar o tipo da coluna para o novo ENUM usando CAST via texto
ALTER TABLE public.projetos_solares
    ALTER COLUMN etapa_atual TYPE public.etapa_projeto_v2
    USING etapa_atual::text::public.etapa_projeto_v2;

-- Passo 5: Restaurar o DEFAULT com o novo ENUM
ALTER TABLE public.projetos_solares
    ALTER COLUMN etapa_atual SET DEFAULT 'assinatura_financiamento'::public.etapa_projeto_v2;

-- Passo 6: Remover o ENUM antigo e renomear o novo
DROP TYPE IF EXISTS public.etapa_projeto;
ALTER TYPE public.etapa_projeto_v2 RENAME TO etapa_projeto;

-- Fazer o mesmo para historico_projetos (etapa_anterior e etapa_nova)
-- Criar novo ENUM temporário para o histórico
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'etapa_projeto_v3') THEN
        CREATE TYPE public.etapa_projeto_v3 AS ENUM (
            'assinatura_financiamento',
            'visita_tecnica',
            'adequacao_padrao',
            'projeto_engenharia',
            'aprovacao_concessionaria',
            'suprimentos_faturamento',
            'logistica_entrega',
            'instalacao_fisica',
            'solicitacao_vistoria',
            'troca_medidor',
            'startup_pos_venda'
        );
    END IF;
END$$;

-- Atualizar historico_projetos: etapa_nova
UPDATE public.historico_projetos
SET etapa_nova = CASE etapa_nova::text
    WHEN 'suprimentos'  THEN 'suprimentos_faturamento'
    WHEN 'logistica'    THEN 'logistica_entrega'
    WHEN 'instalacao'   THEN 'instalacao_fisica'
    WHEN 'homologacao'  THEN 'solicitacao_vistoria'
    ELSE etapa_nova::text
END;

-- Atualizar historico_projetos: etapa_anterior (nullable)
UPDATE public.historico_projetos
SET etapa_anterior = CASE etapa_anterior::text
    WHEN 'suprimentos'  THEN 'suprimentos_faturamento'
    WHEN 'logistica'    THEN 'logistica_entrega'
    WHEN 'instalacao'   THEN 'instalacao_fisica'
    WHEN 'homologacao'  THEN 'solicitacao_vistoria'
    ELSE etapa_anterior::text
END
WHERE etapa_anterior IS NOT NULL;

ALTER TABLE public.historico_projetos
    ALTER COLUMN etapa_nova TYPE public.etapa_projeto
    USING etapa_nova::text::public.etapa_projeto;

ALTER TABLE public.historico_projetos
    ALTER COLUMN etapa_anterior TYPE public.etapa_projeto
    USING etapa_anterior::text::public.etapa_projeto;

DROP TYPE IF EXISTS public.etapa_projeto_v3;


-- =====================================================================
-- PARTE 2: ADICIONAR NOVOS CAMPOS GERENCIAIS À TABELA projetos_solares
-- =====================================================================

-- Responsável pela próxima ação
ALTER TABLE public.projetos_solares
    ADD COLUMN IF NOT EXISTS responsavel_nome VARCHAR(255);

-- Status financeiro (com constraint de valores válidos)
ALTER TABLE public.projetos_solares
    ADD COLUMN IF NOT EXISTS status_financeiro VARCHAR(20) DEFAULT 'Pendente'
    CHECK (status_financeiro IN ('Pendente', 'Aprovado', 'Liberado'));

-- Nome da concessionária de energia
ALTER TABLE public.projetos_solares
    ADD COLUMN IF NOT EXISTS concessionaria VARCHAR(100);

-- Data de início da obra (quando o negócio foi fechado no CRM)
ALTER TABLE public.projetos_solares
    ADD COLUMN IF NOT EXISTS data_inicio_obra TIMESTAMPTZ;

-- Backfill: usar data_inicio existente como valor inicial para data_inicio_obra
UPDATE public.projetos_solares
SET data_inicio_obra = data_inicio
WHERE data_inicio_obra IS NULL AND data_inicio IS NOT NULL;


-- =====================================================================
-- PARTE 3: ATUALIZAR TRIGGER DE CRIAÇÃO AUTOMÁTICA DE PROJETOS
-- Inclui data_inicio_obra = now() na criação automática por lead ganho
-- =====================================================================

CREATE OR REPLACE FUNCTION public.handle_lead_won_auto_project()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status IN ('Negócio Fechado', 'Pago', 'Concluído'))
       AND (OLD.status IS DISTINCT FROM NEW.status OR OLD.status IS NULL) THEN

        INSERT INTO public.projetos_solares (
            lead_id,
            etapa_atual,
            proxima_acao,
            data_limite_etapa,
            data_inicio_obra
        )
        VALUES (
            NEW.id,
            'assinatura_financiamento',
            'Validar documentação do contrato e assinatura',
            now() + INTERVAL '7 days',
            now()
        )
        ON CONFLICT (lead_id) DO NOTHING;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================================
-- PARTE 4: ATUALIZAR TRIGGER DE LOG DE HISTÓRICO
-- Inclui referência ao novo ENUM atualizado
-- =====================================================================

CREATE OR REPLACE FUNCTION public.log_projeto_etapa_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.historico_projetos (
            projeto_id,
            etapa_anterior,
            etapa_nova,
            anotacao
        )
        VALUES (
            NEW.id,
            NULL,
            NEW.etapa_atual,
            'Projeto solar iniciado automaticamente pelo CRM.'
        );
    ELSIF TG_OP = 'UPDATE' AND OLD.etapa_atual IS DISTINCT FROM NEW.etapa_atual THEN
        INSERT INTO public.historico_projetos (
            projeto_id,
            etapa_anterior,
            etapa_nova,
            anotacao
        )
        VALUES (
            NEW.id,
            OLD.etapa_atual,
            NEW.etapa_atual,
            COALESCE('Transicionado para a etapa: ' || NEW.etapa_atual::text || '. Próxima ação: ' || NEW.proxima_acao, 'Mudança de etapa.')
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================================
-- PARTE 5: COMENTÁRIOS DE DOCUMENTAÇÃO NAS NOVAS COLUNAS
-- =====================================================================

COMMENT ON COLUMN public.projetos_solares.responsavel_nome IS 'Nome do membro da equipe responsável pela próxima ação na etapa atual.';
COMMENT ON COLUMN public.projetos_solares.status_financeiro IS 'Status de aprovação financeira do projeto: Pendente, Aprovado ou Liberado.';
COMMENT ON COLUMN public.projetos_solares.concessionaria IS 'Nome da distribuidora/concessionária de energia (ex: Celesc, Cemig, CPFL).';
COMMENT ON COLUMN public.projetos_solares.data_inicio_obra IS 'Data e hora em que o negócio foi fechado/ganho no CRM, marcando o início oficial da obra.';

-- =====================================================================
-- FIM DA MIGRAÇÃO
-- Verificação: SELECT column_name, data_type FROM information_schema.columns
--              WHERE table_name = 'projetos_solares' ORDER BY ordinal_position;
-- =====================================================================
