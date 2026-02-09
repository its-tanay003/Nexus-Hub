
import React, { useEffect, useState, useCallback } from 'react';
import GlassCard from './GlassCard';
import { MessMenuItem, MailSummary, Announcement } from '../types';
import { fetchSimulatedMailSummaries } from '../services/geminiService';
import { io } from 'socket.io-client';
import { useToast } from '../context/ToastContext';

const DailyPulse: React.FC = () => {
  const { addToast } = useToast();
  const [mails, setMails] = useState<MailSummary[]>([]);
  const [isLoadingMail, setIsLoadingMail] = useState(true);
  const [crowdLevel, setCrowdLevel] = useState(78);
  const [retryCooldown, setRetryCooldown] = useState(0);

  useEffect(() => {
    // Socket Listener for Crowd Meter
    const socket = io('http://localhost:4000/mess', { transports: ['websocket'] });
    socket.on('CROWD_UPDATE', (data: any) => {
      setCrowdLevel(data.level);
    });
    return () => { socket.disconnect(); }
  }, []);

  const loadMails = useCallback(async () => {
    setIsLoadingMail(true);
    try {
      const data = await fetchSimulatedMailSummaries();
      setMails(data);

      // Check for fallback content
      const fallbackCount = data.filter(m => m.isFallback).length;
      if (fallbackCount > 0) {
        addToast(`System Busy: ${fallbackCount} emails processed with basic summarization.`, 'warning');
      } else {
        // Only show success toast if we explicitly refreshed
        if (retryCooldown > 0) addToast("Inbox refreshed successfully!", 'success');
      }
    } catch (e) {
      console.error(e);
      addToast("Failed to load emails", 'error');
    } finally {
      setIsLoadingMail(false);
    }
  }, [addToast, retryCooldown]);

  // Initial Load
  useEffect(() => {
    loadMails();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cooldown Timer Logic
  useEffect(() => {
    if (retryCooldown > 0) {
      const timer = setInterval(() => setRetryCooldown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [retryCooldown]);

  const handleRetry = () => {
    if (retryCooldown > 0) return;
    setRetryCooldown(30); // 30s cooldown
    loadMails();
  };

  // Mock Data for Mess
  const messMenu: MessMenuItem = {
    category: 'Lunch',
    items: ['Paneer Butter Masala', 'Dal Makhani', 'Jeera Rice', 'Butter Naan', 'Gulab Jamun'],
    calories: 850,
    rating: 4.2,
    crowdLevel: crowdLevel
  };

  const announcements: Announcement[] = [
    { id: '1', title: 'Campus Wi-Fi Maintenance', type: 'General', content: 'Scheduled downtime 2 AM - 4 AM.', timestamp: new Date() },
    { id: '2', title: 'Inter-College Hackathon', type: 'Academic', content: 'Registration closes tonight!', timestamp: new Date() },
  ];

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          The Daily Pulse
        </h1>
        <p className="text-gray-400 mt-2">Welcome back, Architect.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Module 1: Live Mess Menu */}
        <GlassCard title="Live Mess Menu" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-yellow-400">{messMenu.category}</span>
              <span className="text-sm bg-white/10 px-2 py-1 rounded">⭐ {messMenu.rating}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-1">
              {messMenu.items.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> {item}
                </li>
              ))}
            </ul>
            
            {/* Crowd Meter */}
            <div className="pt-2">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Crowd Meter</span>
                <span className={`${crowdLevel > 70 ? 'text-red-400' : 'text-green-400'}`}>
                  {crowdLevel}% Full
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${crowdLevel > 70 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-blue-500'}`} 
                  style={{ width: `${crowdLevel}%` }}
                ></div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Module 2: AI Mail Summarizer */}
        <GlassCard title="AI Mail Summarizer" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}>
          {isLoadingMail ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <p className="text-xs text-blue-300 animate-pulse">Gemini is reading your emails...</p>
            </div>
          ) : (
            <>
              {/* Fallback Notification Banner */}
              {mails.some(m => m.isFallback) && (
                 <div className="mb-3 p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
                    <svg className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <div className="flex-1">
                       <h4 className="text-[11px] font-bold text-yellow-200 uppercase tracking-wide">AI Capacity Limit Reached</h4>
                       <p className="text-[10px] text-yellow-100/80 leading-relaxed mt-0.5">
                          High demand is impacting the Neural Engine. Basic summaries are shown. 
                          <button onClick={handleRetry} className="underline ml-1 hover:text-white" disabled={retryCooldown > 0}>
                             Try refreshing
                          </button> in a moment.
                       </p>
                    </div>
                 </div>
              )}

              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                {mails.map((mail) => (
                  <div key={mail.id} className={`p-3 rounded-lg border transition-colors ${
                      mail.isFallback ? 'bg-yellow-900/10 border-yellow-500/20' : 
                      mail.urgent ? 'bg-red-500/10 border-red-500/30' : 
                      'bg-white/5 border-white/5'
                    }`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-xs text-gray-300">{mail.sender}</span>
                      <div className="flex gap-1">
                         {mail.isFallback && (
                           <span className="text-[9px] bg-yellow-600/30 text-yellow-200 px-1 rounded border border-yellow-500/30 cursor-help" title={mail.fallbackReason}>
                             {mail.fallbackReason === 'Network Error' ? 'OFFLINE' : 'BUSY'}
                           </span>
                         )}
                         {mail.urgent && <span className="text-[10px] bg-red-500 text-white px-1 rounded">URGENT</span>}
                      </div>
                    </div>
                    <p className={`text-sm leading-snug ${mail.isFallback ? 'text-gray-300 italic' : 'text-gray-100'}`}>
                      {mail.summary}
                    </p>
                  </div>
                ))}
                {mails.length === 0 && <p className="text-gray-400 text-sm text-center">Inbox Zero.</p>}
              </div>

              {/* Retry / Status Footer */}
              <div className="mt-4 pt-2 border-t border-white/5 flex justify-between items-center">
                 <span className="text-[10px] text-gray-500">
                    {retryCooldown > 0 ? `Retry in ${retryCooldown}s` : "Updated just now"}
                 </span>
                 <button 
                   onClick={handleRetry}
                   disabled={retryCooldown > 0 || isLoadingMail}
                   className={`text-xs px-2 py-1 rounded transition-colors ${
                     retryCooldown > 0 
                       ? 'text-gray-600 cursor-not-allowed' 
                       : 'text-blue-400 hover:text-blue-300 hover:bg-white/5'
                   }`}
                 >
                   Refresh
                 </button>
              </div>
            </>
          )}
        </GlassCard>

        {/* Module 3: Announcements */}
        <GlassCard title="Campus Feed" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>}>
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="flex gap-3 items-start border-l-2 border-blue-500 pl-3">
                <div>
                  <h4 className="font-semibold text-sm text-gray-200">{ann.title}</h4>
                  <p className="text-xs text-gray-400">{ann.content}</p>
                  <span className="text-[10px] text-gray-500 uppercase">{ann.type} • Today</span>
                </div>
              </div>
            ))}
            <button className="w-full py-2 text-xs text-blue-300 hover:text-blue-200 bg-white/5 rounded mt-2">
              View All Announcements
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Feature Showcase: Wellbeing */}
      <GlassCard className="mt-6" title="Student Wellbeing">
        <div className="grid grid-cols-2 gap-4">
          <button className="p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-xl flex flex-col items-center gap-2 transition-colors">
            <span className="text-2xl">🧠</span>
            <span className="text-sm font-semibold">Vent Box</span>
            <span className="text-xs text-gray-400">Anonymous Support</span>
          </button>
           <button className="p-4 bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/30 rounded-xl flex flex-col items-center gap-2 transition-colors">
            <span className="text-2xl">📚</span>
            <span className="text-sm font-semibold">Study Buddies</span>
            <span className="text-xs text-gray-400">Find a group</span>
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default DailyPulse;
