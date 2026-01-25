import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Bot, X, Sparkles, Volume2, Image as ImageIcon } from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessage, UserRole } from '../types';

interface AIAssistantProps {
  role: UserRole;
  onTaskCreate: (taskTitle: string) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ role, onTaskCreate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `你好！我是绝知APP的智能助手。当前为您提供${role === UserRole.STORE_MANAGER ? '门店经营' : '总部管理'}支持。请问有什么可以帮您？`,
      timestamp: new Date()
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      const responseText = await sendMessageToGemini(messages, input, role);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMsg]);

      // Simple heuristic to detect if AI suggested a task (for demo purposes)
      if (responseText.includes("任务") || responseText.includes("Task")) {
        // In a real app, we'd use function calling JSON output
        if (role === UserRole.STORE_MANAGER) {
           // Simulate task extraction
           onTaskCreate("AI生成: 关注近期销售异常 (来自对话)");
        }
      }

    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceSim = () => {
    // Simulation of Voice Input
    if (isProcessing) return;
    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
        setInput("查看本周异常数据预警");
    }, 1500);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-red-600 to-red-700 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-105 transition-transform z-50 group"
        >
          <Sparkles className="animate-pulse" />
          <span className="absolute -top-10 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            多模态交互中心
          </span>
        </button>
      )}

      {/* Chat Panel */}
      <div 
        className={`
          fixed z-50 bg-white shadow-2xl flex flex-col transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0 pointer-events-none'}
          bottom-0 right-0 w-full sm:w-[400px] h-[85vh] sm:h-[600px] sm:bottom-6 sm:right-6 sm:rounded-2xl border border-gray-100
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">智能助手</h3>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                在线 | Task Engine Enabled
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user' 
                    ? 'bg-red-600 text-white rounded-tr-sm' 
                    : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-sm'}
                `}
              >
                {msg.text}
                <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-red-200' : 'text-gray-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          ))}
          
          {isProcessing && (
             <div className="flex justify-start">
               <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 flex items-center gap-2">
                 <div className="flex space-x-1">
                   <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                   <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                   <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                 </div>
                 <span className="text-xs text-gray-500">思考中 (AI Attribution)...</span>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t">
            {/* Multimodal Toolbar */}
            <div className="flex gap-4 mb-3 px-1">
                <button className="text-gray-400 hover:text-red-500 transition-colors flex flex-col items-center gap-1">
                    <ImageIcon size={18} />
                    <span className="text-[10px]">视觉</span>
                </button>
                <button onClick={handleVoiceSim} className={`text-gray-400 hover:text-red-500 transition-colors flex flex-col items-center gap-1 ${isProcessing ? 'animate-pulse text-red-500' : ''}`}>
                    <Mic size={18} />
                    <span className="text-[10px]">{isProcessing ? '听取中' : '语音'}</span>
                </button>
                <button className="text-gray-400 hover:text-red-500 transition-colors flex flex-col items-center gap-1">
                    <Volume2 size={18} />
                    <span className="text-[10px]">播报</span>
                </button>
            </div>

          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入指令或提问..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
              className={`p-2 rounded-full ${input.trim() ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-400'}`}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};