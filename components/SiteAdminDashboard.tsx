
import React, { useState } from 'react';
import type { ProjectDelay, User } from '../types';
// FIX: Import AdminView for use in props and component logic.
import { UserRole, SubmissionStatus, AdminView } from '../types';
import { PendingSubmissionCard } from './PendingSubmissionCard';
import { PencilIcon } from './icons/PencilIcon';
// FIX: Import MyAccountPage for the "My Account" view.
import { MyAccountPage } from './MyAccountPage';

interface SiteAdminDashboardProps {
  // FIX: Added adminView prop to control which section is visible.
  adminView: AdminView;
  pendingSubmissions: ProjectDelay[];
  managedProjects: ProjectDelay[];
  duplicateGroups: ProjectDelay[][];
  users: User[];
  // FIX: Added currentUser to be passed to MyAccountPage.
  currentUser: User;
  onApprove: (id: string) => void;
  onReject: (submission: ProjectDelay) => void;
  onEditSubmission: (submission: ProjectDelay) => void;
  onEditUser: (user: User) => void;
  onCreateUser: () => void;
  onDismissDuplicate: (groupKey: string) => void;
  apiKey: string | null;
  onSaveApiKey: (key: string) => void;
  // FIX: Added onUpdateUser to be passed to MyAccountPage.
  onUpdateUser: (details: { fullName: string; password?: string }) => void;
}

