import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ProjectList } from './components/ProjectList';
import { SubmissionForm } from './components/SubmissionForm';
import { SiteAdminDashboard } from './components/SiteAdminDashboard';
import { CompanyAdminDashboard } from './components/CompanyAdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { Header } from './components/Header';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { CompanyDetailPage } from './components/CompanyDetailPage';
import { ProjectDetailPage } from './components/ProjectDetailPage';
import { EditSubmissionModal } from './components/EditSubmissionModal';
import { EditUserModal } from './components/EditUserModal';
import { RejectionFeedbackModal } from './components/RejectionFeedbackModal';
import { AppView, SubmissionStatus, UserRole, AdminView } from './types';
import type { ProjectDelay, CompanyReputation, AnalysisResult, User, Company } from './types';
import { analyzeReputation } from './services/geminiService';
import { dbService } from './services/db';
import type { Theme } from './components/ThemeSwitcher';
import { AdminBottomNav } from './components/AdminBottomNav';
import { MyAccountPage } from './components/MyAccountPage';

const simpleHash = (password: string) => `${password}_hashed`;

// Initial data is now only used to seed the database on the very first run
const initialUsers: User[] = [
  { email: 'admin@admin.com', passwordHash: simpleHash('password'), role: UserRole.SiteAdmin, fullName: 'Admin Geral', birthDate: '1990-01-01' },
  { email: 'empresa@relogiosgeniais.com', passwordHash: simpleHash('password'), role: UserRole.CompanyAdmin, companyName: 'Relógios Geniais', fullName: 'Gerente de Contas', birthDate: '1990-01-01' },
  { email: 'usuario@email.com', passwordHash: simpleHash('password'), role: UserRole.User, fullName: 'Usuário de Teste', birthDate: '1995-05-10' },
  { email: 'outro@email.com', passwordHash: simpleHash('password'), role: UserRole.User, fullName: 'Outro Usuário', birthDate: '1992-03-15' },
  { email: 'feliz@email.com', passwordHash: simpleHash('password'), role: UserRole.User, fullName: 'Cliente Feliz', birthDate: '1988-11-20' },
  { email: 'triste@email.com', passwordHash: simpleHash('password'), role: UserRole.User, fullName: 'Apoiador Triste', birthDate: '2000-07-07' },
  { email: 'jogador@email.com', passwordHash: simpleHash('password'), role: UserRole.User, fullName: 'Jogador Mestre', birthDate: '1998-09-12' },
  { email: 'novo@email.com', passwordHash: simpleHash('password'), role: UserRole.User, fullName: 'Novo Apoiador', birthDate: '2001-01-01' },
  { email: 'duplicado@email.com', passwordHash: simpleHash('password'), role: UserRole.User, fullName: 'Pessoa Duplicada', birthDate: '1999-04-04' },
];

