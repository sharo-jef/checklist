import { ReactNode } from 'react';

interface CRTScreenProps {
  children: ReactNode;
}

export function CRTScreen({ children }: CRTScreenProps) {
  return (
    <div className="h-screen w-full bg-[#1e2633] flex flex-col overflow-hidden">
      {children}
    </div>
  );
}
