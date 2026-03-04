import React from 'react';
import { 
  ArrowLeft, 
  ClipboardList, 
  ChevronRight, 
  Clock, 
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface TaskListPageProps {
  tasks: Task[];
  onBack: () => void;
  onTaskClick: (task: Task) => void;
}

export default function TaskListPage({
  tasks,
  onBack,
  onTaskClick
}: TaskListPageProps) {
  // Filter to show only pending and in-progress tasks
  const pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING: return 'bg-yellow-50 text-yellow-600';
      case TaskStatus.IN_PROGRESS: return 'bg-blue-50 text-blue-600';
      case TaskStatus.COMPLETED: return 'bg-green-50 text-green-600';
      case TaskStatus.REJECTED: return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING: return '待处理';
      case TaskStatus.IN_PROGRESS: return '处理中';
      case TaskStatus.COMPLETED: return '已完成';
      case TaskStatus.REJECTED: return '已驳回';
      default: return '未知';
    }
  };

  return (
    <div className="w-full max-w-[430px] mx-auto bg-[#F8FAFC] min-h-screen sm:my-8 sm:rounded-[32px] sm:shadow-2xl sm:border-[8px] sm:border-gray-800 relative flex flex-col font-sans no-font-scaling">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 h-14 flex items-center gap-3 sticky top-0 z-10 sm:rounded-t-[24px]">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-gray-800 text-sm flex-1">待办任务列表</h1>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {pendingTasks.length} 项待处理
        </span>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {pendingTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <ClipboardList size={48} className="mb-3 opacity-50" />
            <p className="text-sm font-medium">暂无待办任务</p>
            <p className="text-xs mt-1">您的任务列表已清空</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <ClipboardList size={16} className="text-red-600" />
                待办任务
              </h2>
            </div>
            
            <div className="divide-y divide-gray-50">
              {pendingTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onTaskClick(task)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${
                          task.priority === 'high' ? 'bg-red-500' : 
                          task.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                        }`} />
                        <h4 className="font-semibold text-sm text-gray-800">{task.title}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                          {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}优先级
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock size={12} /> {task.dueDate}</span>
                        <span className={`px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
