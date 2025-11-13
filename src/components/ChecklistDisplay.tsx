import { ChecklistItem } from './ChecklistItem';
import { Checklist } from '@/types/checklist';

interface ChecklistDisplayProps {
  checklist: Checklist | undefined;
  items: Array<{ id: string; item: string; value: string; checked: boolean; required?: boolean }>;
  activeItemIndex: number;
  onToggleItem: (itemId: string) => void;
  onBack: () => void;
}

export function ChecklistDisplay({
  checklist,
  items,
  activeItemIndex,
  onToggleItem,
  onBack,
}: ChecklistDisplayProps) {
  return (
    <div className="flex-1 bg-[#1e2633] flex flex-col overflow-hidden">
      <div className="px-4 py-3 bg-[#2a3340]">
        <h1 className="font-mono text-base text-white tracking-wide text-center">
          ▶{checklist?.name || 'NO CHECKLIST'}◀
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {items.length > 0 ? (
          <div>
            {items.map((item, index) => (
              <ChecklistItem
                key={item.id}
                item={item.item}
                value={item.value}
                checked={item.checked}
                required={item.required}
                isActive={index === activeItemIndex}
                onToggle={() => onToggleItem(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="font-mono text-white">NO ITEMS IN CHECKLIST</p>
          </div>
        )}
      </div>
      
      <div className="bg-[#6b7c94] p-3 flex items-center justify-between">
        <button
          className="px-3 py-2 bg-[#4a5568] text-white font-mono text-xs"
        >
          N
        </button>
        <button
          onClick={onBack}
          className="flex-1 ml-4 px-4 py-2 bg-[#6b7c94] text-black font-mono text-sm"
        >
          BACK
        </button>
      </div>
    </div>
  );
}
