import { Checklist } from '@/types/checklist';

interface HeaderProps {
  checklist: Checklist | undefined;
}

export function Header({ checklist }: HeaderProps) {
  return (
    <div className="px-4 py-4 border-b border-green-800/50">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="font-mono text-xl text-green-400 font-bold tracking-wide mb-1">
            {checklist?.name || 'NO CHECKLIST SELECTED'}
          </h1>
          {checklist?.phase && (
            <div className="font-mono text-xs text-green-600">
              PHASE: {checklist.phase.toUpperCase()}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="font-mono text-xs text-green-600">B747-8i</div>
          <div className="font-mono text-xs text-green-600">
            DIGITAL CHECKLIST
          </div>
        </div>
      </div>
    </div>
  );
}
