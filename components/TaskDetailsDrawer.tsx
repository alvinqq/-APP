import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Edit3, Clock, AlertCircle, Share2, Activity, History, Image as ImageIcon, AlertTriangle, XCircle, Check, Loader2, BrainCircuit } from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface TaskDetailsDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (taskId: string) => void;
  onEdit: (taskId: string) => void;
  onReject: (taskId: string) => void;
  onAccept: (taskId: string) => void;
  onAiVerify: (taskId: string) => void;
}

export const TaskDetailsDrawer: React.FC<TaskDetailsDrawerProps> = ({
  task,
  isOpen,
  onClose,
  onComplete,
  onEdit,
  onReject,
  onAccept,
  onAiVerify
}) => {
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Reset local state when task changes or drawer closes
  useEffect(() => {
    if (!isOpen) {
        setShowRejectConfirm(false);
        setIsVerifying(false);
    }
  }, [isOpen, task]);

  if (!task && !isOpen) return null;

  const handleVerifyClick = () => {
      if (task) {
          setIsVerifying(true);
          setTimeout(() => {
            onAiVerify(task.id);
            // We don't set setIsVerifying(false) here because the component might unmount or task status changes will trigger a re-render or effect. 
            // But to be safe and showing transition:
            setIsVerifying(false);
          }, 1500);
      }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {task && (
          <div className="flex flex-col h-full relative">
            
            {/* Rejection Confirmation Modal Overlay (Inside Drawer) */}
            {showRejectConfirm && (
                <div className="absolute inset-0 z-[80] bg-white/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-gray-100 p-6 text-center transform scale-100">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">确认驳回任务？</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            你确定要将拒绝当前任务吗？拒绝后任务状态将变更为“已拒绝”，且上游创建者将收到通知。
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowRejectConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                            >
                                取消
                            </button>
                            <button 
                                onClick={() => {
                                    onReject(task.id);
                                    setShowRejectConfirm(false);
                                }}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
                            >
                                确定驳回
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                 <div className={`w-1 h-5 rounded-full ${task.status === TaskStatus.REJECTED ? 'bg-gray-400' : 'bg-red-600'}`}></div>
                 <h2 className="text-lg font-bold text-gray-800">任务详情</h2>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 -mr-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Main Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      task.status === TaskStatus.REJECTED ? 'bg-gray-100 text-gray-500 border-gray-200' :
                      task.priority === 'high' ? 'bg-red-50 text-red-700 border-red-100' :
                      task.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-gray-50 text-gray-700 border-gray-100'
                   }`}>
                      {task.status === TaskStatus.REJECTED ? '已失效' : 
                       task.priority === 'high' ? '高优先级' : 
                       task.priority === 'medium' ? '中优先级' : '低优先级'}
                   </span>
                   <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={14} /> {task.timestamp}
                   </span>
                </div>
                
                <h3 className={`text-2xl font-bold leading-snug ${task.status === TaskStatus.REJECTED ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {task.title}
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-600 text-sm leading-relaxed">
                  {task.description}
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
                  <div className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
                    <Share2 size={14} /> 任务来源
                  </div>
                  <div className="font-semibold text-gray-800 flex items-center gap-2">
                    {task.source === 'AI_GENERATED' ? (
                        <>
                            <span className="w-2 h-2 rounded-full bg-red-600"></span>
                            AI 智能生成
                        </>
                    ) : (
                        <>
                            <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                            人工创建
                        </>
                    )}
                  </div>
                </div>
                <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
                   <div className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
                    <Activity size={14} /> 当前状态
                  </div>
                  <div className={`font-semibold flex items-center gap-2 ${
                      task.status === TaskStatus.COMPLETED ? 'text-green-600' : 
                      task.status === TaskStatus.VERIFIED ? 'text-blue-600' :
                      task.status === TaskStatus.PENDING_VERIFICATION ? 'text-orange-600' :
                      task.status === TaskStatus.REJECTED ? 'text-gray-500' :
                      'text-red-600'
                  }`}>
                     <span className={`w-2 h-2 rounded-full ${
                         task.status === TaskStatus.COMPLETED ? 'bg-green-500' : 
                         task.status === TaskStatus.VERIFIED ? 'bg-blue-500' :
                         task.status === TaskStatus.PENDING_VERIFICATION ? 'bg-orange-500' :
                         task.status === TaskStatus.REJECTED ? 'bg-gray-400' :
                         'bg-red-500'
                     }`}></span>
                    {task.status === TaskStatus.PENDING ? '待处理' : 
                     task.status === TaskStatus.IN_PROGRESS ? '进行中' : 
                     task.status === TaskStatus.PENDING_VERIFICATION ? '待验证' :
                     task.status === TaskStatus.VERIFIED ? '已验证' : 
                     task.status === TaskStatus.REJECTED ? '已拒绝' : '已完成'}
                  </div>
                </div>
              </div>

              {/* Processing Logs / History Timeline */}
              {task.logs && task.logs.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                     <History size={16} className="text-gray-400" />
                     <h4 className="font-bold text-gray-800 text-sm">处理记录</h4>
                  </div>
                  <div className="relative pl-2">
                    <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
                    <div className="space-y-6">
                      {task.logs.map((log) => (
                        <div key={log.id} className="relative pl-6">
                          {/* Timeline Dot */}
                          <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-white bg-gray-200 shadow-sm flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                             <div className="flex justify-between items-center">
                               <span className="text-sm font-semibold text-gray-700">{log.actor}</span>
                               <span className="text-xs text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded">{log.timestamp}</span>
                             </div>
                             <p className="text-sm text-gray-600 leading-relaxed bg-gray-50/50 p-2 rounded-lg border border-gray-50">
                               {log.action}
                             </p>
                             
                             {/* Attachments */}
                             {log.attachments && log.attachments.length > 0 && (
                                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                                    {log.attachments.map((src, idx) => (
                                        <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 relative group">
                                            <img src={src} alt="attachment" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <ImageIcon size={12} className="text-white" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Business Loop Stage Visualization */}
              {task.loopStage && task.status !== TaskStatus.REJECTED && (
                <div className="border border-red-100 bg-gradient-to-br from-red-50 to-orange-50 p-5 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl"></div>
                  
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <h4 className="text-sm font-bold text-red-900 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                        Task Engine 闭环进度
                    </h4>
                    <span className="text-xs font-mono text-red-600 bg-white/50 px-2 py-1 rounded">
                        Step {task.loopStage} / 7
                    </span>
                  </div>

                  <div className="relative pt-2 pb-1">
                     <div className="h-2 bg-red-200/50 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${(task.loopStage / 7) * 100}%` }}
                        ></div>
                     </div>
                     <div className="flex justify-between mt-2 text-[10px] text-red-400 font-medium">
                        <span>数据预警</span>
                        <span>效果验证</span>
                     </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-white flex gap-4">
                {task.status === TaskStatus.PENDING ? (
                    <>
                        <button 
                            onClick={() => setShowRejectConfirm(true)}
                            className="flex-1 py-3 px-4 bg-white border-2 border-gray-100 text-red-600 font-semibold rounded-xl hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <XCircle size={18} /> 驳回任务
                        </button>
                        <button 
                            onClick={() => onAccept(task.id)}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <Check size={18} /> 接收任务
                        </button>
                    </>
                ) : task.status === TaskStatus.REJECTED ? (
                    <button 
                        disabled
                        className="w-full py-3 px-4 bg-gray-100 border border-gray-200 text-gray-400 font-semibold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                        <XCircle size={18} /> 任务已驳回
                    </button>
                ) : task.status === TaskStatus.PENDING_VERIFICATION ? (
                    <button 
                        onClick={handleVerifyClick}
                        disabled={isVerifying}
                        className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
                    >
                        {isVerifying ? <Loader2 size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
                        AI 验证结果
                    </button>
                ) : task.status === TaskStatus.IN_PROGRESS ? (
                    <button 
                        onClick={() => onEdit(task.id)}
                        className="w-full py-3 px-4 bg-white border-2 border-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <Edit3 size={18} /> 执行任务
                    </button>
                ) : (
                    // Completed or Verified
                     <button 
                        disabled
                        className="w-full py-3 px-4 bg-green-50 text-green-600 border border-green-100 font-semibold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                        <CheckCircle size={18} /> 已完成
                    </button>
                )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};