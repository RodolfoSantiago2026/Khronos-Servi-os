import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Zap, Building, Home, Sparkles, Shield } from 'lucide-react';
import Header from '@/components/Header';
import TrustSection from '@/components/TrustSection';
import Testimonials from '@/components/Testimonials';
import LeadForm from '@/components/LeadForm';
import Footer from '@/components/Footer';
import { getAllSiteSettingsAction } from '@/app/actions/settings';
import EVCalculator from '@/components/EVCalculator';

export default async function MobilidadeEletricaPage() {
  const settingsRes = await getAllSiteSettingsAction();
  const settings = settingsRes.success ? settingsRes.data : null;
  
  // Encontrar a configuração específica para este serviço ou usar fallback robusto
  const service = (settings?.services || []).find((s: any) => s.id === 'mobilidade_eletrica') || {
    title: 'Carregamento Veicular',
    description: 'Instalação e homologação de carregadores veiculares inteligentes para condomínios, apartamentos e residências.',
    subpage_image: '/images/carregamento_ev.png',
    differentials_title: 'Diferenciais do Serviço:',
    differentials: [
      "Projetos de infraestrutura aprovados na concessionária",
      "Carregadores inteligentes com balanceamento dinâmico de carga",
      "Gestão de rateio e cobrança individual por aplicativo",
      "Instalação 100% segura com engenharia especializada Khronos"
    ]
  };

  const testimonialsData = settings?.testimonials || [];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-emerald/10 dark:bg-brand-emerald/5 blur-[120px]" />
        <div className="absolute top-[30%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-[120px]" />
      </div>

      <Header />

      {/* Hero Service */}
      <section className="w-full pt-32 pb-0 px-4 flex flex-col items-center">
        <div className="w-full max-w-6xl mb-8 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-emerald transition-colors font-semibold text-sm">
            <ArrowLeft className="w-4 h-4" />
            Voltar para a Home
          </Link>
        </div>

        <div className="max-w-4xl text-center mb-12">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-emerald/10 text-brand-emerald text-xs font-bold uppercase tracking-widest mb-6 border border-brand-emerald/20 shadow-sm">
             <ShieldCheck className="w-4 h-4" /> Serviço Homologado Khronos
           </div>
           <h1 className="text-4xl md:text-6xl font-poppins font-black text-brand-navy dark:text-slate-100 uppercase tracking-tight leading-[1.1]">
             {service.title}
           </h1>
           <p className="text-slate-500 dark:text-slate-400 mt-6 text-lg max-w-2xl mx-auto font-medium">
             {service.description}
           </p>
        </div>
      </section>
      
      {/* 3 Verticals Segments */}
      <section className="w-full py-16 px-4 max-w-6xl">
        <div className="text-center mb-12">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-emerald">Nossas Soluções</span>
          <h2 className="text-2xl md:text-3xl font-poppins font-black text-brand-navy dark:text-slate-100 uppercase tracking-tighter mt-1">
            Planejamento Inteligente para Cada Cenário
          </h2>
          <div className="w-12 h-1 bg-brand-emerald rounded-full mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Casa */}
          <div className="glass dark:glass-dark rounded-[2rem] p-8 border border-white/40 dark:border-slate-800/40 relative overflow-hidden flex flex-col justify-between hover:border-brand-emerald/30 transition-all duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-emerald/10 flex items-center justify-center text-brand-emerald mb-6 group-hover:scale-110 transition-transform">
                <Home className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold uppercase text-brand-navy dark:text-white mb-3 tracking-tight">Residências e Casas</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                Tenha a conveniência de abastecer seu veículo elétrico todas as noites com segurança máxima e alta velocidade. Oferecemos integração inteligente com o seu sistema de <strong>Energia Solar</strong>, permitindo que você carregue seu veículo utilizando energia 100% limpa e com custo zero de combustível.
              </p>
            </div>
            <div className="text-xs font-bold text-brand-emerald flex flex-col gap-1 mt-4">
              <span>• Recarga rápida e inteligente (7.4 kW a 22 kW)</span>
              <span>• Integração com geração fotovoltaica residencial</span>
            </div>
          </div>

          {/* Condomínio */}
          <div className="glass dark:glass-dark rounded-[2rem] p-8 border border-white/40 dark:border-slate-800/40 relative overflow-hidden flex flex-col justify-between hover:border-brand-emerald/30 transition-all duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-emerald/10 flex items-center justify-center text-brand-emerald mb-6 group-hover:scale-110 transition-transform">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold uppercase text-brand-navy dark:text-white mb-3 tracking-tight">Condomínios Verticais</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                A solução completa para condomínios residenciais e comerciais. Desenvolvemos a infraestrutura coletiva planejada com sistema de <strong>Smart Charging</strong> (gerenciamento dinâmico que evita picos de sobrecarga na rede do prédio) e controle de acesso via RFID ou aplicativo, automatizando a cobrança de forma 100% individualizada.
              </p>
            </div>
            <div className="text-xs font-bold text-brand-emerald flex flex-col gap-1 mt-4">
              <span>• Gestão de rateio e cobrança automática por usuário</span>
              <span>• Balanceamento dinâmico de carga contra quedas</span>
            </div>
          </div>

          {/* Vagas Individuais / Apartamento */}
          <div className="glass dark:glass-dark rounded-[2rem] p-8 border border-white/40 dark:border-slate-800/40 relative overflow-hidden flex flex-col justify-between hover:border-brand-emerald/30 transition-all duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-emerald/10 flex items-center justify-center text-brand-emerald mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold uppercase text-brand-navy dark:text-white mb-3 tracking-tight">Vagas de Garagem Individuais</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                Projete e execute a instalação do seu carregador individual interligado diretamente ao medidor do seu próprio apartamento. Cuidamos de toda a infraestrutura física, cabeamento de proteção blindado e processo de <strong>homologação junto à concessionária de energia</strong>, valorizando o seu imóvel sem impactar os vizinhos.
              </p>
            </div>
            <div className="text-xs font-bold text-brand-emerald flex flex-col gap-1 mt-4">
              <span>• Conexão dedicada ligada ao relógio da sua unidade</span>
              <span>• Homologação completa com engenharia credenciada</span>
            </div>
          </div>
        </div>
      </section>

      {/* Simulator Section */}
      <section className="w-full bg-slate-100/60 dark:bg-slate-900/60 py-16 border-y border-slate-200 dark:border-slate-800">
        <EVCalculator />
      </section>

      {/* Details and Differentials */}
      <div className="py-20 w-full bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white dark:border-slate-700">
             <img src={service.subpage_image || service.image || "/images/carregamento_ev.png"} alt={service.title} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 to-transparent" />
             <div className="absolute bottom-6 left-6 text-white">
                <Zap className="w-8 h-8 text-brand-emerald mb-2" />
                <p className="font-bold text-xl uppercase tracking-tighter">Energia no seu Tempo</p>
             </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-brand-navy dark:text-white uppercase tracking-tight">
              {service.differentials_title || 'Diferenciais do Serviço:'}
            </h3>
            
            <ul className="space-y-4">
              {(service.differentials || []).map((item: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm md:text-base">
                  <div className="w-6 h-6 rounded-full bg-brand-emerald/20 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-brand-emerald" />
                  </div>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>

            {/* Safety details - Crucial for EV */}
            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Segurança Absoluta e Normas Técnicas
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Veículos elétricos demandam alta corrente de forma contínua por várias horas. Para prevenir riscos de sobreaquecimento, nossas instalações atendem estritamente às normas <strong>NBR 5410</strong> e <strong>NBR 17019</strong>. Utilizamos exclusivamente <strong>Dispositivos DR Tipo B</strong> (essenciais para detectar fugas de corrente contínuas residuais de EVs), disjuntores adequados, proteção contra surtos (DPS) e eletrodutos metálicos de alta resistência.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Testimonials serviceId="mobilidade_eletrica" data={testimonialsData} />
      <TrustSection data={settings?.trust} />
      <LeadForm defaultService="Carregamento Veicular" />
      <Footer />
    </main>
  );
}
