import React, { useState } from 'react';
import { 
  AlertTriangle, 
  BrainCircuit, 
  ArrowRight, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Send,
  Loader2,
  RefreshCw,
  FileText
} from 'lucide-react';
import { ExceptionAlert } from '../types';

interface ExceptionAlertModuleProps {
  alerts: ExceptionAlert[];
  onAssignTask: (alertId: string) => void;
  onVerify: (alertId: string) => void;
}

export const ExceptionAlertModule: React.FC<ExceptionAlertModuleProps> = ({ 
  alerts, 
  onAssignTask, 
  onVerify 
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filter out resolved alerts so they don't appear in the list
  const activeAlerts = alerts.filter(a => a.status !== 'resolved');

  if (activeAlerts.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-white px-6 py-4 border-b border-red-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-lg text-red-600 animate-pulse">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">门店异常与预警中心</h3>
            <p className="text-xs text-red-500 font-medium">检测到 {activeAlerts.length} 项待处理异常</p>
          </div>
        </div>
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <RefreshCw size={12} /> 实时监控中
        </div>
      </div>

      {/* Alert List */}
      <div className="divide-y divide-gray-50">
        {activeAlerts.map((alert) => {
          const isExpanded = expandedId === alert.id;
          const isProcessing = alert.status === 'processing' || alert.status === 'assigned';
          
          return (
            <div key={alert.id} className={`transition-colors ${isExpanded ? 'bg-red-50/30' : 'hover:bg-gray-50'}`}>
              
              {/* Summary Row */}
              <div 
                className="px-6 py-4 cursor-pointer flex items-center justify-between"
                onClick={() => toggleExpand(alert.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Status Indicator */}
                  <div className={`
                    w-2 h-2 rounded-full flex-shrink-0
                    ${alert.status === 'new' ? 'bg-red-500 animate-ping' : 
                      alert.status === 'pending_verification' ? 'bg-amber-500' :
                      'bg-blue-500'}
                  `} />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        alert.severity === 'high' 
                          ? 'bg-red-100 text-red-700 border-red-200' 
                          : 'bg-amber-100 text-amber-700 border-amber-200'
                      }`}>
                        {alert.severity === 'high' ? '严重' : '一般'}
                      </span>
                      <h4 className="font-semibold text-sm text-gray-800">
                        {alert.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock size={12} /> {alert.timestamp}</span>
                      <span className="flex items-center gap-1">
                        <User size={12} /> 
                        {alert.status === 'new' ? '待分配' : `执行人: ${alert.assignedTo}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Status Badge */}
                  <div className="text-right mr-2">
                     <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        alert.status === 'new' ? 'text-red-600 bg-red-50' :
                        alert.status === 'assigned' ? 'text-blue-600 bg-blue-50' :
                        alert.status === 'processing' ? 'text-blue-600 bg-blue-50' :
                        'text-amber-600 bg-amber-50'
                     }`}>
                       {alert.status === 'new' ? '需处理' :
                        alert.status === 'assigned' ? '已下发' :
                        alert.status === 'processing' ? '处理中' :
                        '待验证'}
                     </span>
                  </div>
                  {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-0 animate-in fade-in duration-300">
                  <div className="ml-6 pl-4 border-l-2 border-gray-100 space-y-4">
                    
                    {/* Attribution Section */}
                    <div className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BrainCircuit size={40} className="text-indigo-600" />
                      </div>
                      <h5 className="text-xs font-bold text-indigo-600 mb-2 flex items-center gap-1">
                        <BrainCircuit size={14} /> AI 智能归因分析
                      </h5>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {alert.attribution}
                      </p>
                    </div>

                    {/* Action Flow */}
                    <div className="space-y-3">
                      
                      {/* Step 1: Assign Task */}
                      <div className={`flex items-center justify-between p-3 rounded-lg border ${
                        alert.status === 'new' ? 'bg-white border-red-100 shadow-sm' : 'bg-gray-50 border-transparent opacity-60'
                      }`}>
                         <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center ${alert.status === 'new' ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'}`}>
                             <Send size={16} />
                           </div>
                           <div>
                             <div className="text-sm font-medium text-gray-800">下发处理任务</div>
                             <div className="text-xs text-gray-500">建议操作: {alert.recommendedTask}</div>
                           </div>
                         </div>
                         {alert.status === 'new' && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); onAssignTask(alert.id); }}
                             className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex items-center gap-2"
                           >
                             立即下发 <ArrowRight size={14} />
                           </button>
                         )}
                      </div>

                      {/* Step 2: Progress Tracking */}
                      {(alert.status !== 'new') && (
                        <div className={`p-3 rounded-lg border ${isProcessing ? 'bg-white border-blue-100 shadow-sm' : 'bg-gray-50 border-transparent opacity-60'}`}>
                           <div className="flex justify-between items-center mb-2">
                             <div className="flex items-center gap-3">
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isProcessing ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                                 {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                               </div>
                               <div>
                                 <div className="text-sm font-medium text-gray-800">
                                   {isProcessing ? '店员正在处理中...' : '处理阶段已完成'}
                                 </div>
                                 <div className="text-xs text-gray-500">执行人: {alert.assignedTo}</div>
                               </div>
                             </div>
                             <span className="text-xs font-bold text-blue-600">{alert.progress}%</span>
                           </div>
                           <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                             <div 
                               className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out" 
                               style={{ width: `${alert.progress}%` }}
                             />
                           </div>
                        </div>
                      )}

                      {/* Step 3: Result Verification */}
                      {(alert.status === 'pending_verification') && (
                         <div className="p-3 rounded-lg border bg-white border-amber-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-100 text-amber-600">
                                <CheckCircle2 size={16} />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-800">
                                  结果待验证
                                </div>
                                <div className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded flex items-start gap-1">
                                  <FileText size={10} className="mt-0.5" />
                                  反馈: {alert.resultSummary || "已完成相关调整，请确认指标恢复情况。"}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-end gap-2">
                              <button className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                                退回重做
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onVerify(alert.id); }}
                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1"
                              >
                                <CheckCircle2 size={12} /> 确认消除异常
                              </button>
                            </div>
                         </div>
                      )}

                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};