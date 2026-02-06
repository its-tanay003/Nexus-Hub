
import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { useAuth } from '../context/AuthContext';

type LoginMode = 'STUDENT' | 'ADMIN';

const LoginModal: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  
  const [mode, setMode] = useState<LoginMode>('STUDENT');
  const [identifier, setIdentifier] = useState(''); // Email or RegNo
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Captcha State
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaChallenge, setCaptchaChallenge] = useState('ABCD'); 

  // Reset form when mode switches
  useEffect(() => {
    setError('');
    setIdentifier('');
    setPassword('');
    setCaptchaInput('');
  }, [mode]);

  // Lock scroll
  useEffect(() => {
    if (!isAuthenticated) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isAuthenticated]);

  if (isAuthenticated) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (mode === 'STUDENT' && captchaInput !== captchaChallenge) {
        setError("Invalid CAPTCHA.");
        setIsLoading(false);
        return;
    }

    const endpoint = mode === 'STUDENT' 
        ? 'http://localhost:4000/api/v1/auth/login/student' 
        : 'http://localhost:4000/api/v1/auth/login/admin';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            identifier: mode === 'STUDENT' ? identifier : undefined, // Student uses generic ID
            email: mode === 'ADMIN' ? identifier : undefined,      // Admin uses strict Email
            password, 
            captchaToken: 'VALID_MOCK_TOKEN', 
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
      <div className="max-w-md w-full relative">
        
        {/* Mode Toggles */}
        <div className="absolute -top-12 left-0 w-full flex justify-center gap-4">
            <button 
                onClick={() => setMode('STUDENT')}
                className={`px-6 py-2 rounded-t-xl font-bold text-sm transition-all duration-300 ${mode === 'STUDENT' ? 'bg-blue-600 text-white translate-y-1 shadow-lg' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
                Student Portal
            </button>
            <button 
                onClick={() => setMode('ADMIN')}
                className={`px-6 py-2 rounded-t-xl font-bold text-sm transition-all duration-300 ${mode === 'ADMIN' ? 'bg-gray-800 text-red-400 border-t-2 border-red-500 translate-y-1 shadow-lg' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
                Admin / Staff
            </button>
        </div>

        <GlassCard className={`border-t-4 shadow-2xl transition-colors duration-500 ${mode === 'STUDENT' ? 'border-t-blue-500 bg-white/10' : 'border-t-red-500 bg-gray-900/90'}`}>
          <div className="text-center mb-6">
            <div className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-xl mb-3 shadow-lg ${mode === 'STUDENT' ? 'bg-blue-500 shadow-blue-500/30' : 'bg-red-600 shadow-red-500/30'}`}>
                {mode === 'STUDENT' ? 'N' : 'A'}
            </div>
            <h2 className="text-2xl font-display font-bold text-white">
                {mode === 'STUDENT' ? 'Welcome Back' : 'Restricted Access'}
            </h2>
            <p className="text-gray-300 text-sm">
                {mode === 'STUDENT' ? 'Sign in to access your dashboard' : 'Authorized personnel only'}
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
                  {mode === 'STUDENT' ? 'Student ID or Email' : 'Administrative Email'}
              </label>
              <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </span>
                  <input 
                    type="text" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className={`w-full bg-white/5 border rounded-xl px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors ${mode === 'STUDENT' ? 'border-white/10 focus:border-blue-500 focus:ring-blue-500' : 'border-red-500/30 focus:border-red-500 focus:ring-red-500'}`}
                    placeholder={mode === 'STUDENT' ? "e.g. johndoe@uni.edu" : "admin@nexus.edu"}
                    required
                  />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1 ml-1">Password</label>
              <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </span>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full bg-white/5 border rounded-xl px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors ${mode === 'STUDENT' ? 'border-white/10 focus:border-blue-500 focus:ring-blue-500' : 'border-red-500/30 focus:border-red-500 focus:ring-red-500'}`}
                    placeholder="••••••••"
                    required
                  />
              </div>
            </div>

            {mode === 'STUDENT' && (
                <div className="flex gap-3">
                    <div className="flex-1 bg-white/10 rounded-lg flex items-center justify-center font-mono text-gray-400 select-none tracking-widest relative overflow-hidden border border-white/5">
                        <span className="relative z-10">{captchaChallenge}</span>
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]"></div>
                    </div>
                    <input 
                        type="text" 
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                        className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="CAPTCHA"
                        maxLength={4}
                        required
                    />
                </div>
            )}

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
                <a href="#" className="hover:text-blue-400 transition-colors">Forgot password?</a>
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${mode === 'STUDENT' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20' : 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/20'}`}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Authenticating...
                    </span>
                ) : (mode === 'STUDENT' ? "Secure Sign In" : "Access Admin Console")}
            </button>
          </form>

          {mode === 'STUDENT' && (
             <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">Need help? <span className="text-blue-400 cursor-pointer hover:underline">Contact Support</span></p>
             </div>
          )}
          {mode === 'ADMIN' && (
             <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-600">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <span>256-bit SSL Encrypted Connection</span>
             </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default LoginModal;
