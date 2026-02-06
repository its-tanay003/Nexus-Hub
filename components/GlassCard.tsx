import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  urgent?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', title, icon, urgent = false }) => {
  return (
    <div className={`
      relative overflow-hidden rounded-2xl border 
      ${urgent ? 'border-red-500/50 bg-red-900/20' : 'border-white/10 bg-white/5'} 
      backdrop-blur-xl shadow-lg transition-all duration-300 hover:bg-white/10
      ${className}
    `}>
      {urgent && (
        <div className="absolute top-0 right-0 p-1">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
      )}
      
      {(title || icon) && (
        <div className="flex items-center gap-2 p-4 border-b border-white/5">
          {icon && <span className="text-blue-400">{icon}</span>}
          {title && <h3 className="font-display font-semibold text-lg text-white tracking-wide">{title}</h3>}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
