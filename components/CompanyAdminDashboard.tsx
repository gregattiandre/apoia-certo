import React, { useState } from 'react';
import type { ProjectDelay, User } from '../types';
import { StarRatingDisplay } from './StarRatingDisplay';
import { MyAccountPage } from './MyAccountPage';

interface CompanyAdminDashboardProps {
  allProjects: ProjectDelay[];
  currentUser: User;
  onSaveReply: (projectId: string, reply: string) => void;
  users: User[];
  onUpdateUser: (details: { fullName: string; password?: string }) => void;
}

type CompanyAdminTab = 'submissions' | 'account';

const ProjectReplyCard: React.FC<{ project: ProjectDelay, onSaveReply: (projectId: string, reply: string) => void, users: User[] }> = ({ project, onSaveReply, users }) => {
  const [reply, setReply] = useState(project.companyReply || '');
  const [isEditing, setIsEditing] = useState(false);

  const submitter = users.find(u => u.email === project.submitterEmail);
  const submitterFirstName = submitter ? submitter.fullName.split(' ')[0] : 'Usuário';

  const handleSave = () => {
    onSaveReply(project.id, reply);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-white/20 rounded-lg shadow-lg p-6">
      <h4 className="font-bold text-lg text-emerald-800 dark:text-white">{project.projectName}</h4>
      <div className="text-sm text-stone-950 dark:text-white mb-4">Enviado por: {submitterFirstName} ({project.submitterEmail})</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4 text-stone-950 dark:text-white">
        <div>
          <span className="font-semibold">Avaliação:</span>
          <StarRatingDisplay rating={project.rating} />
        </div>
        <div><span className="font-semibold">Status:</span> {project.status}</div>
        <div><span className="font-semibold">Prometido em:</span> {project.promisedDate}</div>
        <div><span className="font-semibold">Entregue em:</span> {project.actualDate || 'N/A'}</div>
      </div>

      {project.comment && (
        <div className="mb-4">
          <h5 className="font-semibold text-sm text-emerald-600 dark:text-emerald-300">Comentário do Usuário:</h5>
          <blockquote className="border-l-4 border-emerald-300 dark:border-emerald-600 pl-4 py-2 mt-1 italic text-stone-950 dark:text-white">
            "{project.comment}"
          </blockquote>
        </div>
      )}

      <div>
        <h5 className="font-semibold text-sm text-emerald-600 dark:text-emerald-300">Sua Resposta (Réplica):</h5>
        {isEditing || !project.companyReply ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              className="w-full p-2 border border-emerald-300 dark:border-emerald-600 rounded-md bg-white dark:bg-stone-50/20 text-stone-950 dark:text-white focus:ring-emerald-500 focus:border-emerald-500 placeholder-stone-500 dark:placeholder-white/50"
              placeholder="Digite a resposta oficial da sua empresa aqui..."
            />
            <div className="flex gap-2">
              <button onClick={handleSave} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 text-sm font-semibold">Salvar Resposta</button>
              {project.companyReply && <button onClick={() => setIsEditing(false)} className="bg-emerald-200 dark:bg-emerald-700 text-emerald-800 dark:text-white px-4 py-2 rounded-md hover:bg-emerald-300 text-sm">Cancelar</button>}
            </div>
          </div>
        ) : (
          <div className="mt-2 flex justify-between items-start">
            <blockquote className="border-l-4 border-emerald-500 pl-4 py-2 italic text-stone-950 dark:text-white">
              "{project.companyReply}"
            </blockquote>
            <button onClick={() => setIsEditing(true)} className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm font-semibold">Editar</button>
          </div>
        )}
      </div>

    </div>
  );
}


export const CompanyAdminDashboard: React.FC<CompanyAdminDashboardProps> = ({ allProjects, currentUser, onSaveReply, users, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<CompanyAdminTab>('submissions');
  const companyProjects = allProjects.filter(p => p.companyName === currentUser.companyName);

  const TabButton: React.FC<{ tab: CompanyAdminTab, label: string }> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === tab ? 'bg-emerald-600 text-white' : 'text-emerald-700 dark:text-white hover:bg-emerald-100 dark:hover:bg-emerald-800'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-white">Painel da Empresa: {currentUser.companyName}</h2>
      
      <div className="border-b border-emerald-200 dark:border-emerald-800">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          <TabButton tab="submissions" label="Gestão de Envios" />
          <TabButton tab="account" label="Minha Conta" />
        </nav>
      </div>

      {activeTab === 'submissions' && (
        <div>
          <p className="text-stone-950 dark:text-white mb-6">Visualize e responda às avaliações dos usuários sobre seus projetos.</p>
          {companyProjects.length > 0 ? (
            <div className="space-y-4">
              {companyProjects.map(project => (
                <ProjectReplyCard key={project.id} project={project} onSaveReply={onSaveReply} users={users} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-6 bg-white dark:bg-white/20 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-emerald-700 dark:text-white">Nenhum Envio Encontrado</h3>
              <p className="mt-2 text-stone-950 dark:text-white">Ainda não há envios de projetos para sua empresa.</p>
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