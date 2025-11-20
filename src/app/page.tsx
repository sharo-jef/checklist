"use client";

import { useState, useMemo, useCallback } from "react";
import { TopMenu } from "@/components/TopMenu";
import { ExitMenuButton } from "@/components/ExitMenuButton";
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
import { useViewRouter } from "@/routing/useViewRouter";
import { ViewState, AppState } from "@/types/routing";

type ViewMode = "default" | "menu" | "checklist";

/**
 * Main application page component.
 *
 * Uses declarative view routing pattern with discriminated unions:
 * - ViewState represents current view (default/menu/checklist)
 * - useViewRouter maps ViewState → appropriate component and props
 * - Eliminates nested conditional rendering for maintainability
 *
 * @returns The rendered checklist application
 */
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
      nextNormalChecklist: getNextIncompleteChecklist(
        MenuType.NORMAL,
        checklistData,
        itemStates
      ),
      nextNonNormalChecklist: getNextIncompleteChecklist(
        MenuType.NON_NORMAL,
        checklistData,
        itemStates
      ),
    }),
    // checklistData is a static constant and doesn't need to be in dependencies
    [activeCategory, itemStates]
  );

  const handleMenuChange = useCallback((menu: MenuType) => {
    setActiveMenu(menu);
    setViewMode("menu");
  }, []);

  const handleExitMenu = useCallback(() => {
    setActiveMenu(null);
    setViewMode("default");
  }, []);

  const handleNormalButton = useCallback(() => {
    const categoryId = navigation.nextNormalChecklist;
    if (!categoryId) return;
    setActiveMenu(MenuType.NORMAL);
    setActiveCategory(categoryId);
    setViewMode("checklist");
    setActiveItemIndex(
      getFirstUncheckedIndex(categoryId, checklistData, itemStates)
    );
  }, [navigation.nextNormalChecklist, setActiveCategory, itemStates]);

  const handleNonNormalButton = useCallback(() => {
    const categoryId = navigation.nextNonNormalChecklist;
    if (!categoryId) return;
    setActiveMenu(MenuType.NON_NORMAL);
    setActiveCategory(categoryId);
    setViewMode("checklist");
    setActiveItemIndex(
      getFirstUncheckedIndex(categoryId, checklistData, itemStates)
    );
  }, [navigation.nextNonNormalChecklist, setActiveCategory, itemStates]);

  const handleResetNormal = useCallback(() => {
    resetNormal();
    setActiveItemIndex(0);
  }, [resetNormal]);

  const handleResetNonNormal = useCallback(() => {
    resetNonNormal();
    setActiveItemIndex(0);
  }, [resetNonNormal]);

  const handleResetAll = useCallback(() => {
    resetAll();
    setActiveItemIndex(0);
  }, [resetAll]);

  const handleChecklistSelect = useCallback(
    (categoryId: string) => {
      setActiveCategory(categoryId);
      setViewMode("checklist");
      setActiveItemIndex(
        getFirstUncheckedIndex(categoryId, checklistData, itemStates)
      );
    },
    [setActiveCategory, itemStates]
  );

  const handleNext = useCallback(() => {
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
  }, [currentItems, activeCategory, setActiveCategory, itemStates]);

  // チェックリスト表示中かどうか
  const isInChecklist =
    activeMenu === MenuType.NORMAL && viewMode === "checklist";

  /**
   * Handle toggle action on a checklist item (user clicked the item).
   * Uses the state transition map to determine next status.
   */
  const handleToggleItem = useCallback(
    (itemId: string) => {
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
      queueMicrotask(() => {
        const firstUncheckedIndex = currentItems.findIndex((item, idx) => {
          if (idx === itemIndex) {
            return newStatus === "unchecked";
          }
          return item.status === "unchecked";
        });
        setActiveItemIndex(firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1);
      });
    },
    [currentItems, activeCategory, currentChecklist, updateItemStatus]
  );

  /**
   * Handle override action on a checklist item (user clicked ITEM OVRD button).
   * Uses the state transition map to determine next status.
   */
  const handleItemOverride = useCallback(
    (itemId: string) => {
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
      queueMicrotask(() => {
        const firstUncheckedIndex = currentItems.findIndex((item, idx) => {
          if (idx === itemIndex) {
            return newStatus === "unchecked";
          }
          return item.status === "unchecked";
        });
        setActiveItemIndex(firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1);
      });
    },
    [currentItems, activeCategory, currentChecklist, updateItemStatus]
  );

  const handleChecklistOverride = useCallback(() => {
    if (!currentChecklist) return;
    overrideChecklist(activeCategory, currentChecklist.id);
    // すべてオーバーライドしたので、アクティブインデックスを-1にして枠を消す
    setActiveItemIndex(-1);
  }, [currentChecklist, activeCategory, overrideChecklist]);

  const handleChecklistReset = useCallback(() => {
    if (!currentChecklist) return;
    resetChecklist(activeCategory, currentChecklist.id);
    // リセット後、最初の項目にアクティブインデックスを設定
    setActiveItemIndex(0);
  }, [currentChecklist, activeCategory, resetChecklist]);

  // Construct ViewState from current UI state
  const viewState: ViewState = useMemo(() => {
    if (viewMode === "default") {
      return { view: "default" };
    } else if (viewMode === "menu" && activeMenu !== null) {
      // activeMenu is already MenuType, use it directly
      return { view: "menu", menu: activeMenu };
    } else if (
      viewMode === "checklist" &&
      (activeMenu === MenuType.NORMAL || activeMenu === MenuType.NON_NORMAL)
    ) {
      return { view: "checklist", menu: activeMenu };
    }
    // Fallback for invalid state
    return { view: "default" };
  }, [viewMode, activeMenu]);

  // Construct AppState with all handlers and data
  const appState: AppState = useMemo(
    () => ({
      // Handlers
      handleNormalButton,
      handleNonNormalButton,
      handleChecklistSelect,
      handleExitMenu,
      handleResetNormal,
      handleResetNonNormal,
      handleResetAll,
      handleNext,
      handleToggleItem,
      handleItemOverride,
      handleChecklistOverride,
      handleChecklistReset,

      // Data
      checklistData,
      itemStates,
      currentChecklist: currentChecklist || undefined,
      currentItems,
      activeItemIndex,
      navigation,
    }),
    // checklistData is a static constant, but included for future-proofing
    [
      checklistData,
      handleNormalButton,
      handleNonNormalButton,
      handleChecklistSelect,
      handleExitMenu,
      handleResetNormal,
      handleResetNonNormal,
      handleResetAll,
      handleNext,
      handleToggleItem,
      handleItemOverride,
      handleChecklistOverride,
      handleChecklistReset,
      itemStates,
      currentChecklist,
      currentItems,
      activeItemIndex,
      navigation,
    ]
  );

  // Get the view component and props from the router
  const { ViewComponent, viewProps } = useViewRouter(viewState, appState);

  return (
    <div className="h-screen w-full bg-[#09090C] flex flex-col overflow-hidden">
      <TopMenu
        activeMenu={isInChecklist ? null : activeMenu}
        onMenuChange={handleMenuChange}
      />
      <ViewComponent {...viewProps} />
      {viewMode === "menu" && (
        <div className="flex justify-end gap-3 p-3 bg-[#09090C]">
          <ExitMenuButton onClick={handleExitMenu} />
        </div>
      )}
    </div>
  );
}
