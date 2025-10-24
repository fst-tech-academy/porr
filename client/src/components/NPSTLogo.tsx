import React from 'react';
import { useSettings } from '../hooks/useSettings';

interface NPSTLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const NPSTLogo: React.FC<NPSTLogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const { getSystemName } = useSettings();
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon - Creative NPST Letter Design */}
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl border border-white/20 relative overflow-hidden`}>
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]"></div>
        
        {/* NPST Text with Beautiful Typography */}
        <div className="relative z-10 flex items-center justify-center">
          <span className="font-black text-white tracking-wider text-shadow-lg" style={{
            fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            textShadow: '0 2px 4px rgba(0,0,0,0.4)',
            letterSpacing: '0.1em',
            fontSize: size === 'sm' ? '0.75rem' : size === 'md' ? '0.875rem' : size === 'lg' ? '1rem' : '1.125rem',
            fontWeight: '900'
          }}>
            NPST
          </span>
        </div>
        
        {/* Legal document accent below letters */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex items-center space-x-1">
          <div className="w-1 h-1 bg-white/60 rounded-full shadow-sm"></div>
          <div className="w-1 h-1 bg-white/60 rounded-full shadow-sm"></div>
          <div className="w-1 h-1 bg-white/60 rounded-full shadow-sm"></div>
        </div>
        
        {/* Accent dot with enhanced styling */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-400 via-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg border border-white/30">
          <div className="w-2 h-2 bg-white rounded-full shadow-inner"></div>
        </div>
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/20 to-transparent"></div>
      </div>
      
      {showText && (
        <div className="flex items-center">
          <h1 className={`font-bold text-slate-900 dark:text-white ${textSizeClasses[size]} leading-tight whitespace-nowrap`}>
            {getSystemName()}
          </h1>
        </div>
      )}
    </div>
  );
};

export default NPSTLogo;
