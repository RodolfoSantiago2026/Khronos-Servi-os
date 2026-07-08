"use client";

import React, { useState, useEffect } from 'react';
import { 
  getProjectsAction, 
  updateProjectStageAction, 
  updateProjectDetailsAction, 
  getProjectHistoryAction, 
  addProjectNoteAction 
} from '@/app/actions/projects';
import { SolarProject, ProjectStage, ProjectHistory, StatusFinanceiro } from '@/types';
import { 
  Sun, 
  Search, 
  User, 
  MapPin, 
  Zap, 
  DollarSign, 
  Clock, 
  Wrench, 
  Truck, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  MessageCircle, 
  Plus, 
  X, 
  History, 
  Save, 
  FileCheck2, 
  Play, 
  ChevronRight,
  HardHat,
  List,
  LayoutGrid,
  Settings,
  Gauge,
  Package,
  ClipboardCheck,
  RefreshCw,
  Building2
} from 'lucide-react';

// ─── Funil de 11 Etapas ───────────────────────────────────────────────────────
const COLUMNS: { id: ProjectStage; title: string; icon: any; color: string; hoverColor: string }[] = [
  { id: 'assinatura_financiamento',  title: 'Assinatura & Financiamento', icon: FileText,      color: 'border-t-blue-500 bg-blue-500/5',    hoverColor: 'hover:bg-blue-500/10'    },
  { id: 'visita_tecnica',            title: 'Visita Técnica',             icon: MapPin,        color: 'border-t-indigo-500 bg-indigo-500/5', hoverColor: 'hover:bg-indigo-500/10'  },
  { id: 'adequacao_padrao',          title: 'Adequação do Padrão',        icon: Settings,      color: 'border-t-violet-500 bg-violet-500/5', hoverColor: 'hover:bg-violet-500/10'  },
  { id: 'projeto_engenharia',        title: 'Projeto de Engenharia',      icon: Wrench,        color: 'border-t-purple-500 bg-purple-500/5', hoverColor: 'hover:bg-purple-500/10'  },
  { id: 'aprovacao_concessionaria',  title: 'Aprovação Concessionária',   icon: FileCheck2,    color: 'border-t-amber-500 bg-amber-500/5',   hoverColor: 'hover:bg-amber-500/10'   },
  { id: 'suprimentos_faturamento',   title: 'Suprimentos & Faturamento',  icon: Package,       color: 'border-t-orange-500 bg-orange-500/5', hoverColor: 'hover:bg-orange-500/10'  },
  { id: 'logistica_entrega',         title: 'Logística & Entrega',        icon: Truck,         color: 'border-t-sky-500 bg-sky-500/5',       hoverColor: 'hover:bg-sky-500/10'     },
  { id: 'instalacao_fisica',         title: 'Instalação Física',          icon: HardHat,       color: 'border-t-teal-500 bg-teal-500/5',     hoverColor: 'hover:bg-teal-500/10'    },
  { id: 'solicitacao_vistoria',      title: 'Solicitação de Vistoria',    icon: ClipboardCheck,color: 'border-t-cyan-500 bg-cyan-500/5',      hoverColor: 'hover:bg-cyan-500/10'    },
  { id: 'troca_medidor',             title: 'Troca do Medidor',           icon: RefreshCw,     color: 'border-t-emerald-500 bg-emerald-500/5',hoverColor: 'hover:bg-emerald-500/10' },
  { id: 'startup_pos_venda',         title: 'Startup & Pós-venda',        icon: Sun,           color: 'border-t-green-600 bg-green-600/5',   hoverColor: 'hover:bg-green-600/10'   },
];

// Helper para formatar o número do WhatsApp com DDI
const formatWhatsApp = (phone: string) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if ((cleaned.length === 10 || cleaned.length === 11) && !cleaned.startsWith('55')) {
    return '55' + cleaned;
  }
  return cleaned;
};

