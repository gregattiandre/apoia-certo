import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { ProjectDelay } from '../types';
import { StarRatingInput } from './StarRatingInput';

interface SubmissionFormProps {
  onSubmit: (newSubmission: Omit<ProjectDelay, 'id' | 'status' | 'submitterEmail'>) => void;
  companyNames: string[];
}

const InputField: React.FC<{
  label: string;
  id: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
}> = ({ label, id, type, value, onChange, onFocus, autoComplete, required, disabled }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-emerald-700 dark:text-emerald-200">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      autoComplete={autoComplete}
      required={required}
      disabled={disabled}
      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-stone-50/20 text-stone-950 border border-emerald-300 dark:border-emerald-600 rounded-md shadow-sm placeholder-stone-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm disabled:bg-stone-200 disabled:cursor-not-allowed"
    />
  </div>
);


export const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSubmit, companyNames }) => {
  const [companySearch, setCompanySearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [crowdfundingLink, setCrowdfundingLink] = useState('');
  const [promisedDate, setPromisedDate] = useState('');
  const [actualDate, setActualDate] = useState('');
  const [isDelivered, setIsDelivered] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [wouldBuyAgain, setWouldBuyAgain] = useState(true);
  const [error, setError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCompanies = useMemo(() => {
    if (!companySearch) return [];
    const lowerCaseSearch = companySearch.toLowerCase();
    return companyNames.filter(name =>
      name.toLowerCase().includes(lowerCaseSearch)
    ).sort();
  }, [companySearch, companyNames]);

  const handleCompanySelect = (companyName: string) => {
    setCompanySearch(companyName);
    setIsDropdownOpen(false);
  };

  const handleCreateNewCompany = () => {
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!companySearch || !projectName || !crowdfundingLink || !promisedDate) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    if (rating === 0) {
      setError('Por favor, selecione uma avaliação em estrelas.');
      return;
    }
    
    try {
      new URL(crowdfundingLink);
    } catch (_) {
      setError('Por favor, insira um link de financiamento coletivo válido.');
      return;
    }

    setError('');
    onSubmit({
      companyName: companySearch,
      projectName,
      crowdfundingLink,
      promisedDate,
      actualDate: isDelivered ? actualDate : undefined,
      rating,
      comment,
      wouldBuyAgain,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-white/20 rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-100 mb-2">Reportar um Atraso</h2>
        <p className="text-stone-950 dark:text-stone-100 mb-6">Ajude a comunidade relatando o status de entrega de um projeto. Seu envio será revisado por um administrador.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 rounded-md">{error}</div>}
          
          <div className="relative" ref={dropdownRef}>
            <InputField 
              label="Nome da Empresa" 
              id="companyName" 
              type="text" 
              value={companySearch} 
              onChange={(e) => setCompanySearch(e.target.value)} 
              onFocus={() => setIsDropdownOpen(true)}
              autoComplete="off"
              required 
            />
            {isDropdownOpen && companySearch && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-stone-800 border border-emerald-300 dark:border-emerald-600 rounded-md shadow-lg max-h-60 overflow-auto">
                <ul>
                  {filteredCompanies.map(name => (
                    <li key={name}>
                      <button 
                        type="button" 
                        className="w-full text-left px-4 py-2 text-sm text-stone-950 dark:text-stone-100 hover:bg-emerald-100 dark:hover:bg-emerald-700"
                        onClick={() => handleCompanySelect(name)}
                      >
                        {name}
                      </button>
                    </li>
                  ))}
                  {filteredCompanies.length === 0 && (
                     <li>
                      <button 
                        type="button" 
                        className="w-full text-left px-4 py-2 text-sm text-emerald-600 dark:text-emerald-300 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-700"
                        onClick={handleCreateNewCompany}
                      >
                        Criar empresa: "{companySearch}"
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
          
          <InputField label="Nome do Projeto" id="projectName" type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
          <InputField label="Link do Financiamento" id="crowdfundingLink" type="url" value={crowdfundingLink} onChange={(e) => setCrowdfundingLink(e.target.value)} required />
          
          <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-200">
              Sua Avaliação <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <StarRatingInput rating={rating} onRatingChange={setRating} />
            </div>
          </div>

          <InputField label="Data de Entrega Prometida" id="promisedDate" type="date" value={promisedDate} onChange={(e) => setPromisedDate(e.target.value)} required />

          <div>
            <div className="flex items-center">
              <input
                id="isDelivered"
                type="checkbox"
                checked={isDelivered}
                onChange={(e) => setIsDelivered(e.target.checked)}
                className="h-4 w-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="isDelivered" className="ml-2 block text-sm text-stone-950 dark:text-stone-100">
                O projeto foi entregue.
              </label>
            </div>
          </div>
          
          {isDelivered && (
             <InputField label="Data de Entrega Real" id="actualDate" type="date" value={actualDate} onChange={(e) => setActualDate(e.target.value)} required={isDelivered} />
          )}

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-emerald-700 dark:text-emerald-200">
              Comentário (Opcional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-stone-50/20 text-stone-950 border border-emerald-300 dark:border-emerald-600 rounded-md shadow-sm placeholder-stone-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              placeholder="Descreva sua experiência com a entrega deste projeto..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-200">
                Compraria novamente dessa empresa?
            </label>
            <div className="mt-2 flex items-center">
                <span className={`text-sm ${!wouldBuyAgain ? 'font-bold text-emerald-700 dark:text-emerald-200' : 'text-stone-500'}`}>Não</span>
                <button
                    type="button"
                    onClick={() => setWouldBuyAgain(!wouldBuyAgain)}
                    role="switch"
                    aria-checked={wouldBuyAgain}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 mx-3 ${wouldBuyAgain ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-600'}`}
                >
                    <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${wouldBuyAgain ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                </button>
                <span className={`text-sm ${wouldBuyAgain ? 'font-bold text-emerald-700 dark:text-emerald-200' : 'text-stone-500'}`}>Sim</span>
            </div>
          </div>


          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
            Enviar para Revisão
          </button>
        </form>
      </div>
    </div>
  );
};