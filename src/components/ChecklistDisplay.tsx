import { ChecklistItem } from "./ChecklistItem";
import { Checklist, ChecklistItemStatus } from "@/types/checklist";

interface ChecklistDisplayProps {
  checklist: Checklist | undefined;
  items: Array<{
    id: string;
    item: string;
    value: string;
    status: ChecklistItemStatus;
    required?: boolean;
  }>;
  activeItemIndex: number;
  onToggleItem: (itemId: string) => void;
  onItemOverride?: (itemId: string) => void;
  onChecklistOverride?: () => void;
  onNext?: () => void;
  showNextButton?: boolean;
  hasNextChecklist?: boolean;
}

export function ChecklistDisplay({
  checklist,
  items,
  activeItemIndex,
  onToggleItem,
  onItemOverride,
  onChecklistOverride,
  onNext,
  showNextButton = false,
  hasNextChecklist = false,
}: ChecklistDisplayProps) {
  const allItemsChecked =
    items.length > 0 && items.every((item) => item.status === "checked");
  const canGoNext = allItemsChecked && hasNextChecklist;

  const handleItemOverride = () => {
    if (
      activeItemIndex >= 0 &&
      activeItemIndex < items.length &&
      onItemOverride
    ) {
      const activeItem = items[activeItemIndex];
      onItemOverride(activeItem.id);
    }
  };

  return (
    <div className="flex-1 bg-[#09090C] flex flex-col overflow-hidden">
      <div className="px-4 pb-2 bg-[#09090C]">
        <h1 className="font-mono text-[20px] text-white tracking-wide text-center">
          ▶ {checklist?.name || "NO CHECKLIST"} ◀
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.length > 0 ? (
          <div>
            {items.map((item, index) => {
              // 前の項目がすべてチェック済みまたはオーバーライド済みかどうかを確認
              const canToggle =
                index === 0 ||
                items
                  .slice(0, index)
                  .every(
                    (prevItem) =>
                      prevItem.status === "checked" ||
                      prevItem.status === "overridden"
                  );

              return (
                <ChecklistItem
                  key={item.id}
                  item={item.item}
                  value={item.value}
                  status={item.status}
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
        <div className="flex gap-3 bg-[#09090C] p-3">
          <div className="flex-1">
            {canGoNext && (
              <button
                onClick={onNext}
                className="w-full py-1 text-center font-mono text-xl tracking-wide leading-none bg-[#4a5568] text-white flex items-center justify-center border-2 border-transparent hover:border-white"
                style={{ height: "100%" }}
              >
                NORMAL
              </button>
            )}
          </div>
          <button
            onClick={handleItemOverride}
            className="flex-1 py-1 text-center font-mono text-xl tracking-wide leading-none bg-[#4a5568] text-white border-2 border-transparent hover:border-white"
          >
            ITEM
            <br />
            OVRD
          </button>
          <button
            onClick={onChecklistOverride}
            className="flex-1 py-1 text-center font-mono text-xl tracking-wide leading-none bg-[#4a5568] text-white border-2 border-transparent hover:border-white"
          >
            CHKL
            <br />
            OVRD
          </button>
          <button className="flex-1 py-1 text-center font-mono text-xl tracking-wide leading-none bg-[#4a5568] text-white border-2 border-transparent hover:border-white">
            CHKL
            <br />
            RESET
          </button>
        </div>
      )}
    </div>
  );
}
