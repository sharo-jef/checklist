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
    <div className="flex-1 bg-[#1a1a2e] flex flex-col">
      <div className="px-4 py-4 border-b-2 border-gray-600">
        <h1 className="font-mono text-xl text-white font-bold tracking-wide text-center">
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
      
      <div className="p-4">
        <button
          onClick={onBack}
          className="w-full px-4 py-3 bg-gray-600 text-black font-bold text-sm"
        >
          BACK
        </button>
      </div>
    </div>
  );
}
