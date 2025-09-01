import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { UserRole } from '../types';

interface EditUserModalProps {
  user: User | null;
  isCreating: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, 'passwordHash'> & { password?: string }, isNew: boolean) => void;
  companyNames: string[];
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ user, isCreating, onClose, onSave, companyNames }) => {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    birthDate: '',
    role: UserRole.User,
    companyName: '',
    password: '',
  });
  const [newCompanyName, setNewCompanyName] = useState('');

  useEffect(() => {
    if (user && !isCreating) {
      setFormData({
        email: user.email,
        fullName: user.fullName,
        birthDate: user.birthDate,
        role: user.role,
        companyName: user.companyName || '',
        password: '',
      });
    } else {
      setFormData({
        email: '',
        fullName: '',
        birthDate: '',
        role: UserRole.User,
        companyName: '',
        password: '',
      });
    }
    setNewCompanyName('');
  }, [user, isCreating]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'companyName' && value === '_NEW_') {
        setNewCompanyName('');
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = { ...formData };
    if (dataToSave.role === UserRole.CompanyAdmin) {
      dataToSave.companyName = formData.companyName === '_NEW_' ? newCompanyName : formData.companyName;
    } else {
      dataToSave.companyName = '';
    }
    onSave(dataToSave, isCreating);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-lg shadow-xl w-full max-w-lg" role="dialog" aria-modal="true">
        <form onSubmit={handleSubmit}>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-emerald-800 dark:text-white">
              {isCreating ? 'Criar Novo Usuário' : 'Editar Usuário'}
            </h2>
            <div className="space-y-4 mt-6">
              <InputField label="Nome Completo" name="fullName" value={formData.fullName} onChange={handleChange} required />
              <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required disabled={!isCreating} />
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-emerald-700 dark:text-white">Tipo de Conta</label>
                <select id="role" name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-emerald-300 dark:border-emerald-600 bg-white dark:bg-stone-50/20 text-stone-950 dark:text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md">
                  <option value={UserRole.User}>Usuário</option>
                  <option value={UserRole.CompanyAdmin}>Admin de Empresa</option>
                  <option value={UserRole.SiteAdmin}>Admin do Site</option>
                </select>
              </div>
              {formData.role === UserRole.CompanyAdmin && (
                 <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-emerald-700 dark:text-white">
                        Nome da Empresa
                    </label>
                    <select
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-emerald-300 dark:border-emerald-600 bg-white dark:bg-stone-50/20 text-stone-950 dark:text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                    >
                        <option value="" disabled>Selecione uma empresa</option>
                        {companyNames.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                        <option value="_NEW_">Adicionar nova empresa...</option>
                    </select>

                    {formData.companyName === '_NEW_' && (
                        <div className="mt-2">
                            <InputField
                                label="Nome da Nova Empresa"
                                name="newCompanyName"
                                value={newCompanyName}
                                onChange={(e) => setNewCompanyName(e.target.value)}
                                required
                            />
                        </div>
                    )}
                </div>
              )}
              <InputField
                label="Nova Senha"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={isCreating ? 'Senha' : 'Deixe em branco para não alterar'}
                required={isCreating}
              />
            </div>
          </div>
          <div className="bg-stone-100 dark:bg-stone-950/50 px-8 py-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="py-2 px-4 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm text-sm font-medium text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700">Cancelar</button>
            <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}> = ({ label, name, value, onChange, type = 'text', required, disabled, placeholder }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-emerald-700 dark:text-white">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-stone-50/20 text-stone-950 dark:text-white border border-emerald-300 dark:border-emerald-600 rounded-md shadow-sm placeholder-stone-500 dark:placeholder-white/50 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm disabled:bg-stone-200 disabled:cursor-not-allowed"
    />
  </div>
);