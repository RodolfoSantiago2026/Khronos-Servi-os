export type LeadStatus = 'Pendente' | 'Em Atendimento' | 'Concluído' | 'Pago' | 'Perdido' | 'Negócio Fechado';

export interface Lead {
  id: string;
  created_at: string;
  nome: string;
  whatsapp: string;
  localizacao: string;
  servico: string;
  perda_estimada: number;
  status: LeadStatus;
  observacoes?: string;
  valor_fechado?: number;
  email?: string;
  cep?: string;
  concessionaria?: string;
  valor_conta?: number;
  valor_proposta?: number;
  sistema_kwp?: number;
  temperatura?: 'Frio' | 'Morno' | 'Quente';
  motivo_perda?: string;
  data_proximo_contato?: string;
  origem?: string;
}

/**
 * Funil de etapas do projeto solar (11 estágios)
 * Ordem: assinatura → visita → adequação → projeto → aprovação →
 *        suprimentos → logística → instalação → vistoria → troca medidor → startup
 */
export type ProjectStage =
  | 'assinatura_financiamento'
  | 'visita_tecnica'
  | 'adequacao_padrao'
  | 'projeto_engenharia'
  | 'aprovacao_concessionaria'
  | 'suprimentos_faturamento'
  | 'logistica_entrega'
  | 'instalacao_fisica'
  | 'solicitacao_vistoria'
  | 'troca_medidor'
  | 'startup_pos_venda';

export type StatusFinanceiro = 'Pendente' | 'Aprovado' | 'Liberado';

export interface SolarProject {
  id: string;
  lead_id: string;
  etapa_atual: ProjectStage;
  proxima_acao: string;
  data_inicio: string;
  data_limite_etapa?: string;
  criado_em: string;
  atualizado_em: string;

  // Campos gerenciais (novos)
  responsavel_nome?: string;
  status_financeiro?: StatusFinanceiro;
  concessionaria?: string;
  data_inicio_obra?: string;

  // Joined from leads
  lead?: {
    nome: string;
    whatsapp: string;
    localizacao: string;
    sistema_kwp?: number;
    valor_fechado?: number;
    valor_proposta?: number;
  };
}

export interface ProjectHistory {
  id: string;
  projeto_id: string;
  etapa_anterior?: ProjectStage;
  etapa_nova: ProjectStage;
  anotacao?: string;
  criado_em: string;
}
