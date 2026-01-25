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
  Users
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

import { UserRole, Task, TaskStatus, ExceptionAlert, TaskActionLog } from './types';
import { ProcessFlow } from './components/ProcessFlow';
import { AIAssistant } from './components/AIAssistant';
import { TaskDetailsDrawer } from './components/TaskDetailsDrawer';
import { ExceptionAlertModule } from './components/ExceptionAlertModule';
import { TaskEditModal } from './components/TaskEditModal';

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

// --- ROLE CONFIGURATION ---

const ROLE_LABELS = {
  [UserRole.STORE_ASSISTANT]: { label: '店员', group: '门店端', icon: User },
  [UserRole.FRANCHISEE]: { label: '加盟商', group: '门店端', icon: Store },
  [UserRole.HQ_SPECIALIST]: { label: '专员', group: '总部端', icon: Briefcase },
  [UserRole.HQ_MARKET_MANAGER]: { label: '市场经理', group: '总部端', icon: Map },
  [UserRole.HQ_EXECUTIVE]: { label: '总部管理', group: '总部端', icon: Building2 },
};

// --- DATA MAPPING BY ROLE ---

const TASKS_BY_ROLE: Record<UserRole, Task[]> = {
  [UserRole.STORE_ASSISTANT]: [
    { 
      id: 'sa-1', 
      title: '早班开市SOP', 
      description: '完成前厅桌椅摆放与地面清洁', 
      priority: 'high', 
      status: TaskStatus.PENDING, 
      timestamp: '07:50', 
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
      source: 'AI_GENERATED', 
      loopStage: 5,
      logs: [
        { id: 'f3-1', actor: '供应链系统', timestamp: '22:00', action: '自动生成建议订货单' }
      ]
    },
  ],
  [UserRole.HQ_SPECIALIST]: [
    { id: 'hs-1', title: '门店工单处理 (ID: 9527)', description: '协助处理上海南京路店POS机故障报修', priority: 'high', status: TaskStatus.IN_PROGRESS, timestamp: '08:45', source: 'MANUAL', loopStage: 0, logs: [] },
    { id: 'hs-2', title: '新品物料配送追踪', description: '追踪“藤椒系列”物料在华东仓的入库情况', priority: 'medium', status: TaskStatus.PENDING, timestamp: '09:30', source: 'AI_GENERATED', loopStage: 2, logs: [] },
  ],
  [UserRole.HQ_MARKET_MANAGER]: [
    { id: 'mm-1', title: '华南区合规巡检', description: '本周重点巡检广州天河区 5 家 B 类门店', priority: 'high', status: TaskStatus.PENDING, timestamp: '09:00', source: 'AI_GENERATED', loopStage: 5, logs: [] },
    { id: 'mm-2', title: '区域月度经营会议', description: '准备华东区 10 月份经营分析报告', priority: 'medium', status: TaskStatus.PENDING, timestamp: '14:00', source: 'MANUAL', loopStage: 0, logs: [] },
  ],
  [UserRole.HQ_EXECUTIVE]: [
    { id: 'he-1', title: 'Q4 战略目标调整', description: '基于 Q3 财报数据，审批市场部提交的 Q4 预算调整案', priority: 'high', status: TaskStatus.PENDING, timestamp: '10:00', source: 'AI_GENERATED', loopStage: 3, logs: [] },
    { id: 'he-2', title: '食品安全危机预案演练', description: '发起全集团食品安全应急响应测试', priority: 'low', status: TaskStatus.VERIFIED, timestamp: '16:00', source: 'MANUAL', loopStage: 0, logs: [] },
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
  <div className={`p-5 rounded-2xl border transition-all duration-200 hover:shadow-md ${highlight ? 'bg-gradient-to-br from-red-600 to-red-700 text-white border-transparent' : 'bg-white border-gray-100'}`}>
    <div className="flex justify-between items-start mb-2">
      <h3 className={`text-sm font-medium ${highlight ? 'text-red-100' : 'text-gray-500'}`}>{title}</h3>
      {trend && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${
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
    <div className="text-2xl font-bold mb-1">{value}</div>
    {subtext && <div className={`text-xs ${highlight ? 'text-red-200' : 'text-gray-400'}`}>{subtext}</div>}
  </div>
);

interface TaskItemProps {
  task: Task;
  onClick: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onClick }) => (
  <div onClick={onClick} className="flex items-center p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer group transition-colors">
    <div className={`w-2 h-12 rounded-full mr-4 ${
      task.priority === 'high' ? 'bg-red-500' : 
      task.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
    }`} />
    <div className="flex-1">
      <div className="flex justify-between mb-1">
        <h4 className="font-semibold text-gray-800">{task.title}</h4>
        <span className="text-xs text-gray-400">{task.timestamp}</span>
      </div>
      <p className="text-sm text-gray-500 line-clamp-1">{task.description}</p>
      <div className="flex items-center gap-2 mt-2">
         {task.source === 'AI_GENERATED' && (
           <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded flex items-center gap-1">
             <Store size={10} /> AI下发
           </span>
         )}
         <span className={`text-[10px] px-1.5 py-0.5 rounded ${
           task.status === TaskStatus.COMPLETED ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
         }`}>
           {task.status === TaskStatus.PENDING ? '待处理' : 
             task.status === TaskStatus.IN_PROGRESS ? '进行中' : 
             task.status === TaskStatus.VERIFIED ? '已验证' : '已完成'}
         </span>
      </div>
    </div>
    <div className="text-gray-300 group-hover:text-red-600">
      <MoreHorizontal size={20} />
    </div>
  </div>
);

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

  // Switch tasks when role changes
  useEffect(() => {
    setTasks(TASKS_BY_ROLE[role] || []);
    setSimulateLoop(false);
    setActiveLoopStage(0);
    setTaskFilter('active'); // Reset filter on role change
  }, [role]);

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
          addTask("AI预警优化完成");
        } else {
          setActiveLoopStage(stage);
        }
      }, 2000); 
      return () => clearInterval(interval);
    }
  }, [simulateLoop]);

  const addTask = (title: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: title,
      description: 'AI助手自动生成的任务项。',
      priority: 'medium',
      status: TaskStatus.PENDING,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      source: 'AI_GENERATED',
      loopStage: 5,
      logs: [
        { 
          id: Date.now().toString() + '-log', 
          actor: 'AI助手', 
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
          action: '基于预警规则自动生成任务' 
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
    
    // Also update selectedTask
    setSelectedTask(prev => {
        if (prev && prev.id === taskId) {
            return {
                ...prev,
                status: TaskStatus.COMPLETED,
                logs: [...(prev.logs || []), completionLog]
            };
        }
        return prev;
    });
  };

  const handleTaskEdit = (taskId: string) => {
    setIsEditModalOpen(true);
  };

  const handleTaskUpdate = (taskId: string, actionText: string, attachments: string[], newStatus: TaskStatus) => {
    const newLog: TaskActionLog = {
      id: Date.now().toString(),
      actor: '当前用户',
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      action: actionText || `更新任务状态为: ${newStatus}`,
      attachments: attachments
    };

    setTasks(prev => prev.map(t => 
      t.id === taskId ? { 
          ...t, 
          status: newStatus,
          logs: [...(t.logs || []), newLog]
      } : t
    ));

    // Update selected task to reflect changes immediately in drawer
    setSelectedTask(prev => {
      if (prev && prev.id === taskId) {
        return {
          ...prev,
          status: newStatus,
          logs: [...(prev.logs || []), newLog]
        };
      }
      return prev;
    });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as UserRole);
  };

  // --- EXCEPTION ALERT HANDLERS ---
  const handleAssignTask = (alertId: string) => {
    // 1. Update Alert Status
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, status: 'assigned', progress: 0 } : a
    ));

    // 2. Simulate Task creation visible in Task List (optional, but good for demo)
    const alertItem = alerts.find(a => a.id === alertId);
    if (alertItem) {
        addTask(`[异常处理] ${alertItem.recommendedTask}`);
    }

    // 3. Simulate Progress (Demo only)
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setAlerts(prev => prev.map(a => {
         if (a.id !== alertId) return a;
         // Transition to processing
         if (progress === 20 && a.status === 'assigned') return { ...a, status: 'processing', progress };
         // Update progress
         if (progress < 100) return { ...a, progress };
         // Done
         clearInterval(interval);
         return { ...a, status: 'pending_verification', progress: 100, resultSummary: '已完成物料补充，更换了展示牌。' };
      }));
    }, 1500);
  };

  const handleVerifyAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, status: 'resolved' } : a
    ));
  };


  // Helper to get Chart Data based on role
  const getChartData = () => {
    if (role === UserRole.STORE_ASSISTANT || role === UserRole.FRANCHISEE) {
      return GENERATE_HOURLY_DATA(role === UserRole.FRANCHISEE ? 5000 : 3000);
    }
    return GENERATE_WEEKLY_DATA(role === UserRole.HQ_EXECUTIVE ? 1000000 : 500000);
  };

  const chartData = getChartData();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-red-200">
              绝
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 hidden lg:block">
              绝知APP <span className="text-gray-400 font-light text-sm">| 智能商业超级助手 V4.1</span>
            </h1>
          </div>

          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-red-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="搜索任务、门店、指标或唤起AI..." 
                className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 rounded-full py-2 pl-10 pr-4 transition-all duration-200 outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Expanded Role Switcher */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                {React.createElement(ROLE_LABELS[role].icon, { size: 14 })}
              </div>
              <select 
                value={role} 
                onChange={handleRoleChange}
                className="pl-9 pr-8 py-1.5 bg-gray-100 border-none rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-red-100 focus:bg-white transition-all cursor-pointer appearance-none"
                style={{ backgroundImage: 'none' }}
              >
                <optgroup label="门店端">
                  <option value={UserRole.STORE_ASSISTANT}>门店端 - 店员</option>
                  <option value={UserRole.FRANCHISEE}>门店端 - 加盟商</option>
                </optgroup>
                <optgroup label="总部端">
                  <option value={UserRole.HQ_SPECIALIST}>总部端 - 专员</option>
                  <option value={UserRole.HQ_MARKET_MANAGER}>总部端 - 市场经理</option>
                  <option value={UserRole.HQ_EXECUTIVE}>总部端 - 总部管理</option>
                </optgroup>
              </select>
              <ChevronDown className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" size={14} />
            </div>
            
            <button className="relative text-gray-500 hover:text-gray-700">
              <Bell size={24} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
               <img src="https://picsum.photos/100/100" alt="User" />
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        
        {/* TOP STATUS BAR: CORE LOOP VISUALIZER (Shared but maybe simplified for some roles) */}
        {role !== UserRole.STORE_ASSISTANT && (
          activeLoopStage > 0 ? (
             <ProcessFlow currentStage={activeLoopStage} />
          ) : (
             <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 flex items-center justify-between border border-red-100">
               <div className="flex items-center gap-3">
                 <div className="bg-white p-2 rounded-lg shadow-sm text-red-600">
                   <Building2 size={24} />
                 </div>
                 <div>
                   <h2 className="font-semibold text-gray-800">全域系统运行正常</h2>
                   <p className="text-sm text-gray-500">Task Engine 实时监控中 • {ROLE_LABELS[role].group}视角</p>
                 </div>
               </div>
               <button 
                 onClick={triggerDataAlert}
                 className="px-4 py-2 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-100 hover:bg-red-50 transition-colors shadow-sm"
               >
                 模拟异常预警
               </button>
             </div>
          )
        )}

        {/* --- ROLE SPECIFIC MODULES --- */}

        {/* FRANCHISEE: EXCEPTION ALERT MODULE */}
        {role === UserRole.FRANCHISEE && (
          <div className="mb-6">
            <ExceptionAlertModule 
              alerts={alerts}
              onAssignTask={handleAssignTask}
              onVerify={handleVerifyAlert}
            />
          </div>
        )}

        {/* STORE ASSISTANT: OPENING TASK FLOW */}
        {role === UserRole.STORE_ASSISTANT && (
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 animate-in fade-in duration-500 slide-in-from-bottom-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <ClipboardList size={20} className="text-red-600" />
                店员开店智能任务流
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Sun size={14} className="text-orange-500" />
                <span>当前进度: {openingStep + 1}/{OPENING_STEPS.length}</span>
              </div>
            </div>
            
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 rounded-full z-0">
                 <div 
                   className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500"
                   style={{ width: `${(openingStep / (OPENING_STEPS.length - 1)) * 100}%` }}
                 />
              </div>

              {/* Steps */}
              <div className="relative z-10 flex justify-between">
                {OPENING_STEPS.map((step, index) => {
                  const isCompleted = index <= openingStep;
                  const isCurrent = index === openingStep;
                  const Icon = step.icon;

                  return (
                    <div 
                      key={step.id} 
                      className="flex flex-col items-center gap-3 cursor-pointer group"
                      onClick={() => setOpeningStep(index)} // For demo interaction
                    >
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                        ${isCompleted 
                          ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-100' 
                          : 'bg-white border-gray-200 text-gray-400 group-hover:border-red-200'}
                        ${isCurrent ? 'ring-4 ring-red-50 scale-110' : ''}
                      `}>
                         {isCompleted && !isCurrent ? <Check size={18} /> : <Icon size={18} />}
                      </div>
                      <div className="text-center">
                        <div className={`text-xs font-bold mb-0.5 ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                          {step.label}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {step.time}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MARKET MANAGER: REGIONAL DASHBOARD */}
        {role === UserRole.HQ_MARKET_MANAGER && (
           <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 animate-in fade-in duration-500 slide-in-from-bottom-2">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-gray-800 flex items-center gap-2">
                 <Map size={20} className="text-red-600" />
                 战区实时大屏
               </h3>
               <div className="flex gap-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={10} /> 华东: 正常</span>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded flex items-center gap-1"><AlertTriangle size={10} /> 华南: 预警</span>
               </div>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { region: '华东战区', value: '98%', label: '营运合规率', status: 'good' },
                  { region: '华北战区', value: '96%', label: '营运合规率', status: 'good' },
                  { region: '华南战区', value: '85%', label: '营运合规率', status: 'alert' },
                  { region: '西南战区', value: '92%', label: '营运合规率', status: 'good' }
                ].map((item, idx) => (
                  <div key={item.region} className={`p-4 rounded-xl border ${item.status === 'alert' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'} hover:shadow-md transition-shadow`}>
                     <div className="flex justify-between items-start mb-2">
                        <span className={`font-bold ${item.status === 'alert' ? 'text-red-800' : 'text-gray-700'}`}>{item.region}</span>
                        {item.status === 'alert' && <AlertTriangle size={14} className="text-red-500" />}
                     </div>
                     <div className={`text-2xl font-bold mb-1 ${item.status === 'alert' ? 'text-red-600' : 'text-gray-900'}`}>{item.value}</div>
                     <div className="text-xs text-gray-500">{item.label}</div>
                  </div>
                ))}
             </div>
           </div>
        )}

        {/* --- METRICS & TASKS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: METRICS & TASKS (SWAPPED HERE) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in duration-500">
              
              {/* Dynamic Metrics based on Role */}
              {role === UserRole.STORE_ASSISTANT && (
                <>
                  <StatCard title="订单收入" value="¥1,208" trend="+5.2%" />
                  <StatCard title="待办任务" value="3" trend="neutral" />
                  <StatCard title="个人预估收入" value="¥185" trend="+8%" />
                  <StatCard title="门店活动数" value="2" trend="neutral" highlight />
                </>
              )}
              {role === UserRole.FRANCHISEE && (
                <>
                  <StatCard title="订单实收" value="¥12,840" trend="+12%" highlight />
                  <StatCard title="订单量" value="302" trend="+15" subtext="高于区域平均" />
                  <StatCard title="毛利率" value="62.5%" trend="-1.2%" />
                  <StatCard title="客单价" value="¥42.5" trend="+1.5%" />
                </>
              )}
              {role === UserRole.HQ_SPECIALIST && (
                <>
                  <StatCard title="待处理工单" value="12" trend="-5%" highlight />
                  <StatCard title="今日已闭环" value="28" trend="+10%" />
                  <StatCard title="SLA达标率" value="99.2%" trend="neutral" />
                  <StatCard title="异常预警" value="3" trend="+1" />
                </>
              )}
              {role === UserRole.HQ_MARKET_MANAGER && (
                <>
                  <StatCard title="区域总营收" value="¥4.2M" trend="+8.5%" highlight />
                  <StatCard title="门店覆盖率" value="100%" trend="neutral" />
                  <StatCard title="合规巡检" value="45/50" subtext="本周进度" />
                  <StatCard title="拓店目标" value="85%" trend="+5%" />
                </>
              )}
              {role === UserRole.HQ_EXECUTIVE && (
                <>
                  <StatCard title="集团总营收" value="¥128M" trend="+15%" highlight />
                  <StatCard title="商品SKU数" value="3,240" trend="+12" />
                  <StatCard title="净利润率" value="22%" trend="+1.2%" />
                  <StatCard title="活跃会员" value="2.5M" trend="+8%" />
                </>
              )}
            </div>

            {/* Task List (Moved Here - Swapped) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
              <div className="flex items-center gap-6 mb-4 border-b border-gray-100 pb-2">
                <button 
                  onClick={() => setTaskFilter('active')}
                  className={`relative font-bold text-sm flex items-center gap-2 pb-2 transition-colors ${
                    taskFilter === 'active' ? 'text-gray-800' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <LayoutDashboard size={18} className={taskFilter === 'active' ? "text-red-600" : "text-gray-400"} />
                  {role === UserRole.HQ_SPECIALIST ? '待处理' : '待办任务'}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    taskFilter === 'active' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tasks.filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS).length}
                  </span>
                  {taskFilter === 'active' && <div className="absolute bottom-[-9px] left-0 w-full h-0.5 bg-red-600 rounded-t-full"></div>}
                </button>

                <button 
                  onClick={() => setTaskFilter('completed')}
                  className={`relative font-bold text-sm flex items-center gap-2 pb-2 transition-colors ${
                    taskFilter === 'completed' ? 'text-gray-800' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <CheckCircle size={18} className={taskFilter === 'completed' ? "text-green-600" : "text-gray-400"} />
                  已完成
                  {taskFilter === 'completed' && (
                     <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                       {tasks.filter(t => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.VERIFIED).length}
                     </span>
                  )}
                   {taskFilter === 'completed' && <div className="absolute bottom-[-9px] left-0 w-full h-0.5 bg-green-600 rounded-t-full"></div>}
                </button>
              </div>
              
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] pr-2">
                {tasks
                  .filter(t => {
                     const isActive = t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS;
                     return taskFilter === 'active' ? isActive : !isActive;
                  })
                  .map(task => (
                  <TaskItem key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                ))}
                
                {tasks.filter(t => {
                     const isActive = t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS;
                     return taskFilter === 'active' ? isActive : !isActive;
                  }).length === 0 && (
                   <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                     <CheckCircle size={40} className="mb-2 opacity-20" />
                     <p className="text-sm">{taskFilter === 'active' ? '暂无待办任务' : '暂无已完成任务'}</p>
                   </div>
                )}
              </div>
              
              {taskFilter === 'active' && (
                <button 
                  onClick={() => addTask("新手动任务")}
                  className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-medium hover:border-red-300 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                >
                  + 新增任务
                </button>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: CHART & INSIGHTS (SWAPPED HERE) */}
          <div className="space-y-6">
            
            {/* CHART AREA (Moved Here - Swapped) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp size={18} className="text-red-600" />
                  {(role === UserRole.STORE_ASSISTANT || role === UserRole.FRANCHISEE) 
                    ? '实时客流' 
                    : '业务增长'}
                </h3>
                <select className="bg-gray-50 border-none text-xs text-gray-500 rounded-md py-1 px-2">
                  <option>Today</option>
                  <option>7 Days</option>
                </select>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 10}} 
                      dy={10}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 10}} 
                      width={30}
                    />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#DC2626" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Insight Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <Sparkles size={18} className="text-yellow-400" />
                  智能洞察
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {role === UserRole.STORE_ASSISTANT && "今日早班效率提升 10%，请继续保持。"}
                  {role === UserRole.FRANCHISEE && "预计晚市外卖订单量将增加 25%，建议提前备好包材。"}
                  {role === UserRole.HQ_SPECIALIST && "华东仓物流延误风险已解除，请关闭相关预警工单。"}
                  {role === UserRole.HQ_MARKET_MANAGER && "华南大区B类门店库存周转率本周下降 5%，建议发起促销。"}
                  {role === UserRole.HQ_EXECUTIVE && "Q3 整体净利润率优于行业平均水平 2.5 个百分点。"}
                </p>
                <button className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors backdrop-blur-sm">
                  查看详情
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* MULTIMODAL INTERACTION CENTER (The "One Core") */}
      <AIAssistant role={role} onTaskCreate={addTask} />
      
      {/* TASK DETAILS DRAWER */}
      <TaskDetailsDrawer 
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onComplete={handleTaskComplete}
        onEdit={handleTaskEdit}
      />

      {/* TASK EDIT MODAL */}
      <TaskEditModal 
        task={selectedTask}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleTaskUpdate}
      />

    </div>
  );
}