// ─── Badge de Status Financeiro ───────────────────────────────────────────────
function FinanceiroBadge({ value }: { value?: StatusFinanceiro | string }) {
  if (!value) return (
    <span className="inline-flex items-center text-[9px] font-bold px-2 py-1 rounded border bg-slate-100 text-slate-400 border-slate-200">
      —
    </span>
  );
  const styles: Record<string, string> = {
    'Liberado': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Aprovado': 'bg-blue-50 text-blue-700 border-blue-200',
    'Pendente': 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={`inline-flex items-center text-[9px] font-bold px-2 py-1 rounded border ${styles[value] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
      {value}
    </span>
  );
}

export default function SolarProjectsBoard() {
  const [projects, setProjects] = useState<SolarProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  
  // Alternador de Visualização (Planilha por padrão)
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('table');
  
  // Modificações temporárias da planilha — incluindo novos campos
  const [tempValues, setTempValues] = useState<Record<string, {
    proxima_acao: string;
    data_limite_etapa: string;
    responsavel_nome: string;
    status_financeiro: string;
    concessionaria: string;
  }>>({});
  const [updatingStages, setUpdatingStages] = useState<Record<string, boolean>>({});
  const [savingRows, setSavingRows] = useState<Record<string, boolean>>({});

  // Modal de Detalhes
  const [selectedProject, setSelectedProject] = useState<SolarProject | null>(null);
  const [historyLogs, setHistoryLogs] = useState<ProjectHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  
  // Campos de Edição de Detalhes (Modal)
  const [editNextAction, setEditNextAction] = useState('');
  const [editLimitDate, setEditLimitDate] = useState('');
  const [savingDetails, setSavingDetails] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await getProjectsAction();
      if (res.success && res.data) {
        setProjects(res.data);
      } else {
        setError(res.error || 'Erro ao carregar projetos.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const loadProjectHistory = async (projectId: string) => {
    setLoadingHistory(true);
    try {
      const res = await getProjectHistoryAction(projectId);
      if (res.success && res.data) {
        setHistoryLogs(res.data);
      }
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenDetails = (project: SolarProject) => {
    setSelectedProject(project);
    setEditNextAction(project.proxima_acao);
    setEditLimitDate(project.data_limite_etapa ? project.data_limite_etapa.substring(0, 16) : '');
    setNewNote('');
    loadProjectHistory(project.id);
  };

  const handleCloseDetails = () => {
    setSelectedProject(null);
    setHistoryLogs([]);
  };

  // Drag and Drop Lógica
  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    e.dataTransfer.setData('text/plain', projectId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStage: ProjectStage) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('text/plain');
    if (!projectId) return;

    const projectToMove = projects.find(p => p.id === projectId);
    if (!projectToMove || projectToMove.etapa_atual === targetStage) return;

    const updatedProjects = projects.map(p => {
      if (p.id === projectId) {
        return { ...p, etapa_atual: targetStage, atualizado_em: new Date().toISOString() };
      }
      return p;
    });
    setProjects(updatedProjects);

    try {
      const res = await updateProjectStageAction(projectId, targetStage);
      if (!res.success) {
        fetchProjects();
        alert('Erro ao atualizar etapa do projeto: ' + res.error);
      } else {
        setProjects(prev => prev.map(p => p.id === projectId && res.data ? res.data : p));
      }
    } catch (err: any) {
      fetchProjects();
      alert('Erro ao mover projeto: ' + err.message);
    }
  };

  // Alteração direta da etapa via Dropdown na Planilha
  const handleStageChange = async (projectId: string, newStage: ProjectStage) => {
    setUpdatingStages(prev => ({ ...prev, [projectId]: true }));
    try {
      const res = await updateProjectStageAction(projectId, newStage);
      if (res.success && res.data) {
        setProjects(prev => prev.map(p => p.id === projectId && res.data ? res.data : p));
        setTempValues(prev => {
          const next = { ...prev };
          delete next[projectId];
          return next;
        });
      } else {
        alert('Erro ao atualizar etapa do projeto: ' + res.error);
      }
    } catch (err: any) {
      alert('Erro ao atualizar etapa: ' + err.message);
    } finally {
      setUpdatingStages(prev => ({ ...prev, [projectId]: false }));
    }
  };

  // Inicializa ou atualiza um campo temporário de uma linha
  const getOrInitTemp = (proj: SolarProject) => {
    return tempValues[proj.id] || {
      proxima_acao:     proj.proxima_acao || '',
      data_limite_etapa: proj.data_limite_etapa ? proj.data_limite_etapa.substring(0, 16) : '',
      responsavel_nome:  proj.responsavel_nome  || '',
      status_financeiro: proj.status_financeiro || 'Pendente',
      concessionaria:    proj.concessionaria    || '',
    };
  };

  // Alteração dos inputs temporários na planilha
  const handleTempChange = (
    projectId: string,
    field: 'proxima_acao' | 'data_limite_etapa' | 'responsavel_nome' | 'status_financeiro' | 'concessionaria',
    value: string
  ) => {
    setTempValues(prev => {
      const project = projects.find(p => p.id === projectId)!;
      const currentTemp = prev[projectId] || getOrInitTemp(project);
      return {
        ...prev,
        [projectId]: { ...currentTemp, [field]: value }
      };
    });
  };

  // Verificar se a linha tem modificações
  const hasRowChanges = (proj: SolarProject): boolean => {
    const temp = tempValues[proj.id];
    if (!temp) return false;
    return (
      temp.proxima_acao      !== (proj.proxima_acao || '')        ||
      temp.data_limite_etapa !== (proj.data_limite_etapa ? proj.data_limite_etapa.substring(0, 16) : '') ||
      temp.responsavel_nome  !== (proj.responsavel_nome  || '')   ||
      temp.status_financeiro !== (proj.status_financeiro || 'Pendente') ||
      temp.concessionaria    !== (proj.concessionaria    || '')
    );
  };

  // Salvar linha modificada na planilha
  const handleSaveRow = async (projectId: string) => {
    const temp = tempValues[projectId];
    if (!temp) return;

    setSavingRows(prev => ({ ...prev, [projectId]: true }));
    try {
      const res = await updateProjectDetailsAction(
        projectId,
        temp.proxima_acao,
        temp.data_limite_etapa,
        {
          responsavel_nome:  temp.responsavel_nome  || undefined,
          status_financeiro: temp.status_financeiro as StatusFinanceiro || undefined,
          concessionaria:    temp.concessionaria    || undefined,
        }
      );

      if (res.success && res.data) {
        setProjects(prev => prev.map(p => p.id === projectId && res.data ? res.data : p));
        setTempValues(prev => {
          const next = { ...prev };
          delete next[projectId];
          return next;
        });
        if (selectedProject?.id === projectId) {
          setSelectedProject(res.data);
        }
      } else {
        alert(res.error || 'Erro ao atualizar detalhes.');
      }
    } catch (err: any) {
      alert(err.message || 'Erro inesperado ao salvar detalhes.');
    } finally {
      setSavingRows(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    setSavingDetails(true);
    try {
      const res = await updateProjectDetailsAction(
        selectedProject.id, 
        editNextAction, 
        editLimitDate
      );

      if (res.success && res.data) {
        setProjects(prev => prev.map(p => p.id === selectedProject.id && res.data ? res.data : p));
        setSelectedProject(res.data);
        setTempValues(prev => {
          const next = { ...prev };
          delete next[selectedProject.id];
          return next;
        });
        alert('Detalhes atualizados com sucesso!');
      } else {
        alert(res.error || 'Erro ao atualizar detalhes.');
      }
    } catch (err: any) {
      alert(err.message || 'Erro inesperado ao salvar detalhes.');
    } finally {
      setSavingDetails(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newNote.trim()) return;

    setSavingNote(true);
    try {
      const res = await addProjectNoteAction(selectedProject.id, newNote, selectedProject.etapa_atual);
      if (res.success && res.data) {
        setHistoryLogs(prev => [res.data!, ...prev]);
        setNewNote('');
      } else {
        alert(res.error || 'Erro ao salvar anotação.');
      }
    } catch (err: any) {
      alert(err.message || 'Erro inesperado.');
    } finally {
      setSavingNote(false);
    }
  };

  const getSLADiff = (limitDateStr?: string) => {
    if (!limitDateStr) return null;
    const limit = new Date(limitDateStr);
    const now = new Date();
    const diffTime = limit.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { days: diffDays, overdue: diffTime < 0 };
  };

  const getSLABadge = (limitDateStr?: string) => {
    const sla = getSLADiff(limitDateStr);
    if (!sla) return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border bg-slate-100 text-slate-500 border-slate-200">
        Sem SLA
      </span>
    );
    if (sla.overdue) return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border bg-red-50 text-red-600 border-red-200">
        <AlertCircle className="w-3 h-3" /> Atrasado ({Math.abs(sla.days)}d)
      </span>
    );
    if (sla.days <= 2) return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border bg-amber-50 text-amber-600 border-amber-200 animate-pulse">
        <Clock className="w-3 h-3" /> Vence em {sla.days}d
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border bg-emerald-50 text-emerald-600 border-emerald-200">
        <Clock className="w-3 h-3" /> No Prazo ({sla.days}d)
      </span>
    );
  };

  const getSLABadgeTable = (limitDateStr?: string) => {
    const sla = getSLADiff(limitDateStr);
    if (!sla) return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border bg-slate-100 text-slate-500 border-slate-200">
        Sem SLA
      </span>
    );
    if (sla.overdue) return (
      <span className="inline-flex items-center gap-1.5 text-[9px] font-bold px-2 py-1 rounded border bg-red-50 text-red-600 border-red-200 animate-pulse">
        <AlertCircle className="w-3.5 h-3.5 text-red-500" /> Atrasado ({Math.abs(sla.days)}d)
      </span>
    );
    if (sla.days <= 2) return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded border bg-amber-50 text-amber-600 border-amber-200">
        <Clock className="w-3.5 h-3.5" /> Vence em {sla.days}d
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded border bg-emerald-50 text-emerald-600 border-emerald-200">
        <Clock className="w-3.5 h-3.5" /> No Prazo ({sla.days}d)
      </span>
    );
  };

  // Filtros aplicados
  const filteredProjects = projects.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    return (
      p.lead?.nome.toLowerCase().includes(searchLower) ||
      p.lead?.whatsapp.includes(searchTerm) ||
      p.lead?.localizacao.toLowerCase().includes(searchLower) ||
      (p.responsavel_nome?.toLowerCase().includes(searchLower)) ||
      (p.concessionaria?.toLowerCase().includes(searchLower))
    );
  });

  const getStageFriendlyName = (stage: ProjectStage) => {
    const col = COLUMNS.find(c => c.id === stage);
    return col ? col.title : stage;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Barra de Ações Rápidas */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por cliente, responsável, concessionária..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-brand-emerald text-slate-800"
            />
          </div>
          
          {/* Alternador de Visualização */}
          <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button 
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'table' ? 'bg-white shadow-sm font-bold text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              title="Visualização de Planilha"
            >
              <List className="w-3.5 h-3.5" /> Planilha
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'kanban' ? 'bg-white shadow-sm font-bold text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              title="Visualização de Quadro Kanban"
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Quadro
            </button>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="text-xs text-slate-500 font-medium">
            Ativos: <strong className="text-slate-800">{projects.length} projetos</strong>
          </div>
          <button 
            onClick={fetchProjects}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-all cursor-pointer"
          >
            Sincronizar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center bg-white rounded-xl border border-slate-200">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-emerald rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs text-slate-400">Buscando cronogramas do servidor...</p>
        </div>
      ) : error ? (
        <div className="p-12 text-center bg-white rounded-xl border border-red-200 text-red-600 text-xs">
          {error}
        </div>
      ) : viewMode === 'table' ? (
        /* ══════════════════════════════════════════════════
           VISUALIZAÇÃO DE PLANILHA
           ══════════════════════════════════════════════════ */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" style={{ minWidth: '1300px' }}>
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-[10px] uppercase tracking-[0.1em] border-b border-slate-200">
                  <th className="px-4 py-4 font-bold sticky left-0 bg-slate-50/80 z-10 min-w-[180px]">Cliente</th>
                  <th className="px-4 py-4 font-bold min-w-[120px]">Sistema / Contrato</th>
                  <th className="px-4 py-4 font-bold min-w-[190px]">Etapa Atual</th>
                  <th className="px-4 py-4 font-bold min-w-[120px]">Responsável</th>
                  <th className="px-4 py-4 font-bold min-w-[110px]">Financeiro</th>
                  <th className="px-4 py-4 font-bold min-w-[120px]">Concessionária</th>
                  <th className="px-4 py-4 font-bold min-w-[90px]">Início Obra</th>
                  <th className="px-4 py-4 font-bold min-w-[240px]">Próxima Ação</th>
                  <th className="px-4 py-4 font-bold min-w-[160px]">Prazo Limite (SLA)</th>
                  <th className="px-4 py-4 font-bold min-w-[110px]">Alerta</th>
                  <th className="px-4 py-4 font-bold text-center min-w-[110px]">Ações</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={11} className="text-center py-16 text-slate-400 italic text-xs">
                      Nenhum projeto encontrado.
                    </td>
                  </tr>
                )}
                {filteredProjects.map((proj) => {
                  const currentTemp = getOrInitTemp(proj);
                  const isModified  = hasRowChanges(proj);
                  const slaDiff     = getSLADiff(proj.data_limite_etapa);
                  const isOverdue   = slaDiff?.overdue;
                  const isUpdatingStage = !!updatingStages[proj.id];
                  const isSavingRow = !!savingRows[proj.id];

                  return (
                    <tr 
                      key={proj.id} 
                      className={`transition-all hover:bg-slate-50/50 ${isOverdue ? 'bg-red-500/[0.015] hover:bg-red-500/[0.03]' : ''}`}
                    >
                      {/* Cliente */}
                      <td className={`px-4 py-3.5 sticky left-0 bg-white z-[5] ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}>
                        <div 
                          className="font-bold text-slate-900 cursor-pointer hover:text-brand-emerald transition-all truncate max-w-[160px]"
                          onClick={() => handleOpenDetails(proj)}
                          title={proj.lead?.nome}
                        >
                          {proj.lead?.nome}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[160px]">{proj.lead?.localizacao}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{proj.lead?.whatsapp}</div>
                      </td>

                      {/* Sistema / Contrato */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {proj.lead?.sistema_kwp && (
                          <div className="font-semibold text-slate-700 font-mono">
                            {proj.lead.sistema_kwp} kWp
                          </div>
                        )}
                        <div className="font-bold text-emerald-600 font-mono mt-0.5">
                          R$ {proj.lead?.valor_fechado?.toLocaleString('pt-BR') || '—'}
                        </div>
                      </td>

                      {/* Etapa Atual Dropdown */}
                      <td className="px-4 py-3.5">
                        <div className="relative">
                          <select
                            value={proj.etapa_atual}
                            disabled={isUpdatingStage}
                            onChange={(e) => handleStageChange(proj.id, e.target.value as ProjectStage)}
                            className="w-full text-[11px] font-bold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer border border-slate-200 bg-white hover:border-slate-300 text-slate-700 shadow-sm transition-all focus:border-brand-emerald disabled:opacity-55"
                          >
                            {COLUMNS.map(col => (
                              <option key={col.id} value={col.id}>{col.title}</option>
                            ))}
                          </select>
                          {isUpdatingStage && (
                            <div className="absolute right-2.5 top-2.5 w-3.5 h-3.5 border-2 border-slate-200 border-t-brand-emerald rounded-full animate-spin"></div>
                          )}
                        </div>
                      </td>

                      {/* Responsável */}
                      <td className="px-4 py-3.5">
                        <input
                          type="text"
                          value={currentTemp.responsavel_nome}
                          onChange={(e) => handleTempChange(proj.id, 'responsavel_nome', e.target.value)}
                          className={`w-full px-2.5 py-1.5 text-[11px] border rounded-lg focus:outline-none focus:border-brand-emerald text-slate-700 font-medium ${
                            isModified && currentTemp.responsavel_nome !== (proj.responsavel_nome || '') 
                              ? 'border-amber-300 bg-amber-50/10' 
                              : 'border-slate-200 bg-slate-50/30'
                          }`}
                          placeholder="Nome do responsável..."
                        />
                      </td>

                      {/* Status Financeiro */}
                      <td className="px-4 py-3.5">
                        <select
                          value={currentTemp.status_financeiro}
                          onChange={(e) => handleTempChange(proj.id, 'status_financeiro', e.target.value)}
                          className={`w-full text-[11px] font-bold rounded-lg px-2 py-1.5 outline-none cursor-pointer border shadow-sm transition-all focus:border-brand-emerald ${
                            currentTemp.status_financeiro === 'Liberado' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : currentTemp.status_financeiro === 'Aprovado'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          } ${isModified && currentTemp.status_financeiro !== (proj.status_financeiro || 'Pendente') ? 'ring-2 ring-amber-300' : ''}`}
                        >
                          <option value="Pendente">Pendente</option>
                          <option value="Aprovado">Aprovado</option>
                          <option value="Liberado">Liberado</option>
                        </select>
                      </td>

                      {/* Concessionária */}
                      <td className="px-4 py-3.5">
                        <input
                          type="text"
                          value={currentTemp.concessionaria}
                          onChange={(e) => handleTempChange(proj.id, 'concessionaria', e.target.value)}
                          className={`w-full px-2.5 py-1.5 text-[11px] border rounded-lg focus:outline-none focus:border-brand-emerald text-slate-700 font-medium ${
                            isModified && currentTemp.concessionaria !== (proj.concessionaria || '') 
                              ? 'border-amber-300 bg-amber-50/10' 
                              : 'border-slate-200 bg-slate-50/30'
                          }`}
                          placeholder="Ex: Celesc, Cemig..."
                        />
                      </td>

                      {/* Início da Obra */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-[11px] font-semibold text-slate-600">
                          {formatDate(proj.data_inicio_obra || proj.data_inicio)}
                        </span>
                      </td>

                      {/* Próxima Ação Input */}
                      <td className="px-4 py-3.5">
                        <input
                          type="text"
                          value={currentTemp.proxima_acao}
                          onChange={(e) => handleTempChange(proj.id, 'proxima_acao', e.target.value)}
                          className={`w-full px-2.5 py-1.5 text-[11px] border rounded-lg focus:outline-none focus:border-brand-emerald text-slate-700 font-medium ${
                            isModified && currentTemp.proxima_acao !== (proj.proxima_acao || '')
                              ? 'border-amber-300 bg-amber-50/10' 
                              : 'border-slate-200 bg-slate-50/30'
                          }`}
                          placeholder="Digite a próxima ação..."
                        />
                      </td>

                      {/* Data Limite Input */}
                      <td className="px-4 py-3.5">
                        <input
                          type="datetime-local"
                          value={currentTemp.data_limite_etapa}
                          onChange={(e) => handleTempChange(proj.id, 'data_limite_etapa', e.target.value)}
                          className={`px-2.5 py-1.5 text-[11px] border rounded-lg focus:outline-none focus:border-brand-emerald font-semibold text-slate-700 bg-white ${
                            isModified && currentTemp.data_limite_etapa !== (proj.data_limite_etapa ? proj.data_limite_etapa.substring(0, 16) : '')
                              ? 'border-amber-300 bg-amber-50/10' 
                              : 'border-slate-200'
                          }`}
                        />
                      </td>

                      {/* Alerta de SLA */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {getSLABadgeTable(proj.data_limite_etapa)}
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Botão de Salvar */}
                          <button
                            onClick={() => handleSaveRow(proj.id)}
                            disabled={!isModified || isSavingRow}
                            className={`p-2 rounded-lg border transition-all cursor-pointer shadow-sm ${
                              isModified 
                                ? 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600 hover:scale-105' 
                                : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                            }`}
                            title={isModified ? "Salvar alterações desta linha" : "Sem alterações"}
                          >
                            {isSavingRow ? (
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                              <Save className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Botão Detalhes */}
                          <button
                            onClick={() => handleOpenDetails(proj)}
                            className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all cursor-pointer shadow-sm"
                            title="Ver histórico e notas"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          {/* Botão WhatsApp */}
                          {proj.lead?.whatsapp && (
                            <a
                              href={`https://wa.me/${formatWhatsApp(proj.lead.whatsapp)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all cursor-pointer shadow-sm"
                              title="Falar no WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════
           VISUALIZAÇÃO DE QUADRO KANBAN (11 colunas)
           ══════════════════════════════════════════════════ */
        <div className="flex gap-4 overflow-x-auto pb-6 select-none -mx-4 px-4 md:-mx-8 md:px-8">
          {COLUMNS.map(col => {
            const colProjects = filteredProjects.filter(p => p.etapa_atual === col.id);
            const ColIcon = col.icon;
            return (
              <div 
                key={col.id} 
                className={`flex-shrink-0 w-72 rounded-xl border-t-4 border border-slate-200 flex flex-col max-h-[75vh] transition-all ${col.color} ${col.hoverColor}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Header da Coluna */}
                <div className="p-3 bg-white/60 border-b border-slate-200/50 flex justify-between items-center rounded-t-xl sticky top-0 z-10 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      <ColIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-tight truncate max-w-[150px]" title={col.title}>
                        {col.title}
                      </h3>
                      <p className="text-[9px] text-slate-400 font-semibold">{colProjects.length} {colProjects.length === 1 ? 'obra' : 'obras'}</p>
                    </div>
                  </div>
                </div>

                {/* Área de Cards */}
                <div className="p-3 overflow-y-auto space-y-3 flex-1 min-h-[400px]">
                  {colProjects.length === 0 ? (
                    <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-300/40 rounded-lg p-6 text-center">
                      <span className="text-[10px] text-slate-400/80 font-medium italic">Solte cards aqui</span>
                    </div>
                  ) : (
                    colProjects.map(proj => {
                      const slaDiff = getSLADiff(proj.data_limite_etapa);
                      const isRed = slaDiff?.overdue;
                      return (
                        <div
                          key={proj.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, proj.id)}
                          onClick={() => handleOpenDetails(proj)}
                          className={`bg-white p-3.5 rounded-lg border shadow-sm cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between ${
                            isRed 
                              ? 'border-red-300 hover:border-red-500 hover:shadow-red-500/5 bg-red-50/5' 
                              : 'border-slate-200 hover:border-brand-emerald hover:shadow-emerald-500/5 bg-white'
                          }`}
                        >
                          {/* Cliente e Potência */}
                          <div className="space-y-1 mb-2">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-1">
                                {proj.lead?.nome}
                              </h4>
                              {proj.lead?.sistema_kwp && (
                                <span className="flex-shrink-0 text-[9px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded border border-slate-200 font-mono">
                                  {proj.lead.sistema_kwp} kWp
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 flex-shrink-0 text-slate-400" />
                              <span className="truncate">{proj.lead?.localizacao}</span>
                            </p>
                          </div>

                          {/* Responsável e Financeiro */}
                          {(proj.responsavel_nome || proj.status_financeiro) && (
                            <div className="flex items-center gap-2 mb-2">
                              {proj.responsavel_nome && (
                                <span className="text-[9px] text-slate-500 flex items-center gap-0.5 truncate">
                                  <User className="w-3 h-3" /> {proj.responsavel_nome}
                                </span>
                              )}
                              <FinanceiroBadge value={proj.status_financeiro} />
                            </div>
                          )}

                          {/* Campo Próxima Ação Destacado */}
                          <div className="bg-slate-50 border border-slate-100 rounded-md p-2 my-2 text-left">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Próxima Ação</span>
                            <p className="text-[10px] font-medium text-slate-600 line-clamp-2 leading-tight">
                              {proj.proxima_acao || 'Nenhuma ação cadastrada.'}
                            </p>
                          </div>

                          {/* Rodapé do Card */}
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                            <div>
                              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Contrato</span>
                              <span className="font-mono text-[10px] font-bold text-emerald-600">
                                R$ {proj.lead?.valor_fechado?.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) || '—'}
                              </span>
                            </div>
                            <div>
                              {getSLABadge(proj.data_limite_etapa)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Lateral de Detalhes do Projeto */}
      {selectedProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-4xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header do Drawer */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 flex-shrink-0">
              <div>
                <span className="text-[9px] font-black text-brand-emerald bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Controle de Obra Solar
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-2 flex items-center gap-3">
                  {selectedProject.lead?.nome}
                  <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded border border-slate-200">
                    {getStageFriendlyName(selectedProject.etapa_atual)}
                  </span>
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                  <p className="text-xs text-slate-500">
                    {selectedProject.lead?.whatsapp} · {selectedProject.lead?.localizacao}
                  </p>
                  {selectedProject.concessionaria && (
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {selectedProject.concessionaria}
                    </span>
                  )}
                  {selectedProject.responsavel_nome && (
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <User className="w-3 h-3" /> {selectedProject.responsavel_nome}
                    </span>
                  )}
                  <FinanceiroBadge value={selectedProject.status_financeiro} />
                </div>
              </div>
              <button 
                onClick={handleCloseDetails}
                className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo Duas Colunas */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Coluna Esquerda */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
                    Detalhes e Planejamento da Etapa
                  </h3>
                  
                  <form onSubmit={handleSaveDetails} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Potência kWp</span>
                        <span className="text-lg font-mono font-black text-slate-800">
                          {selectedProject.lead?.sistema_kwp || '—'} kWp
                        </span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Valor Contratado</span>
                        <span className="text-lg font-mono font-black text-emerald-600">
                          R$ {selectedProject.lead?.valor_fechado?.toLocaleString('pt-BR') || '—'}
                        </span>
                      </div>
                    </div>

                    {/* Início da obra e status financeiro no modal */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Início da Obra</span>
                        <span className="text-sm font-bold text-slate-700">
                          {formatDate(selectedProject.data_inicio_obra || selectedProject.data_inicio)}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Status Financeiro</span>
                        <FinanceiroBadge value={selectedProject.status_financeiro} />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Próxima Ação
                      </label>
                      <textarea
                        value={editNextAction}
                        onChange={(e) => setEditNextAction(e.target.value)}
                        rows={3}
                        className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-emerald text-slate-800 font-medium"
                        placeholder="Ex: Entrar em contato com o cliente para agendar a visita..."
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Data Limite da Etapa (SLA)
                      </label>
                      <input
                        type="datetime-local"
                        value={editLimitDate}
                        onChange={(e) => setEditLimitDate(e.target.value)}
                        className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-emerald font-semibold text-slate-700 bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingDetails}
                      className="w-full py-2.5 bg-brand-emerald hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" /> {savingDetails ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </form>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Contato do Cliente</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mb-3">
                    Você pode iniciar um diálogo com o cliente diretamente no WhatsApp sobre esta etapa da obra.
                  </p>
                  <a
                    href={`https://wa.me/${formatWhatsApp(selectedProject.lead?.whatsapp || '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-emerald-600 font-bold text-xs rounded-lg transition-all"
                  >
                    <MessageCircle className="w-4 h-4" /> Conversar no WhatsApp
                  </a>
                </div>
              </div>

              {/* Coluna Direita: Histórico */}
              <div className="border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-8 pt-6 lg:pt-0 flex flex-col h-full">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-500" /> Histórico & Logs da Obra
                </h3>

                {/* Form de Nova Anotação */}
                <form onSubmit={handleAddNote} className="mb-6 space-y-2 flex-shrink-0">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Adicionar nota interna ao histórico deste projeto..."
                    rows={2}
                    className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-emerald text-slate-800 bg-yellow-50/20"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingNote || !newNote.trim()}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[11px] font-bold rounded-lg transition-all shadow-sm flex items-center gap-2"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Nota
                    </button>
                  </div>
                </form>

                {/* Timeline Scroll */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[300px]">
                  {loadingHistory ? (
                    <div className="text-center py-8 text-xs text-slate-400">Carregando logs...</div>
                  ) : historyLogs.length === 0 ? (
                    <div className="text-center py-12 text-xs text-slate-400 italic">Nenhuma anotação registrada ainda.</div>
                  ) : (
                    <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-5 py-2">
                      {historyLogs.map(log => {
                        const isSystem = log.etapa_anterior !== log.etapa_nova;
                        return (
                          <div key={log.id} className="relative">
                            <span className={`absolute -left-[21px] top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-white flex items-center justify-center ${isSystem ? 'border-brand-emerald' : 'border-slate-400'}`}>
                              <span className={`w-1 h-1 rounded-full ${isSystem ? 'bg-brand-emerald' : 'bg-slate-400'}`}></span>
                            </span>
                            <div className="text-left space-y-1">
                              <div className="flex justify-between items-center gap-4">
                                <span className="text-[10px] font-bold text-slate-500">
                                  {new Date(log.criado_em).toLocaleString('pt-BR')}
                                </span>
                                {isSystem && log.etapa_nova && (
                                  <span className="text-[8px] bg-slate-100 border border-slate-200 font-bold px-1.5 py-0.5 rounded text-slate-600">
                                    Mudança de Etapa
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-700 font-medium leading-relaxed">{log.anotacao}</p>
                              {log.etapa_anterior && log.etapa_nova && log.etapa_anterior !== log.etapa_nova && (
                                <div className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
                                  <span>{getStageFriendlyName(log.etapa_anterior)}</span>
                                  <ChevronRight className="w-2.5 h-2.5" />
                                  <span className="text-slate-600 font-bold">{getStageFriendlyName(log.etapa_nova)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
