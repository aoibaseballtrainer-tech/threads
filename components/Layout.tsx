import React from 'react';
import { UserProfile } from '../types';
import { SPECIAL_ADMIN_EMAIL } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile | null;
  operatingAs?: UserProfile | null;
  onResetOperation?: () => void;
  onLogout: () => void;
  onNavigate: (view: 'dashboard' | 'entry' | 'admin' | 'settings' | 'scheduler' | 'posts_list') => void;
  isProcessingPosts?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  operatingAs, 
  onResetOperation, 
  onLogout, 
  onNavigate 
}) => {
  const isSupreme = user?.email === SPECIAL_ADMIN_EMAIL;
  const isImpersonating = user && operatingAs && user.id !== operatingAs.id;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className={`w-full md:w-72 bg-gray-900 text-white flex-shrink-0 flex flex-col transition-all duration-700 ${isSupreme ? 'border-r-4 border-amber-500/30' : ''}`}>
        <div className={`p-8 ${isSupreme ? 'bg-gradient-to-b from-amber-600/20 to-transparent' : ''}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg ${isSupreme ? 'bg-amber-500 text-white animate-pulse' : 'bg-indigo-600 text-white'}`}>
              <i className="fab fa-threads"></i>
            </div>
            <div>
              <h1 className={`text-lg font-black tracking-tighter ${isSupreme ? 'text-amber-400' : 'text-white'}`}>
                THREADS <br />ANALYSIS
              </h1>
            </div>
          </div>
        </div>

        <nav className="mt-4 px-4 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
          {user && (
            <>
              <div className="text-[10px] font-black text-gray-600 uppercase px-4 mb-2 tracking-[0.2em]">フォルダ操作</div>
              <button onClick={() => onNavigate('dashboard')} className="w-full flex items-center gap-4 px-4 py-3.5 text-sm font-bold rounded-2xl hover:bg-gray-800 transition-all group">
                <i className="fas fa-chart-pie w-5 text-gray-500 group-hover:text-indigo-400"></i>
                ダッシュボード
              </button>
              <button onClick={() => onNavigate('posts_list')} className="w-full flex items-center gap-4 px-4 py-3.5 text-sm font-bold rounded-2xl hover:bg-gray-800 transition-all group">
                <i className="fas fa-layer-group w-5 text-gray-500 group-hover:text-indigo-400"></i>
                投稿管理
              </button>
              <button onClick={() => onNavigate('entry')} className="w-full flex items-center gap-4 px-4 py-3.5 text-sm font-bold rounded-2xl hover:bg-gray-800 transition-all group">
                <i className="fas fa-plus-square w-5 text-gray-500 group-hover:text-indigo-400"></i>
                データ登録
              </button>

              <div className="text-[10px] font-black text-gray-600 uppercase px-4 mt-8 mb-2 tracking-[0.2em]">自動化・設定</div>
              <button onClick={() => onNavigate('scheduler')} className="w-full flex items-center gap-4 px-4 py-3.5 text-sm font-bold rounded-2xl hover:bg-gray-800 transition-all group">
                <i className="fas fa-magic w-5 text-gray-500 group-hover:text-indigo-400"></i>
                AIスケジューラー
              </button>
              <button onClick={() => onNavigate('settings')} className="w-full flex items-center gap-4 px-4 py-3.5 text-sm font-bold rounded-2xl hover:bg-gray-800 transition-all group">
                <i className="fas fa-sliders w-5 text-gray-500 group-hover:text-indigo-400"></i>
                個人設定
              </button>
              
              {user.role === 'ADMIN' && (
                <>
                  <div className="text-[10px] font-black text-gray-600 uppercase px-4 mt-8 mb-2 tracking-[0.2em]">管理者権限</div>
                  <button 
                    onClick={() => onNavigate('admin')}
                    className={`w-full flex items-center gap-4 px-4 py-4 text-sm font-black rounded-2xl border transition-all ${isSupreme ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-indigo-600/10 border-indigo-600/20 text-indigo-400'}`}
                  >
                    <i className={`fas ${isSupreme ? 'fa-crown' : 'fa-user-shield'} w-5`}></i>
                    管理者ダッシュボード
                  </button>
                </>
              )}
            </>
          )}
        </nav>

        <div className="p-6 border-t border-gray-800/50 mt-auto bg-gray-900/50">
          {user && (
            <div className="flex items-center gap-3 px-2 py-3 mb-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shadow-lg ${isSupreme ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' : 'bg-indigo-600 text-white'}`}>
                {user.fullName ? user.fullName.charAt(0) : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-black truncate ${isSupreme ? 'text-amber-500' : 'text-white'}`}>{user.fullName}</p>
                <p className="text-[10px] text-gray-500 truncate font-mono">ACCESS: {user.role}</p>
              </div>
            </div>
          )}
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 text-xs font-black text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
          >
            <i className="fas fa-power-off w-5"></i>
            ログアウト
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 overflow-y-auto custom-scrollbar flex flex-col">
        {isImpersonating && operatingAs && (
          <div className="bg-amber-500 text-white px-8 py-3 flex justify-between items-center sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <i className="fas fa-user-secret text-lg"></i>
              <span className="text-sm font-black uppercase tracking-widest">
                操作中: {operatingAs.fullName} (@{operatingAs.threadsUserId})
              </span>
            </div>
            <button 
              onClick={onResetOperation} 
              className="bg-white text-amber-600 px-6 py-1.5 rounded-full text-xs font-black shadow-lg hover:bg-gray-100 transition-all"
            >
              管理者モードに戻る
            </button>
          </div>
        )}
        <div className="p-6 md:p-12 max-w-[1400px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
