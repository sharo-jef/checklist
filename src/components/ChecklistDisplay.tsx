import { ChecklistItem } from './ChecklistItem';
import { Checklist } from '@/types/checklist';

interface ChecklistDisplayProps {
  checklist: Checklist | undefined;
  items: Array<{ id: string; item: string; value: string; checked: boolean; required?: boolean }>;
  activeItemIndex: number;
  onToggleItem: (itemId: string) => void;
}

export function ChecklistDisplay({
  checklist,
  items,
  activeItemIndex,
  onToggleItem,
}: ChecklistDisplayProps) {
  return (
    <div className="flex-1 bg-[#1B2A3E] flex flex-col overflow-hidden">
      <div className="px-4 bg-[#1B2A3E]">
        <h1 className="font-mono text-base text-white tracking-wide text-center">
          ▶ {checklist?.name || 'NO CHECKLIST'} ◀
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.length > 0 ? (
          <div>
            {items.map((item, index) => {
              // 前の項目がすべてチェック済みかどうかを確認
              const canToggle = index === 0 || items.slice(0, index).every(prevItem => prevItem.checked);

              return (
                <ChecklistItem
                  key={item.id}
                  item={item.item}
                  value={item.value}
                  checked={item.checked}
                  required={item.required}
                  isActive={index === activeItemIndex}
                  onToggle={() => canToggle && onToggleItem(item.id)}
                />
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="font-mono text-white">NO ITEMS IN CHECKLIST</p>
          </div>
        )}
      </div>
    </div>
  );
}
