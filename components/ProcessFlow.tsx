import React from 'react';
import { BUSINESS_LOOP_STAGES } from '../types';
import { CheckCircle2, Circle, ArrowRight, Activity, Cpu, Lightbulb, Mic, ListTodo, ClipboardCheck, BarChart3 } from 'lucide-react';

interface ProcessFlowProps {
  currentStage: number; // 0 to 7 (0 = inactive, 1-7 active steps)
}

const ICONS = [
  Activity,       // Data Alert
  Cpu,            // AI Attribution
  Lightbulb,      // Generate Suggestion
  Mic,            // Voice Confirmation
  ListTodo,       // Generate Task
  ClipboardCheck, // Execution Feedback
  BarChart3       // Effect Verification
];

export const ProcessFlow: React.FC<ProcessFlowProps> = ({ currentStage }) => {
  return (
    <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
        全域任务闭环引擎 (Task Engine) 实时状态
      </h3>
      
      <div className="flex items-center justify-between min-w-[600px]">
        {BUSINESS_LOOP_STAGES.map((stage, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStage;
          const isCompleted = stepNumber < currentStage;
          const Icon = ICONS[index];

          return (
            <React.Fragment key={stage}>
              <div className="flex flex-col items-center gap-2 relative z-10 group">
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${isActive ? 'bg-red-600 text-white shadow-lg shadow-red-200 scale-110' : ''}
                    ${isCompleted ? 'bg-green-100 text-green-600 border border-green-200' : ''}
                    ${!isActive && !isCompleted ? 'bg-gray-100 text-gray-400' : ''}
                  `}
                >
                  {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-red-700' : 'text-gray-500'}`}>
                  {stage}
                </span>
                
                {/* Tooltip for context */}
                {isActive && (
                  <div className="absolute -top-10 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    当前处理中...
                  </div>
                )}
              </div>

              {/* Connector Line */}
              {index < BUSINESS_LOOP_STAGES.length - 1 && (
                <div className="flex-1 h-[2px] mx-2 bg-gray-100 relative">
                  <div 
                    className={`absolute top-0 left-0 h-full bg-green-500 transition-all duration-500`}
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                  {isActive && (
                    <div className="absolute top-0 left-0 h-full bg-red-500 w-1/2 animate-pulse" />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};