export type LeadStatus = 'Pendente' | 'Em Atendimento' | 'Concluído' | 'Pago' | 'Perdido';

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
}
