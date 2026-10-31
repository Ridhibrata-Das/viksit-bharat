'use client';

import React, { useState, useRef, useEffect } from 'react';
import { queryChat } from '../../lib/api';
import { ChatCitation } from '@viksit/shared';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Globe,
  CornerDownRight,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  citations?: ChatCitation[];
  matchedPromises?: Array<{ code: string; title: string; status: string }>;
  suggestedFollowUps?: string[];
  timestamp: string;
}

export function CitizenChatbot({ locale: initialLocale }: { locale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [locale, setLocale] = useState<'en' | 'bn'>(initialLocale === 'bn' ? 'bn' : 'en');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isBn = locale === 'bn';

  // Initialize welcome message when opened
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: isBn
            ? 'নমস্কার! আমি **সোনার বন্ধু**, বিকশিত বাংলা ২০৪৭ ড্যাশবোর্ডের অফিশিয়াল এআই নীতি সহকারী।\n\nপশ্চিমবঙ্গের নির্বাচনী প্রতিশ্রুতি, সরকারি গ্যাজেট, বাজেট বরাদ্দ এবং **২০৩৩ সালের ₹৮৫ লক্ষ কোটি ও ২০৪৭ সালের ₹৪২৫ লক্ষ কোটি জিএসডিপি** রূপরেখা সম্পর্কে যেকোনো প্রশ্ন আমাকে করতে পারেন।'
            : "Welcome! I am **Sonar Bondhu**, the official policy intelligence assistant for the Viksit Bengal 2047 Dashboard.\n\nAsk me anything about West Bengal's public commitments, gazette orders, budgetary sanctions, or the **two-phase GSDP trajectory (₹85 Lakh Cr by 2033 & ₹425 Lakh Cr by 2047)**.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedFollowUps: isBn
            ? [
                '১ কোটি চাকরির প্রতিশ্রুতির বর্তমান অগ্রগতি কী?',
                'দার্জিলিং চা শিল্পের জন্য কী সরকারি আদেশ দেওয়া হয়েছে?',
                '২০৩৩ ও ২০৪৭ সালের জিএসডিপি (₹ লক্ষ কোটি) লক্ষ্যমাত্রা কীভাবে অর্জিত হবে?',
                'আজকের সর্বশেষ যাচাইকৃত খতিয়ান দেখান',
              ]
            : [
                'What is the progress on the 1 crore jobs promise?',
                'Show tea industry updates in Darjeeling',
                'How will the ₹85 Lakh Cr (2033) & ₹425 Lakh Cr (2047) GSDP goals be achieved?',
                "What are today's verified governance updates?",
              ],
        },
      ]);
    }
  }, [locale, isBn]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const response = await queryChat({
        message: textToSend.trim(),
        locale,
      });

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.answer,
        citations: response.citations,
        matchedPromises: response.matchedPromises,
        suggestedFollowUps: response.suggestedFollowUps,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: isBn
          ? 'দুঃখিত, সংযোগে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
          : 'Sorry, unable to connect to the knowledge engine right now. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? (isBn ? 'এআই সহকারী বন্ধ করুন' : 'Close AI Assistant') : (isBn ? 'সোনার বন্ধু এআই সহকারী খুলুন' : 'Open Sonar Bondhu AI Assistant')}
          className="group relative flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white rounded-full shadow-2xl hover:shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-blue-400"
        >
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
          </span>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="font-bold text-sm tracking-wide">
              {isBn ? 'সোনার বন্ধু এআই' : 'Ask Bengal AI'}
            </span>
          </div>
        </button>
      </div>

      {/* Chat Drawer / Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="chatbot-heading"
          className="fixed bottom-24 right-4 md:right-8 z-50 w-[92vw] md:w-[440px] h-[580px] max-h-[80vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsOpen(false);
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border-b border-blue-950">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/40 rounded-xl text-amber-300">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 id="chatbot-heading" className="text-sm font-bold flex items-center gap-1.5">
                  <span>{isBn ? 'সোনার বন্ধু — বাংলা নীতি এআই' : 'Sonar Bondhu AI'}</span>
                  <span className="px-1.5 py-0.2 text-[10px] bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 font-mono">
                    RAG-Grounded
                  </span>
                </h3>
                <p className="text-[11px] text-slate-300">
                  {isBn ? 'যাচাইকৃত রাজ্য গ্যাজেট ও প্রতিশ্রুতি নিরীক্ষক' : 'Fact-checked policy & economic tracker'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
                title="Switch Language / ভাষা পরিবর্তন করুন"
                className="px-2 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 transition flex items-center gap-1 text-slate-200"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{locale === 'en' ? 'বাংলা' : 'EN'}</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label={isBn ? 'বন্ধ করুন' : 'Close'}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div
            className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/40"
            aria-live="polite"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm space-y-2.5'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Matched Promise Pills */}
                  {msg.matchedPromises && msg.matchedPromises.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        {isBn ? 'চিহ্নিত প্রতিশ্রুতি:' : 'Referenced Goals:'}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {msg.matchedPromises.map((p) => (
                          <span
                            key={p.code}
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                          >
                            [{p.code}] {p.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Citations List */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        {isBn ? 'যাচাইকৃত সূত্র ও প্রমাণাদি:' : 'Verified Sources & Citations:'}
                      </span>
                      <ul className="space-y-1 text-[11px]">
                        {msg.citations.map((c, i) => (
                          <li key={i} className="flex items-start gap-1 text-slate-600 dark:text-slate-300">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span className="truncate">{c.sourceTitle}</span>
                            {c.sourceUrl && c.sourceUrl !== '#' && (
                              <a
                                href={c.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline shrink-0 ml-1"
                              >
                                <ExternalLink className="w-3 h-3 inline" />
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Follow Up Suggested Chips */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400">
                        {isBn ? 'প্রস্তাবিত পরবর্তী প্রশ্ন:' : 'Suggested Follow-ups:'}
                      </span>
                      <div className="flex flex-col gap-1">
                        {msg.suggestedFollowUps.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(q)}
                            className="text-left px-2 py-1 bg-slate-50 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-300 rounded text-[11px] transition text-slate-600 dark:text-slate-300 flex items-center gap-1.5"
                          >
                            <CornerDownRight className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{q}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-[9px] text-right text-slate-400 mt-1">
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-2xl w-fit border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>{isBn ? 'তথ্য যাচাই ও অনুসন্ধান করা হচ্ছে...' : 'Verifying state records & synthesizing answer...'}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isBn ? 'প্রতিশ্রুতি, জেলা বা অর্থনীতি নিয়ে প্রশ্ন করুন...' : 'Ask about promises, districts, $1T goals...'}
              disabled={loading}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              type="submit"
              size="sm"
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
