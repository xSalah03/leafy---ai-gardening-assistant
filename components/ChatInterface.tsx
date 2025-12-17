
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Info, ExternalLink, Globe, Trash2, Sparkles, Sprout, Bug, Calendar, Trash, Search, X, Check, MessageCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import { chatWithAssistant, ChatResponse } from '../services/geminiService';

interface MessageWithSources extends ChatMessage {
  sources?: { title: string; uri: string }[];
}

const SUGGESTED_PROMPTS = [
  { icon: <Bug size={14} />, text: "Why are my leaves turning yellow?", label: "Diagnosis" },
  { icon: <Sprout size={14} />, text: "Best low-light indoor plants", label: "Advice" },
  { icon: <Calendar size={14} />, text: "When should I plant tomatoes?", label: "Calendar" },
  { icon: <Sparkles size={14} />, text: "How to propagate a Pothos", label: "Guide" }
];

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<MessageWithSources[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showGroundingInfo, setShowGroundingInfo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage
  useEffect(() => {
    const savedChat = localStorage.getItem('leafy-chat-v2');
    if (savedChat) {
      try {
        setMessages(JSON.parse(savedChat));
      } catch (e) {
        console.error("Failed to parse chat history");
        setMessages([]);
      }
    }
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('leafy-chat-v2', JSON.stringify(messages));
    } else {
      localStorage.removeItem('leafy-chat-v2');
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const contentToSend = textOverride || input.trim();
    if (!contentToSend || isLoading) return;

    const userMsg: MessageWithSources = { role: 'user', content: contentToSend };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);
    setShowGroundingInfo(false);

    try {
      const result: ChatResponse = await chatWithAssistant(newHistory);
      
      const assistantMsg: MessageWithSources = { 
        role: 'assistant', 
        content: typeof result.text === 'string' ? result.text : String(result.text || ""),
        sources: result.sources 
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having a bit of trouble connecting to my botanical roots right now. My database might be in a temporary drought. Could you try your question again in a moment?" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('leafy-chat-v2');
    setShowClearConfirm(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col h-[calc(100vh-22rem)] min-h-[500px] bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-2xl border border-stone-100 dark:border-stone-800 overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative transition-colors">
      {/* Tightened Header */}
      <div className="bg-emerald-700/5 dark:bg-emerald-900/10 px-6 py-4 flex items-center justify-between border-b border-stone-100 dark:border-stone-800 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-emerald-600 dark:bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20">
            <Bot size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 leading-none mb-1">Botanical Assistant</h3>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Leafy Online</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {showClearConfirm ? (
            <div className="flex items-center gap-1 animate-in slide-in-from-right-2">
              <button 
                onClick={clearChat}
                className="p-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all shadow-md active:scale-95 flex items-center gap-1"
                title="Confirm and delete chat history"
              >
                <Check size={16} />
                <span className="text-[10px] font-black uppercase px-1">Clear</span>
              </button>
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-all"
                title="Cancel chat clearing"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowClearConfirm(true)}
              className="p-2.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all active:scale-90"
              title="Clear entire conversation history"
              disabled={messages.length === 0}
            >
              <Trash2 size={18} />
            </button>
          )}

          <div className="h-6 w-[1px] bg-stone-100 dark:bg-stone-800 mx-1" />
          
          <button 
            onClick={() => setShowGroundingInfo(!showGroundingInfo)}
            className={`p-2.5 rounded-xl transition-all active:scale-90 ${showGroundingInfo ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'text-stone-300 dark:text-stone-600 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
            title="Search Grounding status and information"
          >
            <Globe size={18} />
          </button>
        </div>

        {/* Info Overlay for Search Grounding */}
        {showGroundingInfo && (
          <div className="absolute top-full right-6 mt-2 w-64 p-4 bg-stone-900 dark:bg-black text-white rounded-2xl shadow-2xl z-20 animate-in fade-in slide-in-from-top-2 duration-300 border border-stone-800">
            <div className="flex items-center gap-2 mb-2">
              <Globe size={14} className="text-emerald-400" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Search Grounding</h4>
            </div>
            <p className="text-[11px] text-stone-300 leading-relaxed font-medium">
              Leafy is connected to live Google Search data. This ensures your advice on planting times, local pests, and weather-specific care is always accurate and up-to-date.
            </p>
            <button 
              onClick={() => setShowGroundingInfo(false)}
              className="mt-3 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
            >
              Got it
            </button>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-stone-50/20 dark:bg-stone-950/20 scrollbar-hide relative">
{messages.length === 0 && (           <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-500">
     <div className="h-24 w-24 bg-white dark:bg-stone-800 rounded-[2rem] flex items-center justify-center mb-6 text-emerald-500 dark:text-emerald-400 shadow-xl shadow-emerald-500/5 border border-white dark:border-stone-700"><Bot size={48} strokeWidth={1.5} />
             </div>
             <h3 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3">Hello, Gardener!</h3>
             <p className="text-stone-500 dark:text-stone-400 font-medium max-w-md mb-8 leading-relaxed">
               I'm Leafy, your AI botanical expert. Ask me about plant care, pest diagnosis, or garden planning.
             </p>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt.text)}
                    title={`Ask: "${prompt.text}"`}
                    className="group flex flex-col items-start p-3 bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-2xl text-left hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 hover:shadow-lg transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        {prompt.icon}
                      </div>
                      <span className="text-[9px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest">{prompt.label}</span>
                    </div>
                    <p className="text-xs font-bold text-stone-700 dark:text-stone-300 group-hover:text-emerald-900 dark:group-hover:text-emerald-100">{prompt.text}</p>
                  </button>
                ))}
             </div>
           </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex flex-col gap-2 max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`shrink-0 h-8 w-8 rounded-xl flex items-center justify-center shadow-sm border ${
                  m.role === 'user' 
                    ? 'bg-stone-900 dark:bg-stone-700 text-white border-stone-800 dark:border-stone-600' 
                    : 'bg-white dark:bg-stone-800 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                }`}>
                  {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                
                <div className={`p-4 rounded-[1.5rem] shadow-sm text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-100 dark:border-stone-700 rounded-tl-none ring-4 ring-stone-50/50 dark:ring-stone-900/50'
                }`}>
                  {m.content}
                </div>
              </div>
              
              {m.sources && m.sources.length > 0 && (
                <div className="ml-11 mt-1 space-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest px-1">
                    <Globe size={10} className="text-emerald-500 dark:text-emerald-400" />
                    Knowledge Sources
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {m.sources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-2.5 py-1 bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-lg text-[9px] font-bold text-emerald-700 dark:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-md transition-all shadow-sm"
                      >
                        <span className="truncate max-w-[120px]">{source.title}</span>
                        <ExternalLink size={10} className="shrink-0 opacity-40" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="flex gap-3 max-w-[85%]">
              <div className="shrink-0 h-8 w-8 rounded-xl bg-white dark:bg-stone-800 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm animate-pulse">
                <Bot size={16} />
              </div>
              <div className="bg-white dark:bg-stone-800 p-4 rounded-[1.5rem] rounded-tl-none border border-stone-100 dark:border-stone-700 shadow-sm flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="h-1 w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1 w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1 w-1 bg-emerald-400 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compact Input Area */}
      <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] relative z-10 transition-colors">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            autoFocus
            placeholder="Ask anything about plants..."
            className="w-full bg-stone-100 dark:bg-stone-800 border-2 border-transparent rounded-2xl pl-5 pr-16 py-3 text-sm text-stone-800 dark:text-stone-100 focus:bg-white dark:focus:bg-stone-900 focus:border-emerald-500/30 dark:focus:border-emerald-500/50 outline-none transition-all placeholder:text-stone-400 dark:placeholder:text-stone-500 disabled:opacity-50"
          />
          <div className="absolute right-1.5">
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              title="Send message to Leafy"
              className="h-10 w-10 flex items-center justify-center bg-emerald-600 dark:bg-emerald-500 text-white rounded-[0.9rem] hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-30 transition-all shadow-lg shadow-emerald-500/10 active:scale-90"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </form>
        <p className="text-center mt-2 text-[8px] font-bold text-stone-300 dark:text-stone-600 uppercase tracking-widest">
          AI Botanist — Live with Search Grounding
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
