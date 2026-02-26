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
      text: `你好！我是绝知助手。有什么可以帮您？`,
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

      if (responseText.includes("任务") || responseText.includes("Task")) {
        if (role === UserRole.FRANCHISEE || role === UserRole.STORE_ASSISTANT) {
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
    if (isProcessing) return;
    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
        setInput("查看本周异常数据预警");
    }, 1500);
  };

  return (
    <>
      {/* Trigger Area - Invisible over the bottom nav button */}
      <div 
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-16 z-50 cursor-pointer opacity-0"
        onClick={() => setIsOpen(true)}
      ></div>

      {/* Chat Interface (Full Overlay in Mobile Container) */}
      <div 
        className={`
          absolute inset-0 z-[60] bg-white flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">智能助手</h3>
              <p className="text-[10px] text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Online
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-200 rounded-full text-gray-500">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 pb-20">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-red-600 text-white rounded-tr-sm' 
                    : 'bg-white text-gray-700 border border-gray-100 rounded-tl-sm'}
                `}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isProcessing && (
             <div className="flex justify-start">
               <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 flex items-center gap-2">
                 <div className="flex space-x-1">
                   <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                   <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                   <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                 </div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t safe-area-bottom">
           <div className="flex items-center gap-2 mb-2 px-1">
              <button className="text-gray-400"><ImageIcon size={20} /></button>
              <button onClick={handleVoiceSim} className={`text-gray-400 ${isProcessing ? 'text-red-500 animate-pulse' : ''}`}><Mic size={20} /></button>
           </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700"
            />
            <button 
              onClick={handleSend}
              className={`p-1.5 rounded-full ${input.trim() ? 'bg-red-600 text-white' : 'bg-gray-300 text-white'}`}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};