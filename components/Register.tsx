import React, { useState } from 'react';

interface RegisterProps {
  onRegister: (details: { fullName: string; birthDate: string; email: string; password: string; }) => void;
  onSwitchToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegister, onSwitchToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !birthDate || !email || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setError('');
    onRegister({ fullName, birthDate, email, password });
  };

  return (
    <div className="flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-white/20 p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-emerald-800 dark:text-white">
            Criar Nova Conta
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-center text-sm text-red-600">{error}</p>}
          <div className="rounded-md shadow-sm space-y-4">
             <input type="text" placeholder="Nome Completo" required value={fullName} onChange={e => setFullName(e.target.value)} className="appearance-none relative block w-full px-3 py-2 border border-emerald-300 dark:border-emerald-600 bg-white dark:bg-stone-50/20 placeholder-stone-500 dark:placeholder-white/50 text-stone-950 dark:text-white rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
             <input type="date" placeholder="Data de Nascimento" required value={birthDate} onChange={e => setBirthDate(e.target.value)} className="appearance-none relative block w-full px-3 py-2 border border-emerald-300 dark:border-emerald-600 bg-white dark:bg-stone-50/20 placeholder-stone-500 dark:placeholder-white/50 text-stone-950 dark:text-white rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
             <input type="email" placeholder="E-mail" required value={email} onChange={e => setEmail(e.target.value)} className="appearance-none relative block w-full px-3 py-2 border border-emerald-300 dark:border-emerald-600 bg-white dark:bg-stone-50/20 placeholder-stone-500 dark:placeholder-white/50 text-stone-950 dark:text-white rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
             <input type="password" placeholder="Senha" required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none relative block w-full px-3 py-2 border border-emerald-300 dark:border-emerald-600 bg-white dark:bg-stone-50/20 placeholder-stone-500 dark:placeholder-white/50 text-stone-950 dark:text-white rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
             <input type="password" placeholder="Confirmar Senha" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="appearance-none relative block w-full px-3 py-2 border border-emerald-300 dark:border-emerald-600 bg-white dark:bg-stone-50/20 placeholder-stone-500 dark:placeholder-white/50 text-stone-950 dark:text-white rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
          </div>

          <div>
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
              Registrar
            </button>
          </div>
          <div className="text-sm text-center">
            <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }} className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">
              Já tem uma conta? Faça login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};