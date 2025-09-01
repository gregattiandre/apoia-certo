import React, { useState, useMemo } from 'react';
import type { ProjectDelay, AnalysisResult } from '../types';
import { SubmissionStatus } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { StarRatingDisplay } from './StarRatingDisplay';
import { ClockIcon } from './icons/ClockIcon';
import { RefreshIcon } from './icons/RefreshIcon';

interface CompanyDetailPageProps {
  companyName: string;
  projects: ProjectDelay[];
  onBack: () => void;
  isAdmin: boolean; 
  onEdit: (project: ProjectDelay) => void;
  onViewProject: (projectName: string, companyName: string) => void;
  aiAnalysis?: AnalysisResult;
  isAiAnalysisLoading?: boolean;
  apiKey: string | null;
}

const calculateDelay = (promisedDate: string, actualDate?: string): number => {
    const promised = new Date(promisedDate);
    const actual = actualDate ? new Date(actualDate) : new Date();
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

export const CompanyDetailPage: React.FC<CompanyDetailPageProps> = ({ companyName, projects, onBack, onViewProject, aiAnalysis, isAiAnalysisLoading, apiKey }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const approvedProjects = useMemo(() => projects.filter(p => p.status === SubmissionStatus.Approved), [projects]);

    const stats = useMemo(() => {
        if (approvedProjects.length === 0) {
            return { avgRating: 0, avgDelay: 0, onTimePercentage: 0, wouldBuyAgainPercentage: 0, buyAgainCount: 0 };
        }
        const totalRating = approvedProjects.reduce((sum, p) => sum + p.rating, 0);
        const totalDelay = approvedProjects.reduce((sum, p) => sum + calculateDelay(p.promisedDate, p.actualDate), 0);
        const onTimeCount = approvedProjects.filter(p => calculateDelay(p.promisedDate, p.actualDate) <= 0).length;

        const buyAgainSubmissions = approvedProjects.filter(p => typeof p.wouldBuyAgain === 'boolean');
        const wouldBuyAgainCount = buyAgainSubmissions.filter(p => p.wouldBuyAgain === true).length;
        const wouldBuyAgainPercentage = buyAgainSubmissions.length > 0 ? (wouldBuyAgainCount / buyAgainSubmissions.length) * 100 : 0;

        return {
            avgRating: totalRating / approvedProjects.length,
            avgDelay: totalDelay / approvedProjects.length,
            onTimePercentage: (onTimeCount / approvedProjects.length) * 100,
            wouldBuyAgainPercentage,
            buyAgainCount: buyAgainSubmissions.length,
        };
    }, [approvedProjects]);

    const aggregatedProjects = useMemo(() => {
        const projectsByName = new Map<string, ProjectDelay[]>();
        for (const project of approvedProjects) {
            if (!projectsByName.has(project.projectName)) {
                projectsByName.set(project.projectName, []);
            }
            projectsByName.get(project.projectName)!.push(project);
        }

        return Array.from(projectsByName.entries()).map(([projectName, submissions]) => {
            const complaintCount = submissions.length;
            const totalDelay = submissions.reduce((acc, sub) => acc + calculateDelay(sub.promisedDate, sub.actualDate), 0);
            const averageDelay = complaintCount > 0 ? totalDelay / complaintCount : 0;
            
            return {
                projectName,
                complaintCount,
                averageDelay,
            };
        });
    }, [approvedProjects]);

    const filteredProjects = useMemo(() => {
        return aggregatedProjects.filter(p => p.projectName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [aggregatedProjects, searchTerm]);


    const delayColor = stats.avgDelay > 90 ? 'text-red-500' : stats.avgDelay > 30 ? 'text-amber-500' : 'text-green-500';

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-white">{companyName}</h2>
        <button onClick={onBack} className="w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
            &larr; Voltar ao Ranking
        </button>
      </div>

      <div className="bg-white dark:bg-white/20 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-emerald-800 dark:text-white mb-4">Estatísticas Gerais</h3>
          {approvedProjects.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 <div>
                    <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-300">Avaliação Média</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <StarRatingDisplay rating={stats.avgRating} starSize="h-7 w-7"/>
                        <span className="text-2xl font-bold text-emerald-700 dark:text-white">{stats.avgRating.toFixed(1)}</span>
                    </div>
                     <p className="text-xs text-stone-950 dark:text-white mt-1">de {approvedProjects.length} {approvedProjects.length === 1 ? 'avaliação' : 'avaliações'}</p>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-300">Atraso Médio</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <ClockIcon className={`w-7 h-7 ${delayColor}`} />
                        <span className={`text-2xl font-bold ${delayColor}`}>{formatDelay(stats.avgDelay)}</span>
                    </div>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-300">Entregas no Prazo</h4>
                    <span className="text-2xl font-bold text-emerald-700 dark:text-white">{stats.onTimePercentage.toFixed(0)}%</span>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-300 flex items-center gap-1">
                        <RefreshIcon className="w-4 h-4" />
                        Comprariam Novamente
                    </h4>
                    <span className="text-2xl font-bold text-emerald-700 dark:text-white">
                        {stats.buyAgainCount > 0 ? `${stats.wouldBuyAgainPercentage.toFixed(0)}%` : 'N/A'}
                    </span>
                    {stats.buyAgainCount > 0 && (
                        <p className="text-xs text-stone-950 dark:text-white mt-1">
                            de {stats.buyAgainCount} {stats.buyAgainCount === 1 ? 'resposta' : 'respostas'}
                        </p>
                    )}
                </div>
            </div>
          ) : (
            <p className="text-sm text-stone-950 dark:text-white">Ainda não há projetos aprovados para calcular as estatísticas.</p>
          )}

          {apiKey && isAiAnalysisLoading && (
              <div className="mt-6 p-4 bg-stone-200 dark:bg-black/20 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 mr-2 animate-pulse text-emerald-500"/>
                  <p className="text-sm text-stone-950 dark:text-white">Gerando análise com IA...</p>
              </div>
          )}
          {apiKey && aiAnalysis && !isAiAnalysisLoading && (
            aiAnalysis.isError ? (
              <div className="mt-6 p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 rounded-md text-sm">
                  {aiAnalysis.text}
              </div>
            ) : (
              <div className="mt-6 p-4 bg-stone-50 dark:bg-black/20 rounded-lg">
                  <h4 className="flex items-center text-sm font-semibold text-emerald-800 dark:text-white mb-2">
                      <SparklesIcon className="w-5 h-5 mr-2 text-emerald-500"/>
                      Análise da IA
                  </h4>
                  <p className="text-sm text-stone-950 dark:text-white">{aiAnalysis.text}</p>
              </div>
            )
          )}
      </div>

      <div className="bg-white dark:bg-white/20 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
            <h3 className="text-lg font-semibold text-emerald-800 dark:text-white">Projetos Registrados</h3>
            <div className="mt-4 max-w-md">
                <input
                    type="search"
                    placeholder="Buscar por projeto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-stone-50/20 border border-emerald-300 dark:border-emerald-600 rounded-md shadow-sm placeholder-stone-500 dark:placeholder-white/50 text-stone-950 dark:text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
            </div>
        </div>
        
        {filteredProjects.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-emerald-200/50 dark:divide-white/20">
                    <thead className="bg-emerald-50 dark:bg-white/5">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-600 dark:text-emerald-300 uppercase tracking-wider">Projeto</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-emerald-600 dark:text-emerald-300 uppercase tracking-wider">Número de Reclamações</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-600 dark:text-emerald-300 uppercase tracking-wider">Tempo de Atraso Médio</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-200/50 dark:divide-white/20">
                    {filteredProjects.map(project => (
                        <tr key={project.projectName} className="dark:text-white">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button onClick={() => onViewProject(project.projectName, companyName)} className="font-medium text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 text-left">
                                {project.projectName}
                            </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-950 dark:text-white text-center">{project.complaintCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-950 dark:text-white">{formatDelay(project.averageDelay)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        ) : (
             <p className="text-center text-sm text-stone-950 dark:text-white p-8">
                {searchTerm ? 'Nenhum projeto encontrado para esta busca.' : 'Ainda não há projetos aprovados para esta empresa.'}
            </p>
        )}
      </div>
    </div>
  );
};