const initialProjects: ProjectDelay[] = [
  { id: '1', companyName: 'Relógios Geniais', projectName: 'Relógio Tempo Certo', crowdfundingLink: 'https://www.kickstarter.com/projects/getpebble/pebble-time-awesome-smartwatch-no-compromises', promisedDate: '2015-05-30', actualDate: '2015-07-20', status: SubmissionStatus.Approved, rating: 4, comment: "Atrasou um pouco, mas o produto é ótimo!", submitterEmail: 'usuario@email.com', wouldBuyAgain: true },
  { id: '2', companyName: 'Cooler & Cia', projectName: 'O Cooler Mais Legal', crowdfundingLink: 'https://www.kickstarter.com/projects/ryangrepper/coolest-cooler-21st-century-cooler-thats-actually', promisedDate: '2015-02-01', actualDate: '2017-08-01', status: SubmissionStatus.Approved, rating: 1.5, comment: "Atraso inaceitável de mais de 2 anos.", submitterEmail: 'outro@email.com', wouldBuyAgain: false },
  { id: '3', companyName: 'Relógios Geniais', projectName: 'Relógio Geração 2', crowdfundingLink: 'https://www.kickstarter.com/projects/getpebble/pebble-2-time-2-and-core-an-entirely-new-3g-ultra', promisedDate: '2016-09-30', actualDate: '2016-11-15', status: SubmissionStatus.Approved, rating: 4.5, submitterEmail: 'usuario@email.com', wouldBuyAgain: true },
  { id: '4', companyName: 'Impressoras Pontuais', projectName: 'Impressora 3D Pro', crowdfundingLink: 'http://example.com/impressora', promisedDate: '2023-12-31', actualDate: '2023-12-25', status: SubmissionStatus.Approved, rating: 5, comment: "Entregaram antes do prazo! Fantástico!", submitterEmail: 'feliz@email.com', wouldBuyAgain: true },
  { id: '5', companyName: 'VaporWare Inc.', projectName: 'O Gadget Fantasma', crowdfundingLink: 'http://example.com/vaporware', promisedDate: '2022-01-01', status: SubmissionStatus.Approved, rating: 1, comment: "Nunca entregaram. Fraude.", submitterEmail: 'triste@email.com', companyReply: 'Estamos reestruturando o projeto e em breve teremos novidades.', wouldBuyAgain: false },
  { id: '6', companyName: 'Mestres dos Tabuleiros', projectName: 'Robôs vs Minions', crowdfundingLink: 'http://example.com/jogos', promisedDate: '2024-03-01', status: SubmissionStatus.Pending, rating: 3, comment: "Ainda no aguardo, mas a comunicação tem sido boa.", submitterEmail: 'jogador@email.com', wouldBuyAgain: true },
  { id: '7', companyName: 'Relógios Geniais', projectName: 'Smartwatch Fictício 3', crowdfundingLink: 'http://example.com/relogio3', promisedDate: '2024-05-01', status: SubmissionStatus.Pending, rating: 5, submitterEmail: 'novo@email.com', wouldBuyAgain: true },
  { id: '8', companyName: 'Relógios Geniais', projectName: 'Relógio Tempo Certo', crowdfundingLink: 'https://www.kickstarter.com/projects/getpebble/pebble-time-awesome-smartwatch-no-compromises', promisedDate: '2015-06-15', status: SubmissionStatus.Pending, rating: 4, submitterEmail: 'duplicado@email.com', comment: 'Segundo relato para o mesmo projeto.', wouldBuyAgain: true },
];

