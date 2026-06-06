/**
 * Solar system estimation configurations and calculator parameters
 */

export const TARIFFS: Record<string, number> = {
  celesc: 1.08,
  edp:    0.94,
  enel:   0.85,
  outra:  0.90,
};

export const IRRADIATION: Record<string, number> = {
  SC: 4.5, RS: 4.4, PR: 4.7, SP: 5.0, RJ: 5.1, MG: 5.2,
  ES: 5.1, BA: 5.8, GO: 5.5, MT: 5.4, MS: 5.3, DF: 5.4,
  CE: 5.9, PE: 5.8, MA: 5.7, PI: 6.0, RN: 5.9, PB: 5.8,
  AL: 5.7, SE: 5.6, PA: 5.2, AM: 4.8, RO: 5.0, AC: 4.9,
  RR: 5.1, AP: 4.8, TO: 5.5,
};

export const COST_PER_KWP = 4800;
export const COVERAGE_RATIO = 0.90; // System covers 90% of the bill
export const CO2_FACTOR = 0.08;     // Brazilian grid average (kg CO2 per kWh)
export const PERFORMANCE_RATIO = 0.75;

export interface CalcResult {
  economiaM:    number; // Monthly savings R$
  economiaA:    number; // Annual savings R$
  economia25:   number; // 25-year savings R$
  potencia:     number; // System power kWp
  custoProjeto: number; // Estimated project cost R$
  payback:      number; // Payback in months
  co2Anual:     number; // CO₂ avoided per year in kg
  co2Total:     number; // CO₂ avoided in 25 years in kg
  geracao:      number; // Monthly generation in kWh
}

/**
 * Calculates solar parameters based on bill value, concessionária, and state
 */
export function calcularSolar(valorConta: number, concessionaria: string, uf: string): CalcResult {
  const tarifa      = TARIFFS[concessionaria] ?? 0.90;
  const irradiacao  = IRRADIATION[uf.toUpperCase()] ?? 4.5;

  // kWh consumed monthly
  const consumoMensal = valorConta / tarifa;

  // System size in kWp
  const potencia = (consumoMensal * COVERAGE_RATIO) / (irradiacao * 30 * PERFORMANCE_RATIO);

  // Monthly generation (kWh)
  const geracao = potencia * irradiacao * 30 * PERFORMANCE_RATIO;

  // Monthly savings in R$ (generation * tariff)
  const economiaM    = geracao * tarifa;
  const economiaA    = economiaM * 12;
  const economia25   = economiaA * 25;

  // Project cost estimate
  const custoProjeto = potencia * COST_PER_KWP;

  // Payback in months
  const payback = custoProjeto / economiaM;

  // CO₂ avoided
  const co2Anual = geracao * 12 * CO2_FACTOR;
  const co2Total = co2Anual * 25;

  return {
    economiaM:    Math.round(economiaM * 100) / 100,
    economiaA:    Math.round(economiaA),
    economia25:   Math.round(economia25),
    potencia:     Math.round(potencia * 100) / 100,
    custoProjeto: Math.round(custoProjeto),
    payback:      Math.round(payback),
    co2Anual:     Math.round(co2Anual),
    co2Total:     Math.round(co2Total),
    geracao:      Math.round(geracao),
  };
}

/**
 * Resolves UF by CEP prefix (first 5 digits)
 */
export function ufFromCep(cep: string): string {
  const num = parseInt(cep.replace(/\D/g, '').slice(0, 5));
  if (isNaN(num)) return '';
  if (num >= 1000 && num <= 19999) return 'SP';
  if (num >= 20000 && num <= 28999) return 'RJ';
  if (num >= 29000 && num <= 29999) return 'ES';
  if (num >= 30000 && num <= 39999) return 'MG';
  if (num >= 40000 && num <= 48999) return 'BA';
  if (num >= 49000 && num <= 49999) return 'SE';
  if (num >= 50000 && num <= 56999) return 'PE';
  if (num >= 57000 && num <= 57999) return 'AL';
  if (num >= 58000 && num <= 58999) return 'PB';
  if (num >= 59000 && num <= 59999) return 'RN';
  if (num >= 60000 && num <= 63999) return 'CE';
  if (num >= 64000 && num <= 64999) return 'PI';
  if (num >= 65000 && num <= 65999) return 'MA';
  if (num >= 66000 && num <= 68899) return 'PA';
  if (num >= 68900 && num <= 68999) return 'AP';
  if (num >= 69000 && num <= 69299) return 'AM';
  if (num >= 69300 && num <= 69399) return 'RR';
  if (num >= 69400 && num <= 69899) return 'AM';
  if (num >= 69900 && num <= 69999) return 'AC';
  if (num >= 70000 && num <= 73699) return 'DF';
  if (num >= 73700 && num <= 76799) return 'GO';
  if (num >= 76800 && num <= 76999) return 'RO';
  if (num >= 77000 && num <= 77999) return 'TO';
  if (num >= 78000 && num <= 78899) return 'MT';
  if (num >= 78900 && num <= 79999) return 'MS';
  if (num >= 80000 && num <= 87999) return 'PR';
  if (num >= 88000 && num <= 89999) return 'SC';
  if (num >= 90000 && num <= 99999) return 'RS';
  return '';
}
