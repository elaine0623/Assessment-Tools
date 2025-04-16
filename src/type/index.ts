export interface DailyRecordEntry {
  date: string; // YYYY-MM-DD格式
  content: string;
}

export interface UserInput {
  userName: string;
  dailyRecords: { [date: string]: DailyRecordEntry };
  
  apiConnection: {
    platform: 'jira' | 'trello' | '';
    apiKey: string;
    token: string;
    connected: boolean;
    data?: any;
  };
  
  fileUpload: {
    file: File | null;
    uploaded: boolean;
    parsed: boolean;
    data?: any;
  };
}

export interface GeneratedReport {
  id: string;
  timestamp: string;
  content: string;
  source: {
    dailyRecord: boolean;
    apiPlatform: string | null;
    fileUploaded: boolean;
  };
  status: 'draft' | 'final';
}

export interface AppState {
  currentTab: 'daily' | 'api' | 'file';
  userInput: UserInput;
  isGenerating: boolean;
  generatedReports: GeneratedReport[];
  currentReport: GeneratedReport | null;
  error: string | null;
}

export type TabType = 'daily' | 'api' | 'file';

// Trello 相關類型定義
export interface TrelloUser {
  id: string;
  username: string;
  fullName: string;
}

export interface TrelloCard {
  id: string;
  name: string;
  description: string;
  url: string;
  assignedToMe: boolean;
  completed: boolean;
  dueDate: string | null;
  listName: string;
}

export interface TrelloList {
  id: string;
  name: string;
  cards: TrelloCard[];
}

export interface TrelloBoard {
  id: string;
  name: string;
  url: string;
  lists: TrelloList[];
}

export interface TrelloData {
  user: TrelloUser;
  boards: TrelloBoard[];
  cards: TrelloCard[]; // 使用者負責的卡片
}

// Jira 相關類型定義
export interface JiraUser {
  id: string;
  username: string;
  displayName: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  description: string;
  status: string;
  created: string;
  updated: string;
  projectKey: string;
  projectName: string;
  assignedToMe: boolean;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  issues: JiraIssue[];
}

export interface JiraData {
  user: JiraUser;
  projects: JiraProject[];
  issues: JiraIssue[]; // 使用者負責的問題
}