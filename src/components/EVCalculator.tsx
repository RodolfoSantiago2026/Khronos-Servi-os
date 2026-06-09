"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Fuel, Zap, Leaf, TrendingDown, HelpCircle } from 'lucide-react';

export default function EVCalculator() {
  const [kmMensal, setKmMensal] = useState(1500);
  const [consumoCombustivel, setConsumoCombustivel] = useState(10); // km/l
  const [precoCombustivel, setPrecoCombustivel] = useState(5.80); // R$/l
  const [tarifaEnergia, setTarifaEnergia] = useState(0.85); // R$/kWh
  
  // Consumo médio de um veículo elétrico: 6 km por kWh (16.6 kWh/100km)
  const consumoEV = 6; 

  // Cálculos
  const litrosCombustivel = kmMensal / consumoCombustivel;
  const custoCombustivel = litrosCombustivel * precoCombustivel;

  const kwhNecessario = kmMensal / consumoEV;
  const custoEV = kwhNecessario * tarifaEnergia;

  const economiaMensal = custoCombustivel - custoEV;
  const economiaAnual = economiaMensal * 12;

  // Redução de CO2: média de 120g de CO2 por km para carros a gasolina
  const co2Evitado = (kmMensal * 0.120 * 12) / 1000; // toneladas por ano

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-4xl font-poppins font-black text-brand-navy dark:text-slate-100 uppercase tracking-tighter">
          Simulador de Economia <span className="text-brand-emerald">Mobilidade Elétrica</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-xl mx-auto mt-2">
          Calcule a diferença financeira e o impacto ambiental de trocar o combustível fóssil pela eletricidade.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Controles do Simulador */}
        <div className="lg:col-span-6 glass dark:glass-dark rounded-[2.5rem] p-6 md:p-8 border border-white/40 dark:border-slate-800/40 flex flex-col justify-between space-y-6">
          
          {/* Slider Quilometragem */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold text-brand-navy dark:text-slate-200">
              <span className="flex items-center gap-2">
                <Car className="w-4 h-4 text-brand-emerald" />
                Quilometragem Mensal
              </span>
              <span className="bg-brand-emerald/10 text-brand-emerald px-3 py-1 rounded-full text-xs font-black">
                {kmMensal.toLocaleString()} km
              </span>
            </div>
            <input 
              type="range" 
              min="500" 
              max="5000" 
              step="100"
              value={kmMensal} 
              onChange={(e) => setKmMensal(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-brand-emerald"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
              <span>500 km</span>
              <span>2.500 km</span>
              <span>5.000 km</span>
            </div>
          </div>

          {/* Consumo Combustão */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold text-brand-navy dark:text-slate-200">
              <span className="flex items-center gap-2">
                <Fuel className="w-4 h-4 text-brand-orange" />
                Consumo Médio (Gasolina)
              </span>
              <span className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-xs font-black">
                {consumoCombustivel} km/l
              </span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="20" 
              step="0.5"
              value={consumoCombustivel} 
              onChange={(e) => setConsumoCombustivel(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-brand-orange"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
              <span>5 km/l (SUV/V6)</span>
              <span>12 km/l (Médio)</span>
              <span>20 km/l (Híbrido)</span>
            </div>
          </div>

          {/* Preço Combustível */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold text-brand-navy dark:text-slate-200">
              <span className="flex items-center gap-2">
                Preço da Gasolina (por Litro)
              </span>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-black">
                R$ {precoCombustivel.toFixed(2)}
              </span>
            </div>
            <input 
              type="range" 
              min="4.50" 
              max="8.00" 
              step="0.05"
              value={precoCombustivel} 
              onChange={(e) => setPrecoCombustivel(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-slate-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
              <span>R$ 4,50</span>
              <span>R$ 6,25</span>
              <span>R$ 8,00</span>
            </div>
          </div>

          {/* Tarifa de Energia */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold text-brand-navy dark:text-slate-200">
              <span className="flex items-center gap-2">
                Tarifa de Energia (com Impostos)
              </span>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-black">
                R$ {tarifaEnergia.toFixed(2)}/kWh
              </span>
            </div>
            <input 
              type="range" 
              min="0.50" 
              max="1.50" 
              step="0.05"
              value={tarifaEnergia} 
              onChange={(e) => setTarifaEnergia(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-slate-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
              <span>R$ 0,50 (Baixa)</span>
              <span>R$ 1,00 (Média)</span>
              <span>R$ 1,50 (Alta)</span>
            </div>
          </div>

        </div>

        {/* Resultados / Dashboard */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Card de Economia Principal */}
          <div className="flex-1 bg-gradient-to-br from-brand-emerald to-emerald-700 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            {/* Background decor */}
            <div className="absolute right-0 bottom-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -mr-16 -mb-16 pointer-events-none" />
            <div className="absolute left-6 top-6 opacity-10">
              <TrendingDown className="w-24 h-24 stroke-[4]" />
            </div>

            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-3 py-1 rounded-full">
                Sua Economia Anual Estimada
              </span>
              <div className="mt-4">
                <span className="text-4xl md:text-5xl font-poppins font-black leading-none">
                  R$ {economiaAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <p className="text-xs text-white/80 mt-1 font-medium">
                  Ou cerca de <strong className="text-white">R$ {economiaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> economizados todos os meses.
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-white/20 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-emerald-100">Redução de CO₂</p>
                <div className="flex items-center gap-1.5 mt-1 font-black text-sm">
                  <Leaf className="w-4 h-4 text-emerald-250 fill-emerald-250 animate-bounce" />
                  <span>{co2Evitado.toFixed(1)} toneladas/ano</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-black tracking-widest text-emerald-100">Custo p/ Rodar 100km</p>
                <div className="mt-1 font-black text-sm">
                  <span className="text-xs font-semibold text-emerald-200">Gasolina: R$ {(100 / consumoCombustivel * precoCombustivel).toFixed(0)}</span>
                  <span className="mx-2 text-white/50">|</span>
                  <span className="text-emerald-100">Elétrico: R$ {(100 / consumoEV * tarifaEnergia).toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparativo de Custo Mensal */}
          <div className="glass dark:glass-dark rounded-[2.5rem] p-6 border border-white/40 dark:border-slate-800/40 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-navy dark:text-slate-350">
              Comparativo de Gasto Mensal
            </h3>
            
            <div className="space-y-3">
              {/* Carro Combustão */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>Veículo Combustão</span>
                  <span className="text-brand-orange">R$ {custoCombustivel.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/mês</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    className="h-full bg-brand-orange rounded-full"
                  />
                </div>
              </div>

              {/* Carro Elétrico */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>Veículo Elétrico</span>
                  <span className="text-brand-emerald">R$ {custoEV.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/mês</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(10, Math.min(100, (custoEV / custoCombustivel) * 100))}%` }}
                    className="h-full bg-brand-emerald rounded-full"
                  />
                </div>
              </div>
            </div>
            
            {/* Nota de rodapé explicativa */}
            <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl text-[10px] text-slate-400 dark:text-slate-500">
              <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="leading-normal">
                Cálculos considerando a tarifa média residencial padrão e consumo de 16,6 kWh/100km. A economia pode ser de <strong>até 100%</strong> se você possuir um sistema de Energia Solar fotovoltaica instalado.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
