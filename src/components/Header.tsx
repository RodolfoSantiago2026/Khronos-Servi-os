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
            className="hidden sm:flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl border border-slate-200 hover:border-brand-emerald dark:border-slate-800 dark:hover:border-brand-emerald text-[10px] md:text-xs font-black uppercase tracking-wider text-slate-700 hover:text-brand-emerald dark:text-slate-350 dark:hover:text-brand-emerald transition-all duration-200 active:scale-95 shadow-sm"
          >
            <Phone className="w-3.5 h-3.5 text-brand-emerald fill-brand-emerald/10" />
            <span className="hidden md:inline">Falar com Especialista</span>
            <span className="inline md:hidden">Falar com Especialista</span>
          </a>

          {/* Solicitar Orçamento */}
          <a
            href="#lead-form"
            onClick={handleBudgetClick}
            className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-100 transition-all duration-200 active:scale-95 shadow-lg shadow-slate-950/10 dark:shadow-white/5"
          >
            <FileText className="w-3.5 h-3.5" />
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
