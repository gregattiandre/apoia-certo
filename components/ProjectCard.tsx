import React from 'react';
import type { CompanyReputation, User } from '../types';
import { UserRole } from '../types';
import { ClockIcon } from './icons/ClockIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { StarRatingDisplay } from './StarRatingDisplay';

interface ProjectCardProps {
  reputation: CompanyReputation;
  rank: number;
  onViewCompany: (companyName: string) => void;
  currentUser: User | null;
  onGenerateAnalysis: (companyName: string) => void;
  apiKey: string | null;
}

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


export const ProjectCard: React.FC<ProjectCardProps> = ({ reputation, rank, onViewCompany, currentUser, onGenerateAnalysis, apiKey }) => {
  const { aiAnalysis, isAiAnalysisLoading } = reputation;
  
  const rankColor = rank === 1 ? 'bg-amber-400 text-amber-900' : rank === 2 ? 'bg-emerald-300 text-emerald-800' : rank === 3 ? 'bg-amber-600/70 text-amber-900' : 'bg-emerald-200 dark:bg-emerald-700 text-emerald-600 dark:text-emerald-300';
  const delayColor = reputation.averageDelayDays > 90 ? 'text-red-500' : reputation.averageDelayDays > 30 ? 'text-amber-500' : 'text-green-500';

  const canGenerateAnalysis = currentUser?.role === UserRole.SiteAdmin && !aiAnalysis && !isAiAnalysisLoading && apiKey;

  return (
    <div className="bg-stone-50 dark:bg-white/20 border-stone-900 dark:border-stone-50 rounded-lg shadow-lg overflow-hidden transition-shadow hover:shadow-xl flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex items-start justify-between">
          <div>
            <h3 
              className="text-2xl font-bold text-emerald-800 dark:text-white cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              onClick={() => onViewCompany(reputation.name)}
              title={`Ver detalhes de ${reputation.name}`}
            >
              {reputation.name}
            </h3>
            <p className="text-sm text-stone-950 dark:text-white">
              {reputation.delayedProjectsCount} projeto(s) rastreado(s)
            </p>
          </div>
          <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold ${rankColor}`}>
            #{rank}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-4">
            <div className="flex items-center space-x-2">
                <StarRatingDisplay rating={reputation.averageRating} />
                <span className="text-sm font-bold text-emerald-700 dark:text-white">({reputation.averageRating.toFixed(1)})</span>
            </div>
            <div className="flex items-center space-x-2">
                <ClockIcon className={`w-6 h-6 ${delayColor}`} />
                <div>
                    <p className="text-sm text-stone-950 dark:text-white">Atraso Médio</p>
                    <p className={`text-lg font-bold ${delayColor}`}>{formatDelay(reputation.averageDelayDays)}</p>
                </div>
            </div>
        </div>

      </div>
      
      {apiKey && (
        <div className="p-6 pt-4">
          {isAiAnalysisLoading && (
              <div className="mt-4 p-4 bg-stone-200 dark:bg-black/20 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 mr-2 animate-pulse text-emerald-500"/>
                  <p className="text-sm text-stone-950 dark:text-white">Gerando análise com IA...</p>
              </div>
          )}
          {aiAnalysis && !isAiAnalysisLoading && (
            aiAnalysis.isError ? (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 rounded-md text-sm">
                  {aiAnalysis.text}
              </div>
            ) : (
              <div className="mt-4 p-4 bg-stone-50 dark:bg-black/20 rounded-lg">
                  <h4 className="flex items-center text-sm font-semibold text-emerald-800 dark:text-white mb-2">
                      <SparklesIcon className="w-5 h-5 mr-2 text-emerald-500"/>
                      Análise da IA
                  </h4>
                  <p className="text-sm text-stone-950 dark:text-white">{aiAnalysis.text}</p>
              </div>
            )
          )}
          {canGenerateAnalysis && (
            <div className="mt-4">
              <button
                onClick={() => onGenerateAnalysis(reputation.name)}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <SparklesIcon className="w-5 h-5 mr-2" />
                Gerar Análise IA
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};