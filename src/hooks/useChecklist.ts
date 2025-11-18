import { useState, useCallback, useEffect } from "react";
import {
  ChecklistCategory,
  ChecklistItem,
  ChecklistItemStatus,
  Progress,
} from "@/types/checklist";
import { loadFromStorage, setItemStatus } from "@/utils/storage";

interface UseChecklistProps {
  categories: ChecklistCategory[];
}

/**
 * チェックリスト状態管理フック
 */
export function useChecklist({ categories }: UseChecklistProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "");
  const [activeChecklist, setActiveChecklist] = useState(
    categories[0]?.checklists[0]?.id || ""
  );

  // 初期状態は空オブジェクト（サーバーとクライアントで一致）
  const [itemStates, setItemStates] = useState<{
    [categoryId: string]: {
      [checklistId: string]: {
        [itemId: string]: ChecklistItemStatus;
      };
    };
  }>({});

  // クライアントサイドでのみLocalStorageから読み込む（ハイドレーション対応）
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored?.itemStates) {
      // useEffectの中でqueueMicrotaskを使用して次のマイクロタスクで実行
      queueMicrotask(() => {
        setItemStates(stored.itemStates || {});
      });
    }
  }, []);

  // アイテムの状態を変更
  const updateItemStatus = useCallback(
    (
      categoryId: string,
      checklistId: string,
      itemId: string,
      newStatus: ChecklistItemStatus
    ) => {
      setItemStates((prev) => {
        // LocalStorageに保存
        setItemStatus(categoryId, checklistId, itemId, newStatus);

        return {
          ...prev,
          [categoryId]: {
            ...prev[categoryId],
            [checklistId]: {
              ...prev[categoryId]?.[checklistId],
              [itemId]: newStatus,
            },
          },
        };
      });
    },
    []
  );

  // カテゴリ変更時に最初のチェックリストを自動選択
  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      setActiveCategory(categoryId);
      const category = categories.find((c) => c.id === categoryId);
      if (category && category.checklists.length > 0) {
        setActiveChecklist(category.checklists[0].id);
      }
    },
    [categories]
  );

  // 進捗情報を計算
  const getProgress = useCallback(
    (categoryId: string, checklistId: string): Progress => {
      const category = categories.find((c) => c.id === categoryId);
      const checklist = category?.checklists.find(
        (cl) => cl.id === checklistId
      );

      if (!checklist) {
        return { completed: 0, total: 0, percentage: 0 };
      }

      const total = checklist.items.length;
      const completed = checklist.items.filter((item) => {
        const status = itemStates[categoryId]?.[checklistId]?.[item.id];
        return status === "checked" || status === "overridden";
      }).length;

      return {
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    },
    [categories, itemStates]
  );

  // 現在アクティブなチェックリストを取得
  const getCurrentChecklist = useCallback(() => {
    const category = categories.find((c) => c.id === activeCategory);
    return category?.checklists.find((cl) => cl.id === activeChecklist);
  }, [categories, activeCategory, activeChecklist]);

  // 現在アクティブなチェックリストのアイテムを取得（状態付き）
  const getCurrentItems = useCallback((): (ChecklistItem & {
    status: ChecklistItemStatus;
  })[] => {
    const checklist = getCurrentChecklist();
    if (!checklist) return [];

    return checklist.items.map((item) => ({
      ...item,
      status:
        itemStates[activeCategory]?.[activeChecklist]?.[item.id] ?? "unchecked",
    }));
  }, [getCurrentChecklist, itemStates, activeCategory, activeChecklist]);

  // すべてをリセット
  const resetAll = useCallback(() => {
    setItemStates({});
    // LocalStorageもクリア
    if (typeof window !== "undefined") {
      localStorage.removeItem("b747-checklist-state");
    }
  }, []);

  // 特定のチェックリストをリセット
  const resetChecklist = useCallback(
    (categoryId: string, checklistId: string) => {
      setItemStates((prev) => {
        const newStates = {
          ...prev,
          [categoryId]: {
            ...prev[categoryId],
            [checklistId]: {},
          },
        };

        // LocalStorageも更新
        if (typeof window !== "undefined") {
          const stored = loadFromStorage();
          if (stored) {
            stored.itemStates = newStates;
            localStorage.setItem(
              "b747-checklist-state",
              JSON.stringify(stored)
            );
          }
        }

        return newStates;
      });
    },
    []
  );

  // チェックリスト全体をオーバーライド
  const overrideChecklist = useCallback(
    (categoryId: string, checklistId: string) => {
      const category = categories.find((c) => c.id === categoryId);
      const checklist = category?.checklists.find(
        (cl) => cl.id === checklistId
      );

      if (!checklist) return;

      setItemStates((prev) => {
        const updatedChecklistState = { ...prev[categoryId]?.[checklistId] };

        // すべての項目をoverriddenに設定
        checklist.items.forEach((item) => {
          updatedChecklistState[item.id] = "overridden";
          setItemStatus(categoryId, checklistId, item.id, "overridden");
        });

        return {
          ...prev,
          [categoryId]: {
            ...prev[categoryId],
            [checklistId]: updatedChecklistState,
          },
        };
      });
    },
    [categories]
  );

  // NORMALメニューのすべてをリセット
  const resetNormal = useCallback(() => {
    setItemStates((prev) => {
      const newStates = { ...prev };
      categories
        .filter((cat) => cat.menuType === "normal")
        .forEach((cat) => {
          delete newStates[cat.id];
        });
      // LocalStorageも更新
      if (typeof window !== "undefined") {
        const stored = loadFromStorage();
        if (stored) {
          stored.itemStates = newStates;
          localStorage.setItem("b747-checklist-state", JSON.stringify(stored));
        }
      }
      return newStates;
    });
  }, [categories]);

  // NON-NORMALメニューのすべてをリセット
  const resetNonNormal = useCallback(() => {
    setItemStates((prev) => {
      const newStates = { ...prev };
      categories
        .filter((cat) => cat.menuType === "non-normal")
        .forEach((cat) => {
          delete newStates[cat.id];
        });
      // LocalStorageも更新
      if (typeof window !== "undefined") {
        const stored = loadFromStorage();
        if (stored) {
          stored.itemStates = newStates;
          localStorage.setItem("b747-checklist-state", JSON.stringify(stored));
        }
      }
      return newStates;
    });
  }, [categories]);

  return {
    // 状態
    activeCategory,
    activeChecklist,
    categories,
    itemStates,

    // アクション
    setActiveCategory: handleCategoryChange,
    setActiveChecklist,
    updateItemStatus,
    resetAll,
    resetChecklist,
    resetNormal,
    resetNonNormal,
    overrideChecklist,

    // 計算値
    getProgress,
    getCurrentChecklist,
    getCurrentItems,
  };
}
