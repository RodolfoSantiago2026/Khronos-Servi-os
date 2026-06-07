-- Schema SQL para a tabela de Leads do Hubly Serviços

-- Tabela principal de leads
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    nome VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    localizacao VARCHAR(255) NOT NULL,
    servico VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em Atendimento', 'Concluído', 'Pago', 'Perdido', 'Negócio Fechado')),
    perda_estimada NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    valor_fechado NUMERIC(12, 2),
    observacoes TEXT,
    email VARCHAR(255),
    cep VARCHAR(20),
    concessionaria VARCHAR(100),
    valor_conta NUMERIC(12, 2),
    valor_proposta NUMERIC(12, 2) DEFAULT 0.00,
    sistema_kwp NUMERIC(12, 2) DEFAULT 0.00,
    temperatura VARCHAR(20) DEFAULT 'Morno' CHECK (temperatura IN ('Frio', 'Morno', 'Quente')),
    motivo_perda VARCHAR(255),
    data_proximo_contato DATE,
    origem VARCHAR(100) DEFAULT 'Landing Page'
);

-- Comentários da tabela para documentação no Supabase
COMMENT ON TABLE public.leads IS 'Tabela que armazena os leads capturados pelas Landing Pages e Calculadora Solar.';
COMMENT ON COLUMN public.leads.perda_estimada IS 'Perda financeira anual estimada em reais para o cliente devido à sujeira nas placas.';
COMMENT ON COLUMN public.leads.valor_fechado IS 'Valor real fechado após negociação do serviço.';

-- Índices para otimização de busca e ordenação no CRM
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_status_idx ON public.leads (status);

-- Habilitar Row Level Security (RLS) no Supabase
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Seguro (RLS Policies)

-- 1. Qualquer usuário anônimo (cliente acessando o site) pode registrar novos leads
CREATE POLICY "Permitir inserções públicas de novos leads" ON public.leads
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- 2. Somente administradores autenticados podem ver ou modificar registros de leads
CREATE POLICY "Permitir leitura/escrita total apenas para autenticados" ON public.leads
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Tabela de Configurações do Site (CMS)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL
);

COMMENT ON TABLE public.site_settings IS 'Tabela que armazena os conteúdos editáveis do site (Hero, Serviços, Depoimentos, etc).';

-- Habilitar RLS para site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso para site_settings
CREATE POLICY "Permitir leitura pública de configurações" ON public.site_settings
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Permitir escrita/leitura total de configurações para autenticados" ON public.site_settings
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Configuração do Bucket de Armazenamento para Fotos (site-assets)
-- Nota: A criação de buckets e políticas de storage também pode ser feita via painel do Supabase.
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso para o bucket site-assets
CREATE POLICY "Permitir leitura pública de assets" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'site-assets');

CREATE POLICY "Permitir escrita de assets para autenticados" ON storage.objects
    FOR ALL TO authenticated
    WITH CHECK (bucket_id = 'site-assets');


-- Tabela de Credenciais de Acesso do Administrador
CREATE TABLE IF NOT EXISTS public.admin_auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.admin_auth IS 'Tabela que armazena o e-mail mestre e senha do administrador (acesso restrito).';

-- Habilitar RLS para admin_auth
ALTER TABLE public.admin_auth ENABLE ROW LEVEL SECURITY;

-- Nota: Não criamos nenhuma política pública de SELECT.
-- Apenas administradores autenticados podem ver ou atualizar (via service role no backend).

-- Inserir as credenciais padrão do administrador (rodolfo@khronos.com.br / rod223344)
INSERT INTO public.admin_auth (email, password)
VALUES ('rodolfo@khronos.com.br', 'rod223344')
ON CONFLICT (email) DO NOTHING;


-- =====================================================================
-- SEÇÃO ADICIONADA: MÓDULO DE PROJETOS SOLARES E AUTOMACÃO
-- =====================================================================

-- 1. Criar ENUM para as Etapas do Projeto
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'etapa_projeto') THEN
        CREATE TYPE public.etapa_projeto AS ENUM (
            'assinatura_financiamento',
            'visita_tecnica',
            'projeto_engenharia',
            'aprovacao_concessionaria',
            'suprimentos',
            'logistica',
            'instalacao',
            'homologacao',
            'startup_pos_venda'
        );
    END IF;
END$$;

