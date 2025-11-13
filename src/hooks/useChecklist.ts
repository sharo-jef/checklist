import { useState, useCallback } from 'react';
import {
  ChecklistCategory,
  ChecklistItem,
  Progress,
} from '@/types/checklist';
import { loadFromStorage, setItemState } from '@/utils/storage';

interface UseChecklistProps {
  categories: ChecklistCategory[];
}

/**
 * チェックリスト状態管理フック
 */
export function useChecklist({ categories }: UseChecklistProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '');
  const [activeChecklist, setActiveChecklist] = useState(
    categories[0]?.checklists[0]?.id || ''
  );
  
  // LocalStorageから初期状態を読み込む（初期値として設定）
  const [checklistStates, setChecklistStates] = useState<{
    [categoryId: string]: {
      [checklistId: string]: {
        [itemId: string]: boolean;
      };
    };
  }>(() => {
    const stored = loadFromStorage();
    return stored?.checklistStates || {};
  });

  // チェック項目のトグル
  const toggleItem = useCallback(
    (categoryId: string, checklistId: string, itemId: string) => {
      setChecklistStates((prev) => {
        const currentState = prev[categoryId]?.[checklistId]?.[itemId] ?? false;
        const newState = !currentState;

        // LocalStorageに保存
        setItemState(categoryId, checklistId, itemId, newState);

        return {
          ...prev,
          [categoryId]: {
            ...prev[categoryId],
            [checklistId]: {
              ...prev[categoryId]?.[checklistId],
              [itemId]: newState,
            },
          },
        };
      });
    },
    []
  );

  // 進捗情報を計算
  const getProgress = useCallback(
    (categoryId: string, checklistId: string): Progress => {
      const category = categories.find((c) => c.id === categoryId);
      const checklist = category?.checklists.find((cl) => cl.id === checklistId);

      if (!checklist) {
        return { completed: 0, total: 0, percentage: 0 };
      }

      const total = checklist.items.length;
      const completed = checklist.items.filter(
        (item) => checklistStates[categoryId]?.[checklistId]?.[item.id] === true
      ).length;

      return {
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    },
    [categories, checklistStates]
  );

  // 現在アクティブなチェックリストを取得
  const getCurrentChecklist = useCallback(() => {
    const category = categories.find((c) => c.id === activeCategory);
    return category?.checklists.find((cl) => cl.id === activeChecklist);
  }, [categories, activeCategory, activeChecklist]);

  // 現在アクティブなチェックリストのアイテムを取得（状態付き）
  const getCurrentItems = useCallback((): (ChecklistItem & { checked: boolean })[] => {
    const checklist = getCurrentChecklist();
    if (!checklist) return [];

    return checklist.items.map((item) => ({
      ...item,
      checked: checklistStates[activeCategory]?.[activeChecklist]?.[item.id] ?? false,
    }));
  }, [getCurrentChecklist, checklistStates, activeCategory, activeChecklist]);

  // すべてをリセット
  const resetAll = useCallback(() => {
    setChecklistStates({});
    // LocalStorageもクリア
    if (typeof window !== 'undefined') {
      localStorage.removeItem('b747-checklist-state');
    }
  }, []);

  // 特定のチェックリストをリセット
  const resetChecklist = useCallback(
    (categoryId: string, checklistId: string) => {
      setChecklistStates((prev) => ({
        ...prev,
        [categoryId]: {
          ...prev[categoryId],
          [checklistId]: {},
        },
      }));
    },
    []
  );

  return {
    // 状態
    activeCategory,
    activeChecklist,
    categories,
    
    // アクション
    setActiveCategory,
    setActiveChecklist,
    toggleItem,
    resetAll,
    resetChecklist,
    
    // 計算値
    getProgress,
    getCurrentChecklist,
    getCurrentItems,
  };
}
