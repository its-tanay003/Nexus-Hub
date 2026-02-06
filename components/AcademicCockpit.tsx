import React from 'react';
import { Card } from './Card';
import { ScheduleItem, Assignment } from '../types';

const AcademicCockpit: React.FC = () => {
  const schedule: ScheduleItem[] = [
    { id: '1', subject: 'Artificial Intelligence', code: 'CS-401', time: '10:00 AM', room: 'Room LT-1' },
    { id: '2', subject: 'Database Systems', code: 'CS-302', time: '11:30 AM', room: 'Room LT-3' },
    { id: '3', subject: 'Computer Networks Lab', code: 'CS-305', time: '02:00 PM', room: 'Room Lab-2' },
  ];

  const assignments: Assignment[] = [
    { id: '1', title: 'AI Project Proposal', subject: 'Due Tomorrow, 11:59 PM', dueDate: 'Tomorrow' },
    { id: '2', title: 'Database Lab Record', subject: 'Due in 3 days', dueDate: '3 days' },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Academic Cockpit</h1>
        <p className="text-gray-500">Timetable, assignments, and study resources.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Schedule */}
        <div className="lg:col-span-2">
          <Card 
            title="Weekly Schedule" 
            action={
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Export</button>
                <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 shadow-sm">Sync Calendar</button>
              </div>
            }
          >
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Monday</h4>
                <div className="space-y-3">
                  {schedule.map(item => (
                    <div key={item.id} className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="hidden md:block w-1 h-12 bg-gray-200 rounded-full group-hover:bg-blue-400 transition-colors"></div>
                        <div>
                          <h3 className="font-bold text-gray-900">{item.subject}</h3>
                          <p className="text-sm text-gray-500">🕙 {item.time} • 📍 {item.room}</p>
                        </div>
                      </div>
                      <span className="mt-2 md:mt-0 self-start md:self-center px-3 py-1 text-xs font-bold text-gray-600 border border-gray-200 rounded-full bg-white">
                        {item.code}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Tuesday</h4>
                <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center text-gray-400 text-sm">
                  No classes scheduled
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-500 to-sky-400 text-white border-none relative overflow-hidden">
             {/* Background decorative icon */}
             <div className="absolute right-[-20px] top-[-20px] opacity-20">
               <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
             </div>
             
             <div className="relative z-10">
               <p className="text-blue-100 text-sm font-medium">Current CGPA</p>
               <h2 className="text-5xl font-bold mt-2">8.75</h2>
               <div className="flex gap-2 mt-4">
                 <span className="px-2 py-1 bg-white/20 rounded text-xs">Sem 5</span>
                 <span className="px-2 py-1 bg-white/20 rounded text-xs">Rank #12</span>
               </div>
             </div>
          </Card>

          <Card title="Due Assignments">
            <div className="space-y-3">
              {assignments.map(assign => (
                <div key={assign.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-100">
                  <div className={`p-2 rounded-lg ${assign.id === '1' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-800">{assign.title}</h4>
                    <p className="text-xs text-red-500 font-medium">{assign.subject}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Study Vault">
             <div className="p-3 border border-gray-100 rounded-lg flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer bg-gray-50">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-red-100 text-red-500 rounded-lg">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 </div>
                 <div>
                   <h4 className="text-sm font-bold text-gray-800">Past Exam Papers</h4>
                   <p className="text-xs text-gray-500">PDF • 12 MB</p>
                 </div>
               </div>
               <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AcademicCockpit;
