"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, FileText } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import KhronosLogo from '@/components/KhronosLogo';
import { getSiteSettingsAction } from '@/app/actions/settings';
import { env } from '@/config/env';

export default function Header() {
  const [whatsappNumber, setWhatsappNumber] = useState(env.whatsappNumber);

  useEffect(() => {
    async function loadWhatsapp() {
      try {
        const settingsRes = await getSiteSettingsAction('general');
        if (settingsRes.success && settingsRes.data) {
          const generalData = settingsRes.data as any;
          if (generalData.whatsappNumber) {
            setWhatsappNumber(generalData.whatsappNumber);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar WhatsApp no Header:', err);
      }
    }
    loadWhatsapp();
  }, []);

  const handleBudgetClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const leadFormElement = document.getElementById('lead-form');
    if (leadFormElement) {
      e.preventDefault();
      leadFormElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const whatsappMessage = 'Olá! Gostaria de falar com um especialista sobre as soluções do Grupo Khronos.';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <header className="sticky top-0 w-full z-50 transition-all duration-300 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/40">
      <div className="max-w-[1440px] mx-auto px-4 py-3 md:px-12 md:py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/" className="group cursor-pointer">
          <KhronosLogo size="md" className="max-h-8 md:max-h-10 w-auto" />
        </Link>

        {/* CTA Actions & Theme Toggle */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Falar com Especialista - WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 md:px-5 md:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 border border-emerald-500/30"
          >
            <Phone className="w-3 h-3 md:w-3.5 md:h-3.5 fill-white/10" />
            <span className="hidden md:inline">Falar com Especialista</span>
            <span className="inline md:hidden">WhatsApp</span>
          </a>

          {/* Solicitar Orçamento */}
          <a
            href="#lead-form"
            onClick={handleBudgetClick}
            className="flex items-center gap-1 md:gap-2 px-3 py-2 md:px-6 md:py-3 rounded-xl bg-gradient-to-r from-brand-orange to-brand-red text-white text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-[1.03] shadow-lg shadow-brand-orange/30 hover:brightness-110 border border-white/10 relative overflow-hidden group/btn"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shine pointer-events-none" />
            <FileText className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span>Orçamento</span>
          </a>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
