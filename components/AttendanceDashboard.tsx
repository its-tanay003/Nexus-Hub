
import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { useAuth } from '../context/AuthContext';
import { AttendanceSummary, ClassSessionHistory } from '../types';

const AttendanceDashboard: React.FC = () => {
  const { token } = useAuth();
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [history, setHistory] = useState<ClassSessionHistory[]>([]);
  const [historyMeta, setHistoryMeta] = useState<{name: string, code: string} | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch Summaries on Load
  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/v1/attendance/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setSummaries(data.data);
        }
      } catch (err) {
        console.error("Failed to load attendance", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchSummaries();
  }, [token]);

  // Fetch Details when a subject is clicked
  const handleSubjectClick = async (subjectId: string) => {
    setSelectedSubject(subjectId);
    setLoadingDetail(true);
    try {
      const res = await fetch(`http://localhost:4000/api/v1/attendance/subject/${subjectId}`, {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.history);
        setHistoryMeta(data.subject);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const getStatusColor = (pct: number) => {
    if (pct >= 85) return 'bg-green-500';
    if (pct >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = (pct: number) => {
    if (pct >= 85) return 'text-green-600';
    if (pct >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );

  // --- DETAIL VIEW ---
  if (selectedSubject) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedSubject(null)}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">
               {historyMeta?.code} - {historyMeta?.name}
            </h1>
            <p className="text-sm text-gray-500">Detailed Attendance History</p>
          </div>
        </div>

        {loadingDetail ? (
           <div className="flex justify-center p-12">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
           </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             {history.length === 0 ? (
                 <div className="p-8 text-center text-gray-500">No classes recorded yet.</div>
             ) : (
                 <div className="divide-y divide-gray-100">
                    {history.map((session) => (
                      <div key={session.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors">
                         <div className="flex items-start gap-4 mb-2 md:mb-0">
                            <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-2 min-w-[60px]">
                               <span className="text-xs text-gray-500 font-bold uppercase">{new Date(session.date).toLocaleString('default', { month: 'short' })}</span>
                               <span className="text-xl font-bold text-gray-800">{new Date(session.date).getDate()}</span>
                            </div>
                            <div>
                               <h4 className="font-bold text-gray-800 text-sm">{session.topic}</h4>
                               <p className="text-xs text-gray-500">
                                  {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                  {new Date(session.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                               </p>
                            </div>
                         </div>
                         <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                            {session.remarks && (
                                <span className="text-xs text-gray-400 italic hidden md:block">{session.remarks}</span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                               ${session.status === 'PRESENT' ? 'bg-green-100 text-green-700' : 
                                 session.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                                 session.status === 'LATE' ? 'bg-yellow-100 text-yellow-700' :
                                 'bg-blue-100 text-blue-700'}
                            `}>
                               {session.status}
                            </span>
                         </div>
                      </div>
                    ))}
                 </div>
             )}
          </div>
        )}
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-2xl font-display font-bold text-gray-900">My Attendance</h1>
           <p className="text-gray-500">Track your eligibility and class history.</p>
        </div>
        <div className="flex gap-2">
           <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Safe (&gt;85%)
              <span className="w-2 h-2 rounded-full bg-yellow-500 ml-2"></span> Warning (&lt;85%)
              <span className="w-2 h-2 rounded-full bg-red-500 ml-2"></span> Critical (&lt;75%)
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {summaries.map((sub) => (
          <GlassCard 
             key={sub.subjectId} 
             className="cursor-pointer hover:shadow-lg hover:border-blue-200 group"
             
          >
             <div onClick={() => handleSubjectClick(sub.subjectId)}>
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{sub.subjectCode}</span>
                    <h3 className="font-bold text-gray-900 text-lg mt-1 group-hover:text-blue-600 transition-colors">{sub.subjectName}</h3>
                    <p className="text-xs text-gray-400">{sub.professor}</p>
                  </div>
                  <div className={`flex flex-col items-end ${getStatusText(sub.percentage)}`}>
                     <span className="text-3xl font-bold font-display">{sub.percentage}%</span>
                  </div>
               </div>

               <div className="space-y-2">
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                     <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${getStatusColor(sub.percentage)}`} 
                        style={{ width: `${sub.percentage}%` }}
                     ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 font-medium">
                     <span>{sub.attendedClasses} / {sub.totalClasses} Attended</span>
                     {sub.status !== 'Safe' && (
                        <span className={`${sub.status === 'Critical' ? 'text-red-500' : 'text-yellow-500'} font-bold flex items-center gap-1`}>
                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                           {sub.status}
                        </span>
                     )}
                  </div>
               </div>
             </div>
          </GlassCard>
        ))}

        {summaries.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white/30 rounded-2xl border border-dashed border-gray-300">
             <p>No subjects enrolled.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceDashboard;
