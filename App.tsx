import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Store, 
  Building2, 
  Bell, 
  Search, 
  Menu,
  ChevronDown,
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
      title: '昨日营收异常确认', 
      description: '昨日晚市营收低于预测值 15%，请确认是否为天气原因', 
      priority: 'high', 
      status: TaskStatus.PENDING, 
      timestamp: '09:00', 
      dueDate: TODAY,
      source: 'AI_GENERATED', 
      loopStage: 4,
      logs: [
        { id: 'f1-1', actor: 'Data Engine', timestamp: '08:55', action: '检测到营收数据偏离阈值' },
        { id: 'f1-2', actor: 'AI助手', timestamp: '09:00', action: '生成归因分析并推送待办' }
      ]
    },
    { 
      id: 'f-2', 
      title: '排班表审核', 
      description: '审核下周店员排班计划', 
      priority: 'medium', 
      status: TaskStatus.IN_PROGRESS, 
      timestamp: '10:30', 
      dueDate: TODAY,
      source: 'MANUAL', 
      loopStage: 0,
      logs: [
        { id: 'f2-1', actor: '系统', timestamp: '10:30', action: '收到店长提交的排班申请' },
        { id: 'f2-2', actor: '当前用户', timestamp: '10:45', action: '查看了排班草稿' }
      ]
    },
    { 
      id: 'f-3', 
      title: '进货单确认', 
      description: '确认明日核心冻品订货量', 
      priority: 'high', 
      status: TaskStatus.PENDING, 
      timestamp: '22:00', 
      dueDate: TODAY,
      source: 'AI_GENERATED', 
      loopStage: 5,
      logs: [
        { id: 'f3-1', actor: '供应链系统', timestamp: '22:00', action: '自动生成建议订货单' }
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
    title: '客单价异常下跌预警',
    severity: 'high',
    timestamp: '11:30',
    status: 'new',
    attribution: '基于实时交易数据分析，今日午市时段客单价同比下跌 15%。AI 归因发现套餐 B（高毛利）销量异常低，可能是收银台展示牌未及时更新或缺货。',
    recommendedTask: '检查前台 POP 物料及套餐 B 备货情况',
    assignedTo: '王小明 (店长)',
    progress: 0,
    resultSummary: ''
  },
  {
    id: 'alert-002',
    title: '冻库温度波动预警',
    severity: 'medium',
    timestamp: '10:15',
    status: 'processing',
    attribution: 'IoT 传感器监测到 2 号冷柜温度在过去 1 小时内波动超过 3°C，疑似柜门未关严或除霜系统故障。',
    recommendedTask: '检查冷柜门密封性及除霜设定',
    assignedTo: '张伟 (值班)',
    progress: 45,
    resultSummary: ''
  }
];

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, trend, subtext, highlight = false }: { title: string, value: string, trend?: string, subtext?: string, highlight?: boolean }) => (
  <div className={`p-4 rounded-xl border transition-all duration-200 ${highlight ? 'bg-gradient-to-br from-red-600 to-red-700 text-white border-transparent' : 'bg-white border-gray-100'}`}>
    <div className="flex justify-between items-start mb-2">
      <h3 className={`text-xs font-medium ${highlight ? 'text-red-100' : 'text-gray-500'}`}>{title}</h3>
      {trend && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
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
    <div className="text-xl font-bold mb-1">{value}</div>
    {subtext && <div className={`text-[10px] ${highlight ? 'text-red-200' : 'text-gray-400'}`}>{subtext}</div>}
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
        {role !== UserRole.STORE_ASSISTANT && (
          <div className="transform scale-95 origin-center w-full">
            {activeLoopStage > 0 ? (
               <ProcessFlow currentStage={activeLoopStage} />
            ) : (
               <div className="bg-white rounded-xl p-3 flex items-center justify-between border border-red-50 shadow-sm">
                 <div className="flex items-center gap-2">
                   <div className="bg-red-50 p-1.5 rounded-lg text-red-600"><Building2 size={16} /></div>
                   <div className="text-xs text-gray-500">系统运行正常</div>
                 </div>
                 <button onClick={triggerDataAlert} className="text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded border border-red-100">模拟异常</button>
               </div>
            )}
          </div>
        )}

        {/* --- DYNAMIC DASHBOARD --- */}
        {activeTab === 'home' && (
           <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* Modules based on Role */}
              {role === UserRole.FRANCHISEE && (
                <ExceptionAlertModule alerts={alerts} onAssignTask={handleAssignTask} onVerify={handleVerifyAlert} />
              )}

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                  {role === UserRole.STORE_ASSISTANT && (
                    <>
                      <StatCard title="订单收入" value="¥1,208" trend="+5.2%" />
                      <StatCard title="待办任务" value="3" trend="neutral" />
                    </>
                  )}
                  {role === UserRole.FRANCHISEE && (
                    <>
                      <StatCard title="订单实收" value="¥12,840" trend="+12%" highlight />
                      <StatCard title="订单量" value="302" trend="+15" />
                    </>
                  )}
                  {(role !== UserRole.STORE_ASSISTANT && role !== UserRole.FRANCHISEE) && (
                     <>
                      <StatCard title="核心指标" value="98.5%" trend="+1.2%" highlight />
                      <StatCard title="异常工单" value="12" trend="-5%" />
                     </>
                  )}
              </div>

              {/* Chart */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    <TrendingUp size={16} className="text-red-600" />
                    {(role === UserRole.STORE_ASSISTANT || role === UserRole.FRANCHISEE) ? '实时客流' : '业务趋势'}
                  </h3>
                </div>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" hide />
                      <Tooltip contentStyle={{borderRadius: '8px', fontSize: '12px'}} />
                      <Area type="monotone" dataKey="value" stroke="#DC2626" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

               {/* AI Insight */}
               <div className="bg-gray-900 p-4 rounded-2xl text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500 rounded-full blur-[40px] opacity-20"></div>
                  <div className="relative z-10">
                    <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
                      <Sparkles size={14} className="text-yellow-400" /> 智能洞察
                    </h3>
                    <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">
                      {role === UserRole.STORE_ASSISTANT ? "今日早班效率提升 10%，请继续保持。" : "华东仓物流延误风险已解除，请关闭相关预警工单。"}
                    </p>
                  </div>
               </div>
           </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                <button 
                  onClick={() => setTaskFilter('active')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${taskFilter === 'active' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border'}`}
                >
                   待办 ({tasks.filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS).length})
                </button>
                <button 
                  onClick={() => setTaskFilter('completed')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${taskFilter === 'completed' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border'}`}
                >
                   已完成
                </button>
             </div>

             <div className="space-y-3">
                {tasks
                  .filter(t => {
                     const isActive = t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS;
                     return taskFilter === 'active' ? isActive : !isActive;
                  })
                  .map(task => (
                  <TaskItem key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                ))}
                {tasks.filter(t => (taskFilter === 'active' ? (t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS) : !(t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS))).length === 0 && (
                   <div className="py-10 text-center text-gray-400 text-xs">暂无任务</div>
                )}
             </div>

             <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full py-3 bg-red-50 border border-dashed border-red-200 text-red-500 rounded-xl font-medium text-sm flex items-center justify-center gap-2"
             >
               + 新增任务
             </button>
          </div>
        )}

      </main>

      {/* --- FIXED BOTTOM NAVIGATION --- */}
      <div className="sticky bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around z-40 bottom-nav-safe-area">
         <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 w-16 transition-colors touch-target ${activeTab === 'home' ? 'text-red-600' : 'text-gray-400'}`}>
            <Home size={22} className={activeTab === 'home' ? 'fill-current' : ''} />
            <span className="text-[10px] font-medium">首页</span>
         </button>
         <button onClick={() => setActiveTab('tasks')} className={`flex flex-col items-center gap-1 w-16 transition-colors touch-target ${activeTab === 'tasks' ? 'text-red-600' : 'text-gray-400'}`}>
            <ClipboardList size={22} className={activeTab === 'tasks' ? 'fill-current' : ''} />
            <span className="text-[10px] font-medium">任务</span>
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