import { UserProfile, PeriodicEntry } from './types';

export const ADMIN_EMAIL = 'admin@example.com';
export const SPECIAL_ADMIN_EMAIL = 'aoi.baseball.trainer@gmail.com';
export const SPECIAL_ADMIN_PASS = 'aoi19980525';

export const GENRES = [
  'ビジネス・起業',
  'テック・ガジェット',
  'ライフスタイル・暮らし',
  '美容・ファッション',
  '教育・学習',
  'エンタメ・趣味',
  'グルメ・料理',
  '金融・投資',
  'その他'
];

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'admin-1',
    email: 'admin@example.com',
    fullName: 'システム管理者',
    address: '東京都港区',
    genre: '管理',
    threadsUserId: 'admin_threads',
    accountLink: 'https://threads.net/@admin_threads',
    role: 'ADMIN',
    isApproved: true,
    // Fix: Added missing isProfileComplete property
    isProfileComplete: true,
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'admin-aoi',
    email: SPECIAL_ADMIN_EMAIL,
    fullName: 'AOI 管理者',
    address: '未設定',
    genre: '管理',
    threadsUserId: 'aoi_admin',
    accountLink: 'https://threads.net/@aoi_admin',
    role: 'ADMIN',
    isApproved: true,
    // Fix: Added missing isProfileComplete property
    isProfileComplete: true,
    createdAt: '2024-05-20T00:00:00Z',
  },
  {
    id: 'user-1',
    email: 'user1@example.com',
    fullName: '佐藤 健太',
    address: '大阪府大阪市',
    genre: 'テック・ガジェット',
    threadsUserId: 'kenta_tech',
    accountLink: 'https://threads.net/@kenta_tech',
    role: 'USER',
    isApproved: true,
    // Fix: Added missing isProfileComplete property
    isProfileComplete: true,
    createdAt: '2023-10-01T00:00:00Z',
  }
];

export const MOCK_ENTRIES: PeriodicEntry[] = [
  {
    id: 'e1',
    userId: 'user-1',
    date: '2024-05-01',
    followers: 1200,
    views7Days: 5000,
    interactionsTotal: 450,
    likes: 300,
    replies: 80,
    quotes: 20,
    reposts: 50,
    pinnedPostViews: 1200,
    listCount: 5,
    topContents: [
      { id: 't1', content: '最新のReactについての考察', views: 1500, link: 'https://threads.net/p/1' }
    ],
    createdAt: '2024-05-01T10:00:00Z',
  },
  {
    id: 'e2',
    userId: 'user-1',
    date: '2024-05-08',
    followers: 1250,
    views7Days: 5500,
    interactionsTotal: 480,
    likes: 320,
    replies: 90,
    quotes: 25,
    reposts: 45,
    pinnedPostViews: 1300,
    listCount: 6,
    topContents: [
      { id: 't2', content: 'Gemini APIの活用法', views: 2000, link: 'https://threads.net/p/2' }
    ],
    createdAt: '2024-05-08T10:00:00Z',
  }
];
