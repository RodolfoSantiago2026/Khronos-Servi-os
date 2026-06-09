"use client";

import React, { useState, useEffect } from 'react';
import { getSiteSettingsAction } from '@/app/actions/settings';
import { env } from '@/config/env';

export default function FloatingWhatsApp() {
  const [whatsappNumber, setWhatsappNumber] = useState(env.whatsappNumber);
  const [showTooltip, setShowTooltip] = useState(false);

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
        console.error('Erro ao carregar WhatsApp no Floating Button:', err);
      }
    }
    loadWhatsapp();

    // Mostra o balão de ajuda após 3 segundos
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const whatsappMessage = 'Olá! Gostaria de tirar algumas dúvidas sobre as soluções do Grupo Khronos.';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 pointer-events-none">
      
      {/* Tooltip / Balão de Fala */}
      {showTooltip && (
        <div className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl animate-bounce pointer-events-auto flex items-center gap-1.5 transition-all">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Como posso ajudar?
          <button 
            onClick={() => setShowTooltip(false)}
            className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Botão de WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#22c35e] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto relative group"
        title="Falar no WhatsApp"
      >
        {/* Glow pulsing effect */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-35 animate-ping -z-10 group-hover:animate-none" />
        
        {/* Official WhatsApp Logo SVG */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 448 512" 
          className="w-7 h-7 fill-white drop-shadow-md"
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3 496l133.9-35.2c32.7 17.8 69.6 27.2 107.2 27.2 122.4 0 222-99.6 222-222 0-59.3-23.2-115-65.2-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-79.8 21 21.4-77.8-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 54 130.5 0 101.7-82.8 184.5-184.6 184.5zm100.9-138.1c-5.5-2.8-32.6-16.1-37.7-18s-8.8-2.8-12.5 2.8c-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.6-13.4 37.2-26.3 4.6-13 4.6-24.1 3.2-26.3-1.4-2.2-5-3.7-10.5-6.5z"/>
        </svg>
      </a>

    </div>
  );
}
