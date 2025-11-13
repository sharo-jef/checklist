import { ReactNode } from 'react';

interface CRTScreenProps {
  children: ReactNode;
}

export function CRTScreen({ children }: CRTScreenProps) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* CRT Screen Container */}
        <div className="relative bg-linear-to-b from-green-950/20 to-black border-8 border-gray-800 rounded-lg shadow-2xl overflow-hidden">
          {/* Screen Glow Effect */}
          <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />
          
          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="scanlines" />
          </div>
          
          {/* Vignette Effect */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-transparent via-transparent to-black/60" />
          
          {/* Content */}
          <div className="relative z-10">
            {children}
          </div>
          
          {/* CRT Curve Reflection */}
          <div className="absolute inset-0 pointer-events-none bg-linear-to-br from-white/5 via-transparent to-transparent opacity-30" />
        </div>
        
        {/* Screen Frame Shadow */}
        <div className="mt-4 text-center">
          <p className="font-mono text-xs text-gray-600">
            BOEING 747-8 INTERCONTINENTAL - DIGITAL CHECKLIST SYSTEM
          </p>
        </div>
      </div>
    </div>
  );
}