const UserRoleLabel: React.FC<{ role: UserRole }> = ({ role }) => {
  const roleInfo = {
    [UserRole.SiteAdmin]: { text: 'Admin do Site', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
    [UserRole.CompanyAdmin]: { text: 'Admin de Empresa', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    [UserRole.User]: { text: 'Usuário', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
  };
  const { text, color } = roleInfo[role];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>{text}</span>;
};

const StatusLabel: React.FC<{ status: SubmissionStatus }> = ({ status }) => {
    const statusInfo = {
        [SubmissionStatus.Approved]: { text: 'Aprovado', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
        [SubmissionStatus.Rejected]: { text: 'Rejeitado', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
        [SubmissionStatus.Pending]: { text: 'Pendente', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
    };
    const { text, color } = statusInfo[status];
    return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>{text}</span>;
}


export const SiteAdminDashboard: React.FC<SiteAdminDashboardProps> = ({ 
  // FIX: Destructure adminView from props.
  adminView,
  pendingSubmissions, managedProjects, duplicateGroups, users, 
  // FIX: Destructure currentUser and onUpdateUser from props.
  currentUser,
  onApprove, onReject, onEditSubmission,
  onEditUser, onCreateUser, onDismissDuplicate, onUpdateUser,
  apiKey, onSaveApiKey
}) => {
  const [newApiKey, setNewApiKey] = useState('');

  const getUserFirstName = (email: string) => {
    const user = users.find(u => u.email === email);
    return user ? user.fullName.split(' ')[0] : email;
  };
  
  const getNormalizedUrl = (link: string): string => {
      try {
        const url = new URL(link);
        return `${url.hostname}${url.pathname}`.replace(/\/$/, "");
      } catch {
        return link; // fallback for invalid URLs
      }
  };

  const handleApiKeySave = () => {
    onSaveApiKey(newApiKey);
    alert('Chave de API salva com sucesso!');
  };
  
  const handleApiKeyRemove = () => {
    setNewApiKey('');
    onSaveApiKey('');
    alert('Chave de API removida com sucesso!');
  };

  return (
    <div className="space-y-12">
      <h2 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-100">Painel do Administrador do Site</h2>
      
      {/* FIX: Conditionally render sections based on adminView prop */}
      {adminView === AdminView.Pending && (
        <section>
          <h3 className="text-2xl font-semibold text-emerald-800 dark:text-emerald-200 border-b border-emerald-300 dark:border-emerald-700 pb-2 mb-4">Envios Pendentes de Moderação</h3>
          {pendingSubmissions.length > 0 ? (
            <div className="space-y-4">
              {pendingSubmissions.map(submission => (
                <PendingSubmissionCard key={submission.id} submission={submission} onApprove={onApprove} onReject={onReject} onEdit={onEditSubmission} users={users} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-6 bg-white dark:bg-white/20 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-emerald-700 dark:text-emerald-200">Nenhum Envio Pendente</h3>
              <p className="mt-2 text-stone-950 dark:text-stone-100">A fila de moderação está vazia. Bom trabalho!</p>
            </div>
          )}
        </section>
      )}

      {adminView === AdminView.Duplicates && (
        <section>
          <h3 className="text-2xl font-semibold text-emerald-800 dark:text-emerald-200 border-b border-emerald-300 dark:border-emerald-700 pb-2 mb-4">Possíveis Envios Duplicados</h3>
          {duplicateGroups.length > 0 ? (
            <div className="space-y-6">
              {duplicateGroups.map((group, index) => {
                const groupKey = getNormalizedUrl(group[0].crowdfundingLink);
                return (
                <div key={index} className="bg-white dark:bg-white/20 rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg text-emerald-800 dark:text-white">{group[0].projectName}</h4>
                      <p className="text-sm text-stone-950 dark:text-stone-100">
                        Encontrados {group.length} envios com a mesma URL.
                      </p>
                      <a href={group[0].crowdfundingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline break-all">{group[0].crowdfundingLink}</a>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Ação Manual Necessária</p>
                      <p className="text-xs text-stone-950 dark:text-stone-100 mb-2">Edite os envios para padronizar os dados, se necessário.</p>
                       <button onClick={() => onDismissDuplicate(groupKey)} className="text-sm bg-emerald-200 dark:bg-emerald-700 hover:bg-emerald-300 dark:hover:bg-emerald-600 text-emerald-600 dark:text-emerald-300 px-3 py-1 rounded-md transition-colors">
                          Dispensar
                       </button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                      {group.map(p => (
                          <div key={p.id} className="flex justify-between items-center p-2 bg-stone-100 dark:bg-black/20 rounded-md">
                              <p className="text-sm text-stone-950 dark:text-stone-100">
                                  ID: {p.id}, Status: {p.status}, Remetente: {getUserFirstName(p.submitterEmail)}
                              </p>
                              <button
                                  onClick={() => onEditSubmission(p)}
                                  className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 inline-flex items-center text-sm font-semibold"
                              >
                                  <PencilIcon className="h-4 w-4 mr-1" />
                                  Editar
                              </button>
                          </div>
                      ))}
                  </div>
                </div>
              )})}
            </div>
          ) : (
            <div className="text-center py-12 px-6 bg-white dark:bg-white/20 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-emerald-700 dark:text-emerald-200">Nenhuma Duplicata Encontrada</h3>
              <p className="mt-2 text-stone-950 dark:text-stone-100">O sistema não detectou envios duplicados com base na URL.</p>
            </div>
          )}
        </section>
      )}

      {adminView === AdminView.Submissions && (
        <section>
          <h3 className="text-2xl font-semibold text-emerald-800 dark:text-emerald-200 border-b border-emerald-300 dark:border-emerald-700 pb-2 mb-4">Gerenciar Envios</h3>
          <div className="bg-white dark:bg-white/20 rounded-lg shadow-lg overflow-hidden">
            {managedProjects.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-emerald-200/50 dark:divide-white/20">
                  <thead className="bg-emerald-50 dark:bg-white/5">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-600 dark:text-emerald-300 uppercase tracking-wider">Projeto</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-600 dark:text-emerald-300 uppercase tracking-wider">Empresa</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-600 dark:text-emerald-300 uppercase tracking-wider">Remetente</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-600 dark:text-emerald-300 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-600 dark:text-emerald-300 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-200/50 dark:divide-white/20">
                    {managedProjects.map(project => (
                      <tr key={project.id} className="dark:text-stone-100">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-950 dark:text-stone-50">{project.projectName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{project.companyName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{getUserFirstName(project.submitterEmail)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusLabel status={project.status} /></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button onClick={() => onEditSubmission(project)} className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 inline-flex items-center">
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 px-6">
                  <h3 className="text-xl font-semibold text-emerald-700 dark:text-emerald-200">Nenhum Projeto Aprovado ou Rejeitado</h3>
                  <p className="mt-2 text-stone-950 dark:text-stone-100">Quando os envios forem moderados, eles aparecerão aqui para gerenciamento.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {adminView === AdminView.Settings && (
        <section>
          <h3 className="text-2xl font-semibold text-emerald-800 dark:text-emerald-200 border-b border-emerald-300 dark:border-emerald-700 pb-2 mb-4">Configuração da API Gemini</h3>
          <div className="bg-white dark:bg-white/20 rounded-lg shadow-lg p-6">
              <p className="text-sm text-stone-950 dark:text-stone-100 mb-4">
                  A funcionalidade de análise por IA é opcional. Para habilitá-la, insira sua chave de API do Google Gemini. Se nenhuma chave for fornecida, os recursos de IA ficarão ocultos em toda a plataforma.
              </p>
              <div className="space-y-4">
                  <div>
                      <label htmlFor="apiKey" className="block text-sm font-medium text-emerald-700 dark:text-emerald-200">
                          Sua Chave de API
                      </label>
                      <input
                          type="password"
                          id="apiKey"
                          value={newApiKey}
                          onChange={(e) => setNewApiKey(e.target.value)}
                          placeholder={apiKey ? '•••••••••••••••••••••••••••••• (Chave salva)' : 'Insira sua nova chave de API aqui'}
                          className="mt-1 block w-full px-3 py-2 bg-white text-stone-950 border border-emerald-300 rounded-md shadow-sm placeholder-stone-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                      />
                  </div>
                  <div className="flex items-center justify-end gap-3">
                      {apiKey && (
                          <button onClick={handleApiKeyRemove} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                              Remover Chave
                          </button>
                      )}
                      <button onClick={handleApiKeySave} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                          Salvar Chave
                      </button>
                  </div>
              </div>
          </div>
        </section>
      )}

      {adminView === AdminView.Users && (
        <section>
          <div className="flex justify-between items-center border-b border-emerald-300 dark:border-emerald-700 pb-2 mb-4">
            <h3 className="text-2xl font-semibold text-emerald-800 dark:text-emerald-200">Gerenciamento de Usuários e Empresas</h3>
            <button onClick={onCreateUser} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 text-sm font-semibold">
              Criar Novo Usuário
            </button>
          </div>
          <div className="bg-white dark:bg-white/20 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-emerald-200/50 dark:divide-white/20">
                <thead className="bg-emerald-50 dark:bg-white/5">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-600 dark:text-emerald-300 uppercase tracking-wider">Primeiro Nome</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-600 dark:text-emerald-300 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-600 dark:text-emerald-300 uppercase tracking-wider">Tipo</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-600 dark:text-emerald-300 uppercase tracking-wider">Empresa</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-600 dark:text-emerald-300 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-200/50 dark:divide-white/20">
                  {users.map(user => (
                    <tr key={user.email} className="dark:text-stone-100">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-950 dark:text-stone-50">{user.fullName.split(' ')[0]}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm"><UserRoleLabel role={user.role} /></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{user.companyName || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => onEditUser(user)} className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300">Editar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* FIX: Conditionally render MyAccountPage */}
      {adminView === AdminView.MyAccount && (
        <MyAccountPage currentUser={currentUser} onUpdateUser={onUpdateUser} />
      )}
    </div>
  );
};
