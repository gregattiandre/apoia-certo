import React, { useState } from 'react';
import type { User } from '../types';

interface MyAccountPageProps {
  currentUser: User;
  onUpdateUser: (details: { fullName: string; password?: string }) => void;
}

export const MyAccountPage: React.FC<MyAccountPageProps> = ({ currentUser, onUpdateUser }) => {
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName) {
      setError('O nome completo não pode estar em branco.');
      return;
    }

    if (password && password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    const details: { fullName: string; password?: string } = { fullName };
    if (password) {
      details.password = password;
    }
    
    onUpdateUser(details);
    setSuccess('Perfil atualizado com sucesso!');
    setPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <section>
      <h3 className="text-2xl font-semibold text-emerald-800 dark:text-white border-b border-emerald-300 dark:border-emerald-700 pb-2 mb-6">
        Editar Perfil
      </h3>
      <div className="max-w-lg mx-auto bg-white dark:bg-white/20 p-8 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-emerald-700 dark:text-white">Email</label>
            <input
              id="email"
              type="email"
              value={currentUser.email}
              disabled
              className="mt-1 block w-full px-3 py-2 bg-stone-100 dark:bg-stone-700/50 text-stone-950 dark:text-white border border-emerald-300 dark:border-emerald-600 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
            />
          </div>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-emerald-700 dark:text-white">Nome Completo</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-stone-50/20 text-stone-950 dark:text-white border border-emerald-300 dark:border-emerald-600 rounded-md shadow-sm placeholder-stone-500 dark:placeholder-white/50 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-emerald-700 dark:text-white">Nova Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Deixe em branco para não alterar"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-stone-50/20 text-stone-950 dark:text-white border border-emerald-300 dark:border-emerald-600 rounded-md shadow-sm placeholder-stone-500 dark:placeholder-white/50 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-emerald-700 dark:text-white">Confirmar Nova Senha</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme a nova senha"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-stone-50/20 text-stone-950 dark:text-white border border-emerald-300 dark:border-emerald-600 rounded-md shadow-sm placeholder-stone-500 dark:placeholder-white/50 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            />
          </div>
          
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">{success}</p>}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};