import React, { useState } from 'react';
import type { User } from '../types';

interface LoginProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  onSwitchToRegister: () => void;
}

const simpleHash = (password: string) => `${password}_hashed`;

export const Login: React.FC<LoginProps> = ({ users, onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = users.find(user => user.email === email);

    if (foundUser && foundUser.passwordHash === simpleHash(password)) {
      setError('');
      onLoginSuccess(foundUser);
    } else {
      setError('E-mail ou senha inválidos.');
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-white/20 p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-emerald-800 dark:text-white">
            Acessar Painel
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-emerald-300 dark:border-emerald-600 bg-white dark:bg-stone-50/20 placeholder-stone-500 dark:placeholder-white/50 text-stone-950 dark:text-white rounded-t-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-emerald-300 dark:border-emerald-600 bg-white dark:bg-stone-50/20 placeholder-stone-500 dark:placeholder-white/50 text-stone-950 dark:text-white rounded-b-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Entrar
            </button>
          </div>
          <div className="text-sm text-center">
            <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToRegister(); }} className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">
              Não tem uma conta? Cadastre-se
            </a>
          </div>
           <p className="mt-4 text-center text-xs text-stone-950 dark:text-white">
              Contas de teste:<br/>
              <b>Admin:</b> admin@admin.com<br/>
              <b>Empresa:</b> empresa@relogiosgeniais.com<br/>
              <b>Usuário:</b> usuario@email.com<br/>
              (senha: "password" para todos)
            </p>
        </form>
      </div>
    </div>
  );
};