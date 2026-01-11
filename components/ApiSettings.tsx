import React, { useState } from 'react';
import { ThreadsApiConfig, UserProfile, PeriodicEntry, ScheduledPost, SystemAiSettings } from '../types';
import { testThreadsConnection, getUserIdFromToken, getAppAccessToken, getAccessTokenViaOAuth } from '../services/threadsApiService';

interface ApiSettingsProps {
  config?: ThreadsApiConfig;
  currentUser: UserProfile;
  allAppData: {
    users: UserProfile[];
    entries: PeriodicEntry[];
    scheduledPosts: ScheduledPost[];
    aiSettings: SystemAiSettings;
  };
  masterUrl: string;
  onUpdateMasterUrl: (url: string) => void;
  onUpdate: (config: ThreadsApiConfig) => void;
  onUpdateSyncUrl: (url: string) => void;
  onChangePassword: (newPass: string) => void;
  onImportData: (data: any) => void;
}

const ApiSettings: React.FC<ApiSettingsProps> = ({ config, currentUser, allAppData, masterUrl, onUpdateMasterUrl, onUpdate, onChangePassword, onImportData }) => {
  // localStorageから設定を復元（更新時に消えないように）
  const getStoredConfig = () => {
    const stored = localStorage.getItem(`threads_api_config_${currentUser.id}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const storedConfig = getStoredConfig();
  const initialConfig = storedConfig || config || {};

  const [accessToken, setAccessToken] = useState(initialConfig?.accessToken || '');
  const [userId, setUserId] = useState(initialConfig?.userId || '');
  const [appId, setAppId] = useState(initialConfig?.appId || '');
  const [appSecret, setAppSecret] = useState(initialConfig?.appSecret || '');
  const [showAppSecret, setShowAppSecret] = useState(false);
  const [urlInput, setUrlInput] = useState(masterUrl);
  const [showServerDoc, setShowServerDoc] = useState(false);
  const [showThreadsGuide, setShowThreadsGuide] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; url?: string } | null>(null);

  // configが更新されたら状態も更新
  React.useEffect(() => {
    if (config) {
      setAccessToken(config.accessToken || '');
      setUserId(config.userId || '');
      setAppId(config.appId || '');
      setAppSecret(config.appSecret || '');
    }
  }, [config]);

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic">API & STORAGE</h2>
          <p className="text-gray-500 mt-2 font-bold uppercase tracking-widest text-xs opacity-60">System Infrastructure</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border-4 border-gray-900 shadow-2xl overflow-hidden">
        <div className="p-10 bg-gray-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black">1. サーバーエンドポイント設定</h3>
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
                  onClick={() => { onUpdateMasterUrl(urlInput); alert('エンドポイントを更新しました。'); }} 
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

      <div className="bg-white rounded-[3rem] border shadow-sm overflow-hidden">
        <div className="p-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black italic flex items-center gap-3">
              <i className="fab fa-threads text-3xl"></i>
              2. THREADS API 連携
            </h3>
            <p className="text-indigo-100 text-xs font-bold mt-2 uppercase tracking-widest">Meta Graph API Integration</p>
          </div>
          <button 
            onClick={() => setShowThreadsGuide(!showThreadsGuide)}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-black transition-all backdrop-blur-sm"
          >
            <i className="fas fa-question-circle mr-2"></i>連携方法を見る
          </button>
        </div>

        {showThreadsGuide && (
          <div className="p-8 bg-indigo-50 border-b border-indigo-100 animate-in slide-in-from-top-4">
            <h4 className="text-lg font-black text-indigo-900 mb-4 flex items-center gap-2">
              <i className="fas fa-book text-indigo-600"></i> Threads API 連携の設定方法
            </h4>
            <div className="space-y-4 text-sm text-indigo-800">
              <div className="bg-white p-6 rounded-2xl border border-indigo-200">
                <h5 className="font-black text-indigo-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
                  Meta for Developers でアプリを作成
                </h5>
                <ol className="list-decimal list-inside space-y-2 ml-8 text-xs">
                  <li><a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-bold">Meta for Developers</a> にアクセス</li>
                  <li>「マイアプリ」→「アプリを作成」をクリック</li>
                  <li>アプリの種類を選択（「ビジネス」推奨）</li>
                  <li>アプリ名を入力して作成</li>
                </ol>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-indigo-200">
                <h5 className="font-black text-indigo-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
                  Threads API を有効化
                </h5>
                <ol className="list-decimal list-inside space-y-2 ml-8 text-xs">
                  <li>アプリダッシュボードで「製品を追加」をクリック</li>
                  <li>「Threads」を検索して追加</li>
                  <li>Threads API の設定画面を開く</li>
                </ol>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-indigo-200">
                <h5 className="font-black text-indigo-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">3</span>
                  テスターとして追加（重要！）
                </h5>
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl mb-3 ml-8">
                  <p className="text-xs text-rose-800 font-bold flex items-start gap-2 mb-2">
                    <i className="fas fa-exclamation-triangle text-rose-600 mt-0.5"></i>
                    <span>「The user has not accepted the invite to test the app.」エラーが出る場合の対処法：</span>
                  </p>
                  <ol className="list-decimal list-inside space-y-1 ml-6 text-xs text-rose-700">
                    <li><strong>アプリのモードを確認：</strong>「設定」→「基本設定」で「アプリモード」が「開発モード」になっているか確認</li>
                    <li><strong>テスターを再追加：</strong>一度削除して、再度テスターとして追加</li>
                    <li><strong>Threadsアプリで確認：</strong>「設定」→「プライバシー」→「アプリとウェブサイト」→「招待」タブで招待を確認・受け入れ</li>
                    <li><strong>時間を置く：</strong>招待を受け入れた後、10-15分待ってから再度試す</li>
                    <li><strong>アプリの権限を確認：</strong>Threads APIの権限設定を確認</li>
                  </ol>
                </div>
                <ol className="list-decimal list-inside space-y-2 ml-8 text-xs">
                  <li>「Threadsテスターを追加または削除」ボタンをクリック</li>
                  <li>自分のThreadsアカウント（@aoi_ogawa_snsなど）をテスターとして追加</li>
                  <li><strong>重要：</strong>Threadsアプリを開き、「設定」→「プライバシー」→「アプリとウェブサイト」→「招待」タブを確認</li>
                  <li>招待通知があれば、<strong>必ず受け入れる</strong></li>
                  <li>招待を受け入れた後、<strong>10-15分待ってから</strong>再度トークン生成を試してください</li>
                </ol>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mt-3 ml-8">
                  <p className="text-xs text-blue-800 font-bold flex items-start gap-2">
                    <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
                    <span>「アクティブ」タブにアプリが表示されていても、テスター招待とは別の認証です。テスター招待は「招待」タブで確認・受け入れが必要です。</span>
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-indigo-200">
                <h5 className="font-black text-indigo-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">4</span>
                  アクセストークンを取得
                </h5>
                <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl mb-3 ml-8">
                  <p className="text-xs text-indigo-800 font-bold mb-2">📎 ユーザートークン生成ツールへのリンク：</p>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      id="app-id-input"
                      placeholder="アプリIDを入力（例: 583234614175148）"
                      defaultValue={appId}
                      className="flex-1 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const inputAppId = (document.getElementById('app-id-input') as HTMLInputElement)?.value || appId || 'YOUR_APP_ID';
                        const url = `https://developers.facebook.com/apps/${inputAppId}/threads/token-generator/`;
                        window.open(url, '_blank');
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-black hover:bg-indigo-700 transition-all whitespace-nowrap"
                    >
                      <i className="fas fa-external-link-alt mr-1"></i>開く
                    </button>
                  </div>
                  <p className="text-[10px] text-indigo-600 mt-2">アプリIDを入力して「開く」をクリックすると、ユーザートークン生成ツールが開きます</p>
                </div>
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl mb-3 ml-8">
                  <p className="text-xs text-rose-800 font-bold mb-2">⚠️ 「The user has not accepted the invite to test the app.」エラーが出る場合：</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-rose-700 ml-2">
                    <li><strong>アプリモードを確認：</strong>Meta for Developers → アプリ → 「設定」→「基本設定」で「アプリモード」が「開発モード」になっているか確認</li>
                    <li><strong>テスターリストを確認：</strong>「ユーザートークン生成ツール」ページに自分のアカウント（aoi_ogawa_sns）が表示されているか確認</li>
                    <li><strong>招待の受け入れを確認：</strong>Threadsアプリ → 「設定」→「プライバシー」→「アプリとウェブサイト」→「招待」タブで招待を受け入れたか確認</li>
                    <li><strong>時間を置く：</strong>招待を受け入れた後、<strong>15-30分待ってから</strong>再度試す（反映に時間がかかる場合があります）</li>
                    <li><strong>テスターを再追加：</strong>一度削除して、再度テスターとして追加し直す</li>
                    <li><strong>ブラウザのキャッシュをクリア：</strong>Meta for Developersのページを強制リロード（Cmd+Shift+R）</li>
                  </ol>
                </div>
                <ol className="list-decimal list-inside space-y-2 ml-8 text-xs">
                  <li>上記のリンクから「ユーザートークン生成ツール」ページを開く</li>
                  <li>自分のアカウント（aoi_ogawa_sns）の「アクセストークンを...」ボタンをクリック</li>
                  <li>または、「ツール」→「Graph API エクスプローラー」を開く</li>
                  <li>「ユーザートークン」を選択</li>
                  <li>必要な権限を選択（<code className="bg-indigo-100 px-1 rounded">threads_basic</code>, <code className="bg-indigo-100 px-1 rounded">threads_content_publish</code>）</li>
                  <li>「アクセストークンを生成」をクリック</li>
                  <li>表示されたトークンをコピーして下の「Meta Access Token」に入力</li>
                </ol>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-indigo-200">
                <h5 className="font-black text-indigo-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">4</span>
                  Threads ユーザーID（オプション）
                </h5>
                <p className="text-xs text-indigo-800 mb-2 ml-8">
                  <strong>自動取得可能です！</strong> アクセストークンを入力後、「自動取得」ボタンをクリックするだけでOKです。
                </p>
                <p className="text-xs text-indigo-600 ml-8">
                  手動で取得する場合：
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-8 text-xs">
                  <li>Graph API エクスプローラーで <code className="bg-indigo-100 px-1 rounded">/me</code> を実行</li>
                  <li>または、<code className="bg-indigo-100 px-1 rounded">https://www.threads.net/@your_username</code> のページで開発者ツールを開き、ユーザーIDを確認</li>
                </ol>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                <p className="text-xs text-amber-800 font-bold flex items-start gap-2">
                  <i className="fas fa-exclamation-triangle text-amber-600 mt-0.5"></i>
                  <span>注意: アクセストークンには有効期限があります。期限切れの場合は再生成してください。</span>
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={e => { 
          e.preventDefault(); 
          const apiConfig = { appId, appSecret, accessToken, userId };
          onUpdate(apiConfig);
          // localStorageにも保存（更新時に消えないように）
          localStorage.setItem(`threads_api_config_${currentUser.id}`, JSON.stringify(apiConfig));
          setTestResult(null);
          alert('API設定を保存しました。ページを更新しても設定は保持されます。'); 
        }} className="p-10 space-y-8">
           <div className="space-y-6">
             {/* アプリIDとApp Secret */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 ml-1 flex items-center gap-2">
                   <i className="fas fa-id-badge text-indigo-500"></i>
                   ThreadsアプリID
                 </label>
                 <input 
                   type="text" 
                   value={appId} 
                   onChange={e => setAppId(e.target.value)} 
                   placeholder="583234614175148"
                   className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50 p-6 font-mono text-sm focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all" 
                 />
                 <p className="text-[10px] text-gray-500 mt-2 ml-1">Meta for Developers のアプリ設定から取得</p>
               </div>

               <div>
                 <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 ml-1 flex items-center gap-2">
                   <i className="fas fa-lock text-indigo-500"></i>
                   Threadsのapp secret
                 </label>
                 <div className="flex gap-2">
                   <input 
                     type={showAppSecret ? "text" : "password"} 
                     value={appSecret} 
                     onChange={e => setAppSecret(e.target.value)} 
                     placeholder="••••••••••"
                     className="flex-1 rounded-2xl border-2 border-gray-200 bg-gray-50 p-6 font-mono text-sm focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all" 
                   />
                   <button
                     type="button"
                     onClick={() => setShowAppSecret(!showAppSecret)}
                     className="px-6 py-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-black transition-all"
                   >
                     {showAppSecret ? '非表示' : '表示'}
                   </button>
                 </div>
                 <p className="text-[10px] text-gray-500 mt-2 ml-1">Meta for Developers のアプリ設定から取得</p>
               </div>
             </div>

             {/* 自動取得ボタン */}
             {appId && appSecret && (
               <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm font-bold text-indigo-900 mb-1">
                       <i className="fas fa-magic mr-2"></i>
                       アクセストークンを自動取得
                     </p>
                     <p className="text-xs text-indigo-700">
                        App IDとApp Secretを入力済みです。ボタンをクリックすると、Meta認証画面が開き、自動的にアクセストークンを取得できます。
                     </p>
                   </div>
                   <button
                     type="button"
                     onClick={async () => {
                       const trimmedAppId = appId ? appId.trim() : '';
                       if (!trimmedAppId) {
                         alert('アプリIDを入力してください');
                         return;
                       }
                       
                       // App IDの形式を確認
                       if (!/^\d+$/.test(trimmedAppId)) {
                         alert(`App IDの形式が正しくありません。数字のみである必要があります。\n現在の値: "${trimmedAppId}"`);
                         return;
                       }
                       
                       // App Secretが入力されているか確認（Threads API専用OAuthでは必要）
                       if (!appSecret) {
                         alert('Threads API専用のOAuth認証にはApp Secretが必要です。\nApp Secretを入力してから再度お試しください。');
                         return;
                       }
                       
                       // App SecretをlocalStorageに保存（トークン交換時に使用）
                       localStorage.setItem(`threads_api_appSecret_${trimmedAppId}`, appSecret);
                       
                       console.log('=== OAuth認証デバッグ情報 (Threads API専用) ===');
                       console.log('使用するApp ID:', trimmedAppId);
                       console.log('App Secret:', appSecret ? '***' : '未入力');
                       console.log('OAuth URL: https://threads.net/oauth/authorize');
                       console.log('========================');
                       
                       setTestResult(null);
                       const result = await getAccessTokenViaOAuth(trimmedAppId);
                       
                       if (result.success && result.accessToken) {
                         setAccessToken(result.accessToken);
                         // 自動的にユーザーIDも取得
                         const userInfo = await getUserIdFromToken(result.accessToken);
                         if (userInfo.success && userInfo.userId) {
                           setUserId(userInfo.userId);
                         }
                         alert('アクセストークンを取得しました！');
                       } else {
                         alert(`エラー: ${result.message}\n\n確認事項:\n1. App IDが正しいか確認（現在: ${trimmedAppId}）\n2. Meta for Developersの「ベーシック」設定で表示されているApp IDと一致しているか\n3. コールバックURLが正しく設定されているか\n4. ブラウザのコンソール（F12）で詳細を確認`);
                       }
                     }}
                     className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-sm whitespace-nowrap shadow-lg"
                   >
                     <i className="fas fa-magic mr-2"></i>
                     自動取得
                   </button>
                 </div>
                 <div className="mt-4 p-3 bg-white rounded-lg border border-indigo-200">
                   <p className="text-xs text-indigo-800 font-bold mb-1">📋 コールバックURL設定が必要です：</p>
                   <p className="text-xs text-indigo-700 mb-2">
                     以下のURLをコールバックURLとして設定してください：
                   </p>
                   <code className="text-xs bg-indigo-100 text-indigo-900 px-3 py-2 rounded block font-mono break-all mb-3">
                     {window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                       ? 'https://localhost:3000/oauth-callback.html'
                       : `${window.location.origin}/oauth-callback.html`}
                   </code>
                   <p className="text-xs text-indigo-600 mt-1">
                     現在の環境: {window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '開発環境 (localhost)' : `本番環境 (${window.location.hostname})`}
                   </p>
                   
                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                     <p className="text-xs text-blue-900 font-bold mb-2">📍 設定方法（2つの方法があります）：</p>
                     
                     <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                       <p className="text-xs text-green-900 font-bold mb-2">✅ 方法1: Threads API設定画面で設定（推奨・簡単）</p>
                       <ol className="list-decimal list-inside space-y-1 text-xs text-green-800 ml-2">
                          <li>「ユースケース &gt; カスタマイズ」画面を開く（現在の画面）</li>
                         <li>左側の「Threads APIにアクセス」セクションで「<strong>設定</strong>」をクリック</li>
                         <li>「<strong>コールバックURLをリダイレクト</strong>」の欄に以下を入力：
                           <code className="bg-green-100 px-1 rounded block mt-1">{window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                             ? 'https://localhost:3000/oauth-callback.html'
                             : `${window.location.origin}/oauth-callback.html`}</code>
                         </li>
                         <li>「<strong>保存する</strong>」ボタンをクリック</li>
                       </ol>
                       <button
                         type="button"
                         onClick={() => {
                           const url = `https://developers.facebook.com/apps/${appId}/threads/use-case/`;
                           window.open(url, '_blank');
                         }}
                         className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-all"
                       >
                         <i className="fas fa-external-link-alt mr-1"></i>
                         Threads API設定画面を開く
                       </button>
                     </div>

                     <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                       <p className="text-xs text-yellow-900 font-bold mb-2">方法2: 基本設定で設定（従来の方法）</p>
                       <ol className="list-decimal list-inside space-y-1 text-xs text-yellow-800 ml-2">
                         <li>「設定」→「基本設定」を開く</li>
                         <li>「プラットフォーム」セクションを探す</li>
                         <li>「プラットフォームを追加」→「ウェブサイト」を選択</li>
                         <li>「有効なOAuthリダイレクトURI」に上記のURLを追加</li>
                         <li>「保存」をクリック</li>
                       </ol>
                       <button
                         type="button"
                         onClick={() => {
                           const url = `https://developers.facebook.com/apps/${appId}/settings/basic/`;
                           window.open(url, '_blank');
                         }}
                         className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-lg text-xs font-bold hover:bg-yellow-700 transition-all"
                       >
                         <i className="fas fa-cog mr-1"></i>
                         基本設定を開く
                       </button>
                     </div>
                   </div>

                   <div className="flex gap-2">
                     <button
                       type="button"
                       onClick={() => {
                         const url = `https://developers.facebook.com/apps/${appId}/settings/basic/`;
                         window.open(url, '_blank');
                       }}
                       className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all"
                     >
                       <i className="fas fa-cog mr-1"></i>
                       基本設定を開く
                     </button>
                     <button
                       type="button"
                       onClick={() => {
                         const url = `https://developers.facebook.com/apps/${appId}/threads/use-case/`;
                         window.open(url, '_blank');
                       }}
                       className="px-4 py-2 bg-gray-600 text-white rounded-lg text-xs font-bold hover:bg-gray-700 transition-all"
                     >
                       <i className="fas fa-external-link-alt mr-1"></i>
                       現在の画面
                     </button>
                   </div>
                 </div>
                 <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                   <p className="text-xs text-blue-800 font-bold mb-2">🔍 トラブルシューティング：</p>
                   <div className="bg-yellow-100 border border-yellow-300 rounded p-2 mb-2">
                     <p className="text-xs text-yellow-900 font-bold">💡 localhost vs サーバー公開について</p>
                     <p className="text-xs text-yellow-800 mt-1">
                       <strong>localhostでも動作しますが</strong>、以下の点を確認してください：
                     </p>
                     <ul className="text-xs text-yellow-800 mt-1 ml-4 list-disc">
                       <li>コールバックURLが <code className="bg-yellow-200 px-1 rounded">{window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                         ? 'https://localhost:3000/oauth-callback.html'
                         : `${window.location.origin}/oauth-callback.html`}</code> に設定されているか</li>
                       <li>Meta for Developersの「コールバックURLをリダイレクト」に同じURLが設定されているか</li>
                       <li>HTTPSでアクセスしているか（<code className="bg-yellow-200 px-1 rounded">{window.location.protocol === 'https:' ? '✓ HTTPS' : '✗ HTTP'}</code>）</li>
                       <li>ブラウザの証明書警告を許可しているか（自己署名証明書の場合）</li>
                     </ul>
                   </div>
                   <div className="bg-indigo-100 border border-indigo-300 rounded p-2 mb-2">
                     <p className="text-xs text-indigo-900 font-bold">📋 現在の設定を確認：</p>
                     <button
                       type="button"
                       onClick={() => {
                         const currentUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '') + '/oauth-callback.html';
                         const info = `
現在のURL: ${window.location.href}
コールバックURL: ${currentUrl}
プロトコル: ${window.location.protocol}
ホスト: ${window.location.host}
ポート: ${window.location.port || 'デフォルト'}

Meta for Developersで設定すべきコールバックURL:
${currentUrl}

確認事項:
1. 上記のコールバックURLがMeta for Developersに設定されているか
2. HTTPSでアクセスしているか（http:// ではなく https://）
3. ブラウザのコンソール（F12）でエラーを確認
                         `;
                         alert(info);
                         console.log('=== 現在の設定情報 ===');
                         console.log('現在のURL:', window.location.href);
                         console.log('コールバックURL:', currentUrl);
                         console.log('プロトコル:', window.location.protocol);
                         console.log('ホスト:', window.location.host);
                         console.log('ポート:', window.location.port || 'デフォルト');
                         console.log('==================');
                       }}
                       className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all"
                     >
                       <i className="fas fa-info-circle mr-1"></i>
                       現在の設定を確認
                     </button>
                   </div>
                 </div>
                 <div className="mt-3 p-3 bg-rose-50 rounded-lg border border-rose-200">
                   <p className="text-xs text-rose-800 font-bold mb-2">⚠️ 「機能をご利用いただけません」エラーが出る場合：</p>
                   <div className="bg-red-100 border border-red-300 rounded p-2 mb-2">
                     <p className="text-xs text-red-900 font-bold">🔴 重要：アプリの基本設定が未完了です</p>
                     <p className="text-xs text-red-800 mt-1">
                       Meta for Developersでアプリの基本情報を入力する必要があります。
                     </p>
                   </div>
                   <ol className="list-decimal list-inside space-y-1 text-xs text-rose-700 ml-2">
                     <li><strong>Meta for Developersの「ベーシック」設定を開く</strong>
                       <ul className="list-disc list-inside ml-4 mt-1">
                         <li>「設定」→「基本設定」を開く</li>
                         <li>ページ上部の赤い警告ボックスを確認</li>
                       </ul>
                     </li>
                     <li><strong>必須項目を入力：</strong>
                       <ul className="list-disc list-inside ml-4 mt-1">
                         <li><strong>アプリアイコン (1024 x 1024)</strong>：1024x1024ピクセルの画像をアップロード</li>
                         <li><strong>プライバシーポリシーのURL</strong>：プライバシーポリシーのページURLを入力（例：<code className="bg-rose-100 px-1 rounded">https://example.com/privacy</code>）</li>
                         <li><strong>カテゴリ</strong>：ドロップダウンから適切なカテゴリを選択（例：「ビジネス」「エンターテインメント」など）</li>
                       </ul>
                     </li>
                     <li><strong>その他の推奨項目：</strong>
                       <ul className="list-disc list-inside ml-4 mt-1">
                         <li>「利用規約のURL」を入力（任意）</li>
                         <li>「ユーザーデータの削除」のURLを入力（任意）</li>
                       </ul>
                     </li>
                     <li><strong>保存して確認：</strong>
                       <ul className="list-disc list-inside ml-4 mt-1">
                         <li>すべての必須項目を入力したら「変更を保存」をクリック</li>
                         <li>赤い警告ボックスが消えることを確認</li>
                         <li>数分待ってから再度OAuth認証を試す</li>
                       </ul>
                     </li>
                   </ol>
                   <button
                     type="button"
                     onClick={() => {
                       const url = `https://developers.facebook.com/apps/${appId}/settings/basic/`;
                       window.open(url, '_blank');
                     }}
                     className="mt-3 w-full px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-all"
                   >
                     <i className="fas fa-cog mr-1"></i>
                     基本設定を開いて必須項目を入力
                   </button>
                 </div>
                 <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                   <p className="text-xs text-yellow-800 font-bold mb-2">💡 プライバシーポリシーのURLについて：</p>
                   <p className="text-xs text-yellow-700">
                     プライバシーポリシーのページがない場合、簡単なプライバシーポリシーページを作成するか、
                     既存のページを使用してください。GitHub Pagesや無料ホスティングサービスを利用することもできます。
                   </p>
                 </div>
               </div>
             )}

             <div className="border-t border-gray-200 pt-6">
               <p className="text-xs text-gray-600 mb-4 flex items-center gap-2">
                 <i className="fas fa-info-circle text-indigo-500"></i>
                 <span>アプリIDとapp secretは、アクセストークンと併用できます。どちらか一方でも連携可能です。</span>
               </p>
             </div>

             <div>
               <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 ml-1 flex items-center gap-2">
                 <i className="fas fa-key text-indigo-500"></i>
                 Meta Access Token <span className="text-gray-400 text-[9px]">（アプリID/app secretと併用可能）</span>
               </label>
               <div className="flex gap-2">
                 <textarea 
                   value={accessToken} 
                   onChange={e => setAccessToken(e.target.value)} 
                   placeholder="EAAxxxxxxxxxxxxx（自動取得ボタンで取得するか、手動で貼り付け）"
                   className="flex-1 rounded-2xl border-2 border-gray-200 bg-gray-50 p-6 font-mono text-[10px] h-24 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all" 
                 />
                 <button
                   type="button"
                   onClick={async () => {
                     if (!appId) {
                       alert('アプリIDを先に入力してください');
                       return;
                     }
                     
                     setTestResult(null);
                     const result = await getAccessTokenViaOAuth(appId);
                     
                     if (result.success && result.accessToken) {
                       setAccessToken(result.accessToken);
                       // 自動的にユーザーIDも取得
                       const userInfo = await getUserIdFromToken(result.accessToken);
                       if (userInfo.success && userInfo.userId) {
                         setUserId(userInfo.userId);
                       }
                       alert('アクセストークンを取得しました！');
                     } else {
                       alert(`エラー: ${result.message}`);
                     }
                   }}
                   disabled={!appId}
                   className="px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-bold text-xs whitespace-nowrap"
                 >
                   <i className="fas fa-magic mr-2"></i>
                   自動取得
                 </button>
               </div>
               <p className="text-[10px] text-gray-500 mt-2 ml-1">
                 <strong>自動取得ボタン</strong>をクリックすると、Meta認証画面が開きます。認証後、自動的にトークンが入力されます。
                 <br />
                 または、Meta for Developers の Graph API エクスプローラーから取得したアクセストークンを手動で貼り付けることもできます。
               </p>
             </div>

             <div>
               <label className="text-[10px] font-black text-gray-400 uppercase block mb-2 ml-1 flex items-center gap-2">
                 <i className="fas fa-user text-indigo-500"></i>
                 Threads Account ID <span className="text-gray-400 text-[9px]">（オプション - 自動取得可能）</span>
               </label>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={userId} 
                   onChange={e => setUserId(e.target.value)} 
                   placeholder="自動取得されます（手動入力も可能）"
                   className="flex-1 rounded-2xl border-2 border-gray-200 bg-gray-50 p-6 font-mono text-sm focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all" 
                 />
                 <button
                   type="button"
                   onClick={async () => {
                     if (!accessToken) {
                       alert('アクセストークンを先に入力してください。');
                       return;
                     }
                     setIsAutoDetecting(true);
                     const result = await getUserIdFromToken(accessToken);
                     if (result.success && result.userId) {
                       setUserId(result.userId);
                       alert(`ユーザーIDを自動取得しました: ${result.userId}`);
                     } else {
                       alert(`ユーザーIDの取得に失敗しました: ${result.message}`);
                     }
                     setIsAutoDetecting(false);
                   }}
                   disabled={isAutoDetecting || !accessToken}
                   className="px-6 py-6 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                 >
                   {isAutoDetecting ? (
                     <i className="fas fa-spinner fa-spin"></i>
                   ) : (
                     <>
                       <i className="fas fa-magic mr-2"></i>自動取得
                     </>
                   )}
                 </button>
               </div>
               <p className="text-[10px] text-gray-500 mt-2 ml-1">
                 アクセストークンから自動取得できます。「自動取得」ボタンをクリックするか、手動で入力してください。
               </p>
             </div>

             {testResult && (
               <div className={`p-6 rounded-2xl border-2 ${testResult.success ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                 <div className="flex items-start gap-3">
                   <i className={`fas ${testResult.success ? 'fa-check-circle text-emerald-600' : 'fa-times-circle text-rose-600'} text-2xl`}></i>
                   <div className="flex-1">
                     <p className={`font-black ${testResult.success ? 'text-emerald-900' : 'text-rose-900'} mb-2`}>
                       {testResult.success ? '✅ 連携成功！' : '❌ 連携失敗'}
                     </p>
                     <p className={`text-sm ${testResult.success ? 'text-emerald-800' : 'text-rose-800'}`}>
                       {testResult.message}
                     </p>
                     {testResult.success && testResult.url && (
                       <a 
                         href={testResult.url} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="mt-3 inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all"
                       >
                         <i className="fas fa-external-link-alt mr-2"></i>投稿を確認する
                       </a>
                     )}
                   </div>
                 </div>
               </div>
             )}

             <div className="flex gap-4">
               <button 
                 type="button"
                 onClick={async () => {
                  // アクセストークンまたはアプリID/app secretのいずれかが必要
                  if (!accessToken && (!appId || !appSecret)) {
                    alert('アクセストークン、またはアプリIDとapp secretを入力してください。');
                    return;
                  }
                  
                  setIsTesting(true);
                  setTestResult(null);
                  
                  // アクセストークンが入力されている場合
                  let finalAccessToken = accessToken;
                  let finalUserId = userId;
                  
                  // アクセストークンが未入力で、アプリIDとapp secretが入力されている場合
                  if (!finalAccessToken && appId && appSecret) {
                    // アプリトークンを自動取得
                    const appTokenResult = await getAppAccessToken(appId, appSecret);
                    if (appTokenResult.success && appTokenResult.accessToken) {
                      finalAccessToken = appTokenResult.accessToken;
                      setAccessToken(finalAccessToken); // 取得したトークンを保存
                    } else {
                      setTestResult({
                        success: false,
                        message: `アプリトークンの取得に失敗: ${appTokenResult.message}\n\n注意: アプリトークンではユーザー投稿ができない場合があります。ユーザートークンが必要な場合は、Graph API エクスプローラーから取得してください。`
                      });
                      setIsTesting(false);
                      return;
                    }
                  }
                  
                  if (finalAccessToken) {
                    // Account IDが未入力の場合は自動取得
                    if (!finalUserId) {
                      const userInfo = await getUserIdFromToken(finalAccessToken);
                      if (!userInfo.success || !userInfo.userId) {
                        setTestResult({
                          success: false,
                          message: `ユーザーIDの取得に失敗: ${userInfo.message}\n\nアプリトークンではユーザー情報を取得できない場合があります。ユーザートークンを使用してください。`
                        });
                        setIsTesting(false);
                        return;
                      }
                      finalUserId = userInfo.userId;
                      setUserId(finalUserId); // 取得したIDを保存
                    }
                  }
                  
                  if (!finalAccessToken) {
                    setTestResult({
                      success: false,
                      message: 'アクセストークンの取得に失敗しました。'
                    });
                    setIsTesting(false);
                    return;
                  }
                  
                  const result = await testThreadsConnection({ appId, appSecret, accessToken: finalAccessToken, userId: finalUserId });
                  setTestResult(result);
                  setIsTesting(false);
                 }}
                 disabled={isTesting || (!accessToken && (!appId || !appSecret))}
                 className="flex-1 py-6 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3"
               >
                 {isTesting ? (
                   <>
                     <i className="fas fa-spinner fa-spin"></i>
                     テスト送信中...
                   </>
                 ) : (
                   <>
                     <i className="fas fa-paper-plane"></i>
                     テスト送信（連携確認）
                   </>
                 )}
               </button>
               <button 
                 type="submit" 
                 className="flex-1 py-6 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-black active:scale-95 transition-all"
               >
                 <i className="fas fa-save mr-2"></i>設定を保存
               </button>
             </div>

             <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
               <p className="text-xs text-blue-800 font-bold flex items-start gap-2">
                 <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
                 <span>「テスト送信」ボタンを押すと、Threads に「テスト投稿」という投稿が公開されます。投稿が成功すれば連携設定は完了です。</span>
               </p>
             </div>
           </div>
        </form>
      </div>
    </div>
  );
};

export default ApiSettings;
