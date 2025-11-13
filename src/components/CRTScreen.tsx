import { ReactNode } from 'react';

interface CRTScreenProps {
  children: ReactNode;
}

export function CRTScreen({ children }: CRTScreenProps) {
  return (
    <div className="min-h-screen w-full bg-[#1a1a2e] flex flex-col">
      {children}
    </div>
  );
}
