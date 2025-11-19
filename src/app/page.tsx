"use client";

import { useState, useMemo } from "react";
import { TopMenu } from "@/components/TopMenu";
import { ChecklistMenu } from "@/components/ChecklistMenu";
import { ChecklistDisplay } from "@/components/ChecklistDisplay";
import { ResetsMenu } from "@/components/ResetsMenu";
import { useChecklist } from "@/hooks/useChecklist";
import { checklistData } from "@/data/checklists";
import { MenuType } from "@/types/checklist";
import { isItemComplete } from "@/utils/checklist";
import { toggleStatus, overrideStatus } from "@/utils/transitions";
import {
  getFirstUncheckedIndex,
  getNextIncompleteChecklist,
  hasNextChecklist,
} from "@/utils/navigation";

type ViewMode = "default" | "menu" | "checklist";

export default function Home() {
  const [activeMenu, setActiveMenu] = useState<MenuType | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("default");
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  const {
    activeCategory,
    setActiveCategory,
    updateItemStatus,
    getCurrentChecklist,
    getCurrentItems,
    resetAll,
    resetNormal,
    resetNonNormal,
    resetChecklist,
    overrideChecklist,
    itemStates,
  } = useChecklist({ categories: checklistData });

  const currentChecklist = getCurrentChecklist();
  const currentItems = getCurrentItems();

  // Memoize navigation computations to avoid recalculation on every render
  const navigation = useMemo(
    () => ({
      hasNext: hasNextChecklist(activeCategory, checklistData, MenuType.NORMAL),
    }),
    [activeCategory, itemStates]
  );

  const handleMenuChange = (menu: MenuType) => {
    setActiveMenu(menu);
    setViewMode("menu");
  };

  const handleExitMenu = () => {
    setActiveMenu(null);
    setViewMode("default");
  };

  const handleNormalButton = () => {
    const categoryId = getNextIncompleteChecklist(
      MenuType.NORMAL,
      checklistData,
      itemStates
    );
    if (!categoryId) return;
    setActiveMenu(MenuType.NORMAL);
    setActiveCategory(categoryId);
    setViewMode("checklist");
    setActiveItemIndex(
      getFirstUncheckedIndex(categoryId, checklistData, itemStates)
    );
  };

  const handleNonNormalButton = () => {
    const categoryId = getNextIncompleteChecklist(
      MenuType.NON_NORMAL,
      checklistData,
      itemStates
    );
    if (!categoryId) return;
    setActiveMenu(MenuType.NON_NORMAL);
    setActiveCategory(categoryId);
    setViewMode("checklist");
    setActiveItemIndex(
      getFirstUncheckedIndex(categoryId, checklistData, itemStates)
    );
  };

  const handleResetNormal = () => {
    resetNormal();
    setActiveItemIndex(0);
  };

  const handleResetNonNormal = () => {
    resetNonNormal();
    setActiveItemIndex(0);
  };

  const handleResetAll = () => {
    resetAll();
    setActiveItemIndex(0);
  };

  const handleChecklistSelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    setViewMode("checklist");
    setActiveItemIndex(
      getFirstUncheckedIndex(categoryId, checklistData, itemStates)
    );
  };

  const handleNext = () => {
    // 現在のチェックリストが完了しているか確認
    const allChecked = currentItems.every((item) =>
      isItemComplete(item.status)
    );
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
      setActiveItemIndex(
        getFirstUncheckedIndex(nextCategory.id, checklistData, itemStates)
      );
    }
  };

  // チェックリスト表示中かどうか
  const isInChecklist =
    activeMenu === MenuType.NORMAL && viewMode === "checklist";

  /**
   * Handle toggle action on a checklist item (user clicked the item).
   * Uses the state transition map to determine next status.
   */
  const handleToggleItem = (itemId: string) => {
    const itemIndex = currentItems.findIndex((item) => item.id === itemId);
    const currentItem = currentItems[itemIndex];

    // Use transition map instead of nested conditionals
    const newStatus = toggleStatus(currentItem.status);

    updateItemStatus(
      activeCategory,
      currentChecklist?.id || "",
      itemId,
      newStatus
    );

    // アクティブインデックスを最初の未チェック項目に更新
    setTimeout(() => {
      const firstUncheckedIndex = currentItems.findIndex((item, idx) => {
        if (idx === itemIndex) {
          return newStatus === "unchecked";
        }
        return item.status === "unchecked";
      });
      setActiveItemIndex(firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1);
    }, 0);
  };

  /**
   * Handle override action on a checklist item (user clicked ITEM OVRD button).
   * Uses the state transition map to determine next status.
   */
  const handleItemOverride = (itemId: string) => {
    const itemIndex = currentItems.findIndex((item) => item.id === itemId);
    const currentItem = currentItems[itemIndex];

    // Use transition map instead of nested conditionals
    const newStatus = overrideStatus(currentItem.status);

    updateItemStatus(
      activeCategory,
      currentChecklist?.id || "",
      itemId,
      newStatus
    );

    // アクティブインデックスを最初の未チェック項目に更新
    setTimeout(() => {
      const firstUncheckedIndex = currentItems.findIndex((item, idx) => {
        if (idx === itemIndex) {
          return newStatus === "unchecked";
        }
        return item.status === "unchecked";
      });
      setActiveItemIndex(firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1);
    }, 0);
  };

  const handleChecklistOverride = () => {
    if (!currentChecklist) return;
    overrideChecklist(activeCategory, currentChecklist.id);
    // すべてオーバーライドしたので、アクティブインデックスを-1にして枠を消す
    setActiveItemIndex(-1);
  };

  const handleChecklistReset = () => {
    if (!currentChecklist) return;
    resetChecklist(activeCategory, currentChecklist.id);
    // リセット後、最初の項目にアクティブインデックスを設定
    setActiveItemIndex(0);
  };

  return (
    <div className="h-screen w-full bg-[#09090C] flex flex-col overflow-hidden">
      <TopMenu
        activeMenu={isInChecklist ? null : activeMenu}
        onMenuChange={handleMenuChange}
      />
      {viewMode === "default" && (
        <div className="flex-1 bg-[#09090C] flex flex-col">
          <div className="flex-1"></div>
          <div className="flex justify-between gap-3 p-3">
            <button
              onClick={handleNormalButton}
              className="py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-white"
            >
              NORMAL
            </button>
            <button
              onClick={handleNonNormalButton}
              className="py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-yellow-400 whitespace-pre-line"
            >
              {"NON-\nNORMAL"}
            </button>
          </div>
        </div>
      )}
      {activeMenu === MenuType.NORMAL && viewMode === "menu" && (
        <>
          <ChecklistMenu
            categories={checklistData.filter(
              (cat) => cat.menuType === MenuType.NORMAL
            )}
            onSelect={handleChecklistSelect}
            itemStates={itemStates}
            menuType={MenuType.NORMAL}
          />
          <div className="flex justify-end gap-3 p-3 bg-[#09090C]">
            <button
              onClick={handleExitMenu}
              className="py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-white whitespace-pre-line"
            >
              {"EXIT\nMENU"}
            </button>
          </div>
        </>
      )}
      {activeMenu === MenuType.NORMAL && viewMode === "checklist" && (
        <ChecklistDisplay
          checklist={currentChecklist}
          items={currentItems}
          activeItemIndex={activeItemIndex}
          onToggleItem={handleToggleItem}
          onItemOverride={handleItemOverride}
          onChecklistOverride={handleChecklistOverride}
          onChecklistReset={handleChecklistReset}
          onNext={handleNext}
          showControls={true}
          hasNextChecklist={navigation.hasNext}
        />
      )}
      {activeMenu === MenuType.RESETS && viewMode === "menu" && (
        <>
          <ResetsMenu
            onResetNormal={handleResetNormal}
            onResetNonNormal={handleResetNonNormal}
            onResetAll={handleResetAll}
            onExitMenu={handleExitMenu}
          />
          <div className="flex justify-end gap-3 p-3 bg-[#09090C]">
            <button
              onClick={handleExitMenu}
              className="py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-white whitespace-pre-line"
            >
              {"EXIT\nMENU"}
            </button>
          </div>
        </>
      )}
      {activeMenu === MenuType.NON_NORMAL && viewMode === "menu" && (
        <>
          <ChecklistMenu
            categories={checklistData.filter(
              (cat) => cat.menuType === MenuType.NON_NORMAL
            )}
            onSelect={handleChecklistSelect}
            itemStates={itemStates}
            menuType={MenuType.NON_NORMAL}
          />
          <div className="flex justify-end gap-3 p-3 bg-[#09090C]">
            <button
              onClick={handleExitMenu}
              className="py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-white whitespace-pre-line"
            >
              {"EXIT\nMENU"}
            </button>
          </div>
        </>
      )}
      {activeMenu === MenuType.NON_NORMAL && viewMode === "checklist" && (
        <ChecklistDisplay
          checklist={currentChecklist}
          items={currentItems}
          activeItemIndex={activeItemIndex}
          onToggleItem={handleToggleItem}
          onItemOverride={handleItemOverride}
          onChecklistOverride={handleChecklistOverride}
          onChecklistReset={handleChecklistReset}
          showControls={true}
          hasNextChecklist={false}
        />
      )}
    </div>
  );
}
