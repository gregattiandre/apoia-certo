import React, { useState } from 'react';
import type { ProjectDelay } from '../types';

interface RejectionFeedbackModalProps {
  submission: ProjectDelay;
  onClose: () => void;
  onConfirm: (id: string, reason?: string) => void;
}

export const RejectionFeedbackModal: React.FC<RejectionFeedbackModalProps> = ({ submission, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(submission.id, reason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-lg shadow-xl w-full max-w-lg" role="dialog" aria-modal="true">
        <form onSubmit={handleSubmit}>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-100">Rejeitar Envio</h2>
            <p className="text-sm text-stone-950 dark:text-white mt-2">
              Você está prestes a rejeitar o envio para o projeto <span className="font-semibold">{submission.projectName}</span>.
            </p>
            <div className="mt-6">
              <label htmlFor="rejectionReason" className="block text-sm font-medium text-emerald-700 dark:text-emerald-200">
                Motivo da Rejeição (Opcional)
              </label>
              <textarea
                id="rejectionReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-stone-50/20 text-stone-950 dark:text-white border border-emerald-300 dark:border-emerald-600 rounded-md shadow-sm placeholder-stone-500 dark:placeholder-white/50 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="Ex: Informações incorretas, envio duplicado, etc. Este feedback será visível para o usuário."
              />
            </div>
          </div>
          <div className="bg-stone-100 dark:bg-stone-950/50 px-8 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm text-sm font-medium text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Confirmar Rejeição
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};