
import React from 'react';

interface DaySelectorProps {
  selectedDay: string;
  onSelect: (day: string) => void;
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DaySelector: React.FC<DaySelectorProps> = ({ selectedDay, onSelect }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {DAYS.map((day, index) => {
        const isSelected = selectedDay === day;
        return (
          <button
            key={day}
            onClick={() => onSelect(day)}
            className={`
              flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-2xl transition-all duration-300
              ${isSelected 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
                : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}
            `}
          >
            <span className={`text-xs font-bold ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
              {SHORT_DAYS[index]}
            </span>
            {/* 
              In a real app, you might calculate the actual date (e.g., "12") for the current week here.
              For this perpetual timetable, we use a generic icon or index.
            */}
            <span className={`text-lg font-bold font-display ${isSelected ? 'text-white' : 'text-gray-600'}`}>
               {/* Simulating date for display purposes if needed, else just dot */}
               •
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default DaySelector;
