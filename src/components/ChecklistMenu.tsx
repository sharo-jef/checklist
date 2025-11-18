import {
  ChecklistCategory,
  ChecklistItemStatus,
  MenuType,
} from "@/types/checklist";
import { CheckIcon } from "./CheckIcon";

interface ChecklistMenuProps {
  categories: ChecklistCategory[];
  onSelect: (categoryId: string) => void;
  itemStates: {
    [categoryId: string]: {
      [checklistId: string]: {
        [itemId: string]: ChecklistItemStatus;
      };
    };
  };
  menuType?: MenuType;
}

export function ChecklistMenu({
  categories,
  onSelect,
  itemStates,
  menuType,
}: ChecklistMenuProps) {
  const isChecklistComplete = (category: ChecklistCategory): boolean => {
    const checklist = category.checklists[0];
    if (!checklist) return false;

    const checklistState = itemStates[category.id]?.[checklist.id];
    if (!checklistState) return false;

    return checklist.items.every((item) => {
      const status = checklistState[item.id];
      return (
        status === "checked" ||
        status === "overridden" ||
        status === "checked-overridden"
      );
    });
  };

  const isChecklistOverridden = (category: ChecklistCategory): boolean => {
    const checklist = category.checklists[0];
    if (!checklist) return false;

    const checklistState = itemStates[category.id]?.[checklist.id];
    if (!checklistState) return false;

    return checklist.items.every(
      (item) =>
        checklistState[item.id] === "overridden" ||
        checklistState[item.id] === "checked-overridden"
    );
  };

  return (
    <div className="flex-1 bg-[#09090C] flex flex-col overflow-hidden">
      {menuType && (
        <div className="p-3 pt-0">
          {/* 本来は NON-NORMAL MENU のサブメニューを開いた際に NON-NORMAL の文字の部分が戻るボタンになり、緑色になる */}
          <div
            className={`py-2 ${/*menuType === MenuType.NON_NORMAL*/ false ? "bg-(--menu-green)" : ""}`}
          >
            <h1 className="font-mono text-[20px] text-white tracking-wide text-center">
              {menuType === MenuType.NORMAL ? "NORMAL MENU" : "NON-NORMAL MENU"}
            </h1>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="space-y-2">
          {categories.map((category) => {
            const isComplete = isChecklistComplete(category);
            const isOverridden = isChecklistOverridden(category);
            return (
              <button
                key={category.id}
                onClick={() => onSelect(category.id)}
                className={`w-full text-left px-4 py-1 bg-gray-700 border-2 border-transparent hover:border-white font-mono text-2xl flex items-center gap-2 ${
                  isOverridden
                    ? "text-cyan-400"
                    : isComplete
                      ? "text-(--text-green)"
                      : "text-white"
                }`}
              >
                <div className="w-4 h-4 shrink-0">
                  {isComplete && !isOverridden && <CheckIcon />}
                </div>
                {category.title}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
