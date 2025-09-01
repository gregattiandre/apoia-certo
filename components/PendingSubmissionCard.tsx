
import React from 'react';
import type { ProjectDelay, User } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';
import { PencilIcon } from './icons/PencilIcon';
import { StarRatingDisplay } from './StarRatingDisplay';

interface PendingSubmissionCardProps {
  submission: ProjectDelay;
  onApprove: (id: string) => void;
  onReject: (submission: ProjectDelay) => void;
  onEdit: (submission: ProjectDelay) => void;
  users: User[];
}

export const PendingSubmissionCard: React.FC<PendingSubmissionCardProps> = ({ submission, onApprove, onReject, onEdit, users }) => {
  const submitter = users.find(u => u.email === submission.submitterEmail);
  const submitterFirstName = submitter ? submitter.fullName.split(' ')[0] : 'Usuário';
  
  return (
    <div className="bg-white dark:bg-white/20 rounded-lg shadow-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">{submission.projectName}</h3>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{submission.companyName}</p>
          <p className="text-xs text-stone-950 dark:text-white mt-1">Enviado por: {submitterFirstName} ({submission.submitterEmail})</p>
          <a href={submission.crowdfundingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-500 dark:text-emerald-400 hover:underline break-all">
            {submission.crowdfundingLink}
          </a>
          <div className="mt-4 flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0 text-sm">
            <p className="text-stone-950 dark:text-white">
              <span className="font-semibold">Prometido:</span> {submission.promisedDate}
            </p>
            <p className="text-stone-950 dark:text-white">
              <span className="font-semibold">Entregue:</span> {submission.actualDate || 'Ainda não entregue'}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-300">Avaliação:</span>
            <StarRatingDisplay rating={submission.rating} />
          </div>
          {submission.comment && (
            <div className="mt-4 p-3 bg-stone-100 dark:bg-black/20 rounded-lg">
              <p className="text-sm text-stone-950 dark:text-white italic">"{submission.comment}"</p>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 flex flex-wrap gap-2 justify-end mt-4 sm:mt-0">
          <button
            onClick={() => onEdit(submission)}
            className="flex items-center justify-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200"
            aria-label="Editar"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Editar
          </button>
          <button
            onClick={() => onApprove(submission.id)}
            className="flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200"
            aria-label="Aprovar"
          >
            <CheckIcon className="h-5 w-5 mr-2" />
            Aprovar
          </button>
          <button
            onClick={() => onReject(submission)}
            className="flex items-center justify-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200"
            aria-label="Rejeitar"
          >
            <XIcon className="h-5 w-5 mr-2" />
            Rejeitar
          </button>
        </div>
      </div>
    </div>
  );
};