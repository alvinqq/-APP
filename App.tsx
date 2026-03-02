import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Store, 
  Building2, 
  Bell, 
  Search, 
  Menu,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Sparkles,
  ClipboardList,
  Check,
  Coffee,
  Sun,
  Utensils,
  Map,
  PieChart,
  Target,
  User,
  Briefcase,
  Users,
  XCircle,
  Calendar,
  Home,
  MessageSquare,
  Clock,
  X
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

import { UserRole, Task, TaskStatus, ExceptionAlert, TaskActionLog } from './types';
import { ProcessFlow } from './components/ProcessFlow';
import { AIAssistant } from './components/AIAssistant';
import { TaskDetailsDrawer } from './components/TaskDetailsDrawer';
import { ExceptionAlertModule } from './components/ExceptionAlertModule';
import { TaskEditModal } from './components/TaskEditModal';
import { TaskCreateModal } from './components/TaskCreateModal';
import TrainingStudyPage from './components/TrainingStudyPage';
import TrainingExamPage from './components/TrainingExamPage';

// --- MOCK DATA GENERATORS ---

const GENERATE_HOURLY_DATA = (base: number) => [
  { name: '08:00', value: base * 0.2, traffic: 45 },
  { name: '10:00', value: base * 0.5, traffic: 120 },
  { name: '12:00', value: base * 1.0, traffic: 340 },
  { name: '14:00', value: base * 0.7, traffic: 180 },
  { name: '16:00', value: base * 0.6, traffic: 160 },
  { name: '18:00', value: base * 1.2, traffic: 420 },
];

const GENERATE_WEEKLY_DATA = (base: number) => [
  { name: 'Mon', value: base * 0.9, compliance: 92 },
  { name: 'Tue', value: base * 0.85, compliance: 94 },
  { name: 'Wed', value: base * 0.95, compliance: 91 },
  { name: 'Thu', value: base * 1.0, compliance: 95 },
  { name: 'Fri', value: base * 1.2, compliance: 89 },
  { name: 'Sat', value: base * 1.4, compliance: 88 },
  { name: 'Sun', value: base * 1.3, compliance: 93 },
];

const TODAY = new Date().toISOString().split('T')[0];

// Helper to check if date is today or tomorrow
const isDueSoon = (dateStr?: string) => {
  if (!dateStr) return false;
  
  const today = new Date();
  const due = new Date(dateStr);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const dueStr = due.toISOString().split('T')[0];

  return dueStr === todayStr || dueStr === tomorrowStr;
};

// --- ROLE CONFIGURATION ---

const ROLE_LABELS = {
  [UserRole.STORE_ASSISTANT]: { label: '店员', group: '门店', icon: User },
  [UserRole.FRANCHISEE]: { label: '加盟商', group: '门店', icon: Store },
  [UserRole.HQ_SPECIALIST]: { label: '专员', group: '总部', icon: Briefcase },
  [UserRole.HQ_MARKET_MANAGER]: { label: '经理', group: '总部', icon: Map },
  [UserRole.HQ_EXECUTIVE]: { label: '管理', group: '总部', icon: Building2 },
};

// --- DATA MAPPING BY ROLE ---
// (Kept same as before)
const TASKS_BY_ROLE: Record<UserRole, Task[]> = {
  [UserRole.STORE_ASSISTANT]: [
    { 
      id: 'sa-1', 
      title: '早班开市SOP', 
      description: '完成前厅桌椅摆放与地面清洁', 
      priority: 'high', 
      status: TaskStatus.PENDING, 
      timestamp: '07:50', 
      dueDate: TODAY,
      source: 'MANUAL', 
      loopStage: 0,
      logs: [
        { id: 'l1', actor: '系统', timestamp: '07:50', action: '任务自动派发' }
      ]
    },
    { 
      id: 'sa-2', 
      title: '冷柜温度检查', 
      description: '记录早班冷柜温度，确保在 2-6°C 之间', 
      priority: 'medium', 
      status: TaskStatus.IN_PROGRESS, 
      timestamp: '08:10', 
      dueDate: TODAY,
      source: 'AI_GENERATED', 
      loopStage: 5,
      logs: [
        { id: 'l2-1', actor: 'AI助手', timestamp: '08:10', action: '基于IoT数据异常生成任务' },
        { id: 'l2-2', actor: '李店员', timestamp: '08:15', action: '开始执行检查' }
      ]
    },
    { 
      id: 'sa-3', 
      title: '物料效期核查', 
      description: '检查后厨半成品效期标签', 
      priority: 'low', 
      status: TaskStatus.PENDING, 
      timestamp: '14:00',
      dueDate: TODAY, 
      source: 'MANUAL', 
      loopStage: 0,
      logs: [
        { id: 'l3', actor: '张店长', timestamp: '14:00', action: '下发周期性检查任务' }
      ]
    },
  ],
  [UserRole.FRANCHISEE]: [
    { 
      id: 'f-1', 
      title: '待盘点', 
      description: '完成月末库存盘点，重点核对临期商品', 
      priority: 'high', 
      status: TaskStatus.PENDING, 
      timestamp: '09:00', 
      dueDate: TODAY,
      source: 'AI_GENERATED', 
      loopStage: 4,
      logs: [
        { id: 'f1-1', actor: '系统', timestamp: '08:55', action: '触发月末盘点提醒' },
        { id: 'f1-2', actor: 'AI助手', timestamp: '09:00', action: '生成盘点清单' }
      ]
    },
    { 
      id: 'f-2', 
      title: '待报货', 
      description: '确认明日核心冻品订货量（牛肉、蔬菜）', 
      priority: 'high', 
      status: TaskStatus.PENDING, 
      timestamp: '10:30', 
      dueDate: TODAY,
      source: 'AI_GENERATED', 
      loopStage: 5,
      logs: [
        { id: 'f2-1', actor: '供应链系统', timestamp: '10:30', action: '检测到库存低于安全线' },
        { id: 'f2-2', actor: 'AI助手', timestamp: '10:35', action: '生成补货建议' }
      ]
    },
    { 
      id: 'f-3', 
      title: '待审核', 
      description: '审核下周店员排班计划', 
      priority: 'medium', 
      status: TaskStatus.IN_PROGRESS, 
      timestamp: '14:00', 
      dueDate: TODAY,
      source: 'MANUAL', 
      loopStage: 0,
      logs: [
        { id: 'f3-1', actor: '系统', timestamp: '14:00', action: '收到店长提交的排班申请' }
      ]
    },
    { 
      id: 'f-4', 
      title: '待进件', 
      description: '处理新设备采购申请（收银机升级）', 
      priority: 'medium', 
      status: TaskStatus.PENDING, 
      timestamp: '16:00', 
      dueDate: TODAY,
      source: 'MANUAL', 
      loopStage: 0,
      logs: [
        { id: 'f4-1', actor: '系统', timestamp: '16:00', action: '收到设备采购申请' }
      ]
    },
  ],
  [UserRole.HQ_SPECIALIST]: [
    { id: 'hs-1', title: '门店工单处理 (ID: 9527)', description: '协助处理上海南京路店POS机故障报修', priority: 'high', status: TaskStatus.IN_PROGRESS, timestamp: '08:45', dueDate: TODAY, source: 'MANUAL', loopStage: 0, logs: [] },
    { id: 'hs-2', title: '新品物料配送追踪', description: '追踪“藤椒系列”物料在华东仓的入库情况', priority: 'medium', status: TaskStatus.PENDING, timestamp: '09:30', dueDate: TODAY, source: 'AI_GENERATED', loopStage: 2, logs: [] },
  ],
  [UserRole.HQ_MARKET_MANAGER]: [
    { id: 'mm-1', title: '华南区合规巡检', description: '本周重点巡检广州天河区 5 家 B 类门店', priority: 'high', status: TaskStatus.PENDING, timestamp: '09:00', dueDate: TODAY, source: 'AI_GENERATED', loopStage: 5, logs: [] },
    { id: 'mm-2', title: '区域月度经营会议', description: '准备华东区 10 月份经营分析报告', priority: 'medium', status: TaskStatus.PENDING, timestamp: '14:00', dueDate: TODAY, source: 'MANUAL', loopStage: 0, logs: [] },
  ],
  [UserRole.HQ_EXECUTIVE]: [
    { id: 'he-1', title: 'Q4 战略目标调整', description: '基于 Q3 财报数据，审批市场部提交的 Q4 预算调整案', priority: 'high', status: TaskStatus.PENDING, timestamp: '10:00', dueDate: TODAY, source: 'AI_GENERATED', loopStage: 3, logs: [] },
    { id: 'he-2', title: '食品安全危机预案演练', description: '发起全集团食品安全应急响应测试', priority: 'low', status: TaskStatus.VERIFIED, timestamp: '16:00', dueDate: TODAY, source: 'MANUAL', loopStage: 0, logs: [] },
  ]
};

