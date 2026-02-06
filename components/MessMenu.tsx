import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { MessMenuItem } from '../types';
import { io } from 'socket.io-client';

const MessMenu: React.FC = () => {
  const [liveStats, setLiveStats] = useState({
    level: 45,
    status: 'Moderate',
    waitTime: '10 mins'
  });

  useEffect(() => {
    // Connect to the 'mess' namespace
    const socket = io('http://localhost:4000/mess', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to Mess Live Stream');
    });

    socket.on('CROWD_UPDATE', (data: any) => {
      console.log('Live Crowd Update:', data);
      setLiveStats(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const breakfast: MessMenuItem = {
    category: 'Breakfast',
    timeRange: '7:30 AM - 9:30 AM',
    items: ['Aloo Paratha', 'Curd', 'Tea/Coffee', 'Fruit'],
    calories: 650,
    protein: 18,
    carbs: 85,
    rating: 4.2,
    crowdLevel: liveStats.level // Initial mock, but updated by socket
  };

  const lunch: MessMenuItem = {
    category: 'Lunch',
    timeRange: '12:30 PM - 2:00 PM',
    items: ['Rajma Masala', 'Jeera Rice', 'Roti', 'Salad', 'Gulab Jamun'],
    calories: 850,
    rating: 4.5,
    crowdLevel: 75
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Mess Menu</h1>
           <p className="text-gray-500">What's cooking today? Track nutrition and crowd levels.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Rate Meal</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 shadow-sm">Feedback</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-1 rounded-xl inline-flex w-full md:w-auto border border-gray-100 shadow-sm">
         <button className="px-8 py-2 bg-gray-100 rounded-lg text-sm font-bold text-gray-800 shadow-sm">Today</button>
         <button className="px-8 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Tomorrow</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Breakfast */}
          <Card>
            <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-blue-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg></span>
                <h3 className="font-bold text-lg text-gray-800">{breakfast.category}</h3>
              </div>
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">{breakfast.timeRange}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <ul className="space-y-3">
                    {breakfast.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> {item}
                        {i === 0 && <span className="text-[10px] text-orange-500 bg-orange-50 border border-orange-100 px-1 rounded">Contains Gluten</span>}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Veg Options Available
                    </span>
                  </div>
               </div>

               <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Nutritional Info (Est.)</h4>
                  <div className="flex justify-between items-end mb-1">
                     <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">{breakfast.calories}</div>
                        <div className="text-xs text-gray-400">Kcal</div>
                     </div>
                     <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">{breakfast.protein}g</div>
                        <div className="text-xs text-gray-400">Protein</div>
                     </div>
                     <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">{breakfast.carbs}g</div>
                        <div className="text-xs text-gray-400">Carbs</div>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
               <span className="text-yellow-500 font-bold text-sm">★ {breakfast.rating} <span className="text-gray-400 font-normal">(120 votes)</span></span>
            </div>
          </Card>

          {/* Lunch Preview */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-orange-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></span>
                <h3 className="font-bold text-lg text-gray-800">{lunch.category}</h3>
              </div>
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">{lunch.timeRange}</span>
            </div>
            <ul className="space-y-1">
              {lunch.items.slice(0, 3).map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-300"></span> {item}
                </li>
              ))}
            </ul>
          </Card>

        </div>

        {/* Sidebar Status - REAL TIME */}
        <div className="space-y-6">
           <Card className={`transition-colors duration-500 ${liveStats.level > 70 ? 'bg-orange-500' : 'bg-blue-500'} text-white border-none`}>
              <div className="flex items-center gap-2 mb-4">
                 <div className={`w-2 h-2 rounded-full bg-white animate-pulse`}></div>
                 <span className="font-medium text-blue-100">Live Status • Socket.IO</span>
              </div>
              <h2 className="text-3xl font-bold text-center mb-1">{liveStats.status}</h2>
              <p className="text-center text-blue-100 text-sm mb-4">Approx. {liveStats.waitTime} wait time</p>
              
              <div className="w-full bg-black/20 rounded-full h-2.5 mb-2">
                 <div 
                    className="bg-white h-2.5 rounded-full transition-all duration-700 ease-out" 
                    style={{ width: `${liveStats.level}%` }}
                 ></div>
              </div>
              <p className="text-center text-xs text-blue-200">{liveStats.level}% Capacity</p>
           </Card>

           <Card title="Quick Poll">
              <p className="text-sm text-gray-500 mb-4">Vote for Sunday Special</p>
              <div className="space-y-3">
                 <div className="p-3 border border-gray-200 rounded-lg flex justify-between items-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <span className="text-sm font-medium text-gray-700">Chole Bhature</span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">45%</span>
                 </div>
                 <div className="p-3 border-2 border-blue-500 bg-blue-50 rounded-lg flex justify-between items-center cursor-pointer">
                    <span className="text-sm font-bold text-gray-900">Masala Dosa</span>
                    <span className="text-xs font-bold text-white bg-blue-500 px-2 py-1 rounded-full">55%</span>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default MessMenu;