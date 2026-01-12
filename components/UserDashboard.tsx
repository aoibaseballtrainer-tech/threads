import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, PeriodicEntry } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyzeGrowth } from '../services/geminiService';

interface UserDashboardProps {
  user: UserProfile; // ログインしている本人（管理者）
  operatingAs: UserProfile; // 現在操作対象にしているユーザー
  users: UserProfile[]; // 全ユーザー
  entries: PeriodicEntry[];
  isSyncing?: boolean;
  onSwitchUser: (userId: string) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, operatingAs, users, entries, isSyncing, onSwitchUser }) => {
  const isAdmin = user.role === 'ADMIN';
  const [aiInsight, setAiInsight] = useState<string>('分析中...');
  const [selectedEntry, setSelectedEntry] = useState<PeriodicEntry | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'history'>('overview');
  
  // 対象ユーザーのデータのみに絞り込み
  const userEntries = useMemo(() => entries.filter(e => e.userId === operatingAs.id), [entries, operatingAs.id]);
  const sortedEntries = useMemo(() => [...userEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [userEntries]);
  const latestEntry = sortedEntries[sortedEntries.length - 1];

  useEffect(() => {
    const fetchInsight = async () => {
      if (userEntries.length > 0) {
        // ユーザーのGemini APIキーを使用
        const insight = await analyzeGrowth(sortedEntries, operatingAs, operatingAs.geminiApiKey);
        setAiInsight(insight);
      } else {
        setAiInsight('データがまだありません。');
      }
    };
    fetchInsight();
  }, [userEntries, operatingAs, sortedEntries]);

  if (userEntries.length === 0) {
    return (
      <div className="space-y-6">
        {isAdmin && (
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-amber-800 uppercase tracking-widest">操作対象の切り替え</p>
              <p className="text-xs text-amber-600 mt-1">管理者は全ユーザーのフォルダを直接操作できます。</p>
            </div>
            <select value={operatingAs.id} onChange={e => onSwitchUser(e.target.value)} className="bg-white border-amber-200 rounded-xl px-4 py-3 text-sm font-black shadow-sm">
              {users.map(u => <option key={u.id} value={u.id}>{u.fullName || u.email}</option>)}
            </select>
          </div>
        )}
        <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-300">
          <i className="fas fa-folder-open text-4xl text-gray-200 mb-4"></i>
          <h2 className="text-xl font-bold text-gray-400">データが登録されていません</h2>
          <p className="text-gray-400 mt-2">@{operatingAs.threadsUserId || 'このユーザー'} はまだ計測データを登録していません。</p>
        </div>
      </div>
    );
  }

  const activeEntry = selectedEntry || latestEntry;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-gray-900">{operatingAs.fullName}</h2>
            {isSyncing && <span className="text-[10px] bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full font-black animate-pulse tracking-widest">LIVE SYNC</span>}
          </div>
          <p className="text-gray-500 text-sm font-bold mt-1">フォルダ: {operatingAs.genre} / @{operatingAs.threadsUserId}</p>
        </div>
        
        <div className="flex items-center gap-4">
          {isAdmin && (
            <select value={operatingAs.id} onChange={e => onSwitchUser(e.target.value)} className="bg-white border rounded-xl px-4 py-3 text-sm font-black shadow-sm focus:ring-4 focus:ring-indigo-50">
              {users.map(u => <option key={u.id} value={u.id}>{u.fullName || u.email}</option>)}
            </select>
          )}
          <div className="flex bg-gray-200 p-1.5 rounded-2xl shadow-inner">
            <button onClick={() => setViewMode('overview')} className={`px-6 py-2 text-xs font-black rounded-xl transition-all ${viewMode === 'overview' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>概要</button>
            <button onClick={() => setViewMode('history')} className={`px-6 py-2 text-xs font-black rounded-xl transition-all ${viewMode === 'history' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>履歴</button>
          </div>
        </div>
      </div>

      {viewMode === 'overview' ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { label: 'フォロワー', value: latestEntry.followers, icon: 'fa-users', color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: '7日総閲覧', value: latestEntry.views7Days, icon: 'fa-eye', color: 'text-sky-600', bg: 'bg-sky-50' },
              { label: 'いいね', value: latestEntry.likes, icon: 'fa-heart', color: 'text-rose-600', bg: 'bg-rose-50' },
              { label: '返信', value: latestEntry.replies, icon: 'fa-reply', color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: '再投稿', value: latestEntry.reposts, icon: 'fa-retweet', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            ].map((item, idx) => (
              <div key={idx} className={`${item.bg} p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-xl transition-all`}>
                <div className="flex items-center gap-2 mb-2 opacity-60">
                  <i className={`fas ${item.icon} ${item.color} text-xs`}></i>
                  <p className="text-[10px] font-black uppercase tracking-widest">{item.label}</p>
                </div>
                <p className="text-2xl font-black text-gray-900">{item.value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border shadow-sm">
              <h3 className="font-black mb-8 text-gray-400 text-[10px] uppercase tracking-[0.2em]">Follower Growth</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sortedEntries}>
                    <defs>
                      <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                    <Area type="monotone" dataKey="followers" stroke="#6366f1" fillOpacity={1} fill="url(#colorFollowers)" strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col relative overflow-hidden">
              <h3 className="font-black mb-6 flex items-center gap-3 text-indigo-400 tracking-widest text-xs">
                <i className="fas fa-microchip"></i> AI ANALYSIS
              </h3>
              <div className="text-sm leading-relaxed font-medium opacity-90 flex-1 italic">
                {aiInsight.includes('APIキー') || aiInsight.includes('設定') ? (
                  <div className="space-y-3">
                    <p className="text-amber-400 font-bold">⚠️ {aiInsight}</p>
                    <p className="text-xs text-gray-400 pt-3 border-t border-gray-700">
                      AI分析を使用する場合は、設定画面でGemini APIキーを入力してください。
                      <br />
                      APIキーは<a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Google AI Studio</a>で無料で取得できます。
                    </p>
                    <p className="text-xs text-gray-500 pt-2">
                      💡 AI分析がなくても、データの登録・管理・投稿予約などの基本機能はすべて使用できます。
                    </p>
                  </div>
                ) : (
                  `"${aiInsight}"`
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-3">
            <h3 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-[0.2em] ml-2">History Records</h3>
            <div className="max-h-[600px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {[...sortedEntries].reverse().map(entry => (
                <button key={entry.id} onClick={() => setSelectedEntry(entry)} className={`w-full text-left px-6 py-5 rounded-2xl font-black transition-all ${activeEntry.id === entry.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 -translate-y-1' : 'bg-white border hover:bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{entry.date}</span>
                    <span className="text-[10px] opacity-60">{entry.followers.toLocaleString()} F</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-3 bg-white p-10 rounded-[3rem] border shadow-sm min-h-[500px] flex items-center justify-center text-gray-300 italic font-black">
             {/* 詳細表示エリア（今回は簡略化） */}
             SNAPSHOT DETAIL VIEW: {activeEntry.date}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
