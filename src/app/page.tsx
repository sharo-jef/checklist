'use client';

import { useState } from 'react';
import { CRTScreen } from '@/components/CRTScreen';
import { TopMenu } from '@/components/TopMenu';
import { ChecklistMenu } from '@/components/ChecklistMenu';
import { ChecklistDisplay } from '@/components/ChecklistDisplay';
import { useChecklist } from '@/hooks/useChecklist';
import { checklistData } from '@/data/checklists';

type ViewMode = 'menu' | 'checklist';
type MenuType = 'normal' | 'non-normal';

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
    resetChecklist,
  } = useChecklist({ categories: checklistData });

  const currentChecklist = getCurrentChecklist();
  const currentItems = getCurrentItems();

  const handleMenuChange = (menu: MenuType) => {
    setActiveMenu(menu);
    if (menu === 'normal') {
      setViewMode('menu');
    }
  };

  const handleReset = () => {
    if (currentChecklist) {
      resetChecklist(activeCategory, currentChecklist.id);
      setActiveItemIndex(0);
    }
  };

  const handleChecklistSelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    setViewMode('checklist');
    setActiveItemIndex(0);
  };

  const handleToggleItem = (itemId: string) => {
    const itemIndex = currentItems.findIndex((item) => item.id === itemId);
    const currentItem = currentItems[itemIndex];
    
    toggleItem(activeCategory, currentChecklist?.id || '', itemId);
    
    // チェックを入れた場合
    if (!currentItem.checked) {
      // 最後の項目の場合、アクティブインデックスを-1にして枠を消す
      if (itemIndex === currentItems.length - 1) {
        setActiveItemIndex(-1);
      }
      // 最後でない場合、次の項目に移動
      else if (activeItemIndex < currentItems.length - 1) {
        setActiveItemIndex(activeItemIndex + 1);
      }
    }
    // チェックを外した場合、その項目に留まる
    else if (currentItem.checked) {
      setActiveItemIndex(itemIndex);
    }
  };

  return (
    <CRTScreen>
      <TopMenu
        activeMenu={activeMenu}
        onMenuChange={handleMenuChange}
        onReset={handleReset}
      />
      {activeMenu === 'normal' && viewMode === 'menu' && (
        <ChecklistMenu
          categories={checklistData}
          onSelect={handleChecklistSelect}
        />
      )}
      {activeMenu === 'normal' && viewMode === 'checklist' && (
        <ChecklistDisplay
          checklist={currentChecklist}
          items={currentItems}
          activeItemIndex={activeItemIndex}
          onToggleItem={handleToggleItem}
        />
      )}
      {activeMenu === 'non-normal' && (
        <div className="flex-1 flex items-center justify-center">
          <p className="font-mono text-white text-lg">NON-NORMAL MENU</p>
        </div>
      )}
    </CRTScreen>
  );
}


