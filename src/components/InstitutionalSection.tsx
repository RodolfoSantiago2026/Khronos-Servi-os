'use client';

import React from 'react';
import { Building2, Camera, Home, Bell, Shield, Car, Check } from 'lucide-react';

export default function InstitutionalSection() {
  const scCities = [
    'Florianópolis',
    'Balneário Camboriú',
    'Blumenau',
    'Joinville',
    'Tubarão',
    'Criciúma',
    'Lages',
    'Videira',
    'Chapecó'
  ];

  const otherStates = [
    { state: 'RS', city: 'Porto Alegre' },
    { state: 'MT', city: 'Cuiabá' },
    { state: 'MS', city: 'Campo Grande' },
    { state: 'MG', city: 'Belo Horizonte' },
    { state: 'PR', city: 'Curitiba' }
  ];

  return (
    <section className="w-full py-24 px-6 md:px-12 bg-slate-50 dark:bg-slate-950 relative overflow-hidden border-t border-slate-200/50 dark:border-slate-800/50">
      
      {/* Background Large Watermark Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.02] select-none z-0">
        <span className="text-[12vw] font-poppins font-black tracking-widest uppercase">
          Grupo Khronos
        </span>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-16">
          <div className="lg:w-[45%]">
            <h2 className="text-4xl md:text-6xl font-poppins font-black text-brand-navy dark:text-white tracking-tighter uppercase leading-[0.95]">
              Grupo <br />
              <span className="text-brand-red">Khronos</span>
            </h2>
          </div>
          <div className="lg:w-[50%] lg:pt-4">
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-medium">
              A Khronos foi fundada em 1984 fabricando sistemas de segurança para residências, comércio e indústrias. Hoje conta com mais de 15 unidades distribuídas no Brasil.
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Side: Stats and Info */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Stat block 1: 40 Years */}
            <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
              <div className="flex items-baseline gap-1">
                <span className="text-8xl md:text-9xl font-poppins font-thin text-slate-300 dark:text-slate-800 leading-none">
                  40
                </span>
                <span className="text-2xl font-bold text-slate-400 dark:text-slate-600 font-poppins">Anos</span>
              </div>
              <div className="flex-1 sm:pt-4 space-y-4">
                <h3 className="text-xl font-poppins font-black text-brand-navy dark:text-white uppercase tracking-tight">
                  + de 40 anos no mercado
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-red flex-shrink-0 animate-pulse" />
                    <span className="text-slate-600 dark:text-slate-400 text-sm font-semibold">
                      Mais de 30.000 clientes
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-red flex-shrink-0 animate-pulse" />
                    <span className="text-slate-600 dark:text-slate-400 text-sm font-semibold">
                      2.500 colaboradores diretos
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stat block 2: 15 Units */}
            <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
              <div className="flex items-baseline gap-1">
                <span className="text-8xl md:text-9xl font-poppins font-thin text-slate-300 dark:text-slate-800 leading-none">
                  15
                </span>
                <span className="text-2xl font-bold text-slate-400 dark:text-slate-600 font-poppins">Unidades</span>
              </div>
              <div className="flex-1 sm:pt-4 space-y-4">
                <h3 className="text-xl font-poppins font-black text-brand-navy dark:text-white uppercase tracking-tight">
                  + de 15 unidades no Brasil
                </h3>
                
                {/* Cities Column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/40 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm">
                  
                  {/* SC list */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-red flex-shrink-0" />
                      <span className="font-poppins font-black text-brand-navy dark:text-white text-sm">SC (Santa Catarina)</span>
                    </div>
                    <div className="flex flex-wrap gap-x-2 gap-y-1 pl-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {scCities.map((city, idx) => (
                        <span key={city}>
                          {city}
                          {idx < scCities.length - 1 ? ' •' : ''}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Other states list */}
                  <div className="space-y-3">
                    {otherStates.map((item) => (
                      <div key={item.state} className="flex items-start gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-red flex-shrink-0 mt-1.5" />
                        <div>
                          <span className="font-poppins font-black text-brand-navy dark:text-white text-sm block">
                            {item.state}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {item.city}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            </div>

          </div>

          {/* Right Side: Interactive Connect Graph Illustration */}
          <div className="lg:col-span-5 flex justify-center items-center relative py-12">
            
            {/* Orbits / Background Rings */}
            <div className="absolute w-[360px] h-[360px] md:w-[440px] md:h-[440px] border border-slate-200 dark:border-slate-800 rounded-full animate-[spin_40s_linear_infinite]" />
            <div className="absolute w-[280px] h-[280px] md:w-[340px] md:h-[340px] border border-dashed border-slate-300 dark:border-slate-800 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
            
            {/* Center Circular Profile */}
            <div className="w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl relative z-10 group bg-slate-200 dark:bg-slate-800">
              <img 
                src="/images/businesswoman-security.png" 
                alt="Khronos App Connected Ecosystem" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-red/35 to-transparent mix-blend-overlay" />
            </div>

            {/* Smart badges / Connected Items surrounding the circle */}
            
            {/* CCTV Camera Badge (Top-Left) */}
            <div className="absolute top-2 left-6 md:top-6 md:left-12 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-lg text-slate-700 dark:text-slate-300 hover:scale-110 transition-transform">
              <Camera className="w-5 h-5 text-brand-red" />
            </div>

            {/* Corporate Building Badge (Left) */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-8 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-lg text-slate-700 dark:text-slate-300 hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5 text-brand-red" />
            </div>

            {/* Shield/Police Badge (Bottom-Left) */}
            <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-lg text-slate-700 dark:text-slate-300 hover:scale-110 transition-transform">
              <Shield className="w-5 h-5 text-brand-red" />
            </div>

            {/* Smart Home Badge (Top-Right) */}
            <div className="absolute top-0 right-6 md:top-4 md:right-12 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-lg text-slate-700 dark:text-slate-300 hover:scale-110 transition-transform">
              <Home className="w-5 h-5 text-brand-red" />
            </div>

            {/* Alarm Bell Badge (Right) */}
            <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-8 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-lg text-slate-700 dark:text-slate-300 hover:scale-110 transition-transform">
              <Bell className="w-5 h-5 text-brand-red" />
            </div>

            {/* Emergency Vehicle Badge (Bottom-Right / Overlaps the circle) */}
            <div className="absolute bottom-0 right-0 md:bottom-2 md:right-4 z-25 flex items-center justify-center w-[76px] h-[76px] rounded-full overflow-hidden border-[3px] border-white dark:border-slate-900 shadow-2xl hover:scale-115 transition-transform bg-slate-100 dark:bg-slate-800">
              <img 
                src="/images/security-car.png" 
                alt="Security Response Patrol Unit" 
                className="w-full h-full object-cover" 
              />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
