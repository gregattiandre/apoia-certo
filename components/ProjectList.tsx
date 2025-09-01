import React, { useState } from 'react';
import type { CompanyReputation, User } from '../types';
import { ProjectCard } from './ProjectCard';

interface ProjectListProps {
  reputations: CompanyReputation[];
  onViewCompany: (companyName: string) => void;
  currentUser: User | null;
  onGenerateAnalysis: (companyName: string) => void;
  apiKey: string | null;
}


export const ProjectList: React.FC<ProjectListProps> = ({ reputations, onViewCompany, currentUser, onGenerateAnalysis, apiKey }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReputations = reputations.filter(rep => {
    const term = searchTerm.toLowerCase();
    if (rep.name.toLowerCase().includes(term)) {
      return true;
    }
    return rep.projects.some(p => p.crowdfundingLink.toLowerCase().includes(term));
  });

  return (
    <div className="space-y-8">
       <div className="text-center">
         <h2 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-white sm:text-4xl">Ranking das Empresas</h2>
         <p className="mt-3 max-w-2xl mx-auto text-xl text-stone-950 dark:text-white sm:mt-4">
           Classificação de empresas com base no atraso médio de entrega de seus projetos. Menor é melhor.
         </p>
       </div>

       <div className="max-w-md mx-auto">
          <input
            type="search"
            placeholder="Buscar por empresa ou URL do projeto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-stone-50/20 border border-emerald-300 dark:border-emerald-600 rounded-md shadow-sm placeholder-stone-500 dark:placeholder-white/50 text-stone-950 dark:text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
          />
        </div>

      {filteredReputations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredReputations.map((rep, index) => (
            <ProjectCard 
              key={rep.name} 
              reputation={rep} 
              rank={index + 1} 
              onViewCompany={onViewCompany}
              currentUser={currentUser}
              onGenerateAnalysis={onGenerateAnalysis}
              apiKey={apiKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-6 bg-white dark:bg-white/20 shadow-lg rounded-lg">
            <h3 className="text-xl font-semibold text-emerald-700 dark:text-white">Nenhuma Empresa Encontrada</h3>
            <p className="mt-2 text-stone-950 dark:text-white">
              {searchTerm ? 'Tente um termo de busca diferente.' : 'Ainda não há envios de projetos aprovados. Envie um para começar!'}
            </p>
        </div>
      )}
    </div>
  );
};