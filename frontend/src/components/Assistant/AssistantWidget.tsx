
import React, { useState, useEffect, useRef } from 'react';
import { useSpeech } from '../../hooks/useSpeech';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  isError?: boolean;
  originalQuery?: string;
}

const AssistantWidget: React.FC = () => {
  const { token, isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      sender: 'ai', 
      text: "Hi! I'm Nexus. How can I help?", 
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    speak
  } = useSpeech(language);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Update initial greeting when language changes
  useEffect(() => {
     if (messages.length === 1 && messages[0].id === 1) {
         setMessages([{
             id: 1,
             sender: 'ai', 
             text: language === 'en' ? "Hi! I'm Nexus. How can I help?" : "Namaste! Main Nexus hoon. Kaise madad karoon?",
             timestamp: new Date()
         }]);
     }
  }, [language]);

  // Sync Voice Transcript to Input
  useEffect(() => {
    if (transcript) setInputText(transcript);
  }, [transcript]);

  // Toggle Camera
  const toggleCamera = async () => {
    if (cameraActive) {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraActive(true);
      } catch (err) {
        alert("Camera permission denied. Please enable it in browser settings.");
      }
    }
  };

  // Send Query to Backend
  const handleSend = async (textOverride?: string) => {
    const query = textOverride || inputText;
    if (!query.trim()) return;

    if (!isAuthenticated) {
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          sender: 'ai', 
          text: "Please login to use Nexus AI.", 
          timestamp: new Date() 
        }]);
        return;
    }

    // Add User Message
    const userMsg: Message = { 
      id: Date.now(), 
      sender: 'user', 
      text: query, 
      timestamp: new Date() 
    };
    
    // Optimistic Update
    setMessages(prev => {
        // Remove error messages if retrying
        const filtered = prev.filter(m => !m.isError);
        return [...filtered, userMsg];
    });
    
    setInputText('');
    setIsProcessing(true);

    try {
      const res = await fetch('http://localhost:4000/api/v1/assistant/query', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ query, language })
      });
      
      const data = await res.json();
      
      if (data.success) {
        const aiMsg: Message = { 
          id: Date.now() + 1, 
          sender: 'ai', 
          text: data.data.text, 
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, aiMsg]);
        speak(data.data.text);

        // Handle Navigation Intent
        if (data.data.navigate_to) {
            if (data.data.navigate_to === 'ACTION:SOS') {
                setMessages(prev => [...prev, { 
                  id: Date.now() + 2, 
                  sender: 'ai', 
                  text: "🚨 TRIGGERING SOS 🚨", 
                  isError: true, 
                  timestamp: new Date() 
                }]);
            } else {
                window.location.hash = data.data.navigate_to;
            }
        }
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
          id: Date.now(), 
          sender: 'ai', 
          text: "I'm having trouble connecting to the server.",
          isError: true,
          originalQuery: query,
          timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const suggestions = [
      { label: '🍔 Mess Menu', query: "What's on the menu today?" },
      { label: '📅 Attendance', query: "Check my attendance" },
      { label: '📍 Map', query: "Open campus map" },
      { label: '📚 Timetable', query: "Show my timetable" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none font-sans">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="pointer-events-auto mb-4 w-[90vw] md:w-96 h-[600px] max-h-[80vh] bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl flex flex-col overflow-hidden animate-fade-in-up ring-1 ring-black/5">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                 <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <span className="font-display font-bold text-sm">N</span>
                 </div>
                 <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-indigo-600 animate-pulse"></div>
              </div>
              <div>
                 <h3 className="font-bold text-sm leading-tight">Nexus AI</h3>
                 <p className="text-[10px] text-blue-100 opacity-90">Online • {language === 'en' ? 'English' : 'Hindi'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               <button 
                 onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
                 className="text-[10px] font-bold bg-white/10 hover:bg-white/20 border border-white/20 px-2 py-1 rounded-lg transition-colors"
               >
                 {language === 'en' ? 'ENG' : 'हिंदी'}
               </button>
               <button 
                 onClick={toggleCamera} 
                 className={`p-1.5 rounded-lg transition-colors ${cameraActive ? 'bg-red-500 text-white shadow-inner' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                 title="Toggle Camera Context"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0010.07 4h3.86a2 2 0 001.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
               </button>
               <button 
                 onClick={() => setIsOpen(false)}
                 className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
          </div>

          {/* Camera Context View */}
          {cameraActive && (
            <div className="h-40 bg-black relative shrink-0 border-b border-gray-100">
               <video ref={videoRef} autoPlay muted className="w-full h-full object-cover opacity-90" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3">
                  <div className="flex items-center gap-2">
                     <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                     <span className="text-xs text-white font-medium shadow-black drop-shadow-md">Vision Active: Show me anything</span>
                  </div>
               </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gray-50/50">
            {messages.map((msg, idx) => (
              <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                {/* AI Avatar */}
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md border border-white self-end mb-1">
                    N
                  </div>
                )}

                <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : msg.isError 
                          ? 'bg-red-50 text-red-700 border border-red-100 rounded-bl-none'
                          : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}>
                    {msg.text}
                    
                    {msg.isError && msg.originalQuery && (
                        <button 
                            onClick={() => handleSend(msg.originalQuery)}
                            className="mt-2 text-xs flex items-center gap-1 font-bold text-red-600 hover:text-red-800 bg-red-100/50 px-2 py-1 rounded transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Tap to Retry
                        </button>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1 font-medium">
                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>

                {/* User Avatar */}
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0 border-2 border-white shadow-sm self-end mb-1">
                    {user?.avatar ? (
                      <img src={`http://localhost:4000${user.avatar}`} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 font-bold text-xs">
                        {user?.name?.[0] || 'U'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isProcessing && (
                <div className="flex gap-3 justify-start animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm border border-white self-end mb-1">
                        N
                    </div>
                    <div>
                        <div className="bg-white text-gray-500 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5 shadow-sm border border-gray-100">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 px-1">Thinking...</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions (Only if few messages) */}
          {messages.length < 3 && !isProcessing && (
              <div className="px-4 pb-2 bg-gray-50/50 flex gap-2 overflow-x-auto scrollbar-hide">
                  {suggestions.map((s) => (
                      <button
                        key={s.label}
                        onClick={() => handleSend(s.query)}
                        className="flex-shrink-0 text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm"
                      >
                          {s.label}
                      </button>
                  ))}
              </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 z-10">
            <div className="relative flex items-end gap-2">
              <div className="relative flex-1">
                  <textarea 
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder={isListening ? "Listening..." : "Ask Nexus..."}
                    disabled={isProcessing}
                    rows={1}
                    className="w-full bg-gray-100 border-0 rounded-2xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all resize-none max-h-24"
                    style={{ minHeight: '44px' }}
                  />
                  
                  {/* Mic Button inside Input */}
                  <button 
                    onClick={isListening ? stopListening : startListening}
                    className={`absolute right-2 bottom-2 p-1.5 rounded-full transition-all ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse shadow-md' 
                        : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100'
                    }`}
                    title="Voice Input"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  </button>
              </div>

              <button 
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isProcessing}
                className="mb-1 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed transition-all transform active:scale-95"
              >
                <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button (FAB) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 border-4 border-white/20 active:scale-95 group z-50 relative ${isOpen ? 'bg-gray-800 rotate-90' : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 hover:scale-110'}`}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <>
            <span className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping"></span>
            <span className="text-2xl group-hover:rotate-12 transition-transform">✨</span>
          </>
        )}
      </button>
    </div>
  );
};

export default AssistantWidget;