const App: React.FC = () => {
  const [projects, setProjects] = useState<ProjectDelay[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentView, setCurrentView] = useState<AppView>(AppView.Public);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<{ name: string; company: string } | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<ProjectDelay | null>(null);
  const [companyAnalyses, setCompanyAnalyses] = useState<Record<string, AnalysisResult>>({});
  const [loadingAnalyses, setLoadingAnalyses] = useState<Record<string, boolean>>({});
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissedDuplicates, setDismissedDuplicates] = useState<string[]>([]);
  const [rejectionTarget, setRejectionTarget] = useState<ProjectDelay | null>(null);
  const [theme, setTheme] = useState<Theme>('system');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [adminView, setAdminView] = useState<AdminView>(AdminView.Pending);


  useEffect(() => {
    async function loadDataFromDB() {
      try {
        await dbService.initializeDB(initialProjects, initialUsers);
        
        const [savedTheme, savedApiKey, loadedProjects, loadedUsers, loadedCompanies, loadedAnalyses, loadedDismissed] = await Promise.all([
          dbService.getSetting<Theme>('theme'),
          dbService.getSetting<string>('apiKey'),
          dbService.getAllProjects(),
          dbService.getAllUsers(),
          dbService.getAllCompanies(),
          dbService.getAllCompanyAnalyses(),
          dbService.getAllDismissedDuplicates(),
        ]);

        if (savedTheme) setTheme(savedTheme);
        if (savedApiKey) setApiKey(savedApiKey);
        setProjects(loadedProjects);
        setUsers(loadedUsers);
        setCompanies(loadedCompanies);
        setCompanyAnalyses(loadedAnalyses);
        setDismissedDuplicates(loadedDismissed);

      } catch (error) {
        console.error("Falha ao carregar dados do banco de dados:", error);
        alert("Não foi possível carregar os dados. Por favor, recarregue a página.");
      } finally {
        setIsLoading(false);
      }
    }
    loadDataFromDB();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark';
    const isSystem = theme === 'system';

    if (isSystem) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      root.classList.toggle('dark', mediaQuery.matches);
      
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.toggle('dark', e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      root.classList.toggle('dark', isDark);
    }
  }, [theme]);

  const handleThemeChange = async (newTheme: Theme) => {
    await dbService.putSetting('theme', newTheme);
    setTheme(newTheme);
  };

  const handleSaveApiKey = async (newKey: string) => {
    const keyToSave = newKey.trim();
    if (keyToSave) {
        await dbService.putSetting('apiKey', keyToSave);
        setApiKey(keyToSave);
    } else {
        await dbService.removeSetting('apiKey');
        setApiKey(null);
    }
  };
  
  const generateCompanyAnalysis = useCallback(async (companyName: string, allProjects: ProjectDelay[] = projects) => {
    if (!apiKey) {
      console.error("Tentativa de gerar análise sem chave de API.");
      const analysisResult = { text: "Erro: Nenhuma chave de API configurada no painel do administrador.", isError: true };
      setCompanyAnalyses(prev => ({ ...prev, [companyName]: analysisResult }));
      return;
    }

    setLoadingAnalyses(prev => ({ ...prev, [companyName]: true }));

    const companyProjects = allProjects.filter(p => p.companyName === companyName && p.status === SubmissionStatus.Approved);
    if (companyProjects.length === 0) {
      setLoadingAnalyses(prev => ({ ...prev, [companyName]: false }));
      return;
    }
    const totalDelay = companyProjects.reduce((acc, p) => {
      if (!p.actualDate) return acc + Math.max(0, (new Date().getTime() - new Date(p.promisedDate).getTime()) / (1000 * 60 * 60 * 24));
      const promised = new Date(p.promisedDate);
      const actual = new Date(p.actualDate);
      return acc + (actual.getTime() - promised.getTime()) / (1000 * 60 * 60 * 24);
    }, 0);
    const totalRating = companyProjects.reduce((acc, p) => acc + p.rating, 0);
    const reputation: Omit<CompanyReputation, 'aiAnalysis' | 'isAiAnalysisLoading'> = {
      name: companyName,
      projects: companyProjects,
      averageDelayDays: totalDelay / companyProjects.length,
      delayedProjectsCount: companyProjects.length,
      averageRating: totalRating / companyProjects.length,
    };

    let analysisResult: AnalysisResult;
    try {
      const analysisText = await analyzeReputation(reputation, apiKey);
      analysisResult = { text: analysisText, isError: analysisText.startsWith("Erro:") };
    } catch (error) {
      console.error("Erro ao gerar análise para", companyName, error);
      const errorMessage = "Erro: Não foi possível gerar a análise da IA.";
      analysisResult = { text: errorMessage, isError: true };
    } finally {
      if(analysisResult) {
        await dbService.putCompanyAnalysis(companyName, analysisResult);
        setCompanyAnalyses(prev => ({ ...prev, [companyName]: analysisResult }));
      }
      setLoadingAnalyses(prev => ({ ...prev, [companyName]: false }));
    }
  }, [projects, apiKey]);

  const handleNavigate = (view: AppView) => {
    setSelectedCompany(null);
    setSelectedProject(null);
    if ((view === AppView.Dashboard || view === AppView.Submit) && !currentUser) {
      setCurrentView(AppView.Login);
    } else {
      setCurrentView(view);
    }
  };
  
  const handleRegister = async (details: { fullName: string; birthDate: string; email: string; password: string; }) => {
    if (users.some(u => u.email === details.email)) {
      alert("Este e-mail já está cadastrado.");
      return;
    }
    const newUser: User = {
      email: details.email,
      passwordHash: simpleHash(details.password),
      fullName: details.fullName,
      birthDate: details.birthDate,
      role: UserRole.User,
    };
    await dbService.putUser(newUser);
    setUsers(prev => [...prev, newUser]);
    alert("Cadastro realizado com sucesso! Faça o login para continuar.");
    setCurrentView(AppView.Login);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentView(AppView.Dashboard);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView(AppView.Public);
  };

  const handleSubmit = useCallback(async (newSubmission: Omit<ProjectDelay, 'id' | 'status' | 'submitterEmail'>) => {
    if (!currentUser) {
        alert("Você precisa estar logado para enviar um formulário.");
        setCurrentView(AppView.Login);
        return;
    }
    
    const companyExists = companies.some(c => c.name === newSubmission.companyName);
    if (!companyExists) {
        const newCompany: Company = { name: newSubmission.companyName };
        await dbService.putCompany(newCompany);
        setCompanies(prev => [...prev, newCompany]);
    }

    const submissionWithId: ProjectDelay = { 
        ...newSubmission, 
        id: new Date().getTime().toString(), 
        status: SubmissionStatus.Pending,
        submitterEmail: currentUser.email,
    };
    await dbService.putProject(submissionWithId);
    setProjects(prevProjects => [...prevProjects, submissionWithId]);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 5000);
    setCurrentView(AppView.Public);
  }, [currentUser, companies]);

  const handleApproval = useCallback(async (id: string) => {
    const projectToUpdate = projects.find(p => p.id === id);
    if (!projectToUpdate) return;
    
    const companyExists = companies.some(c => c.name === projectToUpdate.companyName);
    if (!companyExists) {
        const newCompany: Company = { name: projectToUpdate.companyName };
        await dbService.putCompany(newCompany);
        setCompanies(prev => [...prev, newCompany]);
    }
    
    const updatedProject = { ...projectToUpdate, status: SubmissionStatus.Approved };
    const updatedProjects = projects.map(p => p.id === id ? updatedProject : p);
    await dbService.putProject(updatedProject);
    setProjects(updatedProjects);
    if (apiKey) {
      generateCompanyAnalysis(updatedProject.companyName, updatedProjects);
    }
  }, [projects, companies, generateCompanyAnalysis, apiKey]);

  const handleRejection = useCallback(async (submission: ProjectDelay) => {
    setRejectionTarget(submission);
  }, []);

  const handleConfirmRejection = useCallback(async (id: string, reason?: string) => {
    const projectToUpdate = projects.find(p => p.id === id);
    if (!projectToUpdate) return;
    const updatedProject = { ...projectToUpdate, status: SubmissionStatus.Rejected, rejectionReason: reason };
    await dbService.putProject(updatedProject);
    setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
    setRejectionTarget(null);
  }, [projects]);

  const handleViewCompany = (companyName: string) => {
    setSelectedCompany(companyName);
    setCurrentView(AppView.CompanyDetail);
  };

  const handleViewProject = (projectName: string, companyName: string) => {
    setSelectedProject({ name: projectName, company: companyName });
    setCurrentView(AppView.ProjectDetail);
  };

  const handleOpenEditModal = (submission: ProjectDelay) => setEditingSubmission(submission);
  const handleCloseEditModal = () => setEditingSubmission(null);
  
  const handleUpdateSubmission = async (updatedSubmission: ProjectDelay) => {
    const projectBeforeUpdate = projects.find(p => p.id === updatedSubmission.id);
    const oldStatus = projectBeforeUpdate?.status;

    const companyExists = companies.some(c => c.name === updatedSubmission.companyName);
    if (!companyExists) {
        const newCompany: Company = { name: updatedSubmission.companyName };
        await dbService.putCompany(newCompany);
        setCompanies(prev => [...prev, newCompany]);
    }

    const projectsAfterUpdate = projects.map(p => (p.id === updatedSubmission.id ? updatedSubmission : p));
    
    await dbService.putProject(updatedSubmission);
    setProjects(projectsAfterUpdate);
    setEditingSubmission(null);

    if (apiKey && oldStatus !== SubmissionStatus.Approved && updatedSubmission.status === SubmissionStatus.Approved) {
      generateCompanyAnalysis(updatedSubmission.companyName, projectsAfterUpdate);
    }
  };
  
  const handleSaveCompanyReply = async (projectId: string, reply: string) => {
     const projectToUpdate = projects.find(p => p.id === projectId);
     if (!projectToUpdate) return;
     const updatedProject = { ...projectToUpdate, companyReply: reply };
     await dbService.putProject(updatedProject);
     setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
  };
  
  const handleUpdateSubmissionByUser = async (projectId: string, rating: number, rebuttal: string, wouldBuyAgain: boolean) => {
     const projectToUpdate = projects.find(p => p.id === projectId);
     if (!projectToUpdate) return;
     const updatedProject = { ...projectToUpdate, rating, userRebuttal: rebuttal, wouldBuyAgain };
     await dbService.putProject(updatedProject);
     setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
  };
    
  const handleOpenUserModal = (userToEdit?: User) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setIsCreatingUser(false);
    } else {
      setIsCreatingUser(true);
      setEditingUser(null);
    }
  };

  const handleCloseUserModal = () => {
    setEditingUser(null);
    setIsCreatingUser(false);
  };

  const handleSaveUser = async (userToSave: Omit<User, 'passwordHash'> & { password?: string }, isNew: boolean) => {
    if (isNew) {
      if (users.some(u => u.email === userToSave.email)) {
        alert('Erro: Este e-mail já está em uso.');
        return;
      }
      if (!userToSave.password) {
         alert('Erro: A senha é obrigatória para novos usuários.');
        return;
      }
      const newUser: User = {
        ...userToSave,
        passwordHash: simpleHash(userToSave.password),
      };
      delete (newUser as any).password;
      await dbService.putUser(newUser);
      setUsers(prev => [...prev, newUser]);
    } else {
      const userToUpdate = users.find(u => u.email === userToSave.email);
      if(!userToUpdate) return;
      const updatedUser = { ...userToUpdate, ...userToSave };
      if (userToSave.password) {
        updatedUser.passwordHash = simpleHash(userToSave.password);
      }
      delete (updatedUser as any).password;
      await dbService.putUser(updatedUser);
      setUsers(prevUsers => prevUsers.map(u => (u.email === updatedUser.email ? updatedUser : u)));
    }
    handleCloseUserModal();
  };

  const handleUpdateCurrentUser = async (details: { fullName: string; password?: string }) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, fullName: details.fullName };
    if (details.password) {
        updatedUser.passwordHash = simpleHash(details.password);
    }
    await dbService.putUser(updatedUser);
    setUsers(prev => prev.map(u => u.email === currentUser.email ? updatedUser : u));
    setCurrentUser(updatedUser);
  };

  const handleDismissDuplicate = async (groupKey: string) => {
    await dbService.putDismissedDuplicate(groupKey);
    setDismissedDuplicates(prev => [...prev, groupKey]);
  };

  const pendingSubmissions = useMemo(() => projects.filter(p => p.status === SubmissionStatus.Pending), [projects]);
  const managedProjects = useMemo(() => projects.filter(p => p.status === SubmissionStatus.Approved || p.status === SubmissionStatus.Rejected), [projects]);
  
  const uniqueCompanyNames = useMemo(() => {
    const namesFromProjects = new Set(projects.map(p => p.companyName));
    const namesFromCompanies = new Set(companies.map(c => c.name));
    const allNames = new Set([...namesFromProjects, ...namesFromCompanies]);
    return Array.from(allNames).sort();
  }, [projects, companies]);

  const findDuplicateGroups = useMemo(() => {
    const urlMap = new Map<string, ProjectDelay[]>();
    projects.forEach(p => {
      try {
        const url = new URL(p.crowdfundingLink);
        const normalizedUrl = `${url.hostname}${url.pathname}`.replace(/\/$/, "");
        
        if (dismissedDuplicates.includes(normalizedUrl)) return;

        if (!urlMap.has(normalizedUrl)) urlMap.set(normalizedUrl, []);
        urlMap.get(normalizedUrl)!.push(p);
      } catch (e) { /* ignore invalid URLs */ }
    });
    return Array.from(urlMap.values()).filter(group => group.length > 1);
  }, [projects, dismissedDuplicates]);

  const calculateAllReputations = useCallback((projectsToCalc: ProjectDelay[], analyses: Record<string, AnalysisResult>, loadingStates: Record<string, boolean>): CompanyReputation[] => {
    const approved = projectsToCalc.filter(p => p.status === SubmissionStatus.Approved);
    const companyData: { [key: string]: ProjectDelay[] } = {};
    approved.forEach(p => {
      if (!companyData[p.companyName]) companyData[p.companyName] = [];
      companyData[p.companyName].push(p);
    });
    
    const reputations: CompanyReputation[] = Object.entries(companyData).map(([name, companyProjects]) => {
      const totalDelay = companyProjects.reduce((acc, p) => {
        if (!p.actualDate) return acc + Math.max(0, (new Date().getTime() - new Date(p.promisedDate).getTime()) / (1000 * 60 * 60 * 24));
        const promised = new Date(p.promisedDate);
        const actual = new Date(p.actualDate);
        return acc + (actual.getTime() - promised.getTime()) / (1000 * 60 * 60 * 24);
      }, 0);
      const totalRating = companyProjects.reduce((acc, p) => acc + p.rating, 0);
      return {
        name,
        projects: companyProjects,
        averageDelayDays: companyProjects.length > 0 ? totalDelay / companyProjects.length : 0,
        delayedProjectsCount: companyProjects.length,
        averageRating: companyProjects.length > 0 ? totalRating / companyProjects.length : 0,
        aiAnalysis: analyses[name],
        isAiAnalysisLoading: loadingStates[name] ?? false,
      };
    });
    
    return reputations.sort((a, b) => a.averageDelayDays - b.averageDelayDays || b.delayedProjectsCount - a.delayedProjectsCount);
  }, []);

  const reputations = useMemo(() => calculateAllReputations(projects, companyAnalyses, loadingAnalyses), [projects, companyAnalyses, loadingAnalyses, calculateAllReputations]);
  
  const renderDashboard = () => {
    if (!currentUser) return <Login users={users} onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setCurrentView(AppView.Register)} />;
    switch (currentUser.role) {
      case UserRole.SiteAdmin:
        return <SiteAdminDashboard 
                  adminView={adminView}
                  pendingSubmissions={pendingSubmissions} 
                  managedProjects={managedProjects}
                  duplicateGroups={findDuplicateGroups}
                  onDismissDuplicate={handleDismissDuplicate}
                  onApprove={handleApproval} 
                  onReject={handleRejection} 
                  onEditSubmission={handleOpenEditModal}
                  users={users}
                  onEditUser={handleOpenUserModal}
                  onCreateUser={() => handleOpenUserModal()}
                  apiKey={apiKey}
                  onSaveApiKey={handleSaveApiKey}
                  currentUser={currentUser}
                  onUpdateUser={handleUpdateCurrentUser}
                />;
      case UserRole.CompanyAdmin:
         return <CompanyAdminDashboard 
                  allProjects={projects} 
                  currentUser={currentUser} 
                  onSaveReply={handleSaveCompanyReply}
                  users={users}
                  onUpdateUser={handleUpdateCurrentUser}
                />;
      case UserRole.User:
        return <UserDashboard 
                  allProjects={projects} 
                  currentUser={currentUser} 
                  onUpdate={handleUpdateSubmissionByUser} 
                  onUpdateUser={handleUpdateCurrentUser}
                />;
      default:
        return <Login users={users} onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setCurrentView(AppView.Register)} />;
    }
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.Public:
        return <ProjectList 
                  reputations={reputations} 
                  onViewCompany={handleViewCompany} 
                  currentUser={currentUser} 
                  onGenerateAnalysis={generateCompanyAnalysis}
                  apiKey={apiKey}
                />;
      case AppView.Submit:
        if (!currentUser) return <Login users={users} onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setCurrentView(AppView.Register)} />;
        return <SubmissionForm onSubmit={handleSubmit} companyNames={uniqueCompanyNames} />;
      case AppView.Login:
        return <Login users={users} onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setCurrentView(AppView.Register)} />;
      case AppView.Register:
        return <Register onRegister={handleRegister} onSwitchToLogin={() => setCurrentView(AppView.Login)} />;
      case AppView.Dashboard:
        return renderDashboard();
      case AppView.CompanyDetail: {
        if (!selectedCompany) return <ProjectList reputations={reputations} onViewCompany={handleViewCompany} currentUser={currentUser} onGenerateAnalysis={generateCompanyAnalysis} apiKey={apiKey} />;
        const companyProjects = projects.filter(p => p.companyName === selectedCompany);
        const analysis = companyAnalyses[selectedCompany];
        const isLoading = loadingAnalyses[selectedCompany] ?? false;
        return <CompanyDetailPage 
                  companyName={selectedCompany} 
                  projects={companyProjects} 
                  onBack={() => handleNavigate(AppView.Public)}
                  isAdmin={currentUser?.role === UserRole.SiteAdmin}
                  onEdit={handleOpenEditModal}
                  aiAnalysis={analysis}
                  isAiAnalysisLoading={isLoading}
                  onViewProject={handleViewProject}
                  apiKey={apiKey}
                />;
      }
      case AppView.ProjectDetail: {
        if (!selectedProject) return <ProjectList reputations={reputations} onViewCompany={handleViewCompany} currentUser={currentUser} onGenerateAnalysis={generateCompanyAnalysis} apiKey={apiKey} />;
        return <ProjectDetailPage 
                  projectName={selectedProject.name}
                  companyName={selectedProject.company}
                  allSubmissions={projects}
                  allUsers={users}
                  onBack={() => handleViewCompany(selectedProject.company)}
                />;
      }
      default:
        return <ProjectList reputations={reputations} onViewCompany={handleViewCompany} currentUser={currentUser} onGenerateAnalysis={generateCompanyAnalysis} apiKey={apiKey} />;
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-stone-50 dark:bg-stone-850 text-lg font-semibold text-stone-950 dark:text-white">
        Carregando dados...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-850 text-stone-950 dark:text-white transition-colors duration-300">
      <Header 
        currentView={currentView}
        onNavigate={handleNavigate}
        pendingCount={pendingSubmissions.length}
        currentUser={currentUser}
        onLogout={handleLogout}
        theme={theme}
        onThemeChange={handleThemeChange}
      />
      
      {editingSubmission && <EditSubmissionModal submission={editingSubmission} onClose={handleCloseEditModal} onSave={handleUpdateSubmission} companyNames={uniqueCompanyNames} />}
      {(editingUser || isCreatingUser) && <EditUserModal user={editingUser} isCreating={isCreatingUser} onClose={handleCloseUserModal} onSave={handleSaveUser} companyNames={uniqueCompanyNames} />}
      {rejectionTarget && <RejectionFeedbackModal submission={rejectionTarget} onClose={() => setRejectionTarget(null)} onConfirm={handleConfirmRejection} />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
        {showSuccessMessage && (
          <div className="mb-8 p-4 bg-white dark:bg-white/20 text-stone-950 dark:text-white rounded-lg text-center shadow-lg transition-colors duration-300">
            Envio recebido! Ele ficará visível no ranking após a aprovação do administrador.
          </div>
        )}
        {renderView()}
      </main>

       {currentUser?.role === UserRole.SiteAdmin && currentView === AppView.Dashboard && (
            <AdminBottomNav
                currentView={adminView}
                onNavigate={setAdminView}
                pendingCount={pendingSubmissions.length}
            />
        )}
    </div>
  );
};

export default App;