import React from 'react';
import { X, CheckCircle, Edit3, Clock, AlertCircle, Share2, Activity } from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface TaskDetailsDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (taskId: string) => void;
  onEdit: (taskId: string) => void;
}

export const TaskDetailsDrawer: React.FC<TaskDetailsDrawerProps> = ({
  task,
  isOpen,
  onClose,
  onComplete,
  onEdit,
}) => {
  if (!task && !isOpen) return null;

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
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                 <div className="w-1 h-5 bg-red-600 rounded-full"></div>
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
                      task.priority === 'high' ? 'bg-red-50 text-red-700 border-red-100' :
                      task.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-gray-50 text-gray-700 border-gray-100'
                   }`}>
                      {task.priority === 'high' ? '高优先级' : task.priority === 'medium' ? '中优先级' : '低优先级'}
                   </span>
                   <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={14} /> {task.timestamp}
                   </span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 leading-snug">{task.title}</h3>
                
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
                  <div className={`font-semibold flex items-center gap-2 ${task.status === TaskStatus.COMPLETED ? 'text-green-600' : 'text-red-600'}`}>
                     <span className={`w-2 h-2 rounded-full ${task.status === TaskStatus.COMPLETED ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {task.status === TaskStatus.PENDING ? '待处理' : 
                     task.status === TaskStatus.IN_PROGRESS ? '进行中' : 
                     task.status === TaskStatus.VERIFIED ? '已验证' : '已完成'}
                  </div>
                </div>
              </div>

              {/* Business Loop Stage Visualization */}
              {task.loopStage && (
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
              <button 
                onClick={() => onEdit(task.id)}
                className="flex-1 py-3 px-4 bg-white border-2 border-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Edit3 size={18} /> 编辑任务
              </button>
              <button 
                onClick={() => onComplete(task.id)}
                disabled={task.status === TaskStatus.COMPLETED}
                className={`flex-1 py-3 px-4 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-100 active:scale-[0.98] ${
                  task.status === TaskStatus.COMPLETED 
                  ? 'bg-green-50 text-green-600 border border-green-100 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-red-200 hover:brightness-105'
                }`}
              >
                {task.status === TaskStatus.COMPLETED ? (
                    <>
                        <CheckCircle size={18} /> 已完成
                    </>
                ) : (
                    <>
                        <CheckCircle size={18} /> 标记完成
                    </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};