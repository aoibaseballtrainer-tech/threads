import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, PeriodicEntry, SystemAiSettings, UserRole } from '../types';
import { SPECIAL_ADMIN_EMAIL } from '../constants';

interface AdminDashboardProps {
  users: UserProfile[];
  entries: PeriodicEntry[];
  aiSettings: SystemAiSettings;
  onUpdateAiSettings: (settings: SystemAiSettings) => void;
  onApprove: (userId: string) => void;
  onCreateUser: (email: string, pass: string) => void;
  onUpdateUserRole: (userId: string, role: UserRole) => void;
  onViewUserDetails: (userId: string) => void;
  onImportRequest?: (data: any) => void;
  serverUrl?: string;
  onUpdateServerUrl?: (url: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, entries, aiSettings, onUpdateAiSettings, onApprove, onCreateUser, onUpdateUserRole, onViewUserDetails, onImportRequest, serverUrl = '', onUpdateServerUrl }) => {
  const [activeTab, setActiveTab] = useState<'folders' | 'issue' | 'global_ai' | 'server'>('folders');
  const [urlInput, setUrlInput] = useState(serverUrl);
  const [showServerDoc, setShowServerDoc] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  
  const [localAiSettings, setLocalAiSettings] = useState(aiSettings);
  useEffect(() => {
    setLocalAiSettings(aiSettings);
  }, [aiSettings]);

  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic">ADMIN DIRECTORY</h2>
          <p className="text-gray-500 font-bold text-xs mt-1 uppercase tracking-widest opacity-60">Multi-User Folder Management</p>
        </div>
      </div>

      <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit gap-1 shadow-inner border border-gray-200/50">
        {[
          { id: 'folders', icon: 'fa-folder-tree', label: 'ユーザーフォルダ' },
          { id: 'issue', icon: 'fa-id-card', label: 'アカウント発行' },
          { id: 'global_ai', icon: 'fa-brain', label: '共通AI設定' },
          { id: 'server', icon: 'fa-network-wired', label: 'サーバー設定' },
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${activeTab === tab.id ? 'bg-white shadow-lg text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <i className={`fas ${tab.icon} mr-2`}></i> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'folders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {users.map(user => {
            const isSupreme = user.email === SPECIAL_ADMIN_EMAIL;
            const userEntries = entries.filter(e => e.userId === user.id);
            return (
              <div key={user.id} className={`bg-white border rounded-[3rem] p-8 hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col ${isSupreme ? 'ring-4 ring-amber-400 border-amber-500' : ''}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner ${isSupreme ? 'bg-amber-100 text-amber-600' : 'bg-gray-50 text-gray-400'}`}>
                    <i className="fas fa-folder"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-black text-gray-900 truncate">{user.fullName || 'No Name'}</h4>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">@{user.threadsUserId || 'ID未設定'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-[9px] font-black text-gray-400 uppercase">Records</p>
                    <p className="text-lg font-black">{userEntries.length}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-[9px] font-black text-gray-400 uppercase">Role</p>
                    <p className="text-lg font-black text-[10px] uppercase">{user.role}</p>
                  </div>
                </div>

                <div className="mt-auto space-y-3">
                   <button 
                    onClick={() => onViewUserDetails(user.id)}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg"
                   >
                     <i className="fas fa-folder-open"></i> フォルダを開く
                   </button>
                   
                   <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="text-[9px] font-black text-gray-400 uppercase">Pass:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-600">{showPasswords[user.id] ? user.password : '••••••••'}</span>
                      <button onClick={() => setShowPasswords(prev => ({...prev, [user.id]: !prev[user.id]}))} className="text-indigo-400">
                        <i className={`fas ${showPasswords[user.id] ? 'fa-eye-slash' : 'fa-eye'} text-[10px]`}></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'issue' && (
         <div className="bg-white rounded-[3rem] border shadow-xl p-12 max-w-2xl">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 italic">
              <i className="fas fa-id-card text-indigo-600"></i> ISSUE NEW ACCOUNT
            </h3>
            <form onSubmit={e => { e.preventDefault(); onCreateUser(newUserEmail, newUserPass); setNewUserEmail(''); setNewUserPass(''); alert('サーバーにアカウントを作成しました。'); }} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1.5 ml-1">Email (Login ID)</label>
                <input type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full rounded-2xl border-gray-100 bg-gray-50 p-6 text-sm font-bold focus:bg-white outline-none transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1.5 ml-1">Password</label>
                <input type="text" required value={newUserPass} onChange={e => setNewUserPass(e.target.value)} className="w-full rounded-2xl border-gray-100 bg-gray-50 p-6 text-sm font-bold focus:bg-white outline-none transition-all" />
              </div>
              <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all">即時発行 (サーバーへ書き込み)</button>
            </form>
         </div>
      )}
      
      {activeTab === 'global_ai' && (
        <div className="bg-white rounded-[3rem] border shadow-xl p-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black italic">GLOBAL AI ARCHITECTURE</h3>
            <button onClick={() => onUpdateAiSettings(localAiSettings)} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all">
              保存 & 同期
            </button>
          </div>
          <div className="space-y-8">
            <div>
              <label className="text-[10px] font-black text-indigo-500 uppercase block mb-3 ml-1">System Prompt</label>
              <textarea value={localAiSettings.systemPrompt} onChange={e => setLocalAiSettings({...localAiSettings, systemPrompt: e.target.value})} className="w-full bg-gray-50 border-gray-100 rounded-3xl p-8 text-sm font-bold min-h-[200px] focus:bg-white outline-none transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-black text-indigo-500 uppercase block mb-3 ml-1">Master Knowledge Base</label>
              <textarea value={localAiSettings.knowledgeBase} onChange={e => setLocalAiSettings({...localAiSettings, knowledgeBase: e.target.value})} className="w-full bg-gray-50 border-gray-100 rounded-3xl p-8 text-sm font-bold min-h-[300px] focus:bg-white outline-none transition-all" placeholder="ナレッジをここに集約..." />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'server' && (
        <div className="bg-white rounded-[3rem] border-4 border-gray-900 shadow-2xl overflow-hidden">
          <div className="p-10 bg-gray-900 text-white flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black">サーバーエンドポイント設定</h3>
              <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-widest">Master Database Connector</p>
            </div>
            <i className="fas fa-network-wired text-4xl opacity-50"></i>
          </div>
          <div className="p-10 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase block ml-1 tracking-widest">サーバー URL</label>
              <div className="flex gap-4">
                <input 
                  type="url" 
                  value={urlInput} 
                  onChange={e => setUrlInput(e.target.value)} 
                  placeholder="https://your-server-api.com" 
                  className="flex-1 rounded-2xl border-2 border-gray-100 bg-gray-50 p-6 font-mono text-sm focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner" 
                />
                <button 
                  onClick={() => { 
                    if (onUpdateServerUrl) {
                      onUpdateServerUrl(urlInput);
                      alert('エンドポイントを更新しました。');
                    }
                  }} 
                  className="px-12 py-6 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  接続
                </button>
              </div>
              <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-4">
                <i className="fas fa-info-circle text-indigo-500 mt-1"></i>
                <p className="text-xs text-indigo-800 font-bold leading-relaxed">
                  自前のサーバーや Supabase 等の API エンドポイントを指定してください。全ユーザーのフォルダデータがここに保存されます。
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <button onClick={() => setShowServerDoc(!showServerDoc)} className="text-xs font-black text-indigo-600 hover:underline flex items-center gap-2">
                <i className="fas fa-book"></i> サーバーサイド API の仕様を確認する
              </button>
              {showServerDoc && (
                <div className="mt-6 p-8 bg-gray-50 rounded-3xl text-[11px] text-gray-600 font-mono space-y-4 border border-gray-200 animate-in slide-in-from-top-4">
                  <h4 className="font-black text-gray-900">Required Endpoints (REST JSON)</h4>
                  <ul className="list-disc ml-4 space-y-2">
                    <li><span className="font-black text-indigo-600">POST /api/login</span>: {`{ email, password } -> { status, user, payload }`}</li>
                    <li><span className="font-black text-indigo-600">POST /api/register</span>: {`{ email, password, fullName... } -> { status }`}</li>
                    <li><span className="font-black text-indigo-600">POST /api/sync</span>: {`{ userId, data } -> { status, payload }`}</li>
                    <li><span className="font-black text-indigo-600">GET /api/users</span>: {`() -> { users: [] }`}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
