
import React, { useState } from 'react';
import SOSButton from './components/SOSButton';
import Dashboard from './components/Dashboard';
import AcademicCockpit from './components/AcademicCockpit';
import MessMenu from './components/MessMenu';
import ExplorersGuide from './components/ExplorersGuide';
import LoginModal from './components/LoginModal'; 
import ProfilePage from './components/ProfilePage'; // Import
import { useAuth } from './context/AuthContext'; 

const App: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth(); 
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleSOSTrigger = async (coords: { lat: number; lng: number }) => {
    console.log("SENDING SOS TO BACKEND:", coords);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { id: 'mess', label: 'Mess Menu', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
    { id: 'academics', label: 'Academics', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { id: 'marketplace', label: 'Marketplace', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
    { id: 'explore', label: 'Explore', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg> },
    { id: 'profile', label: 'My Profile', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      
      {/* Login Modal Overlay */}
      <LoginModal />

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed inset-y-0 z-20">
        <div className="p-6 flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold font-display">N</div>
           <span className="font-bold text-xl text-gray-900 tracking-tight">Nexus</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              disabled={!isAuthenticated} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                ${activeTab === item.id 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
           {isAuthenticated ? (
             <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer" onClick={() => setActiveTab('profile')}>
                {user?.avatar ? (
                    <img src={`http://localhost:4000${user.avatar}`} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-xs uppercase">
                        {user?.name.slice(0, 2) || "U"}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                   <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                   <p className="text-xs text-gray-500 truncate">{user?.role}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); logout(); }} className="text-gray-400 hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
             </div>
           ) : (
             <div className="text-center text-xs text-gray-400">Please Sign In</div>
           )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 md:ml-64 flex flex-col min-w-0 transition-all ${!isAuthenticated ? 'blur-sm pointer-events-none select-none overflow-hidden h-screen' : ''}`}>
         
         {/* Top Bar */}
         <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex-1 max-w-xl">
               <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </span>
                  <input 
                    type="text" 
                    placeholder="Search for students, events, or lost items..." 
                    className="w-full bg-gray-50 border border-gray-100 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
               </div>
            </div>
            <div className="flex items-center gap-4">
               <button className="relative text-gray-500 hover:text-gray-900">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
               </button>
            </div>
         </header>

         {/* Scrollable Canvas */}
         <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'academics' && <AcademicCockpit />}
              {activeTab === 'mess' && <MessMenu />}
              {activeTab === 'explore' && <ExplorersGuide />}
              {activeTab === 'profile' && <ProfilePage />}
              {activeTab === 'marketplace' && (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                   <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                   </div>
                   <h2 className="text-xl font-bold text-gray-900">Marketplace</h2>
                   <p className="text-gray-500 mt-2">Buy & Sell feature coming soon.</p>
                </div>
              )}
            </div>
         </main>
      </div>

      <SOSButton onTrigger={handleSOSTrigger} />
    </div>
  );
};

export default App;
