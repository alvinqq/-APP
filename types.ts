export enum UserRole {
  STORE_ASSISTANT = 'STORE_ASSISTANT',       // 门店端 - 店员
  FRANCHISEE = 'FRANCHISEE',                 // 门店端 - 加盟商
  HQ_SPECIALIST = 'HQ_SPECIALIST',           // 总部端 - 专员
  HQ_MARKET_MANAGER = 'HQ_MARKET_MANAGER',   // 总部端 - 市场经理
  HQ_EXECUTIVE = 'HQ_EXECUTIVE'              // 总部端 - 总部管理
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  COMPLETED = 'COMPLETED',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export interface TaskActionLog {
  id: string;
  actor: string;      // 处理人
  timestamp: string;  // 处理时间
  action: string;     // 操作内容
  attachments?: string[]; // 图片凭证 (Base64 or URL)
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: TaskStatus;
  timestamp: string;
  dueDate?: string; // YYYY-MM-DD
  source: 'AI_GENERATED' | 'MANUAL';
  loopStage?: number; // 1-7 corresponding to the closed loop
  logs?: TaskActionLog[]; // 任务处理记录
}

export interface ExceptionAlert {
  id: string;
  title: string;
  severity: 'high' | 'medium';
  timestamp: string;
  status: 'new' | 'assigned' | 'processing' | 'pending_verification' | 'resolved';
  attribution: string; // AI Attribution analysis
  recommendedTask: string; // Task to assign
  assignedTo: string; // Store assistant name
  progress: number; // 0-100
  resultSummary?: string; // Feedback after execution
}

export interface Metric {
  label: string;
  value: string | number;
  trend: number; // percentage
  trendLabel: 'up' | 'down' | 'neutral';
  unit?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
}

// 1.2 Core Business Process Stages
export const BUSINESS_LOOP_STAGES = [
  '数据预警', // 1
  'AI归因',   // 2
  '生成建议', // 3
  '语音确认', // 4
  '生成任务', // 5
  '执行反馈', // 6
  '效果验证'  // 7
];

// 报表类型
export enum ReportType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

// 报表状态
export enum ReportStatus {
  NEW = 'NEW',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED'
}

// 门店指标数据
export interface StoreMetrics {
  storeId: string;
  storeName: string;
  revenue: number;
  orderCount: number;
  customerCount: number;
  avgOrderValue: number;
  grossMargin: number;
  grossMarginRate: number;
  inventoryTurnover: number;
  alerts: string[];
}

// 报表数据
export interface ReportData {
  reportId: string;
  reportType: ReportType;
  reportDate: string;
  periodStart: string;
  periodEnd: string;
  totalRevenue: number;
  totalOrderCount: number;
  totalCustomerCount: number;
  avgOrderValue: number;
  grossMargin: number;
  grossMarginRate: number;
  revenueTrend: number;
  orderTrend: number;
  customerTrend: number;
  storeMetrics: StoreMetrics[];
  summary: string;
  keyInsights: string[];
  recommendations: string[];
}

// 通知数据
export interface Notification {
  id: string;
  type: 'REPORT' | 'TASK' | 'ALERT';
  title: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  data?: {
    reportId?: string;
    reportType?: ReportType;
    taskId?: string;
    alertId?: string;
  };
}