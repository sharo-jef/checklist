import { ChecklistCategory } from '@/types/checklist';

interface ChecklistMenuProps {
  categories: ChecklistCategory[];
  onSelect: (categoryId: string) => void;
  onBack: () => void;
}

export function ChecklistMenu({ categories, onSelect, onBack }: ChecklistMenuProps) {
  return (
    <div className="flex-1 bg-[#1a1a2e] flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className="w-full text-left px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-mono text-sm"
            >
              {category.title}
            </button>
          ))}
        </div>
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
