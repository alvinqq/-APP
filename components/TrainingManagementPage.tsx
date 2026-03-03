import React, { useState } from 'react';
import {
  ArrowLeft,
  Store,
  CheckCircle,
  AlertCircle,
  Users,
  BookOpen,
  Clock,
  ChevronRight,
  Map,
  Flag,
  Zap
} from 'lucide-react';
import { UserRole } from '../types';
import TrainingTaskListPage from './TrainingTaskListPage';

interface TrainingManagementPageProps {
  onBack: () => void;
  role: UserRole;
}

interface StoreOverview {
  totalStores: number;
  normalStores: number;
  frozenStores: number;
}

interface TrainingOverview {
  // 加盟商/专员视角
  pendingTrainees?: number;
  pendingExaminees?: number;
  completedTrainees?: number;
  completedExaminees?: number;
  // 店员视角
  pendingTrainingItems?: number;
  pendingExamItems?: number;
  completedTrainingItems?: number;
  completedExamItems?: number;
}

interface LearningTask {
  id: string;
  title: string;
  type: 'video' | 'document' | 'exam';
  deadline: string;
  status: 'pending' | 'completed';
  progress: number;
  createTime: string;
}

// 判断是否为加盟商/专员视角
const isFranchiseeOrSpecialist = (role: UserRole): boolean => {
  return role === UserRole.FRANCHISEE || role === UserRole.HQ_SPECIALIST;
};