const OPENING_STEPS = [
  { id: 1, label: '人员健康监测', time: '08:00', icon: CheckCircle },
  { id: 2, label: '设备运行自检', time: '08:15', icon: Coffee },
  { id: 3, label: '核心物料盘点', time: '08:30', icon: Utensils },
  { id: 4, label: '环境卫生验收', time: '08:45', icon: Sparkles },
  { id: 5, label: '开市营业打卡', time: '09:00', icon: Store },
];

const MOCK_ALERTS: ExceptionAlert[] = [
  {
    id: 'alert-001',
    title: '临期商品预警',
    severity: 'high',
    timestamp: '11:30',
    status: 'new',
    attribution: '系统检测到 3 批次商品即将到期（3天内），涉及金额约 ¥2,800。建议优先促销或申请退货处理。',
    recommendedTask: '临期商品盘点与促销方案制定',
    assignedTo: '王小明 (店长)',
    progress: 0,
    resultSummary: ''
  },
  {
    id: 'alert-002',
    title: '销售额异常下滑',
    severity: 'high',
    timestamp: '10:15',
    status: 'new',
    attribution: '本周销售额同比上周下降 18%，主要受雨天影响及竞品促销活动冲击。AI 建议调整午市套餐定价策略。',
    recommendedTask: '制定促销活动应对方案',
    assignedTo: '张伟 (值班)',
    progress: 0,
    resultSummary: ''
  },
  {
    id: 'alert-003',
    title: '毛利率异常下滑',
    severity: 'high',
    timestamp: '09:45',
    status: 'pending_verification',
    attribution: '昨日毛利率 42.3%，低于目标值 48%。主要原因为高毛利套餐销量占比下降 15%。',
    recommendedTask: '调整产品结构与促销策略',
    assignedTo: '李明 (运营)',
    progress: 80,
    resultSummary: '已调整套餐组合，今日数据待验证'
  },
  {
    id: 'alert-004',
    title: '库存不足预警',
    severity: 'medium',
    timestamp: '08:30',
    status: 'processing',
    attribution: '核心食材（牛肉、蔬菜）库存低于安全库存线 20%，预计 2 天后断货。建议立即发起补货申请。',
    recommendedTask: '发起紧急补货申请',
    assignedTo: '王芳 (采购)',
    progress: 60,
    resultSummary: ''
  }
];

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, trend, subtext, highlight = false }: { title: string, value: string, trend?: string, subtext?: string, highlight?: boolean }) => (
  <div className={`p-3.5 rounded-xl border transition-all duration-200 hover:shadow-md min-h-[88px] flex flex-col justify-between ${highlight ? 'bg-gradient-to-br from-red-600 to-red-700 text-white border-transparent shadow-lg shadow-red-200/50' : 'bg-white border-gray-100 hover:border-red-200'}`}>
    <div className="flex justify-between items-start">
      <h3 className={`text-xs font-medium ${highlight ? 'text-red-100' : 'text-gray-500'}`}>{title}</h3>
      {trend && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
          trend === 'neutral'
             ? (highlight ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600')
             : trend.startsWith('+') 
                ? (highlight ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700')
                : (highlight ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700')
        }`}>
          {trend}
        </span>
      )}
    </div>
    <div className="text-lg font-bold">{value}</div>
    {subtext && <div className={`text-[10px] ${highlight ? 'text-red-200' : 'text-gray-400'}`}>{subtext}</div>}
  </div>
);

const DualStatCard = ({ value1, label1, value2, label2 }: { value1: string, label1: string, value2: string, label2: string }) => (
  <div className="p-3.5 rounded-xl border border-gray-100 bg-white transition-all duration-200 hover:shadow-md hover:border-red-200 min-h-[88px]">
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></div>
          <span className="text-xs text-gray-600 truncate">{label1}</span>
        </div>
        <span className="text-sm font-bold text-gray-800 whitespace-nowrap">{value1}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
          <span className="text-xs text-gray-600 truncate">{label2}</span>
        </div>
        <span className="text-sm font-bold text-gray-800 whitespace-nowrap">{value2}</span>
      </div>
    </div>
  </div>
);

interface TaskItemProps {
  task: Task;
  onClick: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onClick }) => {
  const dueSoon = (task.status === TaskStatus.PENDING || task.status === TaskStatus.IN_PROGRESS) && isDueSoon(task.dueDate);

  return (
    <div onClick={onClick} className={`flex items-start p-3 bg-white border rounded-xl active:bg-gray-50 cursor-pointer group transition-colors ${task.status === TaskStatus.REJECTED ? 'border-red-100 opacity-70' : dueSoon ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100'}`}>
      <div className={`w-1.5 h-1.5 mt-2 rounded-full mr-3 flex-shrink-0 ${
        task.status === TaskStatus.REJECTED ? 'bg-gray-300' :
        task.priority === 'high' ? 'bg-red-500' : 
        task.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
      }`} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5">
          <h4 className={`font-semibold text-sm truncate pr-2 ${task.status === TaskStatus.REJECTED ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{task.title}</h4>
          <span className="text-[10px] text-gray-400 whitespace-nowrap">{task.timestamp}</span>
        </div>
        <p className="text-xs text-gray-500 line-clamp-1 mb-2">{task.description}</p>
        <div className="flex flex-wrap items-center gap-2">
          {task.source === 'AI_GENERATED' && (
            <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded flex items-center gap-1">
              <Store size={10} /> AI
            </span>
          )}
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
            task.status === TaskStatus.COMPLETED ? 'bg-green-100 text-green-700' : 
            task.status === TaskStatus.VERIFIED ? 'bg-blue-100 text-blue-700' :
            task.status === TaskStatus.PENDING_VERIFICATION ? 'bg-orange-100 text-orange-700' :
            task.status === TaskStatus.REJECTED ? 'bg-gray-100 text-gray-500' :
            'bg-gray-100 text-gray-600'
          }`}>
            {task.status === TaskStatus.PENDING ? '待处理' : 
              task.status === TaskStatus.IN_PROGRESS ? '进行中' : 
              task.status === TaskStatus.PENDING_VERIFICATION ? '待验证' : 
              task.status === TaskStatus.VERIFIED ? '已验证' : 
              task.status === TaskStatus.REJECTED ? '已拒绝' : '已完成'}
          </span>
            {task.dueDate && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${dueSoon ? 'bg-orange-100 text-orange-700 font-semibold' : 'bg-gray-50 text-gray-500'}`}>
                  <Calendar size={10} /> 
                  {dueSoon ? '即将到期' : new Date(task.dueDate).toLocaleDateString(undefined, {month: 'numeric', day: 'numeric'})}
              </span>
          )}
        </div>
      </div>
      {dueSoon && (
        <div className="ml-2 mt-2 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
      )}
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [role, setRole] = useState<UserRole>(UserRole.FRANCHISEE);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeLoopStage, setActiveLoopStage] = useState(0); 
  const [simulateLoop, setSimulateLoop] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openingStep, setOpeningStep] = useState(2); 
  const [alerts, setAlerts] = useState<ExceptionAlert[]>(MOCK_ALERTS);
  const [taskFilter, setTaskFilter] = useState<'active' | 'completed'>('active');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [showDueWarning, setShowDueWarning] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [currentTrainingPage, setCurrentTrainingPage] = useState<'study' | 'exam' | null>(null);
  const [currentTrainingId, setCurrentTrainingId] = useState<string>('');
  const [trainingProgress, setTrainingProgress] = useState<Record<string, { studyCompleted: boolean; examCompleted: boolean; examScore?: number }>>({
    'training-1': { studyCompleted: false, examCompleted: false },
    'training-2': { studyCompleted: false, examCompleted: false },
  });

  // Switch tasks when role changes
  useEffect(() => {
    setTasks(TASKS_BY_ROLE[role] || []);
    setSimulateLoop(false);
    setActiveLoopStage(0);
    setTaskFilter('active'); // Reset filter on role change
  }, [role]);

  // Check for Due Soon tasks
  useEffect(() => {
    // Only check active tasks
    const activeTasks = tasks.filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS);
    const hasUrgentTasks = activeTasks.some(t => isDueSoon(t.dueDate));

    if (hasUrgentTasks) {
      setShowDueWarning(true);
      // Auto hide notification after 5 seconds to be subtle
      const timer = setTimeout(() => setShowDueWarning(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowDueWarning(false);
    }
  }, [tasks]);

  // Simulation for the "Closed Loop" Process
  useEffect(() => {
    if (simulateLoop) {
      let stage = 1;
      setActiveLoopStage(stage);
      const interval = setInterval(() => {
        stage++;
        if (stage > 7) {
          clearInterval(interval);
          setSimulateLoop(false);
          setActiveLoopStage(0);
          addTask({title: "AI预警优化完成"});
        } else {
          setActiveLoopStage(stage);
        }
      }, 2000); 
      return () => clearInterval(interval);
    }
  }, [simulateLoop]);

  const addTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title || '新任务',
      description: taskData.description || 'AI助手自动生成的任务项。',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      status: TaskStatus.PENDING,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      source: taskData.source || 'AI_GENERATED',
      loopStage: taskData.source === 'AI_GENERATED' ? 5 : 0,
      logs: [
        { 
          id: Date.now().toString() + '-log', 
          actor: taskData.source === 'AI_GENERATED' ? 'AI助手' : '当前用户', 
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
          action: taskData.source === 'AI_GENERATED' ? '基于预警规则自动生成任务' : '创建了新任务' 
        }
      ]
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const triggerDataAlert = () => {
    setSimulateLoop(true);
  };

  const handleTaskComplete = (taskId: string) => {
    const completionLog: TaskActionLog = {
        id: Date.now().toString(),
        actor: '当前用户',
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        action: '确认执行并标记任务完成'
    };

    setTasks(prev => prev.map(t => 
      t.id === taskId ? { 
          ...t, 
          status: TaskStatus.COMPLETED,
          logs: [...(t.logs || []), completionLog]
      } : t
    ));
    setSelectedTask(prev => prev && prev.id === taskId ? { ...prev, status: TaskStatus.COMPLETED, logs: [...(prev.logs || []), completionLog] } : prev);
  };

  const handleTaskReject = (taskId: string) => {
    const rejectLog: TaskActionLog = {
        id: Date.now().toString(),
        actor: '当前用户',
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        action: '拒绝了任务（任务已驳回）'
    };
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: TaskStatus.REJECTED, logs: [...(t.logs || []), rejectLog] } : t));
    setSelectedTask(prev => prev && prev.id === taskId ? { ...prev, status: TaskStatus.REJECTED, logs: [...(prev.logs || []), rejectLog] } : prev);
  };

  const handleTaskAccept = (taskId: string) => {
    const acceptLog: TaskActionLog = {
        id: Date.now().toString(),
        actor: '当前用户',
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        action: '接收了任务，开始执行'
    };
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: TaskStatus.IN_PROGRESS, logs: [...(t.logs || []), acceptLog] } : t));
    setSelectedTask(prev => prev && prev.id === taskId ? { ...prev, status: TaskStatus.IN_PROGRESS, logs: [...(prev.logs || []), acceptLog] } : prev);
  };

  const handleTaskEdit = (taskId: string) => {
    setIsEditModalOpen(true);
  };

  const handleTaskUpdate = (taskId: string, actionText: string, attachments: string[], newStatus: TaskStatus, newDueDate?: string) => {
    const newLog: TaskActionLog = {
      id: Date.now().toString(),
      actor: '当前用户',
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      action: `完成任务处理: ${actionText}` + (newDueDate ? ` (截止日期更新为 ${newDueDate})` : ''),
      attachments: attachments
    };

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus, dueDate: newDueDate || t.dueDate, loopStage: (t.loopStage && t.loopStage > 0) ? 6 : t.loopStage, logs: [...(t.logs || []), newLog] } : t));
    setSelectedTask(prev => prev && prev.id === taskId ? { ...prev, status: newStatus, dueDate: newDueDate || prev.dueDate, loopStage: (prev.loopStage && prev.loopStage > 0) ? 6 : prev.loopStage, logs: [...(prev.logs || []), newLog] } : prev);
  };

  const handleAiVerify = (taskId: string) => {
    const isPass = Math.random() > 0.2; 
    const verificationLog: TaskActionLog = {
        id: Date.now().toString(),
        actor: 'AI鉴赏家',
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        action: isPass ? 'AI视觉验证通过：任务完成质量符合标准 (Confidence: 98%)' : 'AI视觉验证不通过：现场照片模糊或未达到SOP要求，已驳回重新处理。'
    };

    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const newStage = (t.loopStage && t.loopStage > 0) ? (isPass ? 7 : 5) : t.loopStage;
      return { ...t, status: isPass ? TaskStatus.COMPLETED : TaskStatus.PENDING, loopStage: newStage, logs: [...(t.logs || []), verificationLog] };
    }));

    setSelectedTask(prev => {
        if (prev && prev.id === taskId) {
            const newStage = (prev.loopStage && prev.loopStage > 0) ? (isPass ? 7 : 5) : prev.loopStage;
            return { ...prev, status: isPass ? TaskStatus.COMPLETED : TaskStatus.PENDING, loopStage: newStage, logs: [...(prev.logs || []), verificationLog] };
        }
        return prev;
    });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as UserRole);
  };

  const handleAssignTask = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'assigned', progress: 0 } : a));
    const alertItem = alerts.find(a => a.id === alertId);
    if (alertItem) addTask({title: `[异常处理] ${alertItem.recommendedTask}`});

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setAlerts(prev => prev.map(a => {
         if (a.id !== alertId) return a;
         if (progress === 20 && a.status === 'assigned') return { ...a, status: 'processing', progress };
         if (progress < 100) return { ...a, progress };
         clearInterval(interval);
         return { ...a, status: 'pending_verification', progress: 100, resultSummary: '已完成物料补充，更换了展示牌。' };
      }));
    }, 1500);
  };

  const handleVerifyAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved' } : a));
  };

  const chartData = (role === UserRole.STORE_ASSISTANT || role === UserRole.FRANCHISEE) 
    ? GENERATE_HOURLY_DATA(role === UserRole.FRANCHISEE ? 5000 : 3000)
    : GENERATE_WEEKLY_DATA(role === UserRole.HQ_EXECUTIVE ? 1000000 : 500000);

  const handleTrainingStudyComplete = () => {
    setTrainingProgress((prev) => ({
      ...prev,
      [currentTrainingId]: { ...prev[currentTrainingId], studyCompleted: true }
    }));
    setCurrentTrainingPage(null);
  };

  const handleTrainingExamComplete = (score: number, passed: boolean) => {
    setTrainingProgress((prev) => ({
      ...prev,
      [currentTrainingId]: { ...prev[currentTrainingId], examCompleted: passed, examScore: score }
    }));
    setCurrentTrainingPage(null);
  };

  const handleTrainingBack = () => {
    setCurrentTrainingPage(null);
  };

  if (currentTrainingPage) {
    if (currentTrainingPage === 'study') {
      const trainingData = {
        'training-1': { title: '新品上架规范培训', type: 'video' as const, contentUrl: '' },
        'training-2': { title: '食品安全培训', type: 'document' as const, contentUrl: '' }
      };
      const data = trainingData[currentTrainingId as keyof typeof trainingData];
      return (
        <TrainingStudyPage
          trainingId={currentTrainingId}
          title={data.title}
          type={data.type}
          contentUrl={data.contentUrl}
          onComplete={handleTrainingStudyComplete}
          onBack={handleTrainingBack}
        />
      );
    } else if (currentTrainingPage === 'exam') {
      const examData = {
        'training-1': {
          title: '新品上架规范考核',
          questions: [
            {
              id: 'q1',
              type: 'single' as const,
              question: '新品上架前需要检查哪些内容？',
              options: ['商品包装完整性', '生产日期', '商品质量', '以上都是'],
              required: true,
              correctAnswer: '以上都是',
              score: 25
            },
            {
              id: 'q2',
              type: 'multiple' as const,
              question: '新品上架的注意事项包括哪些？（多选）',
              options: ['及时更新价格标签', '摆放位置合理', '保持商品清洁', '随意摆放即可'],
              required: true,
              correctAnswer: ['及时更新价格标签', '摆放位置合理', '保持商品清洁'],
              score: 25
            },
            {
              id: 'q3',
              type: 'single' as const,
              question: '发现商品质量问题应该怎么办？',
              options: ['立即下架', '继续销售', '等待上级指示', '打折处理'],
              required: true,
              correctAnswer: '立即下架',
              score: 25
            },
            {
              id: 'q4',
              type: 'text' as const,
              question: '请简述新品上架的标准流程。',
              required: true,
              score: 25
            }
          ]
        },
        'training-2': {
          title: '食品安全考核',
          questions: [
            {
              id: 'q1',
              type: 'single' as const,
              question: '食品储存温度应该控制在多少度以下？',
              options: ['4°C', '8°C', '10°C', '12°C'],
              required: true,
              correctAnswer: '4°C',
              score: 25
            },
            {
              id: 'q2',
              type: 'multiple' as const,
              question: '食品安全管理包括哪些方面？（多选）',
              options: ['人员卫生', '环境卫生', '设备清洁', '以上都是'],
              required: true,
              correctAnswer: ['人员卫生', '环境卫生', '设备清洁'],
              score: 25
            },
            {
              id: 'q3',
              type: 'single' as const,
              question: '发现过期食品应该怎么办？',
              options: ['立即下架并销毁', '打折销售', '继续销售', '等待检查'],
              required: true,
              correctAnswer: '立即下架并销毁',
              score: 25
            },
            {
              id: 'q4',
              type: 'text' as const,
              question: '请简述食品安全检查的要点。',
              required: true,
              score: 25
            }
          ]
        }
      };
      const data = examData[currentTrainingId as keyof typeof examData];
      return (
        <TrainingExamPage
          examId={currentTrainingId}
          title={data.title}
          questions={data.questions}
          passingScore={80}
          onComplete={handleTrainingExamComplete}
          onBack={handleTrainingBack}
        />
      );
    }
  }

  return (
    <div className="w-full max-w-[430px] mx-auto bg-[#F8FAFC] min-h-screen sm:my-8 sm:rounded-[32px] sm:shadow-2xl sm:border-[8px] sm:border-gray-800 relative flex flex-col font-sans no-font-scaling">
      
      {/* --- IN-APP NOTIFICATION TOAST --- */}
      {showDueWarning && (
        <div className="absolute top-16 left-4 right-4 z-50 bg-orange-500 text-white p-3 rounded-xl shadow-lg shadow-orange-200 animate-in slide-in-from-top-4 duration-300 flex items-start gap-3">
          <div className="bg-white/20 p-1.5 rounded-full">
            <Clock size={16} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm">任务临期提醒</h4>
            <p className="text-xs text-orange-50 mt-0.5">你有待办任务将在 24 小时内截止，请及时处理。</p>
          </div>
          <button 
            onClick={() => setShowDueWarning(false)} 
            className="text-white/60 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* --- FIXED HEADER --- */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 z-30 sticky top-0 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-red-200">绝</div>
           <div className="flex flex-col">
             <span className="text-sm font-bold text-gray-900 leading-tight">绝知APP</span>
             <span className="text-[10px] text-gray-400">V4.1 移动版</span>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           {/* Compact Role Switcher */}
           <div className="relative">
              <select 
                value={role} 
                onChange={handleRoleChange}
                className="w-24 bg-gray-100 rounded-full text-[10px] font-medium text-gray-700 py-1 pl-2 pr-6 appearance-none focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <optgroup label="门店">
                  <option value={UserRole.STORE_ASSISTANT}>店员</option>
                  <option value={UserRole.FRANCHISEE}>加盟商</option>
                </optgroup>
                <optgroup label="总部">
                  <option value={UserRole.HQ_SPECIALIST}>专员</option>
                  <option value={UserRole.HQ_MARKET_MANAGER}>经理</option>
                  <option value={UserRole.HQ_EXECUTIVE}>高管</option>
                </optgroup>
              </select>
              <ChevronDown className="absolute right-2 top-1.5 text-gray-500 pointer-events-none" size={12} />
           </div>

           <button className="relative text-gray-500">
             <Bell size={20} />
             {showDueWarning && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full border-2 border-white animate-pulse"></span>
             )}
           </button>
           
           <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
              <img src="https://picsum.photos/100/100" alt="User" />
           </div>
        </div>
      </header>

      {/* --- SCROLLABLE CONTENT --- */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 pb-24 no-scrollbar smooth-scroll" style={{ maxHeight: 'calc(100vh - 4rem - 4rem)', minHeight: 'calc(100vh - 4rem - 4rem)' }}>
        
        {/* Status Bar / Loop */}
        {role !== UserRole.STORE_ASSISTANT && activeLoopStage > 0 && (
          <div className="transform scale-95 origin-center w-full">
            <ProcessFlow currentStage={activeLoopStage} />
          </div>
        )}

        {/* --- DYNAMIC DASHBOARD --- */}
        {activeTab === 'home' && (
           <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* 用户信息栏：账户名、问候语、天气 */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-4 text-white shadow-lg shadow-red-200">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-red-100">
                      {role === UserRole.STORE_ASSISTANT ? '早上好，李店员' : 
                       role === UserRole.FRANCHISEE ? '早上好，王小明' :
                       role === UserRole.HQ_SPECIALIST ? '早上好，张专员' :
                       role === UserRole.HQ_MARKET_MANAGER ? '早上好，李经理' : '早上好，陈总'}
                    </span>
                    <span className="text-lg font-bold">
                      {role === UserRole.STORE_ASSISTANT ? '今日加油！' : 
                       role === UserRole.FRANCHISEE ? '祝您生意兴隆！' :
                       role === UserRole.HQ_SPECIALIST ? '战区业绩冲刺中！' :
                       role === UserRole.HQ_MARKET_MANAGER ? '今日指标达成中！' : '全局掌控中'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
                    <span className="text-lg">☀️</span>
                    <span className="text-sm font-medium">28°C</span>
                  </div>
                </div>
              </div>

              {/* ==================== 门店店员首页 ==================== */}
              {role === UserRole.STORE_ASSISTANT && (
                <>
                  {/* 今日个人业绩 */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <TrendingUp size={16} className="text-red-600" />
                        今日个人业绩
                      </h3>
                    </div>
                    <div className="p-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <StatCard title="销售额" value="¥1,208" trend="+5.2%" highlight />
                        <StatCard title="达成率" value="85%" trend="+3%" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <StatCard title="订单数" value="42" trend="+8" />
                        <StatCard title="客单价" value="¥28.8" trend="neutral" />
                      </div>
                    </div>
                  </div>

                  {/* 我的任务 */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <ClipboardList size={16} className="text-red-600" />
                        我的任务
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {tasks.filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS).length} 项待处理
                      </span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {tasks.filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS).slice(0, 4).map((task) => (
                        <div 
                          key={task.id} 
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedTask(task)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  task.priority === 'high' ? 'bg-red-500' : 
                                  task.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                                }`} />
                                <h4 className="font-semibold text-sm text-gray-800">{task.title}</h4>
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-1">{task.description}</p>
                            </div>
                            <ChevronRight size={14} className="text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 培训考核提醒 */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-500" />
                        培训考核提醒
                      </h3>
                    </div>
                    <div className="p-3 space-y-2">
                      {!trainingProgress['training-1'].studyCompleted && (
                        <div 
                          onClick={() => {
                            setCurrentTrainingId('training-1');
                            setCurrentTrainingPage('study');
                          }}
                          className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100 cursor-pointer hover:bg-amber-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                              <span className="text-sm">📚</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">新品上架规范培训</p>
                              <p className="text-xs text-amber-600">今日需完成 • {trainingProgress['training-1'].studyCompleted ? '已完成' : '待学习'}</p>
                            </div>
                          </div>
                          <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full">去学习</span>
                        </div>
                      )}
                      {!trainingProgress['training-1'].examCompleted && trainingProgress['training-1'].studyCompleted && (
                        <div 
                          onClick={() => {
                            setCurrentTrainingId('training-1');
                            setCurrentTrainingPage('exam');
                          }}
                          className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100 cursor-pointer hover:bg-red-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                              <span className="text-sm">📝</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">新品上架规范考核</p>
                              <p className="text-xs text-red-600">明日截止 • 待考试</p>
                            </div>
                          </div>
                          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">去考试</span>
                        </div>
                      )}
                      {!trainingProgress['training-2'].studyCompleted && (
                        <div 
                          onClick={() => {
                            setCurrentTrainingId('training-2');
                            setCurrentTrainingPage('study');
                          }}
                          className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100 cursor-pointer hover:bg-amber-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                              <span className="text-sm">📚</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">食品安全培训</p>
                              <p className="text-xs text-amber-600">今日需完成 • {trainingProgress['training-2'].studyCompleted ? '已完成' : '待学习'}</p>
                            </div>
                          </div>
                          <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full">去学习</span>
                        </div>
                      )}
                      {!trainingProgress['training-2'].examCompleted && trainingProgress['training-2'].studyCompleted && (
                        <div 
                          onClick={() => {
                            setCurrentTrainingId('training-2');
                            setCurrentTrainingPage('exam');
                          }}
                          className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100 cursor-pointer hover:bg-red-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                              <span className="text-sm">📝</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">食品安全考核</p>
                              <p className="text-xs text-red-600">明日截止 • 待考试</p>
                            </div>
                          </div>
                          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">去考试</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 收入预估 */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <Target size={16} className="text-green-500" />
                        收入预估
                      </h3>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-gray-500">实时提成</p>
                          <p className="text-lg font-bold text-gray-800">¥120.80</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">奖金预估</p>
                          <p className="text-lg font-bold text-green-600">¥280.00</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">完成目标可额外获得¥150奖金</p>
                    </div>
                  </div>
                </>
              )}

              {/* ==================== 加盟商首页 ==================== */}
              {role === UserRole.FRANCHISEE && (
                <>
                  <ExceptionAlertModule alerts={alerts} onAssignTask={handleAssignTask} onVerify={handleVerifyAlert} />

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <TrendingUp size={16} className="text-red-600" />
                        门店核心指标
                      </h3>
                    </div>
                    <div className="p-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <StatCard title="实时营收" value="¥12,840" trend="+12%" highlight />
                        <DualStatCard value1="¥45,680" label1="货款余额" value2="¥32,450" label2="本月进货额" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <StatCard title="昨日毛利额" value="¥5,432" trend="-3.2%" />
                        <StatCard title="昨日毛利率" value="42.3%" trend="-5.7%" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <ClipboardList size={16} className="text-red-600" />
                        待办任务
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {tasks.filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS).length} 项待处理
                      </span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {tasks.filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS).slice(0, 4).map((task) => (
                        <div 
                          key={task.id} 
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedTask(task)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  task.priority === 'high' ? 'bg-red-500' : 
                                  task.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                                }`} />
                                <h4 className="font-semibold text-sm text-gray-800">{task.title}</h4>
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-1">{task.description}</p>
                            </div>
                            <ChevronRight size={14} className="text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ==================== 战区专员首页 ==================== */}
              {role === UserRole.HQ_SPECIALIST && (
                <>
                  {/* 战区作战地图 */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <Map size={16} className="text-red-600" />
                        战区作战地图
                      </h3>
                      <span className="text-xs text-gray-500">华东战区 • 12家门店</span>
                    </div>
                    <div className="p-3">
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-green-50 rounded-xl p-2 text-center border border-green-100">
                          <p className="text-lg font-bold text-green-600">8</p>
                          <p className="text-[10px] text-green-600">正常门店</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-2 text-center border border-amber-100">
                          <p className="text-lg font-bold text-amber-600">3</p>
                          <p className="text-[10px] text-amber-600">关注门店</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-2 text-center border border-red-100">
                          <p className="text-lg font-bold text-red-600">1</p>
                          <p className="text-[10px] text-red-600">问题门店</p>
                        </div>
                      </div>
                      {/* 问题门店列表 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-bold text-xs">A</div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">上海南京路店</p>
                              <p className="text-xs text-red-500">动销差 • 库存高</p>
                            </div>
                          </div>
                          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">需关注</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 font-bold text-xs">B</div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">杭州西湖店</p>
                              <p className="text-xs text-amber-500">毛利率下滑</p>
                            </div>
                          </div>
                          <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full">观察中</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI智能诊断 */}
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-4 text-white shadow-lg shadow-purple-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🤖</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm mb-1">AI智能诊断摘要</h4>
                        <p className="text-xs text-purple-100 mb-2">根据战区数据分析，建议重点关注以下事项：</p>
                        <div className="bg-white/10 rounded-lg p-2">
                          <p className="text-xs text-white">• 建议协助上海南京路店调整商品陈列，提升动销</p>
                          <p className="text-xs text-white">• 杭州西湖店库存周转天数超阈值，建议促销清理</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 协同工单进展 */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <ClipboardList size={16} className="text-red-600" />
                        协同工单进展
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                      <div className="px-4 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm text-gray-800">新品陈列调整申请</h4>
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">处理中</span>
                        </div>
                        <p className="text-xs text-gray-500">提交给：运营部 • 等待审批</p>
                      </div>
                      <div className="px-4 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm text-gray-800">促销活动方案</h4>
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">已通过</span>
                        </div>
                        <p className="text-xs text-gray-500">提交给：市场部 • 已执行</p>
                      </div>
                    </div>
                  </div>

                  {/* 核心指标 */}
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard title="战区销售额" value="¥128,400" trend="+8.5%" />
                    <StatCard title="问题门店" value="3" trend="neutral" />
                  </div>
                </>
              )}

              {/* ==================== 运营经理首页 ==================== */}
              {role === UserRole.HQ_MARKET_MANAGER && (
                <>
                  {/* 核心指标看板 */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <PieChart size={16} className="text-red-600" />
                        核心指标看板
                      </h3>
                    </div>
                    <div className="p-3 space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <StatCard title="销售额" value="¥856.2K" trend="+12.3%" />
                        <StatCard title="进货额" value="¥428.5K" trend="+5.8%" />
                        <StatCard title="活动参与" value="92%" trend="+3.2%" />
                      </div>
                    </div>
                  </div>

                  {/* 个人KPI */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <Target size={16} className="text-red-600" />
                        个人KPI
                      </h3>
                    </div>
                    <div className="p-3">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">销售额目标达成</span>
                            <span className="text-gray-800 font-medium">85%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">新店拓展</span>
                            <span className="text-gray-800 font-medium">60%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">活动执行率</span>
                            <span className="text-gray-800 font-medium">95%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI指标异动诊断 */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 text-white shadow-lg shadow-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🤖</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm mb-1">指标异动诊断</h4>
                        <p className="text-xs text-blue-100 mb-2">AI自动分析 • 刚刚更新</p>
                        <div className="bg-white/10 rounded-lg p-2">
                          <p className="text-xs text-white">• 华东区销售额下降5%，主要因A类门店客流减少12%</p>
                          <p className="text-xs text-white">• 华南区域进货额增长8%，源于新品推广活动效果显著</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 待处理事项 */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <ClipboardList size={16} className="text-red-600" />
                        待处理事项
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">5 项</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            <h4 className="font-semibold text-sm text-gray-800">Q4营销活动方案审批</h4>
                          </div>
                          <ChevronRight size={14} className="text-gray-400" />
                        </div>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <h4 className="font-semibold text-sm text-gray-800">区域促销申请审核</h4>
                          </div>
                          <ChevronRight size={14} className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ==================== 高管首页 ==================== */}
              {role === UserRole.HQ_EXECUTIVE && (
                <>
                  {/* 全景驾驶舱 */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <Building2 size={16} className="text-red-600" />
                        全景驾驶舱
                      </h3>
                    </div>
                    <div className="p-3">
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-100">
                          <p className="text-xs text-red-600 mb-1">销售</p>
                          <p className="text-xl font-bold text-gray-800">¥8,562K</p>
                          <p className="text-[10px] text-green-600">+12.3% ↑</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-100">
                          <p className="text-xs text-blue-600 mb-1">进货</p>
                          <p className="text-xl font-bold text-gray-800">¥4,285K</p>
                          <p className="text-[10px] text-green-600">+5.8% ↑</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-100">
                          <p className="text-xs text-purple-600 mb-1">运营</p>
                          <p className="text-xl font-bold text-gray-800">92%</p>
                          <p className="text-[10px] text-green-600">+3.2% ↑</p>
                        </div>
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 border border-amber-100">
                          <p className="text-xs text-amber-600 mb-1">供应链</p>
                          <p className="text-xl font-bold text-gray-800">15天</p>
                          <p className="text-[10px] text-amber-600">-2天 ↓</p>
                        </div>
                      </div>
                      {/* 趋势图简略展示 */}
                      <div className="h-24 bg-gray-50 rounded-xl flex items-end justify-around p-2 border border-gray-100">
                        {[65, 78, 82, 75, 88, 92, 85, 90, 95, 88, 92, 98].map((v, i) => (
                          <div key={i} className="w-3 bg-gradient-to-t from-red-400 to-red-500 rounded-t" style={{ height: `${v}%` }}></div>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 text-center mt-1">近12个月销售趋势</p>
                    </div>
                  </div>

                  {/* AI全局风险与机会 */}
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-4 text-white shadow-lg shadow-gray-300">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🤖</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm mb-1">AI风险预警与机会洞察</h4>
                        <p className="text-xs text-gray-400 mb-2">全局智能分析 • 每日更新</p>
                        <div className="space-y-2">
                          <div className="bg-red-500/20 rounded-lg p-2 border border-red-500/30">
                            <p className="text-xs text-red-300 font-medium">⚠️ 全局性风险</p>
                            <p className="text-[10px] text-gray-300">XX品类全国库存周转天数超阈值，建议促销清理</p>
                          </div>
                          <div className="bg-green-500/20 rounded-lg p-2 border border-green-500/30">
                            <p className="text-xs text-green-300 font-medium">📈 增长机会</p>
                            <p className="text-[10px] text-gray-300">华东区域新品表现优异，建议全国推广</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 关键审批流 */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <CheckCircle size={16} className="text-red-600" />
                        待审批事项
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">8 项</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-sm text-gray-800">XX区域促销活动申请</h4>
                            <p className="text-xs text-gray-500">运营部 • 预算¥50K</p>
                          </div>
                          <span className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded-full">紧急</span>
                        </div>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-sm text-gray-800">新店开业计划</h4>
                            <p className="text-xs text-gray-500">拓展部 • 10月落地</p>
                          </div>
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full">待审批</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 通用：其他角色显示简单指标 */}
              {(role === UserRole.STORE_ASSISTANT || role === UserRole.FRANCHISEE) && (
                <></>
              )}
            </div>
        )}

        {activeTab === 'workbench' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* 常用功能模块及编辑 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-sm">常用功能</h3>
                <button className="text-xs text-gray-500 flex items-center gap-1">
                  <span>编辑</span>
                  <ChevronDown size={12} />
                </button>
              </div>
              <div className="p-4 grid grid-cols-5 gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                    <span className="text-sm">🎯</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">临期促销</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <span className="text-sm">🛒</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">订单管理</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                    <span className="text-sm">📦</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">商品上下架</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <span className="text-sm">📋</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">库存盘点</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <span className="text-sm">🚚</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">报收投</span>
                </div>
              </div>
            </div>

            {/* 销售类 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm">销售类</h3>
              </div>
              <div className="p-4 grid grid-cols-5 gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <span className="text-sm">🎯</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">临期促销</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <span className="text-sm">🛒</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">订单管理</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                    <span className="text-sm">📦</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">商品上下架</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <span className="text-sm">📊</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">异常流水</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                    <span className="text-sm">🛍️</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">POS商品隐藏</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <span className="text-sm">📈</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">销售上报</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <span className="text-sm">📋</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">POS报表</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <span className="text-sm">📱</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">移动收银</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <span className="text-sm">🔍</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">扫码核券</span>
                </div>
              </div>
            </div>

            {/* 店务类 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm">店务类</h3>
              </div>
              <div className="p-4 grid grid-cols-5 gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <span className="text-sm">🚚</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">报收投</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <span className="text-sm">🎁</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">门店拆包</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <span className="text-sm">📄</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">调拨</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                    <span className="text-sm">🗑️</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">报损</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <span className="text-sm">🍽️</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">试吃</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <span className="text-sm">📋</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">库存盘点</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <span className="text-sm">💻</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">在线运营</span>
                </div>
              </div>
            </div>

            {/* 系统功能 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm">系统功能</h3>
              </div>
              <div className="p-4 grid grid-cols-5 gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <span className="text-sm">🔑</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">POS登录</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                    <span className="text-sm">💻</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">IT服务</span>
                </div>
              </div>
            </div>

            {/* 数据 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm">数据</h3>
              </div>
              <div className="p-4 grid grid-cols-5 gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                    <span className="text-sm">💬</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">私域管理</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <span className="text-sm">🧭</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">经营罗盘</span>
                </div>
              </div>
            </div>

            {/* 其他类 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm">其他类</h3>
              </div>
              <div className="p-4 grid grid-cols-5 gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <span className="text-sm">👣</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">来访报备</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <span className="text-sm">💳</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">支付进件</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <span className="text-sm">💰</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">授信</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                    <span className="text-sm">🤖</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">绝智</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                    <span className="text-sm">🔧</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">维修申报</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <span className="text-sm">💼</span>
                  </div>
                  <span className="text-[9px] text-gray-600 text-center">企业微信</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* --- FIXED BOTTOM NAVIGATION --- */}
      <div className="sticky bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around z-40 bottom-nav-safe-area">
         <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 w-16 transition-colors touch-target ${activeTab === 'home' ? 'text-red-600' : 'text-gray-400'}`}>
            <Home size={22} className={activeTab === 'home' ? 'fill-current' : ''} />
            <span className="text-[10px] font-medium">首页</span>
         </button>
         <button onClick={() => setActiveTab('workbench')} className={`flex flex-col items-center gap-1 w-16 transition-colors touch-target ${activeTab === 'workbench' ? 'text-red-600' : 'text-gray-400'}`}>
            <ClipboardList size={22} className={activeTab === 'workbench' ? 'fill-current' : ''} />
            <span className="text-[10px] font-medium">工作台</span>
         </button>
         
         {/* AI Trigger Integrated in Nav */}
         <div className="relative -top-5">
           <button 
             onClick={() => setShowAIAssistant(!showAIAssistant)}
             className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-full shadow-lg shadow-red-200 flex items-center justify-center text-white touch-target"
           >
             <Sparkles size={24} />
           </button>
         </div>

         <button className={`flex flex-col items-center gap-1 w-16 transition-colors text-gray-400 touch-target`}>
            <MessageSquare size={22} />
            <span className="text-[10px] font-medium">消息</span>
         </button>
         <button className={`flex flex-col items-center gap-1 w-16 transition-colors text-gray-400 touch-target`}>
            <User size={22} />
            <span className="text-[10px] font-medium">我的</span>
         </button>
      </div>

      {/* --- OVERLAYS --- */}
      
      {/* AI Assistant (Only show when explicitly triggered) */}
      {showAIAssistant && <AIAssistant role={role} onTaskCreate={(title) => addTask({title})} onClose={() => setShowAIAssistant(false)} />}
      
      {/* Task Details Drawer (Bottom Sheet Style) */}
      <TaskDetailsDrawer 
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onComplete={handleTaskComplete}
        onEdit={handleTaskEdit}
        onReject={handleTaskReject}
        onAccept={handleTaskAccept}
        onAiVerify={handleAiVerify}
        role={role}
      />

      {/* Modals (Absolute) */}
      <TaskCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={addTask}
      />

      <TaskEditModal 
        task={selectedTask}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleTaskUpdate}
      />

    </div>
  );
}