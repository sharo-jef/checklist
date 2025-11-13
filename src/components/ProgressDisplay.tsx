import { Progress } from '@/types/checklist';

interface ProgressDisplayProps {
  progress: Progress;
}

export function ProgressDisplay({ progress }: ProgressDisplayProps) {
  return (
    <div className="px-4 py-3 border-t border-green-800/50">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-sm text-green-500">PROGRESS</span>
        <span className="font-mono text-sm text-green-400 font-bold">
          {progress.completed}/{progress.total}
        </span>
      </div>
      <div className="w-full h-2 bg-green-950/50 border border-green-800/50 overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      <div className="text-right mt-1">
        <span className="font-mono text-xs text-green-600">
          {progress.percentage}% COMPLETE
        </span>
      </div>
    </div>
  );
}
