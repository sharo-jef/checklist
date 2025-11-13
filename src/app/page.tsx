'use client';

import { CRTScreen } from '@/components/CRTScreen';
import { TabNavigation } from '@/components/TabNavigation';
import { ChecklistDisplay } from '@/components/ChecklistDisplay';
import { useChecklist } from '@/hooks/useChecklist';
import { checklistData } from '@/data/checklists';

export default function Home() {
  const {
    activeCategory,
    activeChecklist,
    setActiveCategory,
    toggleItem,
    getProgress,
    getCurrentChecklist,
    getCurrentItems,
    resetChecklist,
  } = useChecklist({ categories: checklistData });

  const currentChecklist = getCurrentChecklist();
  const currentItems = getCurrentItems();
  const progress = getProgress(activeCategory, activeChecklist);

  return (
    <CRTScreen>
      <TabNavigation
        categories={checklistData}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      <ChecklistDisplay
        checklist={currentChecklist}
        items={currentItems}
        progress={progress}
        onToggleItem={(itemId) => toggleItem(activeCategory, activeChecklist, itemId)}
        onReset={() => resetChecklist(activeCategory, activeChecklist)}
      />
    </CRTScreen>
  );
}

