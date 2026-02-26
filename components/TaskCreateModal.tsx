import React, { useState } from 'react';
import { X, Calendar, Flag, Type, FileText, Plus } from 'lucide-react';
import { Task } from '../types';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (taskData: Partial<Task>) => void;
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({ title, description, priority, dueDate, source: 'MANUAL' });
    setTitle(''); setDescription(''); setPriority('medium'); setDueDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-[80] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full rounded-t-3xl sm:rounded-2xl sm:w-[90%] sm:max-w-sm overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800 text-lg">新增任务</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500">任务标题 *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="请输入" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-red-400" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500">描述</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="详情..." className="w-full p-3 h-20 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none resize-none" />
          </div>
          <div className="flex gap-3">
             <div className="flex-1 space-y-2">
               <label className="text-xs font-semibold text-gray-500">优先级</label>
               <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none">
                 <option value="high">高</option>
                 <option value="medium">中</option>
                 <option value="low">低</option>
               </select>
             </div>
             <div className="flex-1 space-y-2">
               <label className="text-xs font-semibold text-gray-500">日期</label>
               <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none" />
             </div>
          </div>
          <button type="submit" disabled={!title.trim()} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold mt-2 shadow-lg shadow-red-200">创建</button>
        </form>
      </div>
    </div>
  );
};