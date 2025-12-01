import React, { useState } from 'react';
import { Employee, AttendanceRecord } from '../types';
import { generatePayrollInsight } from '../services/geminiService';
import { Sparkles, Send, Bot, User } from 'lucide-react';

interface AiAssistantProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ employees, attendance }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hello! I am your Shop Assistant. Ask me about attendance trends, staff performance, or payroll queries.' }
  ]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setQuery('');
    setIsLoading(true);

    const response = await generatePayrollInsight(userMsg, employees, attendance);
    
    setMessages(prev => [...prev, { role: 'ai', content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="h-[calc(100vh-2rem)] md:h-[600px] flex flex-col bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden m-4 md:m-0">
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-violet-500 to-purple-600 text-white flex items-center gap-2">
        <Sparkles size={20} className="text-yellow-300" />
        <h3 className="font-semibold">AI Insights Assistant</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-purple-100 text-purple-600'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
               <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Bot size={16} />
               </div>
               <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleAsk} className="flex gap-2">
          <input 
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g., Who was late most often this month?"
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
          <button 
            type="submit" 
            disabled={isLoading || !query.trim()}
            className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};