const TrainingManagementPage: React.FC<TrainingManagementPageProps> = ({ onBack, role }) => {
  const [showLearningMap, setShowLearningMap] = useState(false);
  const [showTaskList, setShowTaskList] = useState(false);
  const [taskListFilter, setTaskListFilter] = useState<'pending_training' | 'pending_exam' | 'completed' | 'all'>('all');

  // 模拟门店概览数据
  const storeOverview: StoreOverview = {
    totalStores: 15,
    normalStores: 12,
    frozenStores: 3
  };

  // 模拟训练概览数据 - 根据角色展示不同视角
  const trainingOverview: TrainingOverview = 
    isFranchiseeOrSpecialist(role)
      ? {
          // 加盟商/专员视角
          pendingTrainees: 8,
          pendingExaminees: 5,
          completedTrainees: 42,
          completedExaminees: 38
        }
      : {
          // 店员视角
          pendingTrainingItems: 3,
          pendingExamItems: 2,
          completedTrainingItems: 12,
          completedExamItems: 10
        };

  // 模拟学习地图数据 - 按创建时间排序
  const learningTasks: LearningTask[] = [
    {
      id: '1',
      title: '新品上架规范培训',
      type: 'video',
      deadline: '2026-03-10',
      status: 'completed',
      progress: 100,
      createTime: '2026-02-01'
    },
    {
      id: '2',
      title: '食品安全培训',
      type: 'document',
      deadline: '2026-03-15',
      status: 'completed',
      progress: 100,
      createTime: '2026-02-05'
    },
    {
      id: '3',
      title: '服务礼仪考核',
      type: 'exam',
      deadline: '2026-03-20',
      status: 'completed',
      progress: 100,
      createTime: '2026-02-10'
    },
    {
      id: '4',
      title: 'POS系统操作培训',
      type: 'video',
      deadline: '2026-03-25',
      status: 'pending',
      progress: 0,
      createTime: '2026-02-15'
    },
    {
      id: '5',
      title: '库存管理培训',
      type: 'document',
      deadline: '2026-03-30',
      status: 'pending',
      progress: 30,
      createTime: '2026-02-20'
    },
    {
      id: '6',
      title: '顾客服务技巧考核',
      type: 'exam',
      deadline: '2026-04-05',
      status: 'pending',
      progress: 0,
      createTime: '2026-02-25'
    }
  ].sort((a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime());

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><BookOpen size={16} className="text-blue-600" /></div>;
      case 'document':
        return <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><BookOpen size={16} className="text-green-600" /></div>;
      case 'exam':
        return <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center"><CheckCircle size={16} className="text-orange-600" /></div>;
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

  // 处理跳转到任务列表
  const handleGoToTaskList = (filter: 'pending_training' | 'pending_exam' | 'completed') => {
    setTaskListFilter(filter);
    setShowTaskList(true);
  };

  // 处理去学习
  const handleGoToStudy = (taskId: string) => {
    console.log('去学习:', taskId);
  };

  // 处理去考试
  const handleGoToExam = (taskId: string) => {
    console.log('去考试:', taskId);
  };

  // 处理查看详情
  const handleViewDetail = (taskId: string) => {
    console.log('查看详情:', taskId);
  };

  // 可视化学习地图组件
  const VisualLearningMap: React.FC = () => {
    return (
      <div className="w-full max-w-[430px] mx-auto bg-[#F8FAFC] min-h-screen flex flex-col">
        {/* 头部 */}
        <header className="bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowLearningMap(false)} className="p-1 hover:bg-gray-100 rounded-full">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-base font-bold text-gray-800">学习地图</h1>
          </div>
        </header>

        {/* 地图内容区 - 修复滚动条问题 */}
        <main className="flex-1 overflow-y-auto p-4 max-h-[calc(100vh-3.5rem)]">
          {/* 地图说明 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4">
            <div className="flex items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-1">
                <Flag size={14} className="text-green-600" />
                <span className="text-gray-600">已完成</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap size={14} className="text-orange-500 animate-pulse" />
                <span className="text-gray-600">进行中</span>
              </div>
            </div>
          </div>

          {/* 可视化任务链条 */}
          <div className="relative">
            {/* 曲线路径背景 - 修复高度问题 */}
            <svg className="absolute top-0 left-0 w-full" style={{ zIndex: 0, height: `${learningTasks.length * 100}px` }}>
              <path
                d={`M 50 30 ${learningTasks.map((_, index) => {
                  const y = 30 + index * 100;
                  const nextY = 30 + (index + 1) * 100;
                  if (index < learningTasks.length - 1) {
                    return `Q 200 ${(y + nextY) / 2} 50 ${nextY}`;
                  }
                  return '';
                }).join(' ')}`}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="3"
                strokeDasharray="8 4"
              />
              {/* 已完成路径 - 实线 */}
              <path
                d={`M 50 30 ${learningTasks.map((task, index) => {
                  if (task.status !== 'completed') return '';
                  const y = 30 + index * 100;
                  const nextY = 30 + (index + 1) * 100;
                  if (index < learningTasks.length - 1) {
                    return `Q 200 ${(y + nextY) / 2} 50 ${nextY}`;
                  }
                  return '';
                }).filter(Boolean).join(' ')}`}
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
              />
            </svg>

            {/* 任务节点 */}
            <div className="relative z-10 space-y-6">
              {learningTasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-4 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                  style={{ marginTop: index === 0 ? 0 : undefined }}
                >
                  {/* 任务卡片 */}
                  <div className={`flex-1 ${index % 2 === 0 ? 'mr-8' : 'ml-8'}`}>
                    <div className={`bg-white rounded-xl shadow-sm border-2 p-4 ${
                      task.status === 'completed' ? 'border-green-200' : 'border-orange-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        {getTypeIcon(task.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-bold text-gray-800 truncate">{task.title}</h3>
                            {task.status === 'completed' ? (
                              <Flag size={16} className="text-green-600" />
                            ) : (
                              <Zap size={16} className="text-orange-500 animate-pulse" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{getTypeLabel(task.type)}</span>
                            <span>截止: {task.deadline}</span>
                          </div>
                          {task.status === 'completed' ? (
                            <span className="text-xs text-green-600 mt-1 block">✓ 已完成</span>
                          ) : (
                            <div className="mt-2">
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div 
                                  className="bg-orange-500 h-1.5 rounded-full transition-all"
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-orange-600 mt-0.5 block">{task.progress}% 进行中</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 节点标记 */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                      task.status === 'completed' 
                        ? 'bg-gradient-to-br from-green-400 to-green-600' 
                        : 'bg-gradient-to-br from-orange-400 to-orange-600'
                    }`}>
                      {task.status === 'completed' ? (
                        <Flag size={20} className="text-white" />
                      ) : (
                        <Zap size={20} className="text-white animate-pulse" />
                      )}
                    </div>
                    {/* 序号 */}
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-800 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  </div>

                  {/* 占位符，保持布局平衡 */}
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>

          {/* 底部统计 */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-800">{learningTasks.length}</div>
                <div className="text-xs text-gray-500">总任务</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {learningTasks.filter(t => t.status === 'completed').length}
                </div>
                <div className="text-xs text-gray-500">已完成</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">
                  {learningTasks.filter(t => t.status === 'pending').length}
                </div>
                <div className="text-xs text-gray-500">进行中</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  };

  // 培训任务列表页面
  if (showTaskList) {
    return (
      <TrainingTaskListPage
        onBack={() => setShowTaskList(false)}
        initialFilter={taskListFilter}
        onGoToStudy={handleGoToStudy}
        onGoToExam={handleGoToExam}
        onViewDetail={handleViewDetail}
      />
    );
  }

  // 可视化学习地图
  if (showLearningMap) {
    return <VisualLearningMap />;
  }

  return (
    <div className="w-full max-w-[430px] mx-auto bg-[#F8FAFC] min-h-screen flex flex-col">
      {/* 头部 */}
      <header className="bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-base font-bold text-gray-800">培训管理</h1>
        </div>
      </header>

      {/* 内容区 */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 第一部分：门店概览指标 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Store size={16} className="text-blue-600" />
            门店概览指标
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-600">{storeOverview.totalStores}</div>
              <div className="text-xs text-gray-600">总门店数</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-600">{storeOverview.normalStores}</div>
              <div className="text-xs text-gray-600">正常门店</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-red-600">{storeOverview.frozenStores}</div>
              <div className="text-xs text-gray-600">冻结门店</div>
            </div>
          </div>
        </section>

        {/* 第二部分：训练概览数据 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Users size={16} className="text-orange-600" />
            训练概览
            <span className="text-xs text-gray-500 font-normal">
              ({isFranchiseeOrSpecialist(role) ? '加盟商/专员视角' : '店员视角'})
            </span>
          </h2>
          
          {isFranchiseeOrSpecialist(role) ? (
            // 加盟商/专员视角
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => handleGoToTaskList('pending_training')}
                className="bg-orange-50 rounded-lg p-3 cursor-pointer hover:bg-orange-100 transition-colors"
              >
                <div className="text-lg font-bold text-orange-600">{trainingOverview.pendingTrainees}</div>
                <div className="text-xs text-gray-600">门店待培训人数</div>
              </div>
              <div 
                onClick={() => handleGoToTaskList('pending_exam')}
                className="bg-yellow-50 rounded-lg p-3 cursor-pointer hover:bg-yellow-100 transition-colors"
              >
                <div className="text-lg font-bold text-yellow-600">{trainingOverview.pendingExaminees}</div>
                <div className="text-xs text-gray-600">待考试人数</div>
              </div>
              <div 
                onClick={() => handleGoToTaskList('completed')}
                className="bg-green-50 rounded-lg p-3 cursor-pointer hover:bg-green-100 transition-colors"
              >
                <div className="text-lg font-bold text-green-600">{trainingOverview.completedTrainees}</div>
                <div className="text-xs text-gray-600">已完成培训人数</div>
              </div>
              <div 
                onClick={() => handleGoToTaskList('completed')}
                className="bg-blue-50 rounded-lg p-3 cursor-pointer hover:bg-blue-100 transition-colors"
              >
                <div className="text-lg font-bold text-blue-600">{trainingOverview.completedExaminees}</div>
                <div className="text-xs text-gray-600">已完成考试人数</div>
              </div>
            </div>
          ) : (
            // 店员视角
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => handleGoToTaskList('pending_training')}
                className="bg-orange-50 rounded-lg p-3 cursor-pointer hover:bg-orange-100 transition-colors"
              >
                <div className="text-lg font-bold text-orange-600">{trainingOverview.pendingTrainingItems}</div>
                <div className="text-xs text-gray-600">待完成培训项数</div>
              </div>
              <div 
                onClick={() => handleGoToTaskList('pending_exam')}
                className="bg-yellow-50 rounded-lg p-3 cursor-pointer hover:bg-yellow-100 transition-colors"
              >
                <div className="text-lg font-bold text-yellow-600">{trainingOverview.pendingExamItems}</div>
                <div className="text-xs text-gray-600">待完成考试项数</div>
              </div>
              <div 
                onClick={() => handleGoToTaskList('completed')}
                className="bg-green-50 rounded-lg p-3 cursor-pointer hover:bg-green-100 transition-colors"
              >
                <div className="text-lg font-bold text-green-600">{trainingOverview.completedTrainingItems}</div>
                <div className="text-xs text-gray-600">已完成培训项数</div>
              </div>
              <div 
                onClick={() => handleGoToTaskList('completed')}
                className="bg-blue-50 rounded-lg p-3 cursor-pointer hover:bg-blue-100 transition-colors"
              >
                <div className="text-lg font-bold text-blue-600">{trainingOverview.completedExamItems}</div>
                <div className="text-xs text-gray-600">已完成考试项数</div>
              </div>
            </div>
          )}
        </section>

        {/* 第三部分：学习地图 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <button 
            onClick={() => setShowLearningMap(true)}
            className="w-full flex items-center justify-between hover:bg-gray-50 transition-colors p-2 -m-2 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Map size={16} className="text-purple-600" />
              <span className="text-sm font-bold text-gray-800">学习地图</span>
              <span className="text-xs text-gray-500">查看可视化学习路径</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        </section>
      </main>
    </div>
  );
};

export default TrainingManagementPage;