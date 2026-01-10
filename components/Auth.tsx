import React, { useState } from 'react';
import { GENRES, SPECIAL_ADMIN_EMAIL, SPECIAL_ADMIN_PASS } from '../constants';

interface AuthProps {
  onLogin: (email: string, pass: string) => void;
  onRegister: (data: any) => void;
  onImportProfile: (data: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [genre, setGenre] = useState('');
  const [threadsUserId, setThreadsUserId] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(email, password);
    } else {
      const regData = {
        email, password, fullName, genre, threadsUserId,
        role: email.toLowerCase() === SPECIAL_ADMIN_EMAIL.toLowerCase() ? 'ADMIN' : 'USER',
        isApproved: true,
        isProfileComplete: true,
        createdAt: new Date().toISOString()
      };
      onRegister(regData);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gray-900 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-3xl shadow-2xl">
             <i className="fab fa-threads"></i>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {isLogin ? 'ログイン' : 'メンバー登録'}
          </h2>
          <p className="text-gray-400 text-[10px] mt-2 font-black uppercase tracking-[0.3em]">Threads Analysis Ecosystem</p>
        </div>

        {isSubmitted ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl">
              <i className="fas fa-check"></i>
            </div>
            <h3 className="text-xl font-black">サーバー登録完了</h3>
            <p className="text-sm text-gray-500 font-bold">これでどの端末からでもログイン可能です。</p>
            <button onClick={() => { setIsLogin(true); setIsSubmitted(false); }} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg">ログイン画面へ</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1.5 ml-1">メールアドレス</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold focus:ring-4 focus:ring-indigo-50 transition-all outline-none" placeholder="example@gmail.com" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1.5 ml-1">パスワード</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold focus:ring-4 focus:ring-indigo-50 transition-all outline-none" placeholder="••••••••" />
              </div>

              {!isLogin && (
                <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-1.5 ml-1">お名前</label>
                    <input type="text" placeholder="例: 佐藤 健太" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-1.5 ml-1">ジャンル</label>
                    <select required value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold outline-none">
                      <option value="">選択してください</option>
                      {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-1.5 ml-1">Threads ID</label>
                    <input type="text" placeholder="ユーザーID (@なし)" required value={threadsUserId} onChange={(e) => setThreadsUserId(e.target.value)} className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold outline-none" />
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100 mt-4 hover:bg-indigo-700 transition-all transform active:scale-[0.98]">
              {isLogin ? 'ログイン' : 'アカウントを作成して同期'}
            </button>
          </form>
        )}

        {!isSubmitted && (
          <div className="mt-10 text-center border-t pt-8">
            <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] text-gray-400 hover:text-indigo-600 font-black tracking-widest uppercase transition-colors">
              {isLogin ? '新規メンバー登録はこちら' : 'ログイン画面へ戻る'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
