"use client";

import { useState } from "react";
import { CRTScreen } from "@/components/CRTScreen";
import { TopMenu } from "@/components/TopMenu";
import { ChecklistMenu } from "@/components/ChecklistMenu";
import { ChecklistDisplay } from "@/components/ChecklistDisplay";
import { ResetsMenu } from "@/components/ResetsMenu";
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
    updateItemStatus,
    getCurrentChecklist,
    getCurrentItems,
    resetAll,
    resetNormal,
    resetNonNormal,
    overrideChecklist,
    itemStates,
  } = useChecklist({ categories: checklistData });

  const currentChecklist = getCurrentChecklist();
  const currentItems = getCurrentItems();

  // カテゴリの最初の未チェック項目のインデックスを取得
  const getFirstUncheckedIndex = (categoryId: string) => {
    const category = checklistData.find((cat) => cat.id === categoryId);
    const checklist = category?.checklists[0];

    if (!checklist) return -1;

    const firstUncheckedIndex = checklist.items.findIndex(
      (item) =>
        (itemStates[categoryId]?.[checklist.id]?.[item.id] ?? "unchecked") ===
        "unchecked"
    );
    return firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1;
  };

  const handleMenuChange = (menu: MenuType) => {
    setActiveMenu(menu);
    if (menu === MenuType.NORMAL) {
      setViewMode("menu");
    } else if (menu === MenuType.NON_NORMAL) {
      setViewMode("menu");
    } else if (menu === MenuType.RESETS) {
      setViewMode("menu");
    }
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
    setActiveItemIndex(getFirstUncheckedIndex(categoryId));
  };

  const handleNext = () => {
    // 現在のチェックリストが完了しているか確認
    const allChecked = currentItems.every((item) => item.status === "checked");
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
      setActiveItemIndex(getFirstUncheckedIndex(nextCategory.id));
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

    // overriddenの項目の場合はoverriddenを外す（それ以降もuncheckedになる処理はupdateItemStatusで行われる）
    if (currentItem.status === "overridden") {
      updateItemStatus(
        activeCategory,
        currentChecklist?.id || "",
        itemId,
        "unchecked"
      );
      setActiveItemIndex(itemIndex);
      return;
    }

    // unchecked <-> checked をトグル
    const newStatus =
      currentItem.status === "checked" ? "unchecked" : "checked";
    updateItemStatus(
      activeCategory,
      currentChecklist?.id || "",
      itemId,
      newStatus
    );

    // チェックを入れた場合
    if (newStatus === "checked") {
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
    else {
      setActiveItemIndex(itemIndex);
    }
  };

  const handleItemOverride = (itemId: string) => {
    const itemIndex = currentItems.findIndex((item) => item.id === itemId);
    const currentItem = currentItems[itemIndex];

    // unchecked/checked <-> overridden をトグル
    const newStatus =
      currentItem.status === "overridden" ? "unchecked" : "overridden";
    updateItemStatus(
      activeCategory,
      currentChecklist?.id || "",
      itemId,
      newStatus
    );

    // オーバーライドした場合、次の項目に移動
    if (newStatus === "overridden") {
      // 最後の項目の場合、アクティブインデックスを-1にして枠を消す
      if (itemIndex === currentItems.length - 1) {
        setActiveItemIndex(-1);
      }
      // 最後でない場合、次の項目に移動
      else if (activeItemIndex < currentItems.length - 1) {
        setActiveItemIndex(activeItemIndex + 1);
      }
    }
    // オーバーライドを解除した場合、その項目に留まる
    else {
      setActiveItemIndex(itemIndex);
    }
  };

  const handleChecklistOverride = () => {
    if (!currentChecklist) return;
    overrideChecklist(activeCategory, currentChecklist.id);
    // すべてオーバーライドしたので、アクティブインデックスを-1にして枠を消す
    setActiveItemIndex(-1);
  };

  return (
    <CRTScreen>
      <TopMenu
        activeMenu={isInChecklist ? null : activeMenu}
        onMenuChange={handleMenuChange}
      />
      {activeMenu === MenuType.NORMAL && viewMode === "menu" && (
        <ChecklistMenu
          categories={checklistData.filter(
            (cat) => cat.menuType === MenuType.NORMAL
          )}
          onSelect={handleChecklistSelect}
          itemStates={itemStates}
          menuType={MenuType.NORMAL}
        />
      )}
      {activeMenu === MenuType.NORMAL && viewMode === "checklist" && (
        <ChecklistDisplay
          checklist={currentChecklist}
          items={currentItems}
          activeItemIndex={activeItemIndex}
          onToggleItem={handleToggleItem}
          onItemOverride={handleItemOverride}
          onChecklistOverride={handleChecklistOverride}
          onNext={handleNext}
          showNextButton={true}
          hasNextChecklist={hasNextChecklist()}
        />
      )}
      {activeMenu === MenuType.RESETS && (
        <ResetsMenu
          onResetNormal={handleResetNormal}
          onResetNonNormal={handleResetNonNormal}
          onResetAll={handleResetAll}
        />
      )}
      {activeMenu === MenuType.NON_NORMAL && viewMode === "menu" && (
        <ChecklistMenu
          categories={checklistData.filter(
            (cat) => cat.menuType === MenuType.NON_NORMAL
          )}
          onSelect={handleChecklistSelect}
          itemStates={itemStates}
          menuType={MenuType.NON_NORMAL}
        />
      )}
      {activeMenu === MenuType.NON_NORMAL && viewMode === "checklist" && (
        <ChecklistDisplay
          checklist={currentChecklist}
          items={currentItems}
          activeItemIndex={activeItemIndex}
          onToggleItem={handleToggleItem}
          onItemOverride={handleItemOverride}
          onChecklistOverride={handleChecklistOverride}
        />
      )}
    </CRTScreen>
  );
}
