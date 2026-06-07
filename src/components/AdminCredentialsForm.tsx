"use client";

import React, { useState, useEffect } from 'react';
import { Mail, Lock, Key, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldAlert, RefreshCw } from 'lucide-react';
import { getAdminCredentialsAction, updateAdminCredentialsAction } from '@/app/actions/settings';

export default function AdminCredentialsForm() {
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Statuses
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Load current email on mount
  useEffect(() => {
    async function loadCredentials() {
      try {
        const res = await getAdminCredentialsAction();
        if (res.success && res.email) {
          setEmail(res.email);
        } else if (res.error) {
          setErrorMsg(res.error);
        }
      } catch (err: any) {
        setErrorMsg("Não foi possível carregar o e-mail atual do administrador.");
      } finally {
        setFetching(false);
      }
    }
    loadCredentials();
  }, []);

  // Countdown for session invalidation redirect
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      window.location.href = '/admin/login';
      return;
    }
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Real-time password validations
  const passHasMinLength = newPassword.length >= 8;
  const passHasLettersAndNumbers = /[a-zA-Z]/.test(newPassword) && /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword;

  // Determine strength level
  let strengthPercent = 0;
  let strengthColor = 'bg-slate-200';
  let strengthText = 'Sem senha nova';

  if (newPassword) {
    if (passHasMinLength) strengthPercent += 50;
    if (passHasLettersAndNumbers) strengthPercent += 50;

    if (strengthPercent === 50) {
      strengthColor = 'bg-amber-500';
      strengthText = 'Fraca (Mínimo 8 caracteres e misturar letras/números)';
    } else if (strengthPercent === 100) {
      strengthColor = 'bg-emerald-500';
      strengthText = 'Forte';
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validate inputs
    if (!email.trim()) {
      setErrorMsg("O e-mail mestre é obrigatório.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg("Por favor, insira um endereço de e-mail válido (exemplo@dominio.com).");
      return;
    }

    if (!currentPassword) {
      setErrorMsg("A senha atual é obrigatória para autorizar qualquer alteração.");
      return;
    }

    if (newPassword) {
      if (!passHasMinLength || !passHasLettersAndNumbers) {
        setErrorMsg("A nova senha não atende aos requisitos de segurança.");
        return;
      }
      if (!passwordsMatch) {
        setErrorMsg("A nova senha e a confirmação não coincidem.");
        return;
      }
    }

    setLoading(true);

    try {
      const res = await updateAdminCredentialsAction(
        currentPassword,
        email.trim(),
        newPassword ? newPassword.trim() : undefined
      );

      if (res.success) {
        setSuccessMsg("Credenciais atualizadas com sucesso! Sua sessão será encerrada para segurança.");
        setCountdown(4); // Inicia contagem regressiva para relogar
      } else {
        setErrorMsg(res.error || "Ocorreu um erro ao atualizar as credenciais.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro de comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
        <RefreshCw className="w-8 h-8 text-brand-emerald animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500 font-medium">Carregando credenciais mestre...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
      {/* Coluna do Formulário (Ocupa 2 partes) */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Key className="w-4 h-4 text-brand-emerald" /> Alterar E-mail e Senha Mestre
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Atualize o e-mail ou defina uma nova senha para o acesso de administrador geral.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
          {/* Alerts */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs font-semibold flex items-start gap-2.5 animate-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-xs font-semibold flex flex-col gap-1.5 animate-in slide-in-from-top-1">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
              {countdown !== null && (
                <span className="text-[10px] text-emerald-600 font-bold ml-6">
                  Redirecionando para login em {countdown} segundos...
                </span>
              )}
            </div>
          )}

          {/* Campo E-mail Mestre */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              E-mail Mestre *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                disabled={loading || countdown !== null}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@grupokhronos.com.br"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald text-slate-800 font-semibold bg-slate-50/50 disabled:opacity-60"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 my-6 pt-4">
            <h3 className="text-xs font-bold text-slate-700 mb-4 uppercase tracking-wider">Segurança e Senha</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo Nova Senha */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Nova Senha (Opcional)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showNew ? "text" : "password"}
                    disabled={loading || countdown !== null}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo de 8 caracteres"
                    className="w-full pl-9 pr-10 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald text-slate-800 bg-slate-50/50 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Nova Senha */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    disabled={!newPassword || loading || countdown !== null}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full pl-9 pr-10 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald text-slate-800 bg-slate-50/50 disabled:opacity-60 disabled:bg-slate-100/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    disabled={!newPassword}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none disabled:opacity-30"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Requisitos / Validações da Nova Senha */}
            {newPassword && (
              <div className="mt-3.5 space-y-2.5 bg-slate-50 border border-slate-150 rounded-lg p-3.5 animate-in slide-in-from-top-1">
                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    <span>Força da Senha</span>
                    <span className={strengthPercent === 100 ? 'text-emerald-600' : 'text-amber-600'}>{strengthText}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${strengthColor} transition-all duration-300`} style={{ width: `${strengthPercent}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-semibold">
                  <div className="flex items-center gap-1.5">
                    {passHasMinLength ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-slate-300" />
                    )}
                    <span className={passHasMinLength ? 'text-emerald-700' : 'text-slate-400'}>Mínimo 8 caracteres</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {passHasLettersAndNumbers ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-slate-300" />
                    )}
                    <span className={passHasLettersAndNumbers ? 'text-emerald-700' : 'text-slate-400'}>Conter letras e números</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {confirmPassword && passwordsMatch ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-slate-300" />
                    )}
                    <span className={confirmPassword && passwordsMatch ? 'text-emerald-700' : 'text-slate-400'}>Senhas coincidem</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 my-6 pt-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Autorização e Confirmação</h3>
            
            {/* Campo Senha Atual */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
                Senha Atual * (Necessária para salvar alterações)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type={showCurrent ? "text" : "password"}
                  required
                  disabled={loading || countdown !== null}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Confirme sua senha administrativa atual"
                  className="w-full pl-9 pr-10 py-2 text-xs border border-red-200 rounded-md focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-slate-800 bg-red-50/5 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
          <button
            type="button"
            disabled={loading || countdown !== null}
            onClick={() => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-md text-xs font-semibold transition-all disabled:opacity-50"
          >
            Limpar Campos
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || countdown !== null}
            className="bg-brand-emerald text-white px-5 py-2 rounded-md text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </button>
        </div>
      </div>

      {/* Coluna de Instruções de Segurança (Ocupa 1 parte) */}
      <div className="bg-[#0F0F0F] text-slate-300 rounded-xl p-6 shadow-sm border border-slate-800 flex flex-col justify-between">
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-brand-orange">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span className="font-bold text-xs uppercase tracking-wider">Aviso de Segurança</span>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-slate-400 font-medium">
            <p>
              As credenciais mestre fornecem controle total sobre os dados do CRM e a edição de conteúdos institucionais.
            </p>
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg space-y-2">
              <p className="font-bold text-slate-200 text-[11px] uppercase tracking-wider">Boas Práticas:</p>
              <ul className="list-disc pl-4 space-y-1.5 text-[11px]">
                <li>Use uma senha que não seja idêntica a de outros serviços.</li>
                <li>Misture letras maiúsculas, minúsculas, números e caracteres especiais.</li>
                <li>Nunca compartilhe esta senha por e-mail ou canais de chat abertos.</li>
              </ul>
            </div>
            <p className="text-amber-500 font-bold bg-amber-500/10 border border-amber-500/25 p-3 rounded-lg">
              Importante: Alterar o e-mail ou a senha administrativa removerá seu cookie de sessão ativa. Você precisará realizar um novo login imediatamente.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-850 mt-6 lg:mt-0 text-[10px] text-slate-500 font-bold text-center">
          Khronos CRM • Painel de Segurança
        </div>
      </div>
    </div>
  );
}
