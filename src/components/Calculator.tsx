"use client";

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Calculator() {
  const [geracao, setGeracao] = useState(500);
  const [tarifa, setTarifa] = useState(0.95);

  const perdaAnual = geracao * tarifa * 0.15 * 12;

  const scrollToForm = () => {
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="px-4 py-12 max-w-lg mx-auto w-full z-10">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/60 dark:border-slate-700/50 p-6 md:p-8"
      >
        <h3 className="font-montserrat font-bold text-center text-xl text-brand-navy dark:text-slate-100 mb-8 flex items-center justify-center gap-3">
          <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
          Calculadora de Economia Perdida
        </h3>

        <div className="space-y-8">
          {/* Slider 1 */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-semibold text-slate-600 dark:text-slate-300">
              <label>Geração Mensal (kWh)</label>
              <span className="text-brand-emerald">{geracao} kWh</span>
            </div>
            <input 
              type="range" 
              min="100" 
              max="5000" 
              step="50"
              value={geracao} 
              onChange={(e) => setGeracao(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-emerald hover:accent-emerald-400 transition-all"
            />
          </div>

          {/* Slider 2 */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-semibold text-slate-600 dark:text-slate-300">
              <label>Tarifa de Energia (R$/kWh)</label>
              <span className="text-brand-emerald">R$ {tarifa.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              min="0.30" 
              max="2.00" 
              step="0.01"
              value={tarifa} 
              onChange={(e) => setTarifa(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-emerald hover:accent-emerald-400 transition-all"
            />
          </div>

          {/* Result Box */}
          <motion.div 
            animate={{ boxShadow: ['0px 0px 0px rgba(255,68,68,0)', '0px 0px 20px rgba(255,68,68,0.3)', '0px 0px 0px rgba(255,68,68,0)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-8 bg-slate-900 rounded-[1.5rem] p-6 text-center shadow-inner border border-slate-800 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF4444] to-transparent opacity-50" />
            <p className="text-[#FF4444] font-mono font-bold text-xl md:text-2xl drop-shadow-[0_0_12px_rgba(255,68,68,0.8)] tracking-tight">
              VOCÊ ESTÁ PERDENDO<br/>
              <span className="text-3xl md:text-4xl">R$ {Math.round(perdaAnual)}/ANO!</span>
            </p>
          </motion.div>

          {/* CTA Button */}
          <button 
            onClick={scrollToForm}
            className="w-full relative overflow-hidden group bg-brand-emerald hover:bg-emerald-400 text-white font-bold py-5 rounded-[1.2rem] shadow-[0_4px_20px_0_rgba(16,185,129,0.4)] transition-all hover:-translate-y-1 flex items-center justify-center gap-3 mt-4"
          >
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-[shine_1.5s]" />
            <span className="text-sm md:text-base tracking-wide z-10 relative">QUERO LIMPAR E ECONOMIZAR</span>
            <div className="bg-white/20 p-2 rounded-full z-10 relative group-hover:bg-white/30 transition-colors">
               <MessageCircle className="w-5 h-5" fill="currentColor" />
            </div>
          </button>
        </div>
      </motion.div>
    </section>
  );
}
