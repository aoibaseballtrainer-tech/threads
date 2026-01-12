import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, PeriodicEntry, ScheduledPost, SystemAiSettings } from './types';
import { SPECIAL_ADMIN_EMAIL, SPECIAL_ADMIN_PASS } from './constants';
import { extractTokenFromUrl } from './services/threadsApiService';
import Layout from './components/Layout';
import Auth from './components/Auth';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import DataEntryForm from './components/DataEntryForm';
import ApiSettings from './components/ApiSettings';
import Scheduler from './components/Scheduler';
import PostsTable from './components/PostsTable';

const App: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string>(() => localStorage.getItem('threads_server_endpoint') || '');

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('threads_current_user');
    if (saved) {
      const user = JSON.parse(saved);
      // localStorageからAPI設定を復元
      const savedConfig = localStorage.getItem(`threads_api_config_${user.id}`);
      if (savedConfig) {
        user.apiConfig = JSON.parse(savedConfig);
      }
      // geminiApiKeyは既にuserオブジェクトに含まれている（localStorageに保存されているため）
      return user;
    }
    return null;
  });

  const [operatingAsId, setOperatingAsId] = useState<string | null>(null);
  const [entries, setEntries] = useState<PeriodicEntry[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [aiSettings, setAiSettings] = useState<SystemAiSettings>({
    systemPrompt: "あなたはThreadsプロデューサーです。",
    knowledgeBase: ""
  });
  
  // ビューの状態をlocalStorageとURLハッシュから復元
  const getInitialView = (): 'dashboard' | 'entry' | 'admin' | 'settings' | 'scheduler' | 'posts_list' => {
    // URLハッシュを確認
    const hash = window.location.hash.replace('#', '');
    if (hash && ['dashboard', 'entry', 'admin', 'settings', 'scheduler', 'posts_list'].includes(hash)) {
      return hash as any;
    }
    // localStorageから復元
    const saved = localStorage.getItem('threads_current_view');
    if (saved && ['dashboard', 'entry', 'admin', 'settings', 'scheduler', 'posts_list'].includes(saved)) {
      return saved as any;
    }
    return 'dashboard';
  };

  const [view, setView] = useState<'dashboard' | 'entry' | 'admin' | 'settings' | 'scheduler' | 'posts_list'>(getInitialView);

  // ビュー変更時にlocalStorageとURLハッシュを更新
  const updateView = useCallback((newView: 'dashboard' | 'entry' | 'admin' | 'settings' | 'scheduler' | 'posts_list') => {
    setView(newView);
    localStorage.setItem('threads_current_view', newView);
    // URLハッシュを更新（履歴に追加）
    window.history.pushState({ view: newView }, '', `#${newView}`);
  }, []);

  // ブラウザの戻る/進むボタンに対応
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const hash = window.location.hash.replace('#', '');
      if (hash && ['dashboard', 'entry', 'admin', 'settings', 'scheduler', 'posts_list'].includes(hash)) {
        const newView = hash as 'dashboard' | 'entry' | 'admin' | 'settings' | 'scheduler' | 'posts_list';
        setView(newView);
        localStorage.setItem('threads_current_view', newView);
      } else {
        const saved = (localStorage.getItem('threads_current_view') || 'dashboard') as 'dashboard' | 'entry' | 'admin' | 'settings' | 'scheduler' | 'posts_list';
        setView(saved);
        window.history.replaceState({ view: saved }, '', `#${saved}`);
      }
    };

    // 初期状態をURLに反映
    const currentView = getInitialView();
    if (window.location.hash !== `#${currentView}`) {
      window.history.replaceState({ view: currentView }, '', `#${currentView}`);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- API サービス (汎用サーバー通信) ---

  const apiRequest = useCallback(async (path: string, options: any = {}) => {
    if (!serverUrl) return { error: 'Server URL not configured' };
    try {
      const res = await fetch(`${serverUrl.replace(/\/$/, '')}${path}`, {
        method: options.method || 'GET',
        headers: { 'Content-Type': 'application/json', ...options.headers },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      return await res.json();
    } catch (e) {
      console.error(`API Error [${path}]:`, e);
      return { error: 'Connection Failed' };
    }
  }, [serverUrl]);

  // 全ユーザー取得
  const fetchUsers = useCallback(async () => {
    const data = await apiRequest('/api/users');
    if (data.users) setUsers(data.users);
  }, [apiRequest]);

  // データ同期 (Push & Pull)
  const syncData = useCallback(async (user: UserProfile, customAi?: SystemAiSettings) => {
    if (!serverUrl) return;
    setIsSyncing(true);
    
    // 現在の状態をサーバーへ送信
    const payload = {
      userId: user.id,
      email: user.email,
      data: {
        profile: user,
        entries: entries.filter(e => e.userId === user.id),
        scheduledPosts: scheduledPosts.filter(p => p.userId === user.id),
        aiSettings: customAi || aiSettings
      }
    };

    const res = await apiRequest('/api/sync', { method: 'POST', body: payload });
    
    if (res.status === 'success' && res.payload) {
      // サーバー側の最新データを反映（他の端末での変更を統合）
      const p = res.payload;
      if (p.entries) setEntries(p.entries);
      if (p.scheduledPosts) setScheduledPosts(p.scheduledPosts);
      if (p.aiSettings) setAiSettings(p.aiSettings);
      setLastSyncTime(new Date().toLocaleTimeString());
    }
    setIsSyncing(false);
  }, [serverUrl, apiRequest, entries, scheduledPosts, aiSettings]);

  // 初回起動
  useEffect(() => {
    if (currentUser) {
      syncData(currentUser);
      if (currentUser.role === 'ADMIN') fetchUsers();
    }
  }, [currentUser, syncData, fetchUsers]);

  // --- 認証 ---

  const handleLogin = async (email: string, pass: string) => {
    setIsSyncing(true);
    
    // サーバーURLが設定されている場合はサーバーに問い合わせ
    if (serverUrl) {
      const res = await apiRequest('/api/login', {
        method: 'POST',
        body: { email: email.toLowerCase(), password: pass }
      });

      if (res.status === 'success' && res.user) {
        setCurrentUser(res.user);
        setOperatingAsId(res.user.id);
        localStorage.setItem('threads_current_user', JSON.stringify(res.user));
        setIsSyncing(false);
        return;
      }
    }
    
    // サーバーURLが設定されていない、またはサーバー認証が失敗した場合
    // 特別管理者アカウントのローカルログインを試す
    if (email === SPECIAL_ADMIN_EMAIL && pass === SPECIAL_ADMIN_PASS) {
      const adminUser: UserProfile = { 
        id: 'admin-aoi', 
        email: SPECIAL_ADMIN_EMAIL, 
        password: SPECIAL_ADMIN_PASS, 
        fullName: '小川 葵', 
        address: '未設定',
        genre: '管理',
        threadsUserId: 'aoi_admin',
        accountLink: 'https://threads.net/@aoi_admin',
        role: 'ADMIN', 
        isApproved: true, 
        isProfileComplete: true,
        createdAt: new Date().toISOString() 
      };
      setCurrentUser(adminUser);
      setOperatingAsId(adminUser.id);
      localStorage.setItem('threads_current_user', JSON.stringify(adminUser));
    } else {
      alert('認証に失敗しました。\nサーバーURLが設定されていない場合は、特別管理者アカウントのみログイン可能です。\n\nサーバーURLを設定するには、ログイン後に「個人設定」から設定してください。');
    }
    setIsSyncing(false);
  };

  const handleRegister = async (data: any) => {
    if (!serverUrl) {
      alert("サーバーURLが設定されていません。\n\n新規登録にはサーバーURLの設定が必要です。\n「個人設定」からサーバーURLを設定してから再度お試しください。");
      return;
    }
    setIsSyncing(true);
    const res = await apiRequest('/api/register', { method: 'POST', body: data });
    if (res.status === 'success') {
      alert('登録完了。ログインしてください。');
      updateView('dashboard');
    } else {
      alert('登録エラー: ' + (res.message || 'サーバーエラー'));
    }
    setIsSyncing(false);
  };

  // --- 描画 ---

  if (!currentUser) {
    return <Auth onLogin={handleLogin} onRegister={handleRegister} onImportProfile={() => {}} />;
  }

  const effectiveOpId = operatingAsId || currentUser.id;
  const targetUser = users.find(u => u.id === effectiveOpId) || currentUser;

  const renderContent = () => {
    switch (view) {
      case 'settings':
        return (
          <ApiSettings 
            config={targetUser.apiConfig} 
            currentUser={targetUser} 
            allAppData={{ users, entries, scheduledPosts, aiSettings }} 
            onUpdate={(c) => {
              const updatedUsers = users.map(u => u.id === targetUser.id ? { ...u, apiConfig: c } : u);
              setUsers(updatedUsers);
              // localStorageに保存（更新時に消えないように）
              const updatedUser = updatedUsers.find(u => u.id === targetUser.id);
              if (updatedUser) {
                localStorage.setItem(`threads_api_config_${targetUser.id}`, JSON.stringify(c));
              }
              // サーバーにも同期
              if (targetUser.id === currentUser.id) {
                syncData({...targetUser, apiConfig: c});
              }
            }}
            onUpdateSyncUrl={() => {}} 
            onChangePassword={(p) => syncData({...targetUser, password: p})}
            onImportData={(d) => { setEntries([...entries, ...d.entries]); setScheduledPosts([...scheduledPosts, ...d.scheduledPosts]); }}
          />
        );
      case 'scheduler':
        return (
          <Scheduler 
            posts={scheduledPosts.filter(p => p.userId === targetUser.id)} 
            onAddPosts={(newPosts) => {
              const added = newPosts.map((p, i) => ({...p, id: `p-${Date.now()}-${i}`, userId: targetUser.id, status: 'PENDING', mode: 'LOCAL', createdAt: new Date().toISOString()})) as ScheduledPost[];
              setScheduledPosts(prev => [...prev, ...added]);
              syncData(targetUser);
            }} 
            onUpdatePost={(id, upd) => setScheduledPosts(scheduledPosts.map(p => p.id === id ? {...p, ...upd} : p))} 
            onDeletePost={(id) => { setScheduledPosts(scheduledPosts.filter(p => p.id !== id)); syncData(targetUser); }} 
            onBulkDelete={(ids) => { setScheduledPosts(scheduledPosts.filter(p => !ids.includes(p.id))); syncData(targetUser); }} 
            pastEntries={entries.filter(e => e.userId === targetUser.id)} 
            systemAiSettings={aiSettings} 
            userProfile={targetUser} 
          />
        );
      case 'posts_list':
        return (
          <PostsTable 
            scheduledPosts={scheduledPosts.filter(p => p.userId === targetUser.id)} 
            users={users} 
            historicalEntries={entries.filter(e => e.userId === targetUser.id)} 
            onUpdatePost={(id, upd) => setScheduledPosts(scheduledPosts.map(p => p.id === id ? {...p, ...upd} : p))} 
            onDeletePost={(id) => { setScheduledPosts(scheduledPosts.filter(p => p.id !== id)); syncData(targetUser); }} 
            onBulkDelete={(ids) => { setScheduledPosts(scheduledPosts.filter(p => !ids.includes(p.id))); syncData(targetUser); }} 
          />
        );
      case 'entry':
        return (
          <DataEntryForm 
            onSubmit={(d) => {
              const newEntry = {...d, id: `e-${Date.now()}`, userId: targetUser.id, createdAt: new Date().toISOString()};
              setEntries(prev => [...prev, newEntry]);
              syncData(targetUser);
              alert('サーバーへ同期しました。');
            }} 
          />
        );
      case 'admin':
        return (
          <AdminDashboard 
            users={users} 
            entries={entries} 
            aiSettings={aiSettings} 
            onUpdateAiSettings={(s) => { setAiSettings(s); syncData(currentUser, s); }} 
            onApprove={() => fetchUsers()} 
            onCreateUser={async (e, p) => {
              await apiRequest('/api/register', { method: 'POST', body: { email: e, password: p, fullName: '新規ユーザー', role: 'USER' } });
              fetchUsers();
            }} 
            onUpdateUserRole={() => {}} 
            onViewUserDetails={(id) => { setOperatingAsId(id); updateView('dashboard'); }} 
            serverUrl={serverUrl}
            onUpdateServerUrl={(url) => { 
              setServerUrl(url); 
              localStorage.setItem('threads_server_endpoint', url);
            }}
          />
        );
      default:
        return (
          <UserDashboard 
            user={currentUser} 
            operatingAs={targetUser} 
            users={users} 
            entries={entries} 
            isSyncing={isSyncing} 
            onSwitchUser={(id) => setOperatingAsId(id)} 
          />
        );
    }
  };

  return (
    <Layout 
      user={currentUser} 
      operatingAs={targetUser}
      onResetOperation={() => setOperatingAsId(currentUser.id)}
      onLogout={() => { setCurrentUser(null); localStorage.removeItem('threads_current_user'); }} 
      onNavigate={(v: any) => updateView(v)} 
      isProcessingPosts={false}
    >
      <div className="mb-4 flex justify-between items-center">
        {!serverUrl && <div className="text-[10px] font-black text-rose-600 bg-rose-50 px-4 py-2 rounded-xl animate-pulse">ENDPOINT NOT SET</div>}
        <div className={`ml-auto flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isSyncing ? 'bg-indigo-100 text-indigo-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'}`}>
          <i className={`fas ${isSyncing ? 'fa-sync-alt fa-spin' : 'fa-cloud'}`}></i>
          {isSyncing ? 'Syncing...' : `Online: ${lastSyncTime || 'Stable'}`}
        </div>
      </div>
      {renderContent()}
    </Layout>
  );
};

export default App;
