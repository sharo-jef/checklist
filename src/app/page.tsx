"use client";

import { useState } from "react";
import { CRTScreen } from "@/components/CRTScreen";
import { TopMenu } from "@/components/TopMenu";
import { ChecklistMenu } from "@/components/ChecklistMenu";
import { ChecklistDisplay } from "@/components/ChecklistDisplay";
import { useChecklist } from "@/hooks/useChecklist";
import { checklistData } from "@/data/checklists";
import { MenuType } from "@/types/checklist";

type ViewMode = "menu" | "checklist";

export default function Home() {
  const [activeMenu, setActiveMenu] = useState<MenuType>(MenuType.NORMAL);
  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  const {
    activeCategory,
    setActiveCategory,
    toggleItem,
    getCurrentChecklist,
    getCurrentItems,
    resetChecklist,
    resetAll,
    checklistStates,
  } = useChecklist({ categories: checklistData });

  const currentChecklist = getCurrentChecklist();
  const currentItems = getCurrentItems();

  const handleMenuChange = (menu: MenuType) => {
    setActiveMenu(menu);
    if (menu === MenuType.NORMAL) {
      setViewMode("menu");
    } else if (menu === MenuType.NON_NORMAL) {
      setViewMode("menu");
    }
  };

  const handleReset = () => {
    if (viewMode === "menu") {
      // メニュー画面では全てリセット
      resetAll();
      setActiveItemIndex(0);
    } else if (currentChecklist) {
      // チェックリスト画面では現在のチェックリストのみリセット
      resetChecklist(activeCategory, currentChecklist.id);
      setActiveItemIndex(0);
    }
  };

  const handleChecklistSelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    setViewMode("checklist");
    setActiveItemIndex(0);
  };

  const handleNext = () => {
    // 現在のチェックリストが完了しているか確認
    const allChecked = currentItems.every((item) => item.checked);
    if (!allChecked) return;

    // NORMALメニューのチェックリストを取得
    const normalCategories = checklistData.filter(
      (cat) => cat.menuType === MenuType.NORMAL
    );
    const currentIndex = normalCategories.findIndex(
      (cat) => cat.id === activeCategory
    );

    // 次のチェックリストがあれば移動
    if (currentIndex >= 0 && currentIndex < normalCategories.length - 1) {
      const nextCategory = normalCategories[currentIndex + 1];
      setActiveCategory(nextCategory.id);
      setActiveItemIndex(0);
    }
  };

  // 次のチェックリストがあるかどうかを判定
  const hasNextChecklist = () => {
    const normalCategories = checklistData.filter(
      (cat) => cat.menuType === MenuType.NORMAL
    );
    const currentIndex = normalCategories.findIndex(
      (cat) => cat.id === activeCategory
    );
    return currentIndex >= 0 && currentIndex < normalCategories.length - 1;
  };

  // チェックリスト表示中かどうか
  const isInChecklist =
    activeMenu === MenuType.NORMAL && viewMode === "checklist";

  const handleToggleItem = (itemId: string) => {
    const itemIndex = currentItems.findIndex((item) => item.id === itemId);
    const currentItem = currentItems[itemIndex];

    toggleItem(activeCategory, currentChecklist?.id || "", itemId);

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
        activeMenu={isInChecklist ? null : activeMenu}
        onMenuChange={handleMenuChange}
        onReset={handleReset}
      />
      {activeMenu === MenuType.NORMAL && viewMode === "menu" && (
        <ChecklistMenu
          categories={checklistData.filter(
            (cat) => cat.menuType === MenuType.NORMAL
          )}
          onSelect={handleChecklistSelect}
          checklistStates={checklistStates}
        />
      )}
      {activeMenu === MenuType.NORMAL && viewMode === "checklist" && (
        <ChecklistDisplay
          checklist={currentChecklist}
          items={currentItems}
          activeItemIndex={activeItemIndex}
          onToggleItem={handleToggleItem}
          onNext={handleNext}
          showNextButton={true}
          hasNextChecklist={hasNextChecklist()}
        />
      )}
      {activeMenu === MenuType.NON_NORMAL && viewMode === "menu" && (
        <ChecklistMenu
          categories={checklistData.filter(
            (cat) => cat.menuType === MenuType.NON_NORMAL
          )}
          onSelect={handleChecklistSelect}
          checklistStates={checklistStates}
        />
      )}
      {activeMenu === MenuType.NON_NORMAL && viewMode === "checklist" && (
        <ChecklistDisplay
          checklist={currentChecklist}
          items={currentItems}
          activeItemIndex={activeItemIndex}
          onToggleItem={handleToggleItem}
        />
      )}
    </CRTScreen>
  );
}
