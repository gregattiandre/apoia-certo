import React from 'react';
import type { ProjectDelay, User } from '../types';
import { SubmissionStatus } from '../types';
import { StarRatingDisplay } from './StarRatingDisplay';
import { ClockIcon } from './icons/ClockIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';

interface ProjectDetailPageProps {
  projectName: string;
  companyName: string;
  allSubmissions: ProjectDelay[];
  allUsers: User[];
  onBack: (companyName: string) => void;
}

const calculateDelay = (promisedDate: string, actualDate?: string): number => {
    const promised = new Date(promisedDate);
    const actual = actualDate ? new Date(actualDate) : new Date(); // Consider today if not delivered
    const diffTime = actual.getTime() - promised.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

const formatDelay = (days: number): string => {
  const roundedDays = Math.round(days);
  if (roundedDays === 0) return "Em dia";

  const isEarly = roundedDays < 0;
  const suffix = isEarly ? ' adiantado' : '';
  const absoluteDays = Math.abs(roundedDays);

  if (absoluteDays >= 365.25) {
    const years = Math.floor(absoluteDays / 365.25);
    const remainingMonths = (absoluteDays % 365.25) / 30.44;
    const formattedMonths = (Math.round(remainingMonths * 2) / 2);
    
    let result = `${years}a`;
    if (formattedMonths > 0) {
      result += ` ${formattedMonths.toLocaleString('pt-BR')}m`;
    }
    return result + suffix;
  }
  
  if (absoluteDays >= 30) {
    const months = absoluteDays / 30.44;
    const formattedMonths = (Math.round(months * 2) / 2);
    const monthStr = formattedMonths.toLocaleString('pt-BR');
    return `${monthStr} ${formattedMonths === 1 ? 'mês' : 'meses'}${suffix}`;
  }

  return `${absoluteDays} dia${absoluteDays !== 1 ? 's' : ''}${suffix}`;
};

const SubmissionCard: React.FC<{ submission: ProjectDelay, users: User[] }> = ({ submission, users }) => {
  const submitter = users.find(u => u.email === submission.submitterEmail);
  const submitterDisplay = submitter ? `${submitter.fullName.charAt(0).toUpperCase()}.` : 'Anônimo';
  const wouldBuyAgain = submission.wouldBuyAgain;

  return (
    <div className="bg-white dark:bg-white/20 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start gap-4">
        <StarRatingDisplay rating={submission.rating} />
        <div className="text-right text-xs text-stone-950 dark:text-white space-y-1 flex-shrink-0">
          <span>Enviado por: {submitterDisplay}</span>
          {typeof wouldBuyAgain === 'boolean' && (
            <div className={`flex items-center justify-end gap-1.5 ${wouldBuyAgain ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {wouldBuyAgain ? (
                <CheckIcon className="w-4 h-4" />
              ) : (
                <XIcon className="w-4 h-4" />
              )}
              <span className="font-medium">{wouldBuyAgain ? 'Compraria novamente' : 'Não compraria'}</span>
            </div>
          )}
        </div>
      </div>

      {submission.comment && (
        <div className="mt-4">
          <h5 className="font-semibold text-sm text-emerald-600 dark:text-emerald-300">Comentário do Apoiador:</h5>
          <blockquote className="border-l-4 border-emerald-300 dark:border-emerald-600 pl-4 py-2 mt-1 italic text-stone-950 dark:text-white">
            "{submission.comment}"
          </blockquote>
        </div>
      )}

      {submission.companyReply && (
        <div className="mt-4">
          <h5 className="font-semibold text-sm text-emerald-600 dark:text-emerald-300">Resposta da Empresa:</h5>
          <blockquote className="border-l-4 border-emerald-500 pl-4 py-2 mt-1 italic text-stone-950 dark:text-white">
            "{submission.companyReply}"
          </blockquote>
        </div>
      )}

      {submission.userRebuttal && (
        <div className="mt-4">
          <h5 className="font-semibold text-sm text-emerald-600 dark:text-emerald-300">Tréplica do Apoiador:</h5>
          <blockquote className="border-l-4 border-emerald-300 dark:border-emerald-600 pl-4 py-2 mt-1 italic text-stone-950 dark:text-white">
            "{submission.userRebuttal}"
          </blockquote>
        </div>
      )}
    </div>
  );
};


export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  projectName,
  companyName,
  allSubmissions,
  allUsers,
  onBack,
}) => {
  const projectSubmissions = allSubmissions.filter(
    p => p.projectName === projectName && p.companyName === companyName
  );

  const approvedSubmissions = projectSubmissions.filter(
    p => p.status === SubmissionStatus.Approved
  );

  const {
    averageRating,
    averageDelay,
    wouldBuyAgainPercentage,
    buyAgainCount,
  } = React.useMemo(() => {
      if (approvedSubmissions.length === 0) {
          return { averageRating: 0, averageDelay: 0, wouldBuyAgainPercentage: 0, buyAgainCount: 0 };
      }
      const totalRating = approvedSubmissions.reduce((acc, p) => acc + p.rating, 0);
      const totalDelay = approvedSubmissions.reduce((acc, p) => acc + calculateDelay(p.promisedDate, p.actualDate), 0);

      const buyAgainSubmissions = approvedSubmissions.filter(p => typeof p.wouldBuyAgain === 'boolean');
      const wouldBuyAgainCount = buyAgainSubmissions.filter(p => p.wouldBuyAgain === true).length;
      const wouldBuyAgainPercentage = buyAgainSubmissions.length > 0 ? (wouldBuyAgainCount / buyAgainSubmissions.length) * 100 : 0;

      return {
          averageRating: totalRating / approvedSubmissions.length,
          averageDelay: totalDelay / approvedSubmissions.length,
          wouldBuyAgainPercentage,
          buyAgainCount: buyAgainSubmissions.length,
      };
  }, [approvedSubmissions]);
  
  const crowdfundingLink = projectSubmissions.length > 0 ? projectSubmissions[0].crowdfundingLink : '#';
  const delayColor = averageDelay > 90 ? 'text-red-500' : averageDelay > 30 ? 'text-amber-500' : 'text-green-500';

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-white">{projectName}</h2>
          <p className="text-lg text-stone-950 dark:text-white">
            por <span className="font-semibold">{companyName}</span>
          </p>
          <a
            href={crowdfundingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
          >
            Ver Página do Financiamento
          </a>
        </div>
        <button onClick={() => onBack(companyName)} className="w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
          &larr; Voltar para a Empresa
        </button>
      </div>
      
      <div className="bg-white dark:bg-white/20 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-emerald-800 dark:text-white mb-4">Métricas do Projeto</h3>
        {approvedSubmissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-300">Avaliação Média</h4>
              <div className="flex items-center gap-2 mt-1">
                <StarRatingDisplay rating={averageRating} starSize="h-7 w-7" />
                <span className="text-2xl font-bold text-emerald-700 dark:text-white">{averageRating.toFixed(1)}</span>
              </div>
              <p className="text-xs text-stone-950 dark:text-white mt-1">
                de {approvedSubmissions.length} {approvedSubmissions.length === 1 ? 'avaliação' : 'avaliações'}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-300">Atraso Médio</h4>
              <div className="flex items-center gap-2 mt-1">
                <ClockIcon className={`w-7 h-7 ${delayColor}`} />
                <span className={`text-2xl font-bold ${delayColor}`}>{formatDelay(averageDelay)}</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-300 flex items-center gap-1">
                  <RefreshIcon className="w-4 h-4" />
                  Comprariam Novamente
              </h4>
              <span className="text-2xl font-bold text-emerald-700 dark:text-white">
                  {buyAgainCount > 0 ? `${wouldBuyAgainPercentage.toFixed(0)}%` : 'N/A'}
              </span>
              {buyAgainCount > 0 && (
                  <p className="text-xs text-stone-950 dark:text-white mt-1">
                      de {buyAgainCount} {buyAgainCount === 1 ? 'resposta' : 'respostas'}
                  </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-stone-950 dark:text-white">Ainda não há avaliações aprovadas para calcular as métricas deste projeto.</p>
        )}
      </div>

      <div>
        <h3 className="text-2xl font-semibold text-emerald-800 dark:text-white mb-4">Reclamações Registradas</h3>
        {approvedSubmissions.length > 0 ? (
          <div className="space-y-4">
            {approvedSubmissions.map(sub => <SubmissionCard key={sub.id} submission={sub} users={allUsers} />)}
          </div>
        ) : (
          <div className="text-center py-12 px-6 bg-white dark:bg-white/20 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-emerald-700 dark:text-white">Nenhuma Reclamação Aprovada</h3>
            <p className="mt-2 text-stone-950 dark:text-white">Ainda não há reclamações públicas para este projeto.</p>
          </div>
        )}
      </div>
    </div>
  );
};
