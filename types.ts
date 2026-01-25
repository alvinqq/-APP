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
  COMPLETED = 'COMPLETED',
  VERIFIED = 'VERIFIED'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: TaskStatus;
  timestamp: string;
  source: 'AI_GENERATED' | 'MANUAL';
  loopStage?: number; // 1-7 corresponding to the closed loop
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