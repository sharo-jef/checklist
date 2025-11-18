import { ChecklistItem } from "./ChecklistItem";
import { ChecklistStatusBanner } from "./ChecklistStatusBanner";
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
  onChecklistReset?: () => void;
  onNext?: () => void;
  showControls?: boolean;
  hasNextChecklist?: boolean;
}

export function ChecklistDisplay({
  checklist,
  items,
  activeItemIndex,
  onToggleItem,
  onItemOverride,
  onChecklistOverride,
  onChecklistReset,
  onNext,
  showControls = false,
  hasNextChecklist = false,
}: ChecklistDisplayProps) {
  const allItemsChecked =
    items.length > 0 &&
    items.every(
      (item) =>
        item.status === "checked" ||
        item.status === "overridden" ||
        item.status === "checked-overridden"
    );
  const allItemsOverridden =
    items.length > 0 &&
    items.every(
      (item) =>
        item.status === "overridden" || item.status === "checked-overridden"
    );
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
    <div className="flex-1 bg-[#09090C] flex flex-col overflow-hidden relative">
      <div className="px-4 pb-2 bg-[#09090C]">
        <h1 className="font-mono text-[20px] text-white tracking-wide text-center">
          ▶ {checklist?.name || "NO CHECKLIST"} ◀
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
                status={item.status}
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

      {showControls && (
        <>
          <div className="absolute bottom-[76px] left-0 right-0 pointer-events-none">
            <ChecklistStatusBanner
              isComplete={allItemsChecked}
              isOverridden={allItemsOverridden}
            />
          </div>
          <div className="flex gap-3 bg-[#09090C] p-3">
            <div className={`flex-1 ${!hasNextChecklist ? "invisible" : ""}`}>
              {(canGoNext || allItemsOverridden) && (
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
            <button
              onClick={onChecklistReset}
              className="flex-1 py-1 text-center font-mono text-xl tracking-wide leading-none bg-[#4a5568] text-white border-2 border-transparent hover:border-white"
            >
              CHKL
              <br />
              RESET
            </button>
          </div>
        </>
      )}
      {!showControls && (
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <ChecklistStatusBanner
            isComplete={allItemsChecked}
            isOverridden={allItemsOverridden}
          />
        </div>
      )}
    </div>
  );
}
