import React, { useEffect, useState } from 'react';
import { Card } from './Card';
import { MailSummary } from '../types';
import { fetchSimulatedMailSummaries } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const [mails, setMails] = useState<MailSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSimulatedMailSummaries();
        // Enhance mock data with types and relative time for UI
        const enhancedData = data.map((m, i) => ({
          ...m,
          type: i === 0 ? 'Event' : i === 1 ? 'Academic' : 'Lost & Found',
          timeAgo: i === 0 ? '2 hours ago' : i === 1 ? '5 hours ago' : 'Yesterday'
        })) as MailSummary[];
        setMails(enhancedData);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Good Morning, John! 👋</h1>
          <p className="text-gray-500 mt-1">Here's what's happening on campus today.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 flex items-center gap-2">
          <span className="text-xl">☀️</span> 
          <span className="font-bold text-gray-700">28°C</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Academics & Mess */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Up Next</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-blue-500">
               <div className="flex justify-between items-start mb-2">
                 <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded">CS-401</span>
                 <span className="text-gray-500 text-sm">🕙 10:00 AM</span>
               </div>
               <h3 className="text-xl font-bold text-gray-900">Artificial Intelligence</h3>
               <p className="text-gray-500 text-sm mt-1">📍 Room LT-1</p>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
              <h3 className="font-bold text-lg mb-1">Class Progress</h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-bold">75%</span>
                <span className="text-sm text-blue-100 mb-1">Attendance Met</span>
              </div>
              <div className="w-full bg-blue-800/30 rounded-full h-2">
                <div className="bg-white rounded-full h-2 w-3/4"></div>
              </div>
            </Card>
          </div>

          <div className="flex justify-between items-center mt-8">
            <h2 className="text-xl font-bold text-gray-800">On the Menu</h2>
            <button className="text-blue-500 font-semibold text-sm hover:underline">View Full Menu →</button>
          </div>

          <Card>
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-4 flex items-center justify-between">
              <span className="text-orange-800 font-medium text-sm">📈 Mess Rush Level: <strong>Moderate</strong></span>
              <span className="bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded-full">Moderate</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <div className="pt-2 md:pt-0">
                <h4 className="text-blue-500 font-bold uppercase text-xs mb-2">Breakfast</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Aloo Paratha</li>
                  <li>• Curd</li>
                  <li>• Tea/Coffee</li>
                  <li>• Fruit</li>
                </ul>
              </div>
              <div className="pt-4 md:pt-0 md:pl-4">
                <h4 className="text-orange-500 font-bold uppercase text-xs mb-2">Lunch</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="font-medium text-gray-900">• Rajma Masala</li>
                  <li>• Jeera Rice</li>
                  <li>• Roti</li>
                  <li>• Salad</li>
                </ul>
              </div>
              <div className="pt-4 md:pt-0 md:pl-4">
                <h4 className="text-purple-500 font-bold uppercase text-xs mb-2">Dinner</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Paneer Butter Masala</li>
                  <li>• Dal Makhani</li>
                  <li>• Naan</li>
                  <li>• Rice</li>
                </ul>
              </div>
            </div>
          </Card>
          
          <div className="mt-6">
             <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Food Reviews</h2>
             <div className="flex gap-4 overflow-x-auto pb-2">
                {[1, 2].map((i) => (
                  <div key={i} className="min-w-[200px] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                       <span className="text-xs font-bold">Student #{i}</span>
                    </div>
                    <p className="text-sm text-gray-600">"The Rajma today was actually pretty good!"</p>
                    <div className="flex text-yellow-400 text-xs mt-2">⭐⭐⭐⭐</div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column: Mail Briefs */}
        <div className="space-y-6">
           <Card title="⚡ Mail Briefs" className="h-full">
              <p className="text-xs text-gray-400 mb-4">AI-generated summaries of your inbox</p>
              {loading ? (
                <div className="animate-pulse space-y-4">
                   <div className="h-20 bg-gray-100 rounded-lg"></div>
                   <div className="h-20 bg-gray-100 rounded-lg"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {mails.map((mail) => (
                    <div key={mail.id} className="pb-4 border-b border-gray-50 last:border-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                          mail.type === 'Event' ? 'bg-red-50 text-red-600 border-red-100' : 
                          mail.type === 'Academic' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                          'bg-gray-50 text-gray-600 border-gray-100'
                        }`}>
                          {mail.type}
                        </span>
                        <span className="text-xs text-gray-400">{mail.timeAgo}</span>
                      </div>
                      <h4 className="font-bold text-sm text-gray-800 mt-1">{mail.subject}</h4>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{mail.summary}</p>
                    </div>
                  ))}
                </div>
              )}
              <button className="w-full mt-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                View All Emails
              </button>
           </Card>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
