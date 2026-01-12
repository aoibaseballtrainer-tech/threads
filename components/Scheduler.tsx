import React, { useState, useEffect } from 'react';
import { ScheduledPost, PeriodicEntry, AiPromptGroup, SystemAiSettings, UserProfile, EditableGeneratedPost } from '../types';
import { generateThreadsPosts } from '../services/geminiService';

interface SchedulerProps {
  posts: ScheduledPost[];
  pastEntries: PeriodicEntry[];
  systemAiSettings: SystemAiSettings;
  userProfile: UserProfile;
  onAddPosts: (posts: Omit<ScheduledPost, 'id' | 'userId' | 'status' | 'createdAt'>[]) => void;
  onUpdatePost: (postId: string, updates: Partial<ScheduledPost>) => void;
  onDeletePost: (postId: string) => void;
  onBulkDelete: (postIds: string[]) => void;
}

const Scheduler: React.FC<SchedulerProps> = ({ posts, pastEntries, systemAiSettings, userProfile, onAddPosts, onUpdatePost, onDeletePost, onBulkDelete }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('ai');
  const [manualContent, setManualContent] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualTime, setManualTime] = useState('18:00');

  const [isGenerating, setIsGenerating] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewPosts, setReviewPosts] = useState<EditableGeneratedPost[]>([]);

  const handleAiGenerate = async () => {
    // APIキーが未設定の場合は警告を表示
    if (!userProfile.geminiApiKey || !userProfile.geminiApiKey.trim()) {
      alert('Gemini APIキーが設定されていません。\n\nAI機能を使用する場合は、設定画面でAPIキーを入力してください。\n\n手動投稿タブから投稿を予約することもできます。');
      return;
    }

    setIsGenerating(true);
    try {
      // ユーザーのGemini APIキーを使用
      const generated = await generateThreadsPosts(
        "最新のSNSトレンド", 
        3, 
        systemAiSettings,
        { entries: pastEntries, profile: userProfile },
        userProfile.geminiApiKey
      );
      
      // 生成結果が空の場合はエラー
      if (!generated || generated.length === 0) {
        alert('投稿の生成に失敗しました。\n\nAPIキーが正しいか、または設定画面でAPIキーを確認してください。\n\n手動投稿タブから投稿を予約することもできます。');
        setIsGenerating(false);
        return;
      }
      
      const now = new Date();
      const formatted = generated.map((text, i) => {
        const time = new Date(now.getTime() + (i + 1) * 3600000);
        return {
          id: `gen-${Date.now()}-${i}`,
          content: text,
          scheduledAt: new Date(time.getTime() - time.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
        };
      });
      setReviewPosts(formatted);
      setShowReview(true);
    } catch (e: any) {
      console.error('AI生成エラー:', e);
      alert('投稿の生成に失敗しました。\n\n' + (e.message || 'APIキーが正しいか確認してください。') + '\n\n手動投稿タブから投稿を予約することもできます。');
    }
    finally { setIsGenerating(false); }
  };

  const confirmReservations = () => {
    onAddPosts(reviewPosts.map(p => ({
      content: p.content,
      scheduledAt: new Date(p.scheduledAt).toISOString(),
      isRepost: false
    })));
    setShowReview(false);
    alert('予約をすべて保存しました。');
  };

  return (
    <div className="space-y-8">
      <div className="flex bg-gray-200 p-1 rounded-2xl w-fit mx-auto shadow-inner">
        <button onClick={() => setActiveTab('ai')} className={`px-8 py-3 rounded-xl font-bold ${activeTab === 'ai' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-500'}`}>AI一括生成</button>
        <button onClick={() => setActiveTab('manual')} className={`px-8 py-3 rounded-xl font-bold ${activeTab === 'manual' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-500'}`}>手動予約</button>
      </div>

      {activeTab === 'ai' ? (
        <div className="bg-white p-10 rounded-3xl border shadow-xl text-center space-y-6">
          <i className="fas fa-wand-magic-sparkles text-5xl text-indigo-500"></i>
          <h3 className="text-2xl font-black">AIで投稿案を作成</h3>
          <p className="text-gray-500">あなたの過去の傾向を学習したAIが最適な投稿を提案します。</p>
          {!userProfile.geminiApiKey || !userProfile.geminiApiKey.trim() ? (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 space-y-3">
              <p className="text-sm font-bold text-amber-800">
                <i className="fas fa-info-circle mr-2"></i>
                Gemini APIキーが設定されていません
              </p>
              <p className="text-xs text-amber-700">
                AI機能を使用する場合は、設定画面でGemini APIキーを入力してください。
                <br />
                APIキーは<a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline font-bold">Google AI Studio</a>で無料で取得できます。
              </p>
              <p className="text-xs text-amber-600 font-bold pt-2 border-t border-amber-200">
                💡 手動投稿タブからも投稿を予約できます
              </p>
            </div>
          ) : null}
          <button onClick={handleAiGenerate} disabled={isGenerating} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed">
            {isGenerating ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>生成中...
              </>
            ) : (
              '投稿案を3件作成する'
            )}
          </button>
        </div>
      ) : (
        <div className="bg-white p-10 rounded-3xl border shadow-xl space-y-6">
          <textarea value={manualContent} onChange={(e) => setManualContent(e.target.value)} placeholder="本文を入力..." rows={5} className="w-full rounded-2xl border-gray-200 p-4" />
          <div className="grid grid-cols-2 gap-4">
            <input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} className="rounded-xl border-gray-200 p-3" />
            <input type="time" value={manualTime} onChange={(e) => setManualTime(e.target.value)} className="rounded-xl border-gray-200 p-3" />
          </div>
          <button onClick={() => onAddPosts([{content: manualContent, scheduledAt: new Date(`${manualDate}T${manualTime}`).toISOString(), isRepost: false}])} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg">予約を保存する</button>
        </div>
      )}

      {showReview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-8 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-2xl font-black">AI投稿案の確認</h3>
              <button onClick={() => setShowReview(false)} className="text-gray-400 text-2xl"><i className="fas fa-times"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {reviewPosts.map((post, i) => (
                <div key={post.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                  <textarea value={post.content} onChange={(e) => setReviewPosts(reviewPosts.map(p => p.id === post.id ? {...p, content: e.target.value} : p))} className="w-full rounded-xl border-gray-200 p-4 text-sm" rows={3} />
                  <input type="datetime-local" value={post.scheduledAt} onChange={(e) => setReviewPosts(reviewPosts.map(p => p.id === post.id ? {...p, scheduledAt: e.target.value} : p))} className="w-full rounded-xl border-gray-200 p-3 text-xs font-bold text-indigo-600" />
                </div>
              ))}
            </div>
            <div className="p-8 border-t bg-gray-50 flex justify-end gap-4">
              <button onClick={() => setShowReview(false)} className="px-8 py-3 rounded-xl font-bold text-gray-500">破棄する</button>
              <button onClick={confirmReservations} className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-xl flex items-center gap-2">
                <i className="fas fa-save"></i> すべて保存して予約を確定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduler;