-- 2. Criar a Tabela de Projetos Solares
CREATE TABLE IF NOT EXISTS public.projetos_solares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL UNIQUE,
    etapa_atual public.etapa_projeto NOT NULL DEFAULT 'assinatura_financiamento',
    proxima_acao TEXT NOT NULL DEFAULT 'Validar documentação do contrato e assinatura',
    data_inicio TIMESTAMPTZ NOT NULL DEFAULT now(),
    data_limite_etapa TIMESTAMPTZ,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_projetos_solares_lead 
        FOREIGN KEY (lead_id) 
        REFERENCES public.leads(id) 
        ON DELETE RESTRICT
);

COMMENT ON TABLE public.projetos_solares IS 'Tabela que gerencia o fluxo pós-venda de projetos solares integrados aos leads.';

-- 3. Criar a Tabela de Histórico de Projetos (Logs de Auditoria e Anotações)
CREATE TABLE IF NOT EXISTS public.historico_projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID NOT NULL,
    etapa_anterior public.etapa_projeto,
    etapa_nova public.etapa_projeto NOT NULL,
    anotacao TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_historico_projetos_projeto 
        FOREIGN KEY (projeto_id) 
        REFERENCES public.projetos_solares(id) 
        ON DELETE CASCADE
);

COMMENT ON TABLE public.historico_projetos IS 'Tabela de log de auditoria cronológica das mudanças de etapas e notas dos projetos.';

-- 4. Otimização e Índices
CREATE INDEX IF NOT EXISTS projetos_solares_etapa_atual_idx ON public.projetos_solares (etapa_atual);
CREATE INDEX IF NOT EXISTS projetos_solares_data_limite_etapa_idx ON public.projetos_solares (data_limite_etapa) WHERE data_limite_etapa IS NOT NULL;
CREATE INDEX IF NOT EXISTS historico_projetos_projeto_id_idx ON public.historico_projetos (projeto_id);
CREATE INDEX IF NOT EXISTS historico_projetos_criado_em_desc_idx ON public.historico_projetos (criado_em DESC);

-- 5. Habilitar RLS para novas tabelas
ALTER TABLE public.projetos_solares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_projetos ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de RLS
DROP POLICY IF EXISTS "Permitir acesso completo a projetos para autenticados" ON public.projetos_solares;
CREATE POLICY "Permitir acesso completo a projetos para autenticados" 
    ON public.projetos_solares FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso completo a histórico para autenticados" ON public.historico_projetos;
CREATE POLICY "Permitir acesso completo a histórico para autenticados" 
    ON public.historico_projetos FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- 7. Trigger para atualização da coluna atualizado_em
CREATE OR REPLACE FUNCTION public.set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_projetos_solares_atualizado_em ON public.projetos_solares;
CREATE TRIGGER trg_projetos_solares_atualizado_em
    BEFORE UPDATE ON public.projetos_solares
    FOR EACH ROW
    EXECUTE FUNCTION public.set_atualizado_em();

-- 8. Trigger para criação automática do Projeto quando Lead é ganho
CREATE OR REPLACE FUNCTION public.handle_lead_won_auto_project()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status IN ('Negócio Fechado', 'Pago', 'Concluído')) 
       AND (OLD.status IS DISTINCT FROM NEW.status OR OLD.status IS NULL) THEN
        
        INSERT INTO public.projetos_solares (
            lead_id,
            etapa_atual,
            proxima_acao,
            data_limite_etapa
        )
        VALUES (
            NEW.id,
            'assinatura_financiamento',
            'Validar documentação do contrato e assinatura',
            now() + INTERVAL '7 days'
        )
        ON CONFLICT (lead_id) DO NOTHING;
        
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_leads_lead_won_create_project ON public.leads;
CREATE TRIGGER trg_leads_lead_won_create_project
    AFTER UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_lead_won_auto_project();

-- 9. Trigger para gravação automática de histórico
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
            COALESCE('Transicionado para a etapa: ' || NEW.etapa_atual || '. Próxima ação definida: ' || NEW.proxima_acao, 'Mudança de etapa.')
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_projetos_solares_log_etapa ON public.projetos_solares;
CREATE TRIGGER trg_projetos_solares_log_etapa
    AFTER INSERT OR UPDATE ON public.projetos_solares
    FOR EACH ROW
    EXECUTE FUNCTION public.log_projeto_etapa_transition();


