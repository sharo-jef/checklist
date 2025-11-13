import { ChecklistItem } from './ChecklistItem';
import { Checklist } from '@/types/checklist';

interface ChecklistDisplayProps {
  checklist: Checklist | undefined;
  items: Array<{ id: string; item: string; value: string; checked: boolean; required?: boolean }>;
  activeItemIndex: number;
  onToggleItem: (itemId: string) => void;
  onNext?: () => void;
  showNextButton?: boolean;
}

export function ChecklistDisplay({
  checklist,
  items,
  activeItemIndex,
  onToggleItem,
  onNext,
  showNextButton = false,
}: ChecklistDisplayProps) {
  const allItemsChecked = items.length > 0 && items.every(item => item.checked);

  return (
    <div className="flex-1 bg-[#1B2A3E] flex flex-col overflow-hidden">
      <div className="px-4 pb-2 bg-[#1B2A3E]">
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

      {showNextButton && (
        <div className="flex bg-[#1B2A3E] p-3">
          <button
            onClick={onNext}
            disabled={!allItemsChecked}
            className={`px-6 py-2 text-center font-mono text-sm font-bold tracking-widest ${
              allItemsChecked
                ? 'bg-[#6b7c94] text-white cursor-pointer'
                : 'bg-[#4a5568] text-gray-500 cursor-not-allowed'
            }`}
          >
            NORMAL
          </button>
        </div>
      )}
    </div>
  );
}
