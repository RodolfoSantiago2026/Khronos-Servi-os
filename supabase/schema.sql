-- Schema SQL para a tabela de Leads do Hubly Serviços

-- Tabela principal de leads
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    nome VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    localizacao VARCHAR(255) NOT NULL,
    servico VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em Atendimento', 'Concluído', 'Pago', 'Perdido')),
    perda_estimada NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    valor_fechado NUMERIC(12, 2),
    observacoes TEXT,
    email VARCHAR(255),
    cep VARCHAR(20),
    concessionaria VARCHAR(100),
    valor_conta NUMERIC(12, 2)
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
