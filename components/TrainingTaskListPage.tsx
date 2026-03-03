import React, { useState } from 'react';
import {
  ArrowLeft,
  Filter,
  BookOpen,
  CheckCircle,
  Clock,
  ChevronRight,
  Play,
  FileText,
  Award
} from 'lucide-react';

interface TrainingTask {
  id: string;
  title: string;
  type: 'video' | 'document' | 'exam';
  status: 'pending_training' | 'pending_exam' | 'completed';
  deadline: string;
  progress: number;
  description?: string;
}

interface TrainingTaskListPageProps {
  onBack: () => void;
  initialFilter?: 'pending_training' | 'pending_exam' | 'completed' | 'all';
  onGoToStudy?: (taskId: string) => void;
  onGoToExam?: (taskId: string) => void;
  onViewDetail?: (taskId: string) => void;
}

type TaskStatusFilter = 'all' | 'pending_training' | 'pending_exam' | 'completed';

const TrainingTaskListPage: React.FC<TrainingTaskListPageProps> = ({
  onBack,
  initialFilter = 'all',
  onGoToStudy,
  onGoToExam,
  onViewDetail
}) => {
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>(initialFilter);
  const [selectedTask, setSelectedTask] = useState<TrainingTask | null>(null);

  // 模拟培训任务数据
  const trainingTasks: TrainingTask[] = [
    {
      id: '1',
      title: '新品上架规范培训',
      type: 'video',
      status: 'pending_training',
      deadline: '2026-03-10',
      progress: 0,
      description: '学习新品上架的标准流程和注意事项'
    },
    {
      id: '2',
      title: '食品安全培训',
      type: 'document',
      status: 'pending_training',
      deadline: '2026-03-15',
      progress: 30,
      description: '食品安全法规和操作规范'
    },
    {
      id: '3',
      title: '服务礼仪考核',
      type: 'exam',
      status: 'pending_exam',
      deadline: '2026-03-20',
      progress: 0,
      description: '服务礼仪知识考试，满分100分，80分及格'
    },
    {
      id: '4',
      title: 'POS系统操作培训',
      type: 'video',
      status: 'pending_training',
      deadline: '2026-03-25',
      progress: 0,
      description: 'POS系统基础操作和常见问题处理'
    },
    {
      id: '5',
      title: '库存管理培训',
      type: 'document',
      status: 'completed',
      deadline: '2026-02-28',
      progress: 100,
      description: '库存盘点和报损流程'
    },
    {
      id: '6',
      title: '顾客服务技巧考核',
      type: 'exam',
      status: 'completed',
      deadline: '2026-02-20',
      progress: 100,
      description: '顾客服务场景应对考试'
    }
  ];

  const filteredTasks = trainingTasks.filter(task => {
    if (statusFilter === 'all') return true;
    return task.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_training':
        return <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">待培训</span>;
      case 'pending_exam':
        return <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">待考试</span>;
      case 'completed':
        return <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">已完成</span>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Play size={18} className="text-blue-600" /></div>;
      case 'document':
        return <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><FileText size={18} className="text-green-600" /></div>;
      case 'exam':
        return <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><Award size={18} className="text-orange-600" /></div>;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return '视频';
      case 'document':
        return '文档';
      case 'exam':
        return '考试';
      default:
        return type;
    }
  };

  const getActionButton = (task: TrainingTask) => {
    if (task.status === 'completed') {
      return (
        <button
          onClick={() => onViewDetail && onViewDetail(task.id)}
          className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium"
        >
          查看详情
        </button>
      );
    } else if (task.status === 'pending_exam' || (task.status === 'pending_training' && task.type === 'exam')) {
      return (
        <button
          onClick={() => onGoToExam && onGoToExam(task.id)}
          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full font-medium"
        >
          去考试
        </button>
      );
    } else {
      return (
        <button
          onClick={() => onGoToStudy && onGoToStudy(task.id)}
          className="text-xs bg-orange-600 text-white px-3 py-1.5 rounded-full font-medium"
        >
          去学习
        </button>
      );
    }
  };

  // 任务详情弹窗
  if (selectedTask) {
    return (
      <div className="w-full max-w-[430px] mx-auto bg-[#F8FAFC] min-h-screen flex flex-col">
        {/* 头部 */}
        <header className="bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedTask(null)} className="p-1 hover:bg-gray-100 rounded-full">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-base font-bold text-gray-800">任务详情</h1>
          </div>
        </header>

        {/* 详情内容 */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-start gap-3 mb-4">
              {getTypeIcon(selectedTask.type)}
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-800 mb-1">{selectedTask.title}</h2>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedTask.status)}
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{getTypeLabel(selectedTask.type)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={14} className="text-gray-400" />
                <span>截止时间: {selectedTask.deadline}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BookOpen size={14} className="text-gray-400" />
                <span>任务描述</span>
              </div>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                {selectedTask.description}
              </p>
            </div>

            {selectedTask.status !== 'completed' && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>学习进度</span>
                  <span>{selectedTask.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${selectedTask.progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {selectedTask.status === 'completed' ? (
                <button
                  onClick={() => setSelectedTask(null)}
                  className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-medium"
                >
                  返回列表
                </button>
              ) : selectedTask.status === 'pending_exam' || (selectedTask.status === 'pending_training' && selectedTask.type === 'exam') ? (
                <>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-medium"
                  >
                    返回列表
                  </button>
                  <button
                    onClick={() => onGoToExam && onGoToExam(selectedTask.id)}
                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium"
                  >
                    去考试
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-medium"
                  >
                    返回列表
                  </button>
                  <button
                    onClick={() => onGoToStudy && onGoToStudy(selectedTask.id)}
                    className="flex-1 bg-orange-600 text-white py-2.5 rounded-xl font-medium"
                  >
                    去学习
                  </button>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[430px] mx-auto bg-[#F8FAFC] min-h-screen flex flex-col">
      {/* 头部 */}
      <header className="bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-base font-bold text-gray-800">培训任务列表</h1>
        </div>
      </header>

      {/* 筛选栏 */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setStatusFilter('pending_training')}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                statusFilter === 'pending_training'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              待培训
            </button>
            <button
              onClick={() => setStatusFilter('pending_exam')}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                statusFilter === 'pending_exam'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              待考试
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                statusFilter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              已完成
            </button>
          </div>
        </div>
      </div>

      {/* 任务列表 */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div 
              key={task.id} 
              onClick={() => setSelectedTask(task)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                {getTypeIcon(task.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-gray-800 truncate">{task.title}</h3>
                    {getStatusBadge(task.status)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{getTypeLabel(task.type)}</span>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>截止: {task.deadline}</span>
                    </div>
                  </div>
                  {task.status !== 'completed' && (
                    <div className="mb-2">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {task.status === 'completed' ? '已完成' : `进度 ${task.progress}%`}
                    </span>
                    <div onClick={(e) => e.stopPropagation()}>
                      {getActionButton(task)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <BookOpen size={48} className="mb-4 opacity-30" />
            <p className="text-sm">暂无相关任务</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default TrainingTaskListPage;