export type UserRole = 'ADMIN' | 'USER';

export interface UserProfile {
  id: string;
  email: string;
  password?: string;
  fullName: string;
  address: string;
  genre: string;
  threadsUserId: string;
  accountLink: string;
  role: UserRole;
  isApproved: boolean;
  isProfileComplete: boolean;
  createdAt: string;
  apiConfig?: ThreadsApiConfig;
  cloudSyncUrl?: string; // クラウド同期用URL
  geminiApiKey?: string; // ユーザーごとのGemini APIキー（各自で設定）
}

export interface ThreadsApiConfig {
  appId: string;
  appSecret: string;
  accessToken: string;
  userId: string;
  webhookUrl?: string;
  lastSync?: string;
}

export interface SystemAiSettings {
  systemPrompt: string;
  knowledgeBase: string;
}

export interface TopContent {
  id: string;
  content: string;
  views: number;
  link: string;
}

export interface PeriodicEntry {
  id: string;
  userId: string;
  date: string;
  followers: number;
  views7Days: number;
  interactionsTotal: number;
  likes: number;
  replies: number;
  quotes: number;
  reposts: number;
  pinnedPostViews: number;
  listCount: number;
  topContents: TopContent[];
  createdAt: string;
}

export type PostStatus = 'PENDING' | 'PUBLISHED' | 'FAILED';
export type SchedulingMode = 'LOCAL' | 'REMOTE';

export interface ScheduledPost {
  id: string;
  userId: string;
  content: string;
  scheduledAt: string;
  status: PostStatus;
  mode: SchedulingMode;
  isRepost: boolean;
  originalPostId?: string;
  createdAt: string;
  errorMessage?: string;
  publishedUrl?: string;
}

export interface AiPromptGroup {
  id: string;
  text: string;
  count: number;
}

export interface EditableGeneratedPost {
  id: string;
  content: string;
  scheduledAt: string;
}
