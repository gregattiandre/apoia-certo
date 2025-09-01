export enum SubmissionStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export enum UserRole {
  SiteAdmin = 'SiteAdmin',
  CompanyAdmin = 'CompanyAdmin',
  User = 'User',
}

export interface User {
  email: string;
  passwordHash: string;
  role: UserRole;
  fullName: string;
  birthDate: string; // YYYY-MM-DD
  companyName?: string;
}

export interface ProjectDelay {
  id: string;
  companyName: string;
  projectName: string;
  crowdfundingLink: string;
  promisedDate: string; // YYYY-MM-DD
  actualDate?: string; // YYYY-MM-DD, optional
  status: SubmissionStatus;
  rating: number;
  comment?: string;
  submitterEmail: string;
  companyReply?: string;
  userRebuttal?: string;
  rejectionReason?: string;
  wouldBuyAgain?: boolean;
}

export interface Company {
  name: string;
}

export interface AnalysisResult {
  text: string;
  isError: boolean;
}

export interface CompanyReputation {
  name: string;
  projects: ProjectDelay[];
  averageDelayDays: number;
  delayedProjectsCount: number;
  averageRating: number;
  aiAnalysis?: AnalysisResult;
  isAiAnalysisLoading?: boolean;
}

export enum AppView {
  Public = 'Public',
  Submit = 'Submit',
  Dashboard = 'Dashboard',
  Login = 'Login',
  Register = 'Register',
  CompanyDetail = 'CompanyDetail',
  ProjectDetail = 'ProjectDetail',
}

export enum AdminView {
    Pending = 'Pending',
    Duplicates = 'Duplicates',
    Submissions = 'Submissions',
    Users = 'Users',
    Settings = 'Settings',
    MyAccount = 'MyAccount',
}