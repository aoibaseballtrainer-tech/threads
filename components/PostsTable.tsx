import React, { useState, useMemo, useEffect } from 'react';
import { ScheduledPost, PeriodicEntry, UserProfile } from '../types';

interface PostsTableProps {
  scheduledPosts: ScheduledPost[];
  users: UserProfile[]; // 全ユーザー情報
  historicalEntries: PeriodicEntry[];
  onUpdatePost: (id: string, updates: Partial<ScheduledPost>) => void;
  onDeletePost: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onRetry?: (id: string) => void;
}

const PostsTable: React.FC<PostsTableProps> = ({ scheduledPosts, users, historicalEntries, onUpdatePost, onDeletePost, onBulkDelete, onRetry }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PUBLISHED' | 'FAILED'>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [editingItem, setEditingItem] = useState<ScheduledPost | null>(null);
  const [editDateTime, setEditDateTime] = useState('');

  const getUserName = (userId: string) => {
    const u = users.find(user => user.id === userId);
    return u ? (u.fullName || u.email) : '不明なユーザー';
  };

  const filteredPosts = useMemo(() => {
    return scheduledPosts
      .filter(post => {
        const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || post.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  }, [scheduledPosts, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">投稿フォルダ管理</h2>
          <p className="text-gray-500 text-sm mt-2 font-bold uppercase tracking-widest opacity-60">Global Content Repository</p>
        </div>
        <div className="flex items-center gap-4">
          {selectedIds.length > 0 && <button onClick={() => onBulkDelete(selectedIds)} className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-black text-xs shadow-xl animate-in fade-in">一括削除 ({selectedIds.length})</button>}
          <div className="relative">
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"></i>
            <input type="text" placeholder="フォルダ内を検索..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-12 pr-6 py-4 rounded-2xl border bg-white shadow-sm text-sm w-72 focus:ring-4 focus:ring-indigo-50 transition-all font-bold" />
          </div>
        </div>
      </div>

      <div className="flex border-b gap-10 overflow-x-auto pb-px">
        {['ALL', 'PENDING', 'PUBLISHED', 'FAILED'].map(id => (
          <button key={id} onClick={() => setStatusFilter(id as any)} className={`pb-5 px-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-4 ${statusFilter === id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {id === 'ALL' ? 'Everything' : id}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b">
              <tr>
                <th className="px-8 py-6 w-10"></th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Account</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Schedule</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Content</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-8 py-6"><input type="checkbox" checked={selectedIds.includes(post.id)} onChange={() => setSelectedIds(prev => prev.includes(post.id) ? prev.filter(x => x !== post.id) : [...prev, post.id])} className="rounded-lg text-indigo-600 w-5 h-5" /></td>
                  <td className="px-8 py-6 font-black text-indigo-600 text-xs">{getUserName(post.userId)}</td>
                  <td className="px-8 py-6">
                    <div className="font-black text-gray-900 text-xs">{new Date(post.scheduledAt).toLocaleString('ja-JP')}</div>
                    <div className={`text-[9px] font-black mt-1 ${post.mode === 'REMOTE' ? 'text-sky-500' : 'text-amber-500'}`}>
                      {post.mode === 'REMOTE' ? 'CLOUD AUTO' : 'LOCAL WAIT'}
                    </div>
                  </td>
                  <td className="px-8 py-6 max-w-md"><p className="text-xs font-bold text-gray-600 line-clamp-2 leading-relaxed">{post.content}</p></td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${post.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : post.status === 'FAILED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <button onClick={() => setEditingItem(post)} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><i className="fas fa-edit"></i></button>
                    <button onClick={() => onDeletePost(post.id)} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><i className="fas fa-trash-alt"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PostsTable;
