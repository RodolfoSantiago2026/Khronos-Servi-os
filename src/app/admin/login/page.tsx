"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowLeft, CheckCircle2, MessageCircle, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import { verifyAdminEmailAction } from '@/app/actions/settings';

export default function LoginPage() {
  const [view, setView] = useState<'login' | 'forgot'>('login');
  
  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);

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

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryLoading(true);
    setRecoveryError('');
    setRecoverySuccess(false);

    try {
      const res = await verifyAdminEmailAction(forgotEmail);
      if (res.success) {
        setRecoverySuccess(true);
      } else {
        setRecoveryError(res.error || 'E-mail não cadastrado como administrador.');
      }
    } catch (err) {
      setRecoveryError('Erro de conexão com o servidor.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-emerald/10 dark:bg-brand-emerald/5 blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-250"
      >
        {view === 'login' ? (
          <>
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

              <div className="flex justify-end pr-1">
                <button
                  type="button"
                  onClick={() => {
                    setView('forgot');
                    setError('');
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-brand-emerald transition-all cursor-pointer bg-transparent border-none outline-none"
                >
                  Esqueci a senha
                </button>
              </div>

              {error && <p className="text-[#FF4444] text-xs font-bold text-center animate-pulse">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-emerald hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-brand-emerald/20 transition-all cursor-pointer disabled:opacity-55"
              >
                {loading ? 'Entrando...' : 'ACESSAR CRM'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-emerald/30 to-brand-emerald/10 dark:from-brand-emerald/20 dark:to-transparent text-brand-emerald rounded-2xl flex items-center justify-center mb-4">
                <Key className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-poppins font-bold text-brand-navy dark:text-slate-100">Recuperar Acesso</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-2">
                Informe seu e-mail administrativo para iniciar a recuperação.
              </p>
            </div>

            {!recoverySuccess ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="E-mail cadastrado..."
                    required
                    className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald/50 transition-all shadow-inner"
                  />
                </div>

                {recoveryError && <p className="text-[#FF4444] text-xs font-bold text-center animate-pulse">{recoveryError}</p>}

                <button
                  type="submit"
                  disabled={recoveryLoading}
                  className="w-full bg-brand-emerald hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-brand-emerald/20 transition-all cursor-pointer disabled:opacity-55"
                >
                  {recoveryLoading ? 'Verificando...' : 'VERIFICAR E-MAIL'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    setRecoveryError('');
                    setForgotEmail('');
                  }}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white py-2 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar para o Login
                </button>
              </form>
            ) : (
              <div className="space-y-5 text-center">
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-2xl flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold leading-relaxed">
                    Identidade administrativa validada com sucesso!
                  </p>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-left space-y-2 font-medium">
                  <p>
                    Por motivos de segurança e por se tratar de um <strong>acesso mestre administrativo</strong>, a redefinição é autenticada através do WhatsApp de suporte do Grupo Khronos.
                  </p>
                  <p>
                    Clique no botão abaixo para iniciar o suporte de redefinição com a mensagem pré-configurada para seu e-mail:
                  </p>
                </div>

                <a
                  href={`https://wa.me/5548984773379?text=Olá,%20gostaria%20de%20solicitar%20a%20redefinição%2520de%2520senha%2520do%2520CRM%2520para%2520o%2520e-mail%2520${encodeURIComponent(forgotEmail.trim())}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-4 rounded-xl shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer text-xs uppercase"
                >
                  <MessageCircle className="w-5 h-5 animate-pulse" /> SOLICITAR VIA WHATSAPP
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    setRecoverySuccess(false);
                    setForgotEmail('');
                  }}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white py-2 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar para o Login
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
