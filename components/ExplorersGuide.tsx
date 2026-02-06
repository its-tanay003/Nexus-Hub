import React from 'react';
import { Card } from './Card';
import { NearbyHub } from '../types';

const ExplorersGuide: React.FC = () => {
  const hubs: NearbyHub[] = [
    { id: '1', name: 'Central Park', distance: '0.2 km', tags: ['Green', 'Quiet', 'Sunset'], rating: 4.8 },
    { id: '2', name: 'Tech Cafe', distance: '0.5 km', tags: ['Coffee', 'Study', 'WiFi'], rating: 4.5 },
    { id: '3', name: 'Innovation Hub', distance: '0.8 km', tags: ['AC', 'Projects', 'Teamwork'], rating: 4.9 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Explorer's Guide</h1>
           <p className="text-gray-500">Navigate campus and discover hidden gems.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
             Campus Map
           </button>
           <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 shadow-sm">Shuttle Tracker</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map Placeholder */}
        <div className="lg:col-span-2">
          <div className="bg-gray-200 rounded-2xl h-[400px] w-full relative overflow-hidden group">
             {/* Abstract map background */}
             <div className="absolute inset-0 bg-[url('https://img.freepik.com/free-vector/city-map-navigation-interface-design_1017-31350.jpg')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-500"></div>
             
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/30 backdrop-blur-sm">
                <div className="bg-blue-500 p-4 rounded-full shadow-lg mb-4 animate-bounce">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Interactive Campus Map</h2>
                <p className="text-gray-600 mb-6">Find classrooms, labs, and shortest routes with AR navigation.</p>
                <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full shadow-lg transform transition hover:scale-105">
                  Launch Navigation
                </button>
             </div>
          </div>
        </div>

        {/* Nearby Hubs */}
        <div>
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-bold text-gray-800">Nearby Hubs</h2>
             <button className="text-sm text-blue-500 font-medium">View All</button>
           </div>
           
           <div className="space-y-4">
             {hubs.map(hub => (
               <div key={hub.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex gap-3 hover:shadow-md transition-shadow">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: `url('https://source.unsplash.com/random/100x100?${hub.name.replace(' ','')}')`}}></div>
                  <div className="flex-1">
                     <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 text-sm">{hub.name}</h3>
                        <span className="flex items-center text-xs font-bold text-yellow-500 bg-yellow-50 px-1.5 py-0.5 rounded">
                           ★ {hub.rating}
                        </span>
                     </div>
                     <p className="text-xs text-gray-500 mt-0.5 mb-2">📍 {hub.distance} away</p>
                     <div className="flex flex-wrap gap-1">
                        {hub.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded font-medium">{tag}</span>
                        ))}
                     </div>
                  </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorersGuide;
