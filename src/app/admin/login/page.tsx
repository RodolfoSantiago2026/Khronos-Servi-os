"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Erro ao fazer login');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-emerald/10 dark:bg-brand-emerald/5 blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-emerald/30 to-brand-emerald/10 dark:from-brand-emerald/20 dark:to-transparent text-brand-emerald rounded-2xl flex items-center justify-center mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-poppins font-bold text-brand-navy dark:text-slate-100">Área Administrativa</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-2">Digite o e-mail mestre e a senha para acessar os leads do CRM.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail mestre..."
              required
              className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald/50 transition-all shadow-inner"
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha..."
              required
              className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald/50 transition-all shadow-inner"
            />
          </div>

          {error && <p className="text-[#FF4444] text-xs font-bold text-center animate-pulse">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-emerald hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-brand-emerald/20 transition-all cursor-pointer"
          >
            {loading ? 'Entrando...' : 'ACESSAR CRM'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

