import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Image as ImageIcon, Mic, Sparkles, Paperclip, CheckCircle2, User } from 'lucide-react';
import { chatWithAiCoach, scanFoodPhoto } from '../../services/api';

interface AIAssistantPageProps {
  chatMessages: Array<{ sender: 'user' | 'ai'; text: string; image?: string }>;
  chatLoading: boolean;
  onSendMessage: (text: string, imageFile?: File) => void;
  userBudget: string;
}

export default function AIAssistantPage({
  chatMessages,
  chatLoading,
  onSendMessage,
  userBudget,
}: AIAssistantPageProps) {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    onSendMessage(inputText, selectedFile || undefined);
    setInputText('');
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    onSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto pb-4 space-y-4">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0d0d0f] border border-red-600/30 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-950/60 border border-red-600/40 flex items-center justify-center text-red-400">
            <Bot className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black uppercase text-white tracking-wider">AI LIFESTYLE COMMAND ASSISTANT</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30">
                GEMINI 3.6
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Nutrition, Training & Budget Intelligence Coach</p>
          </div>
        </div>
      </div>

      {/* Suggested Questions Pills */}
      <div className="flex overflow-x-auto gap-2 no-scrollbar py-1 shrink-0">
        {[
          'What should I eat tonight within my budget?',
          'What workout routine should I do today?',
          'How can I improve my protein intake?',
          'Analyze my spending and activity consistency',
        ].map((q) => (
          <button
            key={q}
            onClick={() => handleSuggestedPrompt(q)}
            className="px-3 py-1.5 rounded-lg bg-[#121216] hover:bg-zinc-800 border border-zinc-800 hover:border-red-600/30 text-xs font-bold text-zinc-300 hover:text-white whitespace-nowrap transition"
          >
            ✦ {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 bg-[#121216] border border-zinc-800 rounded-2xl p-4 overflow-y-auto space-y-4 shadow-inner">
        {chatMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold shrink-0 text-xs ${
                msg.sender === 'user'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-950/80 border border-red-600/40 text-red-400'
              }`}
            >
              {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </div>

            <div
              className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-red-900/40 border border-red-600/30 text-white rounded-tr-none'
                  : 'bg-[#080808] border border-zinc-800 text-zinc-200 rounded-tl-none shadow-md'
              }`}
            >
              {msg.image && (
                <img
                  src={msg.image}
                  alt="Attachment"
                  className="w-48 h-36 object-cover rounded-xl mb-2 border border-zinc-700"
                />
              )}
              <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
            </div>
          </div>
        ))}

        {/* AI Typing Indicator */}
        {chatLoading && (
          <div className="flex gap-3 max-w-[85%] items-center">
            <div className="h-8 w-8 rounded-lg bg-red-950/80 border border-red-600/40 flex items-center justify-center text-red-400">
              <Sparkles className="h-4 w-4 animate-spin" />
            </div>
            <div className="p-3 rounded-xl bg-[#080808] border border-zinc-800 text-xs font-bold text-red-400 flex items-center gap-1.5">
              <span>✦</span>
              <span className="animate-pulse">✦</span>
              <span className="animate-ping">✦</span>
              <span className="ml-2 text-zinc-400 font-normal">Analyzing stats & budget context...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="shrink-0 space-y-2">
        {filePreview && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#121216] border border-red-600/40 w-max text-xs">
            <img src={filePreview} alt="Preview" className="h-8 w-8 object-cover rounded" />
            <span className="text-zinc-300 font-bold">{selectedFile?.name}</span>
            <button
              type="button"
              onClick={() => { setSelectedFile(null); setFilePreview(null); }}
              className="text-red-400 hover:text-red-300 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 p-2 rounded-2xl bg-[#0d0d0f] border border-red-600/30 shadow-lg">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl bg-[#121216] hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-red-400 transition"
            title="Upload Food / Receipt Image"
          >
            <ImageIcon className="h-4 w-4" />
          </button>

          <input
            type="text"
            placeholder="Ask AI anything about food, workouts, budget..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
          />

          <button
            type="button"
            onClick={() => alert('Voice input active... speak your question!')}
            className="p-2 rounded-xl bg-[#121216] hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-amber-400 transition"
            title="Voice Command"
          >
            <Mic className="h-4 w-4" />
          </button>

          <button
            type="submit"
            disabled={chatLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold transition shadow-md shadow-red-600/20"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
