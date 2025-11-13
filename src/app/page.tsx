'use client';

import { useState } from 'react';
import { CRTScreen } from '@/components/CRTScreen';
import { TopMenu } from '@/components/TopMenu';
import { ChecklistMenu } from '@/components/ChecklistMenu';
import { ChecklistDisplay } from '@/components/ChecklistDisplay';
import { useChecklist } from '@/hooks/useChecklist';
import { checklistData } from '@/data/checklists';

type ViewMode = 'menu' | 'checklist';
type MenuType = 'normal' | 'resets' | 'non-normal';

export default function Home() {
  const [activeMenu, setActiveMenu] = useState<MenuType>('normal');
  const [viewMode, setViewMode] = useState<ViewMode>('menu');
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  const {
    activeCategory,
    setActiveCategory,
    toggleItem,
    getCurrentChecklist,
    getCurrentItems,
  } = useChecklist({ categories: checklistData });

  const currentChecklist = getCurrentChecklist();
  const currentItems = getCurrentItems();

  const handleMenuChange = (menu: MenuType) => {
    setActiveMenu(menu);
    if (menu === 'normal') {
      setViewMode('menu');
    }
  };

  const handleChecklistSelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    setViewMode('checklist');
    setActiveItemIndex(0);
  };

  const handleBack = () => {
    setViewMode('menu');
    setActiveItemIndex(0);
  };

  const handleToggleItem = (itemId: string) => {
    toggleItem(activeCategory, currentChecklist?.id || '', itemId);
    // 次の項目に移動
    if (activeItemIndex < currentItems.length - 1) {
      setActiveItemIndex(activeItemIndex + 1);
    }
  };

  return (
    <CRTScreen>
      <TopMenu activeMenu={activeMenu} onMenuChange={handleMenuChange} />
      {activeMenu === 'normal' && viewMode === 'menu' && (
        <ChecklistMenu
          categories={checklistData}
          onSelect={handleChecklistSelect}
          onBack={() => {}}
        />
      )}
      {activeMenu === 'normal' && viewMode === 'checklist' && (
        <ChecklistDisplay
          checklist={currentChecklist}
          items={currentItems}
          activeItemIndex={activeItemIndex}
          onToggleItem={handleToggleItem}
          onBack={handleBack}
        />
      )}
      {activeMenu === 'resets' && (
        <div className="flex-1 flex items-center justify-center">
          <p className="font-mono text-white text-lg">RESETS MENU</p>
        </div>
      )}
      {activeMenu === 'non-normal' && (
        <div className="flex-1 flex items-center justify-center">
          <p className="font-mono text-white text-lg">NON-NORMAL MENU</p>
        </div>
      )}
    </CRTScreen>
  );
}


