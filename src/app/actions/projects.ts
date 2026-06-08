"use server";

import { supabaseAdmin } from '@/lib/supabase-admin';
import { SolarProject, ProjectStage, ProjectHistory, StatusFinanceiro } from '@/types';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-token';

/**
 * Helper to verify if the request is from an authenticated administrator session.
 */
async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('khronos_admin_auth')?.value;
    if (!token) return false;
    
    const adminPassword = process.env.ADMIN_PASSWORD || 'khronospro123';
    const payload = await verifyToken(token, adminPassword);
    return !!payload && payload.role === 'admin';
  } catch (err) {
    console.error('Error verifying admin session:', err);
    return false;
  }
}

/**
 * Helper to calculate SLA date based on stage.
 * Returns an ISO date string with the expected deadline.
 */
function calculateStageSLA(stage: ProjectStage): string {
  const now = new Date();
  let days = 5;
  
  switch (stage) {
    case 'assinatura_financiamento':
      days = 7;
      break;
    case 'visita_tecnica':
      days = 5;
      break;
    case 'adequacao_padrao':       // Nova: reforma na caixa do medidor
      days = 10;
      break;
    case 'projeto_engenharia':
      days = 10;
      break;
    case 'aprovacao_concessionaria':
      days = 15;
      break;
    case 'suprimentos_faturamento': // Renomeada: aguardando NF do distribuidor
      days = 7;
      break;
    case 'logistica_entrega':       // Renomeada
      days = 5;
      break;
    case 'instalacao_fisica':       // Renomeada
      days = 7;
      break;
    case 'solicitacao_vistoria':    // Renomeada: pedido protocolado na concessionária
      days = 10;
      break;
    case 'troca_medidor':           // Nova: aguardando troca do medidor bidirecional
      days = 15;
      break;
    case 'startup_pos_venda':
      days = 3;
      break;
  }
  
  now.setDate(now.getDate() + days);
  return now.toISOString();
}

/**
 * Helper to get default next action for a stage.
 */
function getDefaultNextAction(stage: ProjectStage): string {
  switch (stage) {
    case 'assinatura_financiamento':
      return 'Validar documentação do contrato e assinatura';
    case 'visita_tecnica':
      return 'Realizar vistoria técnica no local e emitir laudo';
    case 'adequacao_padrao':
      return 'Contratar eletricista para adequação da caixa do medidor conforme normas';
    case 'projeto_engenharia':
      return 'Elaborar diagrama unifilar, memorial descritivo e projeto executivo';
    case 'aprovacao_concessionaria':
      return 'Dar entrada na solicitação de parecer de acesso com a concessionária';
    case 'suprimentos_faturamento':
      return 'Emitir nota fiscal e separar módulos/inversores do kit solar';
    case 'logistica_entrega':
      return 'Coordenar expedição e rastrear entrega dos kits na residência do cliente';
    case 'instalacao_fisica':
      return 'Iniciar fixação dos suportes, passagem de cabeamento e testes elétricos';
    case 'solicitacao_vistoria':
      return 'Protocolar pedido de vistoria final junto à concessionária de energia';
    case 'troca_medidor':
      return 'Acompanhar agendamento e troca do medidor bidirecional pela concessionária';
    case 'startup_pos_venda':
      return 'Comissionar o sistema e configurar o app de monitoramento do cliente';
    default:
      return 'Definir as próximas atividades do projeto';
  }
}

/**
 * Fetches all solar projects from database, including new managerial fields.
 */
export async function getProjectsAction(): Promise<{ success: boolean; data?: SolarProject[]; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado.' };
    }

    const { data, error } = await supabaseAdmin
      .from('projetos_solares')
      .select('*, lead:leads(nome, whatsapp, localizacao, sistema_kwp, valor_fechado, valor_proposta)')
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      throw new Error(error.message);
    }

    return { success: true, data: data as SolarProject[] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao buscar os projetos' };
  }
}

/**
 * Updates a project's stage (e.g. from Kanban Drag and Drop or table dropdown)
 */
export async function updateProjectStageAction(
  projectId: string, 
  newStage: ProjectStage
): Promise<{ success: boolean; data?: SolarProject; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado.' };
    }

    const nextAction = getDefaultNextAction(newStage);
    const limitDate = calculateStageSLA(newStage);

    const { data, error } = await supabaseAdmin
      .from('projetos_solares')
      .update({ 
        etapa_atual: newStage,
        proxima_acao: nextAction,
        data_limite_etapa: limitDate,
        data_inicio: new Date().toISOString()
      })
      .eq('id', projectId)
      .select('*, lead:leads(nome, whatsapp, localizacao, sistema_kwp, valor_fechado, valor_proposta)')
      .single();

    if (error) {
      console.error('Error updating project stage:', error);
      throw new Error(error.message);
    }

    revalidatePath('/admin');
    return { success: true, data: data as SolarProject };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao atualizar etapa do projeto' };
  }
}

/**
 * Updates project row details: proxima_acao, data_limite_etapa,
 * responsavel_nome, status_financeiro, concessionaria.
 */
export async function updateProjectDetailsAction(
  projectId: string,
  nextAction: string,
  limitDate: string,
  extraFields?: {
    responsavel_nome?: string;
    status_financeiro?: StatusFinanceiro;
    concessionaria?: string;
  }
): Promise<{ success: boolean; data?: SolarProject; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado.' };
    }

    const updatePayload: Record<string, any> = {
      proxima_acao: nextAction,
      data_limite_etapa: limitDate ? new Date(limitDate).toISOString() : null,
    };

    if (extraFields) {
      if (extraFields.responsavel_nome !== undefined) {
        updatePayload.responsavel_nome = extraFields.responsavel_nome || null;
      }
      if (extraFields.status_financeiro !== undefined) {
        updatePayload.status_financeiro = extraFields.status_financeiro;
      }
      if (extraFields.concessionaria !== undefined) {
        updatePayload.concessionaria = extraFields.concessionaria || null;
      }
    }

    const { data, error } = await supabaseAdmin
      .from('projetos_solares')
      .update(updatePayload)
      .eq('id', projectId)
      .select('*, lead:leads(nome, whatsapp, localizacao, sistema_kwp, valor_fechado, valor_proposta)')
      .single();

    if (error) {
      console.error('Error updating project details:', error);
      throw new Error(error.message);
    }

    revalidatePath('/admin');
    return { success: true, data: data as SolarProject };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao salvar os detalhes do projeto' };
  }
}

/**
 * Retrieves the history logs for a specific project.
 */
export async function getProjectHistoryAction(
  projectId: string
): Promise<{ success: boolean; data?: ProjectHistory[]; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado.' };
    }

    const { data, error } = await supabaseAdmin
      .from('historico_projetos')
      .select('*')
      .eq('projeto_id', projectId)
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Error fetching project history:', error);
      throw new Error(error.message);
    }

    return { success: true, data: data as ProjectHistory[] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao buscar o histórico do projeto' };
  }
}

/**
 * Adds a manual observation/note to the project history.
 */
export async function addProjectNoteAction(
  projectId: string,
  noteText: string,
  currentStage: ProjectStage
): Promise<{ success: boolean; data?: ProjectHistory; error?: string }> {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return { success: false, error: 'Acesso não autorizado.' };
    }

    const { data, error } = await supabaseAdmin
      .from('historico_projetos')
      .insert([
        {
          projeto_id: projectId,
          etapa_anterior: currentStage,
          etapa_nova: currentStage,
          anotacao: noteText
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting project history note:', error);
      throw new Error(error.message);
    }

    return { success: true, data: data as ProjectHistory };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao salvar a anotação no histórico' };
  }
}
