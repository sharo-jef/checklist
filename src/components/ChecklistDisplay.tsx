import { ChecklistItem } from './ChecklistItem';
import { ProgressDisplay } from './ProgressDisplay';
import { Header } from './Header';
import { Checklist, Progress } from '@/types/checklist';

interface ChecklistDisplayProps {
  checklist: Checklist | undefined;
  items: Array<{ id: string; item: string; value: string; checked: boolean; required?: boolean }>;
  progress: Progress;
  onToggleItem: (itemId: string) => void;
  onReset?: () => void;
}

export function ChecklistDisplay({
  checklist,
  items,
  progress,
  onToggleItem,
  onReset,
}: ChecklistDisplayProps) {
  return (
    <div className="bg-black/80 backdrop-blur-sm">
      <Header checklist={checklist} />
      
      <div className="max-h-[60vh] overflow-y-auto">
        {items.length > 0 ? (
          <div className="divide-y divide-green-900/30">
            {items.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item.item}
                value={item.value}
                checked={item.checked}
                required={item.required}
                onToggle={() => onToggleItem(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="font-mono text-green-600">NO ITEMS IN CHECKLIST</p>
          </div>
        )}
      </div>
      
      <ProgressDisplay progress={progress} />
      
      {onReset && (
        <div className="px-4 py-3 border-t border-green-800/50 flex justify-end">
          <button
            onClick={onReset}
            className="px-4 py-2 font-mono text-xs text-green-600 hover:text-green-400 border border-green-800/50 hover:border-green-600 transition-colors"
          >
            RESET CHECKLIST
          </button>
        </div>
      )}
    </div>
  );
}
