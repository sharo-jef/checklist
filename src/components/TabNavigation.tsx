import { ChecklistCategory } from "@/types/checklist";
import { TabButton } from "./TabButton";

interface TabNavigationProps {
  categories: ChecklistCategory[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function TabNavigation({
  categories,
  activeCategory,
  onCategoryChange,
}: TabNavigationProps) {
  return (
    <div className="border-b border-green-800/50 overflow-x-auto">
      <div className="flex gap-1 min-w-max px-4">
        {categories.map((category) => (
          <TabButton
            key={category.id}
            title={category.title}
            active={category.id === activeCategory}
            onClick={() => onCategoryChange(category.id)}
          />
        ))}
      </div>
    </div>
  );
}
