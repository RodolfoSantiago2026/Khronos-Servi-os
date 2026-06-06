"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Search, ShieldCheck, BadgeCheck, Zap, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: <Search className="w-6 h-6" />,
    title: "Triagem Rigorosa",
    description: "Analisamos o histórico, certificações e a saúde financeira de cada empresa parceira antes de entrar no Hub."
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Garantia de Qualidade",
    description: "A Hubly Pro audita os projetos para garantir que a instalação siga as normas técnicas e de segurança."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Melhor Negociação",
    description: "Por sermos um Hub, negociamos em grande volume para garantir o melhor preço para você cliente final."
  }
];

export default function TrustSection() {
  return (
    <section className="py-24 px-6 w-full max-w-7xl mx-auto">
      <div className="bg-slate-950 rounded-[3.5rem] p-8 md:p-20 text-white relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/5">
        {/* Background Decor - Refined Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-emerald/20 blur-[120px] rounded-full animate-pulse-subtle" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full animate-pulse-subtle" style={{ animationDelay: '2s' }} />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-emerald/10 text-brand-emerald text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-brand-emerald/20 backdrop-blur-sm">
              <BadgeCheck className="w-4 h-4" /> Qualidade Homologada
            </div>
            
            <h2 className="text-4xl md:text-6xl font-montserrat font-black leading-[1.1] mb-8 uppercase tracking-tighter">
              POR QUE CONTRATAR <br/>VIA <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald to-emerald-400">HUBLY PRO?</span>
            </h2>
            
            <p className="text-slate-400 text-base md:text-xl mb-10 leading-relaxed font-medium max-w-lg">
              Diferente de contratar uma empresa direto no escuro, o <strong className="text-white">Hubly Pro</strong> é a sua camada de proteção absoluta. Selecionamos apenas a elite do mercado.
            </p>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-5 p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md shadow-xl transition-colors hover:bg-white/10"
            >
               <div className="w-14 h-14 bg-gradient-to-br from-brand-emerald to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl shadow-emerald-500/20">
                 <ShieldCheck className="w-8 h-8 text-white" />
               </div>
               <div>
                 <p className="text-sm md:text-base font-black uppercase tracking-wider mb-1">Certificado de Homologação</p>
                 <p className="text-xs text-slate-400 font-medium">Apenas <span className="text-brand-emerald font-bold">15% das empresas</span> que aplicam são aprovadas em nosso rigoroso processo de auditoria.</p>
               </div>
            </motion.div>
          </div>

          <div className="grid gap-6">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ x: 10 }}
                className="group flex gap-6 p-8 glass-dark rounded-[2.5rem] border border-white/5 hover:border-brand-emerald/30 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-brand-emerald flex-shrink-0 group-hover:bg-brand-emerald group-hover:text-white transition-all shadow-inner">
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-black text-lg md:text-xl mb-2 uppercase tracking-tight group-hover:text-brand-emerald transition-colors">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
