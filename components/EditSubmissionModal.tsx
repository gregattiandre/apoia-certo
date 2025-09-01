import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { ProjectDelay } from '../types';
import { SubmissionStatus } from '../types';
import { StarRatingDisplay } from './StarRatingDisplay';

interface EditSubmissionModalProps {
  submission: ProjectDelay;
  onClose: () => void;
  onSave: (updatedSubmission: ProjectDelay) => void;
  companyNames: string[];
}

const InputField: React.FC<{
    label: string; id: string; name: string; type: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    autoComplete?: string;
    required?: boolean;
    disabled?: boolean;
}> = ({ label, id, name, type, value, onChange, onFocus, autoComplete, required, disabled }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-emerald-700 dark:text-emerald-200">{label} {required && <span className="text-red-500">*</span>}</label>
        <input type={type} id={id} name={name} value={value} onChange={onChange} required={required} disabled={disabled} onFocus={onFocus} autoComplete={autoComplete} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-stone-50/20 text-stone-950 dark:text-white border border-emerald-300 dark:border-emerald-600 rounded-md shadow-sm placeholder-stone-500 dark:placeholder-white/50 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm disabled:bg-stone-200 disabled:cursor-not-allowed" />
    </div>
);

const TextAreaField: React.FC<{
    label: string; id: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder: string;
}> = ({ label, id, name, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-emerald-700 dark:text-emerald-200">{label}</label>
        <textarea id={id} name={name} value={value} onChange={onChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-stone-50/20 text-stone-950 dark:text-white border border-emerald-300 dark:border-emerald-600 rounded-md shadow-sm placeholder-stone-500 dark:placeholder-white/50 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" placeholder={placeholder} />
    </div>
);


export const EditSubmissionModal: React.FC<EditSubmissionModalProps> = ({ submission, onClose, onSave, companyNames }) => {
  const [formData, setFormData] = useState<ProjectDelay>(submission);
  const [isDelivered, setIsDelivered] = useState(!!submission.actualDate);
  const [companySearch, setCompanySearch] = useState(submission.companyName);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setFormData(submission);
    setIsDelivered(!!submission.actualDate);
    setCompanySearch(submission.companyName);
  }, [submission]);

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
    setFormData(prev => ({ ...prev, companyName }));
    setIsDropdownOpen(false);
  };

  const handleCreateNewCompany = () => {
    setFormData(prev => ({ ...prev, companyName: companySearch }));
    setIsDropdownOpen(false);
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
     if (name === 'companyName') {
      setCompanySearch(value);
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (name: keyof ProjectDelay, checked: boolean) => {
    setFormData(prev => ({...prev, [name]: checked }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSubmission = { ...formData, actualDate: isDelivered ? formData.actualDate : undefined };
    onSave(updatedSubmission);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
        <form onSubmit={handleSubmit}>
            <div className="p-8">
                <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-100">Editar Envio</h2>
                <div className="space-y-6 mt-6">
                    <InputField label="Email do Remetente" id="submitterEmail" name="submitterEmail" type="email" value={formData.submitterEmail} onChange={handleChange} required disabled />
                    
                    <div className="relative" ref={dropdownRef}>
                      <InputField 
                        label="Nome da Empresa" 
                        id="companyName" 
                        name="companyName"
                        type="text" 
                        value={companySearch} 
                        onChange={(e) => setCompanySearch(e.target.value)} 
                        onFocus={() => setIsDropdownOpen(true)}
                        autoComplete="off"
                        required 
                      />
                      {isDropdownOpen && companySearch && (
                        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-stone-800 border border-emerald-300 dark:border-emerald-600 rounded-md shadow-lg max-h-60 overflow-auto">
                          <ul>
                            {filteredCompanies.map(name => (
                              <li key={name}>
                                <button 
                                  type="button" 
                                  className="w-full text-left px-4 py-2 text-sm text-stone-950 dark:text-white hover:bg-emerald-100 dark:hover:bg-emerald-700"
                                  onClick={() => handleCompanySelect(name)}
                                >
                                  {name}
                                </button>
                              </li>
                            ))}
                            {!filteredCompanies.includes(companySearch) && (
                              <li>
                                <button 
                                  type="button" 
                                  className="w-full text-left px-4 py-2 text-sm text-emerald-600 dark:text-emerald-300 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-700"
                                  onClick={handleCreateNewCompany}
                                >
                                  Usar novo nome: "{companySearch}"
                                </button>
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    <InputField label="Nome do Projeto" id="projectName" name="projectName" type="text" value={formData.projectName} onChange={handleChange} required />
                    <InputField label="Link do Financiamento" id="crowdfundingLink" name="crowdfundingLink" type="url" value={formData.crowdfundingLink} onChange={handleChange} required />
                    <div>
                      <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-200">Avaliação do Usuário (não pode ser alterada)</label>
                      <div className="mt-1"><StarRatingDisplay rating={formData.rating}/></div>
                    </div>
                    <InputField label="Data de Entrega Prometida" id="promisedDate" name="promisedDate" type="date" value={formData.promisedDate} onChange={handleChange} required />
                    <div>
                        <div className="flex items-center">
                            <input id="isDeliveredEdit" type="checkbox" checked={isDelivered} onChange={(e) => setIsDelivered(e.target.checked)} className="h-4 w-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500" />
                            <label htmlFor="isDeliveredEdit" className="ml-2 block text-sm text-stone-950 dark:text-white">O projeto foi entregue.</label>
                        </div>
                    </div>
                    {isDelivered && (<InputField label="Data de Entrega Real" id="actualDate" name="actualDate" type="date" value={formData.actualDate || ''} onChange={handleChange} required={isDelivered} />)}
                     <div>
                        <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-200">
                            Compraria novamente?
                        </label>
                        <div className="mt-2 flex items-center">
                            <span className={`text-sm ${!formData.wouldBuyAgain ? 'font-bold text-emerald-700 dark:text-emerald-200' : 'text-stone-500 dark:text-white/70'}`}>Não</span>
                            <button
                                type="button"
                                onClick={() => handleToggleChange('wouldBuyAgain', !formData.wouldBuyAgain)}
                                role="switch"
                                aria-checked={formData.wouldBuyAgain}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 mx-3 ${formData.wouldBuyAgain ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-600'}`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.wouldBuyAgain ? 'translate-x-5' : 'translate-x-0'}`}
                                />
                            </button>
                            <span className={`text-sm ${formData.wouldBuyAgain ? 'font-bold text-emerald-700 dark:text-emerald-200' : 'text-stone-500 dark:text-white/70'}`}>Sim</span>
                        </div>
                    </div>
                    <TextAreaField label="Comentário do Usuário" id="comment" name="comment" value={formData.comment || ''} onChange={handleChange} placeholder="O usuário não deixou um comentário." />
                    <TextAreaField label="Resposta da Empresa (Réplica)" id="companyReply" name="companyReply" value={formData.companyReply || ''} onChange={handleChange} placeholder="A empresa não respondeu." />
                    <TextAreaField label="Resposta do Usuário (Tréplica)" id="userRebuttal" name="userRebuttal" value={formData.userRebuttal || ''} onChange={handleChange} placeholder="O usuário não respondeu." />
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-emerald-700 dark:text-emerald-200">Status</label>
                        <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-emerald-300 dark:border-emerald-600 bg-white dark:bg-stone-50/20 text-stone-950 dark:text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md">
                            <option value={SubmissionStatus.Pending}>Pendente</option>
                            <option value={SubmissionStatus.Approved}>Aprovado</option>
                            <option value={SubmissionStatus.Rejected}>Rejeitado</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="bg-stone-100 dark:bg-stone-950/50 px-8 py-4 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="py-2 px-4 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm text-sm font-medium text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">Cancelar</button>
                <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">Salvar Alterações</button>
            </div>
        </form>
      </div>
    </div>
  );
};