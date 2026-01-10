import React, { useState } from 'react';
import { GENRES } from '../constants';
import { UserProfile } from '../types';

interface ProfileCompletionProps {
  onComplete: (data: Partial<UserProfile>) => void;
  email: string;
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ onComplete, email }) => {
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [genre, setGenre] = useState('');
  const [threadsUserId, setThreadsUserId] = useState('');
  const [accountLink, setAccountLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ fullName, address, genre, threadsUserId, accountLink });
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="p-14 text-center bg-gray-50 border-b relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center text-3xl mx-auto mb-8 shadow-xl shadow-indigo-200">
            <i className="fas fa-folder-open"></i>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">あなた専用の分析フォルダを作成</h2>
          <p className="text-gray-500 mt-4 leading-relaxed font-medium">
            {email} 様の活動を正確に記録・分析するために、<br/>
            初回のみ基本情報を入力してください。
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-14 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 ml-2">お名前 (フルネーム)</label>
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full rounded-2xl border-gray-200 bg-gray-50 p-5 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-bold" placeholder="例: 佐藤 健太" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 ml-2">活動ジャンル</label>
              <select required value={genre} onChange={e => setGenre(e.target.value)} className="w-full rounded-2xl border-gray-200 bg-gray-50 p-5 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-bold">
                <option value="">選択してください</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 ml-2">Threads ID</label>
              <input type="text" required value={threadsUserId} onChange={e => setThreadsUserId(e.target.value)} className="w-full rounded-2xl border-gray-200 bg-gray-50 p-5 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-bold" placeholder="ユーザーID (@不要)" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 ml-2">アカウントURL</label>
              <input type="url" required value={accountLink} onChange={e => setAccountLink(e.target.value)} className="w-full rounded-2xl border-gray-200 bg-gray-50 p-5 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all font-bold" placeholder="https://threads.net/@..." />
            </div>
          </div>
          
          <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all">
            設定を完了してダッシュボードを開く
          </button>
          <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">
            Secure Setup Protocol Active
          </p>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletion;
