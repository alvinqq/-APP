import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Image as ImageIcon, CheckCircle, Loader2, Activity, Calendar } from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface TaskEditModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, actionText: string, attachments: string[], newStatus: TaskStatus, newDueDate?: string) => void;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [actionText, setActionText] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (task) {
      setActionText('');
      setAttachments([]);
      setDueDate(task.dueDate || new Date().toISOString().split('T')[0]);
    }
  }, [task, isOpen]);

  if (!task || !isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setAttachments(prev => [...prev, event.target!.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!actionText.trim()) { alert("请输入处理描述"); return; }
    if (attachments.length === 0) { alert("请上传照片"); return; }
    setIsSubmitting(true);
    setTimeout(() => {
      onUpdate(task.id, actionText, attachments, TaskStatus.PENDING_VERIFICATION, dueDate);
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  return (
    <div className="absolute inset-0 z-[80] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full rounded-t-3xl sm:rounded-2xl sm:w-[90%] sm:max-w-sm overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">执行任务</h3>
            <p className="text-xs text-gray-500 truncate max-w-[200px]">{task.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-5">
           <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
             <span className="text-xs font-semibold text-gray-700 flex items-center gap-1"><Activity size={14} className="text-red-600"/> 状态</span>
             <span className="text-xs font-bold text-red-600">进行中</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500">截止日期</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500">执行情况 *</label>
            <textarea value={actionText} onChange={(e) => setActionText(e.target.value)} placeholder="描述..." className="w-full h-24 p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none resize-none" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 flex justify-between">
              <span>凭证 *</span>
              <span>{attachments.length} 张</span>
            </label>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <button onClick={() => fileInputRef.current?.click()} className="w-20 h-20 flex-shrink-0 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400">
                <Camera size={20} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              {attachments.map((src, idx) => (
                <div key={idx} className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-gray-100">
                  <img src={src} alt="preview" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold text-sm bg-gray-100 rounded-xl">取消</button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="flex-[2] py-3 bg-red-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} 提交
          </button>
        </div>
      </div>
    </div>
  );
};