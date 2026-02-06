import React, { useState, useRef, useEffect, useCallback } from 'react';

interface SOSButtonProps {
  onTrigger: (coords: { lat: number; lng: number }) => void;
}

const SOSButton: React.FC<SOSButtonProps> = ({ onTrigger }) => {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activated, setActivated] = useState(false);
  
  // Error Handling States
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pressStartTime = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);

  const TRIGGER_DURATION = 3000; // 3 seconds to trigger

  const vibrate = useCallback((pattern: number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  const reset = () => {
    setIsPressing(false);
    setProgress(0);
    pressStartTime.current = null;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const handleTrigger = () => {
    setActivated(true);
    setLocationStatus('locating');
    setErrorMessage(null);
    vibrate([200, 100, 200, 100, 500]); // SOS Pattern vibration

    if (!navigator.geolocation) {
       handleLocationError(new Error("Geolocation not supported by this browser"));
       return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("SOS: Location acquired", pos.coords);
        setLocationStatus('success');
        onTrigger({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        handleLocationError(err);
      },
      { 
        enableHighAccuracy: true,
        timeout: 5000, // Fail if location takes longer than 5s
        maximumAge: 0 
      }
    );
  };

  const handleLocationError = (error: any) => {
    console.error("SOS: Geolocation Failed", error);
    setLocationStatus('error');
    
    let msg = "GPS unavailable";
    if (error.code === 1) msg = "Location permission denied";
    else if (error.code === 2) msg = "Position unavailable";
    else if (error.code === 3) msg = "GPS timeout";
    else if (error.message) msg = error.message;

    setErrorMessage(msg);

    // CRITICAL: Fallback trigger with default coordinates
    onTrigger({ lat: 0, lng: 0 });
  };

  const handleStart = () => {
    if (activated) return;
    setIsPressing(true);
    pressStartTime.current = Date.now();
    vibrate([50]); // Initial haptic bump

    const animate = () => {
      if (!pressStartTime.current) return;
      const elapsed = Date.now() - pressStartTime.current;
      const newProgress = Math.min((elapsed / TRIGGER_DURATION) * 100, 100);
      
      setProgress(newProgress);

      if (newProgress < 100) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        // Triggered!
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        handleTrigger();
      }
    };
    requestRef.current = requestAnimationFrame(animate);
  };

  const handleEnd = () => {
    if (activated) return;
    reset();
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  if (activated) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center animate-ping absolute opacity-50"></div>
        <button 
          className="w-20 h-20 rounded-full bg-red-600 border-4 border-white shadow-xl flex items-center justify-center relative z-10 text-white font-bold animate-pulse"
          onClick={() => {
            setActivated(false);
            setLocationStatus('idle');
            setErrorMessage(null);
            reset();
            alert("SOS Cancelled");
          }}
        >
          SENT
        </button>
        
        <div className="mt-2 flex flex-col items-center space-y-1">
          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold shadow-lg">
            SECURITY ALERTED
          </span>
          
          {/* Location Status Feedback */}
          {locationStatus === 'locating' && (
            <span className="text-[10px] text-gray-500 bg-white/90 px-2 py-0.5 rounded-full font-medium border border-gray-200 animate-pulse">
              Acquiring accurate GPS...
            </span>
          )}
          {locationStatus === 'success' && (
            <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-bold border border-green-200">
              ✓ Exact Location Sent
            </span>
          )}
          {locationStatus === 'error' && (
             <span className="text-[10px] text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full font-bold border border-orange-200 flex items-center gap-1">
               <span>⚠</span> {errorMessage || "GPS Failed"} - Sent Default
             </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none touch-none">
      {/* Progress Ring */}
      <svg className="w-24 h-24 absolute -top-2 -left-2 pointer-events-none transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r="46"
          stroke="white"
          strokeWidth="6"
          fill="transparent"
          className="opacity-20 shadow-sm"
        />
        <circle
          cx="48"
          cy="48"
          r="46"
          stroke="#EF4444"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={289}
          strokeDashoffset={289 - (289 * progress) / 100}
          className="transition-all duration-75 ease-linear shadow-lg"
        />
      </svg>

      <button
        onPointerDown={handleStart}
        onPointerUp={handleEnd}
        onPointerLeave={handleEnd}
        className={`
          w-20 h-20 rounded-full 
          flex flex-col items-center justify-center
          shadow-xl border-4 border-white transition-all duration-200
          ${isPressing ? 'scale-95 bg-red-700' : 'bg-red-600 hover:scale-105 hover:bg-red-500'}
        `}
      >
        <span className="text-2xl font-display font-bold text-white">SOS</span>
        <span className="text-[10px] text-white/90 uppercase tracking-tighter">Hold 3s</span>
      </button>
    </div>
  );
};

export default SOSButton;