-- =====================================================================
-- MIGRAÇÃO 001 v2: Expansão do Módulo de Projetos Solares
-- Data: 2026-06-07  |  Versão corrigida (fix: type cast error 42804)
--
-- ESTRATÉGIA CORRETA PARA ALTERAR ENUM NO POSTGRESQL:
--   1. Converter coluna para TEXT (libera qualquer valor)
--   2. Fazer UPDATE com os novos nomes em TEXT
--   3. DROP TYPE CASCADE no ENUM antigo
--   4. CREATE TYPE com o novo ENUM completo
--   5. Reconverter colunas para o novo ENUM
--
-- INSTRUÇÃO: Execute no SQL Editor do Supabase Dashboard.
-- =====================================================================


-- =====================================================================
-- PARTE 1: PREPARAR projetos_solares PARA MIGRAÇÃO DE ENUM
-- =====================================================================

-- 1a. Remover o DEFAULT da coluna (depende do tipo antigo)
ALTER TABLE public.projetos_solares
    ALTER COLUMN etapa_atual DROP DEFAULT;

-- 1b. Converter etapa_atual para TEXT (remove vínculo com ENUM antigo)
ALTER TABLE public.projetos_solares
    ALTER COLUMN etapa_atual TYPE TEXT
    USING etapa_atual::text;

-- 1c. Mapear nomes antigos → novos (agora é TEXT, sem restrição de tipo)
UPDATE public.projetos_solares
SET etapa_atual = CASE etapa_atual
    WHEN 'suprimentos'  THEN 'suprimentos_faturamento'
    WHEN 'logistica'    THEN 'logistica_entrega'
    WHEN 'instalacao'   THEN 'instalacao_fisica'
    WHEN 'homologacao'  THEN 'solicitacao_vistoria'
    ELSE etapa_atual
END;


-- =====================================================================
-- PARTE 2: PREPARAR historico_projetos PARA MIGRAÇÃO DE ENUM
-- =====================================================================

-- 2a. Converter etapa_nova e etapa_anterior para TEXT
ALTER TABLE public.historico_projetos
    ALTER COLUMN etapa_nova TYPE TEXT
    USING etapa_nova::text;

ALTER TABLE public.historico_projetos
    ALTER COLUMN etapa_anterior TYPE TEXT
    USING etapa_anterior::text;

-- 2b. Mapear nomes antigos → novos em historico_projetos (etapa_nova)
UPDATE public.historico_projetos
SET etapa_nova = CASE etapa_nova
    WHEN 'suprimentos'  THEN 'suprimentos_faturamento'
    WHEN 'logistica'    THEN 'logistica_entrega'
    WHEN 'instalacao'   THEN 'instalacao_fisica'
    WHEN 'homologacao'  THEN 'solicitacao_vistoria'
    ELSE etapa_nova
END;

-- 2c. Mapear nomes antigos → novos em historico_projetos (etapa_anterior)
UPDATE public.historico_projetos
SET etapa_anterior = CASE etapa_anterior
    WHEN 'suprimentos'  THEN 'suprimentos_faturamento'
    WHEN 'logistica'    THEN 'logistica_entrega'
    WHEN 'instalacao'   THEN 'instalacao_fisica'
    WHEN 'homologacao'  THEN 'solicitacao_vistoria'
    ELSE etapa_anterior
END
WHERE etapa_anterior IS NOT NULL;


-- =====================================================================
-- PARTE 3: RECRIAR O ENUM COMPLETO COM 11 ETAPAS
-- =====================================================================

-- 3a. Remover o ENUM antigo (CASCADE remove qualquer vínculo residual)
DROP TYPE IF EXISTS public.etapa_projeto CASCADE;

-- 3b. Criar o novo ENUM com os 11 estágios na ordem correta
CREATE TYPE public.etapa_projeto AS ENUM (
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


-- =====================================================================
-- PARTE 4: RECONVERTER COLUNAS PARA O NOVO ENUM
-- =====================================================================

-- 4a. projetos_solares.etapa_atual → novo ENUM
ALTER TABLE public.projetos_solares
    ALTER COLUMN etapa_atual TYPE public.etapa_projeto
    USING etapa_atual::public.etapa_projeto;

-- 4b. Restaurar o DEFAULT com o novo tipo
ALTER TABLE public.projetos_solares
    ALTER COLUMN etapa_atual SET DEFAULT 'assinatura_financiamento'::public.etapa_projeto;

-- 4c. historico_projetos.etapa_nova → novo ENUM
ALTER TABLE public.historico_projetos
    ALTER COLUMN etapa_nova TYPE public.etapa_projeto
    USING etapa_nova::public.etapa_projeto;

-- 4d. historico_projetos.etapa_anterior → novo ENUM (nullable)
ALTER TABLE public.historico_projetos
    ALTER COLUMN etapa_anterior TYPE public.etapa_projeto
    USING etapa_anterior::public.etapa_projeto;


-- =====================================================================
-- PARTE 5: ADICIONAR NOVOS CAMPOS GERENCIAIS À TABELA projetos_solares
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

-- Backfill: usar data_inicio existente como valor inicial
UPDATE public.projetos_solares
SET data_inicio_obra = data_inicio
WHERE data_inicio_obra IS NULL AND data_inicio IS NOT NULL;


-- =====================================================================
-- PARTE 6: ATUALIZAR TRIGGER DE CRIAÇÃO AUTOMÁTICA DE PROJETOS
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
-- PARTE 7: ATUALIZAR TRIGGER DE LOG DE HISTÓRICO
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
            COALESCE('Transicionado para: ' || NEW.etapa_atual::text || '. Próxima ação: ' || NEW.proxima_acao, 'Mudança de etapa.')
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================================
-- PARTE 8: COMENTÁRIOS DE DOCUMENTAÇÃO
-- =====================================================================

COMMENT ON COLUMN public.projetos_solares.responsavel_nome  IS 'Nome do membro da equipe responsável pela próxima ação na etapa atual.';
COMMENT ON COLUMN public.projetos_solares.status_financeiro IS 'Status de aprovação financeira: Pendente, Aprovado ou Liberado.';
COMMENT ON COLUMN public.projetos_solares.concessionaria    IS 'Nome da distribuidora/concessionária de energia (ex: Celesc, Cemig, CPFL).';
COMMENT ON COLUMN public.projetos_solares.data_inicio_obra  IS 'Data em que o negócio foi fechado no CRM, marcando o início oficial da obra.';


-- =====================================================================
-- VERIFICAÇÃO FINAL
-- Execute para confirmar as colunas da tabela:
--
-- SELECT column_name, data_type, udt_name, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'projetos_solares'
-- ORDER BY ordinal_position;
--
-- SELECT enum_range(NULL::etapa_projeto);
-- =====================================================================
