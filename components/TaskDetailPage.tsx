import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Edit3, Clock, Share2, Activity, History, Image as ImageIcon, AlertTriangle, XCircle, Check, Loader2, BrainCircuit, Calendar, ArrowLeft } from 'lucide-react';
import { Task, TaskStatus, UserRole } from '../types';

interface TaskDetailPageProps {
  task: Task | null;
  onBack: () => void;
  onComplete: (taskId: string) => void;
  onEdit: (taskId: string) => void;
  onReject: (taskId: string) => void;
  onAccept: (taskId: string) => void;
  onAiVerify: (taskId: string) => void;
  role: UserRole;
}

export const TaskDetailPage: React.FC<TaskDetailPageProps> = ({
  task,
  onBack,
  onComplete,
  onEdit,
  onReject,
  onAccept,
  onAiVerify,
  role
}) => {
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    setShowRejectConfirm(false);
    setIsVerifying(false);
  }, [task]);

  if (!task) return null;

  const handleVerifyClick = () => {
      if (task) {
          setIsVerifying(true);
          setTimeout(() => {
            onAiVerify(task.id);
            setIsVerifying(false);
          }, 1500);
      }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '无截止日期';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });
  };

  // 获取状态文本
  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING: return '待处理';
      case TaskStatus.IN_PROGRESS: return '进行中';
      case TaskStatus.VERIFIED: return '已验证';
      case TaskStatus.COMPLETED: return '已完成';
      case TaskStatus.REJECTED: return '已拒绝';
      default: return '其他';
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
      case TaskStatus.VERIFIED:
        return 'text-green-600';
      case TaskStatus.REJECTED:
        return 'text-gray-500';
      default:
        return 'text-red-600';
    }
  };

  return (
    <div className="w-full max-w-[430px] mx-auto bg-[#F8FAFC] min-h-screen sm:my-8 sm:rounded-[32px] sm:shadow-2xl sm:border-[8px] sm:border-gray-800 relative flex flex-col font-sans no-font-scaling">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between sticky top-0 z-10 sm:rounded-t-[24px]">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-1 h-5 rounded-full ${task.status === TaskStatus.REJECTED ? 'bg-gray-400' : 'bg-red-600'}`}></div>
            <h2 className="text-lg font-bold text-gray-800">任务详情</h2>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        
        {/* Main Info */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
             <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                task.status === TaskStatus.REJECTED ? 'bg-gray-100 text-gray-500 border-gray-200' :
                task.priority === 'high' ? 'bg-red-50 text-red-700 border-red-100' :
                task.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                'bg-gray-50 text-gray-700 border-gray-100'
             }`}>
                {task.priority === 'high' ? '高优' : task.priority === 'medium' ? '中优' : '普通'}
             </span>
             <span className="text-[10px] text-gray-400 flex items-center gap-1">
                <Clock size={12} /> {task.timestamp}
             </span>
             {task.dueDate && (
               <span className="text-[10px] text-red-500 bg-red-50 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                  <Calendar size={12} /> 截止: {formatDate(task.dueDate)}
               </span>
             )}
          </div>
          
          <h3 className={`text-xl font-bold leading-snug ${task.status === TaskStatus.REJECTED ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
              {task.title}
          </h3>
          
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-600 text-sm leading-relaxed">
            {task.description}
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
            <div className="text-[10px] text-gray-500 mb-1 flex items-center gap-1.5">
              <Share2 size={12} /> 来源
            </div>
            <div className="font-semibold text-sm text-gray-800 flex items-center gap-2">
              {task.source === 'AI_GENERATED' ? 'AI 智能生成' : '人工创建'}
            </div>
          </div>
          <div className="p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
             <div className="text-[10px] text-gray-500 mb-1 flex items-center gap-1.5">
              <Activity size={12} /> 状态
            </div>
            <div className={`font-semibold text-sm flex items-center gap-2 ${getStatusColor(task.status)}`}>
              {getStatusText(task.status)}
            </div>
          </div>
        </div>

        {/* Logs */}
        {task.logs && task.logs.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-50">
               <History size={14} className="text-gray-400" />
               <h4 className="font-bold text-gray-800 text-sm">记录</h4>
            </div>
            <div className="space-y-4 pl-2">
                {task.logs.map((log) => (
                  <div key={log.id} className="relative pl-4 border-l border-gray-100">
                    <div className="absolute -left-[3px] top-1.5 w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                    <div className="flex flex-col gap-1">
                       <div className="flex justify-between items-center">
                         <span className="text-xs font-semibold text-gray-700">{log.actor}</span>
                         <span className="text-[10px] text-gray-400 font-mono">{log.timestamp}</span>
                       </div>
                       <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                         {log.action}
                       </p>
                       {log.attachments && log.attachments.length > 0 && (
                          <div className="flex gap-2 mt-1">
                              {log.attachments.map((src, idx) => (
                                  <div key={idx} className="w-12 h-12 rounded overflow-hidden border border-gray-200">
                                      <img src={src} alt="att" className="w-full h-full object-cover" />
                                  </div>
                              ))}
                          </div>
                       )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Actions Fixed */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white flex gap-3 z-30 pb-8 sm:rounded-b-[24px]">
          {task.status === TaskStatus.PENDING ? (
              <>
                  {role !== UserRole.STORE_ASSISTANT && (
                      <button 
                          onClick={() => setShowRejectConfirm(true)}
                          className="flex-1 py-3 bg-white border border-gray-200 text-red-600 font-bold text-sm rounded-xl"
                      >
                          驳回
                      </button>
                  )}
                  <button 
                      onClick={() => onAccept(task.id)}
                      className={`py-3 bg-red-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-200 ${
                          role === UserRole.STORE_ASSISTANT ? 'w-full' : 'flex-[2]'
                      }`}
                  >
                      接收任务
                  </button>
              </>
          ) : task.status === TaskStatus.IN_PROGRESS ? (
              <button 
                  onClick={() => onEdit(task.id)}
                  className="w-full py-3 bg-red-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-200 flex items-center justify-center gap-2"
              >
                  <Edit3 size={18} /> 去执行
              </button>
          ) : (
               <button disabled className="w-full py-3 bg-gray-100 text-gray-400 font-bold text-sm rounded-xl">
                  已完成 / 已结束
              </button>
          )}
      </div>
      
      {/* Rejection Overlay */}
      {showRejectConfirm && (
          <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-6 sm:rounded-[32px]">
              <div className="text-center w-full max-w-[430px]">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                      <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">确认驳回？</h3>
                  <div className="flex gap-3 mt-6">
                      <button onClick={() => setShowRejectConfirm(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-sm">取消</button>
                      <button onClick={() => { onReject(task.id); setShowRejectConfirm(false); }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm">确认</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
