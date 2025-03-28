export type ReviewState = 
  | 'APPROVED' 
  | 'CHANGES_REQUESTED' 
  | 'NEEDS_REVIEW' 
  | 'DRAFT'
  | 'UNKNOWN';

export interface Review {
  id: string;
  state: string;
  user: {
    login: string;
    avatar_url: string;
  };
  submitted_at: string;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  html_url: string;
  state: string;
  draft: boolean;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
  repository: {
    name: string;
    full_name: string;
    html_url: string;
  };
  requested_reviewers?: {
    login: string;
    avatar_url: string;
  }[];
  reviewDecision?: string;
  reviews?: Review[];
  status?: ReviewState;
  stale?: boolean;
  userIsRequestedReviewer?: boolean;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description?: string;
  stars?: number;
  forks?: number;
  updated_at?: string;
  owner: {
    login: string;
    avatar_url: string;
  }
}

export interface AppConfig {
  organizationName: string;
  repositories: Repository[];
  showDrafts: boolean;
  staleThresholdDays: number;
}

export interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
}

export interface AppConfigContextType {
  config: AppConfig | null;
  setConfig: (config: AppConfig) => void;
  saveConfig: (config: AppConfig) => void;
}