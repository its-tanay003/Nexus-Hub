
import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { useAuth } from '../context/AuthContext';

type LoginMode = 'STUDENT' | 'ADMIN';

const LoginModal: React.FC = () => {
  const { login, isLoginModalOpen, closeLoginModal } = useAuth();
  
  const [mode, setMode] = useState<LoginMode>('STUDENT');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (isLoginModalOpen) {
        setError('');
        setIdentifier('');
        setPassword('');
    }
  }, [isLoginModalOpen]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (isLoginModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const endpoint = mode === 'STUDENT' 
        ? 'http://localhost:4000/api/v1/auth/login/student' 
        : 'http://localhost:4000/api/v1/auth/login/admin';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            identifier: mode === 'STUDENT' ? identifier : undefined,
            email: mode === 'ADMIN' ? identifier : undefined,
            password, 
            rememberMe 
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');

      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={closeLoginModal}></div>
      <div className="max-w-md w-full relative z-10">
        
        {/* Close Button */}
        <button 
            onClick={closeLoginModal}
            className="absolute -right-2 -top-12 text-gray-400 hover:text-white"
        >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Mode Toggles */}
        <div className="absolute -top-12 left-0 w-full flex justify-center gap-4">
            <button 
                onClick={() => setMode('STUDENT')}
                className={`px-6 py-2 rounded-t-xl font-bold text-sm transition-all duration-300 ${mode === 'STUDENT' ? 'bg-blue-600 text-white translate-y-1 shadow-lg' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
                Student
            </button>
            <button 
                onClick={() => setMode('ADMIN')}
                className={`px-6 py-2 rounded-t-xl font-bold text-sm transition-all duration-300 ${mode === 'ADMIN' ? 'bg-gray-800 text-red-400 border-t-2 border-red-500 translate-y-1 shadow-lg' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
                Staff
            </button>
        </div>

        <GlassCard className={`border-t-4 shadow-2xl transition-colors duration-500 ${mode === 'STUDENT' ? 'border-t-blue-500 bg-white/10' : 'border-t-red-500 bg-gray-900/90'}`}>
          <div className="text-center mb-6">
            <div className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-xl mb-3 shadow-lg ${mode === 'STUDENT' ? 'bg-blue-500 shadow-blue-500/30' : 'bg-red-600 shadow-red-500/30'}`}>
                {mode === 'STUDENT' ? 'N' : 'A'}
            </div>
            <h2 className="text-2xl font-display font-bold text-white">
                {mode === 'STUDENT' ? 'Login Required' : 'Restricted Access'}
            </h2>
            <p className="text-gray-300 text-sm">
                {mode === 'STUDENT' ? 'Please sign in to access this feature.' : 'Authorized personnel only'}
            </p>
          </div>

          {error && (
            <div className={`mb-4 p-3 border rounded-lg text-xs text-center flex items-center justify-center gap-2 ${mode === 'STUDENT' ? 'bg-red-500/20 border-red-500/30 text-red-200' : 'bg-red-900/50 border-red-700 text-red-100'}`}>
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1 ml-1">
                  {mode === 'STUDENT' ? 'Username or Email' : 'Administrative Email'}
              </label>
              <input 
                type="text" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors ${mode === 'STUDENT' ? 'border-white/10 focus:border-blue-500' : 'border-red-500/30 focus:border-red-500'}`}
                placeholder="Enter anything for demo"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1 ml-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors ${mode === 'STUDENT' ? 'border-white/10 focus:border-blue-500' : 'border-red-500/30 focus:border-red-500'}`}
                placeholder="Enter anything"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400">
                <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                    <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className={`rounded bg-white/10 border-white/20 ${mode === 'STUDENT' ? 'text-blue-500 focus:ring-blue-500' : 'text-red-500 focus:ring-red-500'}`} 
                    />
                    Remember me
                </label>
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 ${mode === 'STUDENT' ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}
            >
                {isLoading ? "Authenticating..." : (mode === 'STUDENT' ? "Sign In" : "Access Admin")}
            </button>
          </form>
          
          <div className="mt-4 text-center">
             <p className="text-[10px] text-gray-500">Hackathon Mode: Enter any non-empty credentials.</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default LoginModal;
