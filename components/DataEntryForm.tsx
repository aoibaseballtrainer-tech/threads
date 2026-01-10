import React, { useState } from 'react';
import { PeriodicEntry, TopContent } from '../types';

interface DataEntryFormProps {
  onSubmit: (entry: Omit<PeriodicEntry, 'id' | 'userId' | 'createdAt'>) => void;
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    followers: 0,
    views7Days: 0,
    interactionsTotal: 0,
    likes: 0,
    replies: 0,
    quotes: 0,
    reposts: 0,
    pinnedPostViews: 0,
    listCount: 0,
  });

  const [topContents, setTopContents] = useState<Partial<TopContent>[]>([
    { id: '1', content: '', views: 0, link: '' }
  ]);

  const addTopContentField = () => {
    if (topContents.length < 5) {
      setTopContents([...topContents, { id: Date.now().toString(), content: '', views: 0, link: '' }]);
    }
  };

  const handleTopContentChange = (index: number, field: keyof TopContent, value: string | number) => {
    const updated = [...topContents];
    updated[index] = { ...updated[index], [field]: value };
    setTopContents(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validTopContents = topContents
      .filter(c => c.content && c.link)
      .map(c => ({
        id: c.id || Date.now().toString(),
        content: c.content || '',
        views: Number(c.views) || 0,
        link: c.link || '',
      })) as TopContent[];

    if (validTopContents.length === 0) {
      alert('トップコンテンツは少なくとも1つ入力してください。');
      return;
    }

    onSubmit({
      ...formData,
      followers: Number(formData.followers),
      views7Days: Number(formData.views7Days),
      interactionsTotal: Number(formData.interactionsTotal),
      likes: Number(formData.likes),
      replies: Number(formData.replies),
      quotes: Number(formData.quotes),
      reposts: Number(formData.reposts),
      pinnedPostViews: Number(formData.pinnedPostViews),
      listCount: Number(formData.listCount),
      topContents: validTopContents
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
             <i className="fas fa-calendar-check text-indigo-600"></i>
             基本メトリクス登録
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">計測日</label>
              <input 
                type="date" required value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">フォロワー数</label>
              <input 
                type="number" min="0" required value={formData.followers}
                onChange={(e) => setFormData({...formData, followers: Number(e.target.value)})}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">7日間の閲覧数</label>
              <input 
                type="number" min="0" required value={formData.views7Days}
                onChange={(e) => setFormData({...formData, views7Days: Number(e.target.value)})}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">インタラクション合計</label>
              <input 
                type="number" min="0" required value={formData.interactionsTotal}
                onChange={(e) => setFormData({...formData, interactionsTotal: Number(e.target.value)})}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">いいね数</label>
              <input 
                type="number" min="0" required value={formData.likes}
                onChange={(e) => setFormData({...formData, likes: Number(e.target.value)})}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">返信数</label>
              <input 
                type="number" min="0" required value={formData.replies}
                onChange={(e) => setFormData({...formData, replies: Number(e.target.value)})}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">引用数</label>
              <input 
                type="number" min="0" required value={formData.quotes}
                onChange={(e) => setFormData({...formData, quotes: Number(e.target.value)})}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">再投稿数</label>
              <input 
                type="number" min="0" required value={formData.reposts}
                onChange={(e) => setFormData({...formData, reposts: Number(e.target.value)})}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">固定投稿 閲覧数</label>
              <input 
                type="number" min="0" required value={formData.pinnedPostViews}
                onChange={(e) => setFormData({...formData, pinnedPostViews: Number(e.target.value)})}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">リスト保存数</label>
              <input 
                type="number" min="0" required value={formData.listCount}
                onChange={(e) => setFormData({...formData, listCount: Number(e.target.value)})}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <i className="fas fa-trophy text-amber-500"></i>
              トップコンテンツ (最大5個)
            </h2>
            {topContents.length < 5 && (
              <button 
                type="button" 
                onClick={addTopContentField}
                className="text-sm text-indigo-600 font-medium hover:text-indigo-800"
              >
                + 投稿を追加
              </button>
            )}
          </div>

          <div className="space-y-6">
            {topContents.map((content, idx) => (
              <div key={idx} className="p-4 border rounded-lg bg-gray-50 relative">
                <div className="absolute -left-3 top-4 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-2">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">投稿本文</label>
                    <textarea 
                      required={idx === 0}
                      rows={2}
                      value={content.content}
                      onChange={(e) => handleTopContentChange(idx, 'content', e.target.value)}
                      placeholder="投稿したテキスト内容..."
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">閲覧数</label>
                    <input 
                      type="number" min="0" required={idx === 0}
                      value={content.views}
                      onChange={(e) => handleTopContentChange(idx, 'views', Number(e.target.value))}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">スレッドリンク</label>
                    <input 
                      type="url" required={idx === 0}
                      value={content.link}
                      onChange={(e) => handleTopContentChange(idx, 'link', e.target.value)}
                      placeholder="https://threads.net/p/..."
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all transform hover:-translate-y-1"
          >
            データを登録する
          </button>
        </div>
      </form>
    </div>
  );
};

export default DataEntryForm;
