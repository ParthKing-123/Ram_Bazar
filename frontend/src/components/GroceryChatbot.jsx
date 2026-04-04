import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, ChevronDown } from 'lucide-react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.5-flash';
const SYSTEM_PROMPT = `You are a friendly and knowledgeable grocery shopping assistant for Padmavati super bazar — a trusted grocery store in Pethvadgaon, Maharashtra. 

Your role is to:
- Help customers with grocery shopping advice and suggestions
- Recommend what to buy based on their needs (weekly groceries, festive shopping, meal planning, etc.)
- Suggest quantities and budgets
- Provide tips on storing groceries, seasonal items, and local produce
- Answer questions about categories like Grocery, Provision, Household items, Loose Grocery, Travel Accessories, and Personal Care products

Be warm, concise, and practical. Reply in the same language the user writes in (Hindi, Marathi, or English). Keep responses short and actionable.`;

const QUICK_PROMPTS = [
  '🛒 Weekly grocery list?',
  '🥘 Ingredients for dal-rice?',
  '🎉 Festival shopping tips',
  '💰 Budget grocery ideas',
];

async function callGemini(history) {
  if (!GEMINI_API_KEY) {
    return "⚠️ Gemini API key not configured. Please add `VITE_GEMINI_API_KEY` to `frontend/.env`.";
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT }],
    },
    {
      role: 'model',
      parts: [{ text: 'Understood! I\'m ready to help Padmavati super bazar customers with grocery advice. How can I help you today?' }],
    },
    ...history.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    })),
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 512, temperature: 0.7 } }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
}

const GroceryChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! 👋 I'm your Padmavati super bazar grocery assistant. Ask me anything — weekly lists, meal planning, budget tips, and more!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
      setHasUnread(false);
    }
  }, [open, messages]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    const userMsg = { role: 'user', text: userText };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const reply = await callGemini(newHistory.filter(m => m.role !== 'system'));
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      if (!open) setHasUnread(true);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: `❌ Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* FAB Button */}
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="relative w-14 h-14 bg-gradient-to-br from-brand-600 to-brand-800 hover:from-brand-700 hover:to-brand-900 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center group active:scale-95"
          aria-label="Open grocery assistant"
        >
          {open ? (
            <ChevronDown className="w-6 h-6 transition-transform" />
          ) : (
            <>
              <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-300 animate-pulse" />
            </>
          )}
          {hasUnread && !open && (
            <span className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white" />
          )}
        </button>
      </div>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-36 right-4 md:bottom-24 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
               style={{ height: '480px', maxHeight: 'calc(100vh - 160px)' }}>

            {/* Header */}
            <div className="bg-gradient-to-r from-brand-700 to-brand-900 px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Grocery Assistant</p>
                  <p className="text-white/60 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                    Powered by Gemini AI
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-brand-700" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-brand-700 text-white rounded-br-md'
                        : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-brand-700" />
                  </div>
                  <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />
                    <span className="text-xs text-gray-400">Thinking…</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto hide-scrollbar shrink-0 bg-gray-50">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="shrink-0 text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-xl hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-colors whitespace-nowrap shadow-sm"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 pb-3 pt-2 border-t border-gray-100 bg-white shrink-0">
              <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-brand-400 focus-within:bg-white transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask for grocery advice…"
                  rows={1}
                  className="flex-1 bg-transparent resize-none text-sm text-gray-800 placeholder-gray-400 focus:outline-none max-h-20"
                  style={{ lineHeight: '1.5' }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 bg-brand-700 hover:bg-brand-800 disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroceryChatbot;
