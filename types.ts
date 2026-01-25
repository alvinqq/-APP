export enum UserRole {
  STORE_MANAGER = 'STORE_MANAGER',
  HQ_MANAGER = 'HQ_MANAGER'
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