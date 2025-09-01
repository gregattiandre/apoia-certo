
import React, { useState, useMemo } from 'react';
import type { ProjectDelay } from '../types';
import { SubmissionStatus } from '../types';

interface MergeSubmissionModalProps {
  submissions: ProjectDelay[];
  onClose: () => void;
  onSave: (finalSubmission: ProjectDelay, idsToRemove: string[]) => void;
}

type ProjectField = keyof ProjectDelay;

const FieldSelector: React.FC<{
  fieldName: ProjectField;
  label: string;
  submissions: ProjectDelay[];
  selectedId: string;
  onChange: (field: ProjectField, value: any, selectedId: string) => void;
}> = ({ fieldName, label, submissions, selectedId, onChange }) => {
  const options = useMemo(() => {
    const uniqueOptions = new Map<any, string>();
    submissions.forEach(s => {
      if (s[fieldName] !== undefined && s[fieldName] !== null && s[fieldName] !== '') {
        uniqueOptions.set(s[fieldName], s.id);
      }
    });
    return Array.from(uniqueOptions.entries());
  }, [submissions, fieldName]);

  if (options.length <= 1) {
    return (
        <div>
            <span className="block text-sm font-medium text-emerald-700 dark:text-emerald-200">{label}</span>
            <p className="mt-1 text-sm text-stone-950 dark:text-white p-2 bg-stone-100 dark:bg-stone-800 rounded-md">
                {submissions[0][fieldName]?.toString() || 'N/A'}
            </p>
        </div>
    );
  }

  return (
    <div>
      <span className="block text-sm font-medium text-emerald-700 dark:text-emerald-200">{label}</span>
      <div className="mt-2 space-y-2">
        {options.map(([value, id]) => (
          <label key={`${fieldName}-${id}`} className="flex items-center p-2 rounded-md bg-stone-100 dark:bg-stone-800 border border-transparent has-[:checked]:bg-emerald-100 has-[:checked]:dark:bg-emerald-900/50 has-[:checked]:border-emerald-500">
            <input
              type="radio"
              name={fieldName}
              checked={selectedId === id}
              onChange={() => onChange(fieldName, value, id)}
              className="h-4 w-4 text-emerald-600 border-stone-300 dark:border-stone-600 focus:ring-emerald-500"
            />
            <span className="ml-3 text-sm text-stone-950 dark:text-white">{value.toString()}</span>
          </label>
        ))}
      </div>
    </div>
  );
};


export const MergeSubmissionModal: React.FC<MergeSubmissionModalProps> = ({ submissions, onClose, onSave }) => {
  const [fieldSelections, setFieldSelections] = useState<Record<ProjectField, string>>(() => {
    const initialSelections: any = {};
    const firstSubmission = submissions[0];
    for (const key in firstSubmission) {
        initialSelections[key as ProjectField] = firstSubmission.id;
    }
    return initialSelections;
  });

  const handleFieldChange = (field: ProjectField, value: any, selectedId: string) => {
    setFieldSelections(prev => ({ ...prev, [field]: selectedId }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSubmission: any = { status: SubmissionStatus.Approved }; // Start with a default status
    for (const key in fieldSelections) {
      const field = key as ProjectField;
      const selectedId = fieldSelections[field];
      const sourceSubmission = submissions.find(s => s.id === selectedId);
      if (sourceSubmission) {
        finalSubmission[field] = sourceSubmission[field];
      }
    }

    // Combine comments and replies intelligently
    finalSubmission.comment = submissions.map(s => s.comment).filter(Boolean).join('\n---\n');
    finalSubmission.companyReply = submissions.map(s => s.companyReply).filter(Boolean).join('\n---\n');
    finalSubmission.userRebuttal = submissions.map(s => s.userRebuttal).filter(Boolean).join('\n---\n');
    
    // Use average rating
    const ratings = submissions.map(s => s.rating).filter(r => typeof r === 'number');
    finalSubmission.rating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    
    // Ensure ID is new and unique
    finalSubmission.id = `merged-${new Date().getTime()}`;

    onSave(finalSubmission, submissions.map(s => s.id));
  };
  
  const fieldsToSelect: { field: ProjectField; label: string }[] = [
      { field: 'submitterEmail', label: 'Email do Remetente' },
      { field: 'companyName', label: 'Nome da Empresa' },
      { field: 'projectName', label: 'Nome do Projeto' },
      { field: 'crowdfundingLink', label: 'Link do Financiamento' },
      { field: 'promisedDate', label: 'Data Prometida' },
      { field: 'actualDate', label: 'Data de Entrega Real' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
        <form onSubmit={handleSubmit}>
            <div className="p-8">
                <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-100">Mesclar Envios Duplicados</h2>
                <p className="text-sm text-stone-950 dark:text-white mt-1">Selecione os dados corretos para criar um registro consolidado. Comentários e respostas serão combinados, e a nota será uma média.</p>
                <div className="space-y-6 mt-6">
                    {fieldsToSelect.map(({ field, label }) => (
                         <FieldSelector
                            key={field}
                            fieldName={field}
                            label={label}
                            submissions={submissions}
                            selectedId={fieldSelections[field]}
                            onChange={handleFieldChange}
                         />
                    ))}
                </div>
            </div>
            <div className="bg-stone-100 dark:bg-stone-950/50 px-8 py-4 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="py-2 px-4 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm text-sm font-medium text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                    Cancelar
                </button>
                <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                    Salvar Mesclagem
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};