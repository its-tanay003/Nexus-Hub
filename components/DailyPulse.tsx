import React, { useEffect, useState } from 'react';
import GlassCard from './GlassCard';
import { MessMenuItem, MailSummary, Announcement } from '../types';
import { fetchSimulatedMailSummaries } from '../services/geminiService';
import { io } from 'socket.io-client';

const DailyPulse: React.FC = () => {
  const [mails, setMails] = useState<MailSummary[]>([]);
  const [isLoadingMail, setIsLoadingMail] = useState(true);
  const [crowdLevel, setCrowdLevel] = useState(78);

  useEffect(() => {
    // Socket Listener for Crowd Meter
    const socket = io('http://localhost:4000/mess', { transports: ['websocket'] });
    socket.on('CROWD_UPDATE', (data: any) => {
      setCrowdLevel(data.level);
    });
    return () => { socket.disconnect(); }
  }, []);

  // Mock Data for Mess
  const messMenu: MessMenuItem = {
    category: 'Lunch',
    items: ['Paneer Butter Masala', 'Dal Makhani', 'Jeera Rice', 'Butter Naan', 'Gulab Jamun'],
    calories: 850,
    rating: 4.2,
    crowdLevel: crowdLevel // Dynamic from Socket
  };

  // Mock Data for Announcements
  const announcements: Announcement[] = [
    { id: '1', title: 'Campus Wi-Fi Maintenance', type: 'General', content: 'Scheduled downtime 2 AM - 4 AM.', timestamp: new Date() },
    { id: '2', title: 'Inter-College Hackathon', type: 'Academic', content: 'Registration closes tonight!', timestamp: new Date() },
  ];

  useEffect(() => {
    const loadMails = async () => {
      try {
        const data = await fetchSimulatedMailSummaries();
        setMails(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingMail(false);
      }
    };
    loadMails();
  }, []);

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
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {mails.map((mail) => (
                <div key={mail.id} className={`p-3 rounded-lg border ${mail.urgent ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/5'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-xs text-gray-300">{mail.sender}</span>
                    {mail.urgent && <span className="text-[10px] bg-red-500 text-white px-1 rounded">URGENT</span>}
                  </div>
                  <p className="text-sm text-gray-100 leading-snug">{mail.summary}</p>
                </div>
              ))}
              {mails.length === 0 && <p className="text-gray-400 text-sm text-center">Inbox Zero.</p>}
            </div>
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

      {/* Feature Showcase: Wellbeing (Placeholder) */}
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