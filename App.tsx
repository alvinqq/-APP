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
  Sparkles
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

import { UserRole, Task, TaskStatus } from './types';
import { ProcessFlow } from './components/ProcessFlow';
import { AIAssistant } from './components/AIAssistant';
import { TaskDetailsDrawer } from './components/TaskDetailsDrawer';

// --- MOCK DATA ---
const MOCK_STORE_DATA = [
  { name: '08:00', sales: 1200, traffic: 45 },
  { name: '10:00', sales: 2800, traffic: 120 },
  { name: '12:00', sales: 5600, traffic: 340 },
  { name: '14:00', sales: 4200, traffic: 180 },
  { name: '16:00', sales: 3900, traffic: 160 },
  { name: '18:00', sales: 6800, traffic: 420 },
];

const MOCK_HQ_DATA = [
  { name: 'Mon', revenue: 450000, compliance: 92 },
  { name: 'Tue', revenue: 420000, compliance: 94 },
  { name: 'Wed', revenue: 480000, compliance: 91 },
  { name: 'Thu', revenue: 510000, compliance: 95 },
  { name: 'Fri', revenue: 620000, compliance: 89 },
  { name: 'Sat', revenue: 750000, compliance: 88 },
  { name: 'Sun', revenue: 710000, compliance: 93 },
];

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: '早高峰备货检查',
    description: '核心SKU库存预警，请及时补货。预测数据显示今日10点客流高峰，建议重点关注鲜食区域库存。',
    priority: 'high',
    status: TaskStatus.PENDING,
    timestamp: '08:30',
    source: 'AI_GENERATED',
    loopStage: 5
  },
  {
    id: '2',
    title: '门店清洁SOP执行',
    description: 'B区餐桌清洁度评分下降，请立即安排人员进行清洁并拍照上传验证。',
    priority: 'medium',
    status: TaskStatus.IN_PROGRESS,
    timestamp: '11:15',
    source: 'MANUAL',
    loopStage: 6
  }
];

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, trend, subtext, highlight = false }: { title: string, value: string, trend?: string, subtext?: string, highlight?: boolean }) => (
  <div className={`p-5 rounded-2xl border transition-all duration-200 hover:shadow-md ${highlight ? 'bg-gradient-to-br from-red-600 to-red-700 text-white border-transparent' : 'bg-white border-gray-100'}`}>
    <div className="flex justify-between items-start mb-2">
      <h3 className={`text-sm font-medium ${highlight ? 'text-red-100' : 'text-gray-500'}`}>{title}</h3>
      {trend && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          trend.startsWith('+') 
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
           {task.status === TaskStatus.PENDING ? '待处理' : '进行中'}
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
  const [role, setRole] = useState<UserRole>(UserRole.STORE_MANAGER);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeLoopStage, setActiveLoopStage] = useState(0); // 0 = inactive
  const [simulateLoop, setSimulateLoop] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
          // Add a completed task at the end
          addTask("AI预警优化完成");
        } else {
          setActiveLoopStage(stage);
        }
      }, 2000); // 2 seconds per stage for demo
      return () => clearInterval(interval);
    }
  }, [simulateLoop]);

  const addTask = (title: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: title,
      description: 'AI助手自动生成的任务项，建议立即处理以优化运营效率。',
      priority: 'medium',
      status: TaskStatus.PENDING,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      source: 'AI_GENERATED',
      loopStage: 5
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const triggerDataAlert = () => {
    setSimulateLoop(true);
  };

  const handleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: TaskStatus.COMPLETED } : t
    ));
    // Update the selected task object so the drawer reflects the change immediately
    setSelectedTask(prev => prev && prev.id === taskId ? { ...prev, status: TaskStatus.COMPLETED } : prev);
  };

  const handleTaskEdit = (taskId: string) => {
    alert(`编辑功能 (Task ID: ${taskId}) 尚未在此演示版本中实现。`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-red-200">
              绝
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 hidden sm:block">
              绝知APP <span className="text-gray-400 font-light text-sm">| 智能商业超级助手 V4.0</span>
            </h1>
          </div>

          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-red-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="搜索任务、指标或唤起AI..." 
                className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 rounded-full py-2 pl-10 pr-4 transition-all duration-200 outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Role Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setRole(UserRole.STORE_MANAGER)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${role === UserRole.STORE_MANAGER ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                门店端
              </button>
              <button 
                onClick={() => setRole(UserRole.HQ_MANAGER)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${role === UserRole.HQ_MANAGER ? 'bg-white text-orange-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                总部端
              </button>
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
        
        {/* TOP STATUS BAR: CORE LOOP VISUALIZER */}
        {activeLoopStage > 0 ? (
           <ProcessFlow currentStage={activeLoopStage} />
        ) : (
           <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 flex items-center justify-between border border-red-100">
             <div className="flex items-center gap-3">
               <div className="bg-white p-2 rounded-lg shadow-sm text-red-600">
                 <Building2 size={24} />
               </div>
               <div>
                 <h2 className="font-semibold text-gray-800">全域系统运行正常</h2>
                 <p className="text-sm text-gray-500">Task Engine 实时监控中 • 所有指标位于安全区间</p>
               </div>
             </div>
             <button 
               onClick={triggerDataAlert}
               className="px-4 py-2 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-100 hover:bg-red-50 transition-colors shadow-sm"
             >
               模拟异常预警
             </button>
           </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: METRICS (DATA BASE) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {role === UserRole.STORE_MANAGER ? (
                <>
                  <StatCard title="订单实收" value="¥12,840" trend="+12%" highlight />
                  <StatCard title="客单价" value="¥42.5" trend="-2%" />
                  <StatCard title="订单量" value="302" trend="+15" subtext="高于区域平均" />
                  <StatCard title="毛利率" value="62.5%" trend="neutral" />
                </>
              ) : (
                <>
                  <StatCard title="战区总营收" value="¥4.2M" trend="+8.5%" highlight />
                  <StatCard title="运营达标率" value="94%" trend="+1.2%" />
                  <StatCard title="拓店进度" value="12/15" subtext="本季度目标" />
                  <StatCard title="督导覆盖" value="100%" trend="neutral" />
                </>
              )}
            </div>

            {/* CHART AREA */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp size={18} className="text-red-600" />
                  {role === UserRole.STORE_MANAGER ? '实时客流趋势' : '本周营收趋势'}
                </h3>
                <select className="bg-gray-50 border-none text-sm text-gray-500 rounded-md py-1 px-3">
                  <option>Today</option>
                  <option>Last 7 Days</option>
                </select>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={role === UserRole.STORE_MANAGER ? MOCK_STORE_DATA : MOCK_HQ_DATA}>
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
                      tick={{fill: '#94a3b8', fontSize: 12}} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 12}} 
                    />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={role === UserRole.STORE_MANAGER ? "sales" : "revenue"} 
                      stroke="#DC2626" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: TASKS & INSIGHTS (BUSINESS APP LAYER) */}
          <div className="space-y-6">
            
            {/* Task List */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <LayoutDashboard size={18} className="text-red-600" />
                  待办任务
                </h3>
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                  {tasks.filter(t => t.status === TaskStatus.PENDING).length}
                </span>
              </div>
              
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] pr-2">
                {tasks.map(task => (
                  <TaskItem key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                ))}
                
                {tasks.length === 0 && (
                   <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                     <CheckCircle size={40} className="mb-2 opacity-20" />
                     <p className="text-sm">暂无待办任务</p>
                   </div>
                )}
              </div>
              
              <button 
                onClick={() => addTask("新手动任务")}
                className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-medium hover:border-red-300 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
              >
                + 新增任务
              </button>
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
                  {role === UserRole.STORE_MANAGER 
                    ? "基于今日天气与历史数据，预计晚市外卖订单量将增加 25%，建议提前备好包材。"
                    : "华东大区B类门店库存周转率本周下降 5%，建议发起促销活动。"
                  }
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

    </div>
  );
}