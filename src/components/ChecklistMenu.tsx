import { ChecklistCategory } from "@/types/checklist";
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
}

export function ChecklistMenu({
  categories,
  onSelect,
  checklistStates,
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
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {categories.map((category) => {
            const isComplete = isChecklistComplete(category);
            return (
              <button
                key={category.id}
                onClick={() => onSelect(category.id)}
                className={`w-full text-left px-4 py-1 bg-gray-700 hover:bg-gray-600 font-mono text-2xl font-bold flex items-center gap-2 ${
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
