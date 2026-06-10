export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string; // 'remote' | 'hybrid' | 'onsite'
  matchScore: number;
  matchExplanation: string;
  adjustmentsNeeded: string[];
  description: string;
  salaryRange?: string;
  link?: string;
  postedTime?: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  description: string[];
}

export interface ResumeState {
  name: string;
  currentTitle: string;
  currentCompany: string;
  email: string;
  skills: string[];
  experience: ExperienceItem[];
  about?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isSystemStatus?: boolean;
  attachmentName?: string;
}

export interface CritiqueReport {
  overallScore: number;
  strengths: string[];
  gaps: string[];
  actionItems: string[];
}

export interface MockInterviewState {
  active: boolean;
  currentIndex: number;
  questions: string[];
  answers: string[];
  feedbacks: string[];
  completed: boolean;
}
