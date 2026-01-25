import React, { useState, useRef } from 'react';
import { X, Camera, Image as ImageIcon, Send, Save, CheckCircle, Loader2, Activity } from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface TaskEditModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, actionText: string, attachments: string[], newStatus: TaskStatus) => void;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [actionText, setActionText] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form when opening
  React.useEffect(() => {
    if (task) {
      setActionText('');
      setAttachments([]);
    }
  }, [task, isOpen]);

  if (!task || !isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachments(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!actionText.trim()) {
        alert("请输入处理描述 (必填)");
        return;
    }
    
    if (attachments.length === 0) {
        alert("请上传现场照片/凭证 (必填)");
        return;
    }

    setIsSubmitting(true);
    // Simulate network delay
    setTimeout(() => {
      // Update task status to PENDING_VERIFICATION ("待验证") on submission
      onUpdate(task.id, actionText, attachments, TaskStatus.PENDING_VERIFICATION);
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">执行/编辑任务</h3>
            <p className="text-xs text-gray-500">{task.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Read-only Status Display */}
          <div className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl border border-red-100">
             <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Activity size={16} className="text-red-600" />
                当前任务状态
             </span>
             <span className="px-3 py-1 rounded-full bg-white text-red-700 text-xs font-bold border border-red-100 flex items-center gap-1.5 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                进行中
             </span>
          </div>

          {/* Action Description */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              处理描述 / 备注 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={actionText}
              onChange={(e) => setActionText(e.target.value)}
              placeholder="请输入具体的执行操作，例如：已清理冷柜积冰，温度恢复正常..."
              className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none resize-none text-sm transition-all"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
              <span>现场照片 / 凭证 <span className="text-red-500">*</span></span>
              <span className="text-xs font-normal text-gray-400">{attachments.length} 张已上传</span>
            </label>
            
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {/* Upload Button */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 flex-shrink-0 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-colors group"
              >
                <div className="bg-gray-100 p-2 rounded-full mb-1 group-hover:bg-white transition-colors">
                    <Camera size={20} />
                </div>
                <span className="text-[10px] font-medium">拍照/上传</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />

              {/* Previews */}
              {attachments.map((src, idx) => (
                <div key={idx} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border border-gray-100 group shadow-sm">
                  <img src={src} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                        onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                        className="bg-white/20 hover:bg-red-600 text-white rounded-full p-1.5 backdrop-blur-sm transition-colors"
                    >
                        <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-medium shadow-lg shadow-red-200 hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
            提交完成
          </button>
        </div>
      </div>
    </div>
  );
};