
import React, { useState, useEffect, useCallback } from 'react';
import DaySelector from './DaySelector';
import TimetableCard from './TimetableCard';
import { useAuth } from '../../context/AuthContext';
import { TimetableSchedule } from '../../types';
import { io } from 'socket.io-client';

const TimetableDashboard: React.FC = () => {
  const { token } = useAuth();
  
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const [selectedDay, setSelectedDay] = useState<string>(days[new Date().getDay()]);
  
  const [schedules, setSchedules] = useState<TimetableSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  const fetchTimetable = useCallback(async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:4000/api/v1/academic/timetable/day/${selectedDay}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
          setSchedules(data.data);
        } else {
          setError("Could not load timetable");
        }
      } catch (err) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
  }, [selectedDay, token]);

  // Initial Load
  useEffect(() => {
    if (token) fetchTimetable();
  }, [fetchTimetable, token]);

  // Socket.IO Subscription
  useEffect(() => {
    const socket = io('http://localhost:4000/academic', { transports: ['websocket'] });
    
    socket.on('connect', () => {
        console.log("Connected to Academic Updates");
    });

    socket.on('SCHEDULE_UPDATE', (data: any) => {
        console.log("Real-time Schedule Update:", data);
        setUpdateMsg(data.message || "Schedule updated.");
        // Auto-refresh the timetable
        fetchTimetable();
        
        // Clear message after 5 seconds
        setTimeout(() => setUpdateMsg(null), 5000);
    });

    return () => { socket.disconnect(); };
  }, [fetchTimetable]);

  const handleSyncCalendar = async () => {
      try {
          const res = await fetch('http://localhost:4000/api/v1/academic/timetable/export', {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'nexus-timetable.ics';
          document.body.appendChild(a);
          a.click();
          a.remove();
      } catch (e) {
          alert("Failed to export calendar");
      }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Weekly Timetable</h1>
            <p className="text-gray-500 text-sm">Manage your classes and venues.</p>
         </div>
         <button 
            onClick={handleSyncCalendar}
            className="flex items-center gap-2 text-blue-600 text-sm font-bold bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors shadow-sm border border-blue-100"
         >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Sync Calendar (.ics)
         </button>
      </div>

      {/* Real-time Update Notification */}
      {updateMsg && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl flex items-center gap-3 animate-bounce-in shadow-sm">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <div>
                  <span className="font-bold text-sm block">Schedule Update</span>
                  <span className="text-xs">{updateMsg}</span>
              </div>
          </div>
      )}

      {/* Day Selector */}
      <DaySelector selectedDay={selectedDay} onSelect={setSelectedDay} />

      {/* Content Area */}
      <div className="min-h-[400px]">
        {loading ? (
           <div className="space-y-4 pt-4">
              {[1,2,3].map(i => (
                 <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-16 h-4 bg-gray-200 rounded mt-2"></div>
                    <div className="flex-1 h-32 bg-gray-100 rounded-xl"></div>
                 </div>
              ))}
           </div>
        ) : error ? (
           <div className="text-center py-12 bg-red-50 rounded-xl text-red-500 border border-red-100">
              {error}
           </div>
        ) : schedules.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-16 bg-white border border-dashed border-gray-300 rounded-2xl">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300 text-2xl shadow-inner">
                 ☕
              </div>
              <h3 className="text-lg font-bold text-gray-700">No classes scheduled</h3>
              <p className="text-gray-400 text-sm">Enjoy your free time!</p>
           </div>
        ) : (
           <div className="ml-4 md:ml-16 mt-6 space-y-2">
              {schedules.map(schedule => (
                 <TimetableCard key={schedule.id} schedule={schedule} />
              ))}
           </div>
        )}
      </div>
    </div>
  );
};

export default TimetableDashboard;
