
import React from 'react';
import { TimetableSchedule } from '../../types';

interface TimetableCardProps {
  schedule: TimetableSchedule;
}

const TimetableCard: React.FC<TimetableCardProps> = ({ schedule }) => {
  // Enhanced Color Schemes based on Class Type
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'LAB': 
        return {
          badge: 'bg-purple-100 text-purple-700 border-purple-200',
          border: 'border-l-purple-500',
          bg: 'hover:bg-purple-50/50'
        };
      case 'TUTORIAL': 
        return {
            badge: 'bg-green-100 text-green-700 border-green-200',
            border: 'border-l-green-500',
            bg: 'hover:bg-green-50/50'
        };
      case 'WORKSHOP': 
        return {
            badge: 'bg-orange-100 text-orange-700 border-orange-200',
            border: 'border-l-orange-500',
            bg: 'hover:bg-orange-50/50'
        };
      default: // LECTURE
        return {
            badge: 'bg-blue-100 text-blue-700 border-blue-200',
            border: 'border-l-blue-500',
            bg: 'hover:bg-blue-50/50'
        };
    }
  };

  const styles = getTypeStyles(schedule.type);

  return (
    <div className="relative pl-6 pb-8 border-l-2 border-gray-200 last:border-0 last:pb-0 group">
      {/* Timeline Dot */}
      <div className={`
        absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm bg-gray-300 group-hover:bg-gray-400 transition-colors
      `}></div>

      {/* Time Label */}
      <div className="absolute -left-20 top-[-4px] text-right w-14">
        <span className="block text-sm font-bold text-gray-900">{schedule.startTime}</span>
        <span className="block text-xs text-gray-400">{schedule.endTime}</span>
      </div>

      {/* Card Content */}
      <div className={`
        bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all duration-300
        border-l-4 ${styles.border} ${styles.bg} hover:shadow-md
      `}>
        <div className="flex justify-between items-start mb-3">
          <div>
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${styles.badge}`}>
               {schedule.type}
             </span>
             <h3 className="text-lg font-bold text-gray-800 mt-2 leading-tight">{schedule.subject.name}</h3>
             <p className="text-sm text-gray-500 font-medium">{schedule.subject.code}</p>
          </div>
          
          {/* Teacher Avatar */}
          {schedule.teacher.avatarUrl ? (
            <img src={schedule.teacher.avatarUrl} alt={schedule.teacher.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 border-2 border-white shadow-sm">
               {schedule.teacher.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-50 text-sm">
           
           {/* Location */}
           <div className="flex items-center gap-2 text-gray-700">
             <div className="p-1.5 bg-gray-100 rounded-md text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
             </div>
             <div>
                <span className="block text-xs text-gray-400">Location</span>
                <span className="font-semibold">{schedule.classroom.block.code} - {schedule.classroom.number}</span>
             </div>
           </div>

           {/* Teacher Contact */}
           <div className="flex items-center gap-2 text-gray-700">
             <div className="p-1.5 bg-gray-100 rounded-md text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
             </div>
             <div>
                <span className="block text-xs text-gray-400">Teacher</span>
                <a href={`mailto:${schedule.teacher.email}`} className="font-semibold hover:text-blue-600 transition-colors">
                    {schedule.teacher.name}
                </a>
             </div>
           </div>
        </div>

        {/* Notes Section */}
        {schedule.notes && (
            <div className="mt-3 bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex gap-2">
                <svg className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                <div>
                    <span className="block text-[10px] font-bold text-yellow-700 uppercase">Session Notes</span>
                    <p className="text-xs text-yellow-800">{schedule.notes}</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default TimetableCard;
