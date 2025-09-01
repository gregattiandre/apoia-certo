import React, { useState } from 'react';
import type { ProjectDelay, User } from '../types';
import { SubmissionStatus } from '../types';
import { StarRatingInput } from './StarRatingInput';
import { MyAccountPage } from './MyAccountPage';

interface UserDashboardProps {
  allProjects: ProjectDelay[];
  currentUser: User;
  onUpdate: (projectId: string, rating: number, rebuttal: string, wouldBuyAgain: boolean) => void;
  onUpdateUser: (details: { fullName: string; password?: string }) => void;
}

type UserTab = 'submissions' | 'account';

const UserSubmissionCard: React.FC<{ project: ProjectDelay, onUpdate: UserDashboardProps['onUpdate'] }> = ({ project, onUpdate }) => {
  const [rating, setRating] = useState(project.rating);
  const [rebuttal, setRebuttal] = useState(project.userRebuttal || '');
  const [wouldBuyAgain, setWouldBuyAgain] = useState(project.wouldBuyAgain ?? true);

  const handleSave = () => {
    onUpdate(project.id, rating, rebuttal, wouldBuyAgain);
    alert('Sua avaliação foi atualizada!');
  };

  return (
    <div className={`bg-white dark:bg-white/20 rounded-lg shadow-lg p-6 ${project.status === SubmissionStatus.Rejected ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-lg text-emerald-800 dark:text-white">{project.projectName}</h4>
          <p className="text-sm text-stone-950 dark:text-white mb-4">Empresa: {project.companyName}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          project.status === SubmissionStatus.Approved ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
          project.status === SubmissionStatus.Pending ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' :
          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        }`}>
          {project.status === 'Pending' ? 'Pendente' : project.status}
        </span>
      </div>

      {project.status === SubmissionStatus.Rejected && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 text-red-700 dark:text-red-200">
          <p className="font-bold text-sm">Este envio foi rejeitado.</p>
          {project.rejectionReason && <p className="mt-1 text-sm">Motivo: {project.rejectionReason}</p>}
        </div>
      )}
      
      {project.companyReply && (
         <div className="mb-4">
          <h5 className="font-semibold text-sm text-emerald-600 dark:text-emerald-300">Resposta da Empresa:</h5>
          <blockquote className="border-l-4 border-emerald-300 dark:border-emerald-600 pl-4 py-2 mt-1 italic text-stone-950 dark:text-white">
            "{project.companyReply}"
          </blockquote>
        </div>
      )}

      {project.status !== SubmissionStatus.Rejected && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-white">Sua Avaliação (pode ser alterada)</label>
            <div className="mt-1"><StarRatingInput rating={rating} onRatingChange={setRating} /></div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-white">Sua Resposta (Tréplica)</label>
            <textarea
              value={rebuttal}
              onChange={(e) => setRebuttal(e.target.value)}
              rows={3}
              disabled={!project.companyReply}
              className="w-full mt-1 p-2 border border-emerald-300 dark:border-emerald-600 rounded-md bg-white dark:bg-stone-50/20 text-stone-950 dark:text-white focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-stone-200 disabled:cursor-not-allowed placeholder-stone-500 dark:placeholder-white/50"
              placeholder={project.companyReply ? "Responda à empresa aqui..." : "Aguardando resposta da empresa para habilitar a tréplica."}
            />
            {!project.companyReply && (
              <p className="mt-1 text-xs text-stone-950 dark:text-white">
                Você poderá responder após a empresa publicar uma réplica.
              </p>
            )}
          </div>

           <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-white">
                Compraria novamente dessa empresa?
            </label>
            <div className="mt-2 flex items-center">
                <span className={`text-sm ${!wouldBuyAgain ? 'font-bold text-emerald-700 dark:text-white' : 'text-stone-500'}`}>Não</span>
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
                <span className={`text-sm ${wouldBuyAgain ? 'font-bold text-emerald-700 dark:text-white' : 'text-stone-500'}`}>Sim</span>
            </div>
          </div>
          
          <button onClick={handleSave} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 text-sm font-semibold">Salvar Alterações</button>
        </div>
      )}

    </div>
  )
};

export const UserDashboard: React.FC<UserDashboardProps> = ({ allProjects, currentUser, onUpdate, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<UserTab>('submissions');
  const userProjects = allProjects.filter(p => p.submitterEmail === currentUser.email);

  const TabButton: React.FC<{ tab: UserTab, label: string }> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === tab ? 'bg-emerald-600 text-white' : 'text-emerald-700 dark:text-white hover:bg-emerald-100 dark:hover:bg-emerald-800'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-white">Meu Painel</h2>
      
       <div className="border-b border-emerald-200 dark:border-emerald-800">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          <TabButton tab="submissions" label="Meus Envios" />
          <TabButton tab="account" label="Minha Conta" />
        </nav>
      </div>

      {activeTab === 'submissions' && (
        <div>
          <p className="text-stone-950 dark:text-white mb-6">Gerencie seus envios, atualize suas avaliações e responda às empresas.</p>
          {userProjects.length > 0 ? (
            <div className="space-y-4">
              {userProjects.map(project => (
                <UserSubmissionCard key={project.id} project={project} onUpdate={onUpdate} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-6 bg-white dark:bg-white/20 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-emerald-700 dark:text-white">Você ainda não fez envios</h3>
              <p className="mt-2 text-stone-950 dark:text-white">Reporte um atraso para começar a acompanhar seus projetos.</p>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'account' && (
        <MyAccountPage currentUser={currentUser} onUpdateUser={onUpdateUser} />
      )}
    </div>
  );
};