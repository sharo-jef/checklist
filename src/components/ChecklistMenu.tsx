import { ChecklistCategory, MenuType } from "@/types/checklist";
import { CheckIcon } from "./CheckIcon";

interface ChecklistMenuProps {
  categories: ChecklistCategory[];
  onSelect: (categoryId: string) => void;
  checklistStates: {
    [categoryId: string]: {
      [checklistId: string]: {
        [itemId: string]: boolean;
      };
    };
  };
  menuType?: MenuType;
}

export function ChecklistMenu({
  categories,
  onSelect,
  checklistStates,
  menuType,
}: ChecklistMenuProps) {
  const isChecklistComplete = (category: ChecklistCategory): boolean => {
    const checklist = category.checklists[0];
    if (!checklist) return false;

    const checklistState = checklistStates[category.id]?.[checklist.id];
    if (!checklistState) return false;

    return checklist.items.every((item) => checklistState[item.id] === true);
  };

  return (
    <div className="flex-1 bg-[#09090C] flex flex-col overflow-hidden">
      {menuType && (
        <div className="p-3 pt-0">
          <div
            className={`py-2 ${menuType === MenuType.NON_NORMAL ? "bg-green-600" : ""}`}
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
            return (
              <button
                key={category.id}
                onClick={() => onSelect(category.id)}
                className={`w-full text-left px-4 py-1 bg-gray-700 border-2 border-transparent hover:border-white font-mono text-2xl flex items-center gap-2 ${
                  isComplete ? "text-(--text-green)" : "text-white"
                }`}
              >
                <div className="w-4 h-4 shrink-0">
                  {isComplete && <CheckIcon />}
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
