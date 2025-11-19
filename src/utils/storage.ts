import { StoredData, ChecklistItemStatus } from "@/types/checklist";

const STORAGE_KEY = "checklist-state";
const STORAGE_VERSION = "2.0.0";

/**
 * LocalStorageからデータを読み込む
 */
export function loadFromStorage(): StoredData | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const data: StoredData = JSON.parse(stored);

    // バージョンチェック - 旧バージョンの場合は移行
    if (data.version === "1.0.0") {
      console.log("Migrating storage from v1.0.0 to v2.0.0");
      const oldData = data as unknown as {
        checklistStates?: Record<
          string,
          Record<string, Record<string, boolean>>
        >;
        overriddenStates?: Record<
          string,
          Record<string, Record<string, boolean>>
        >;
      };
      const newItemStates: StoredData["itemStates"] = {};

      // checklistStatesとoverriddenStatesを統合
      for (const categoryId in oldData.checklistStates || {}) {
        newItemStates[categoryId] = {};
        for (const checklistId in oldData.checklistStates?.[categoryId] || {}) {
          newItemStates[categoryId][checklistId] = {};
          for (const itemId in oldData.checklistStates?.[categoryId]?.[
            checklistId
          ] || {}) {
            const isChecked =
              oldData.checklistStates?.[categoryId]?.[checklistId]?.[itemId];
            const isOverridden =
              oldData.overriddenStates?.[categoryId]?.[checklistId]?.[itemId];

            if (isOverridden) {
              newItemStates[categoryId][checklistId][itemId] = "overridden";
            } else if (isChecked) {
              newItemStates[categoryId][checklistId][itemId] = "checked";
            } else {
              newItemStates[categoryId][checklistId][itemId] = "unchecked";
            }
          }
        }
      }

      const migratedData: StoredData = {
        version: STORAGE_VERSION,
        lastUpdated: Date.now(),
        itemStates: newItemStates,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedData));
      return migratedData;
    }

    if (data.version !== STORAGE_VERSION) {
      console.warn("Storage version mismatch. Resetting data.");
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to load from storage:", error);
    return null;
  }
}

/**
 * LocalStorageにデータを保存する
 */
export function saveToStorage(data: Partial<StoredData>): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const currentData = loadFromStorage();
    const newData: StoredData = {
      version: STORAGE_VERSION,
      lastUpdated: Date.now(),
      itemStates: data.itemStates || currentData?.itemStates || {},
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    return true;
  } catch (error) {
    console.error("Failed to save to storage:", error);
    return false;
  }
}

/**
 * LocalStorageをクリアする
 */
export function clearStorage(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear storage:", error);
    return false;
  }
}

/**
 * 特定のアイテムの状態を取得
 */
export function getItemStatus(
  categoryId: string,
  checklistId: string,
  itemId: string
): ChecklistItemStatus {
  const data = loadFromStorage();
  return data?.itemStates?.[categoryId]?.[checklistId]?.[itemId] ?? "unchecked";
}

/**
 * 特定のアイテムの状態を設定
 */
export function setItemStatus(
  categoryId: string,
  checklistId: string,
  itemId: string,
  status: ChecklistItemStatus
): boolean {
  const data = loadFromStorage();
  const itemStates = data?.itemStates || {};

  if (!itemStates[categoryId]) {
    itemStates[categoryId] = {};
  }
  if (!itemStates[categoryId][checklistId]) {
    itemStates[categoryId][checklistId] = {};
  }

  itemStates[categoryId][checklistId][itemId] = status;

  return saveToStorage({ itemStates });
}

/**
 * 特定のチェックリストをリセット
 */
export function resetChecklistInStorage(
  categoryId: string,
  checklistId: string
): boolean {
  const data = loadFromStorage();
  if (!data) {
    return false;
  }

  const newItemStates = {
    ...data.itemStates,
    [categoryId]: {
      ...data.itemStates[categoryId],
      [checklistId]: {},
    },
  };

  return saveToStorage({ itemStates: newItemStates });
}

/**
 * 複数のカテゴリをリセット
 */
export function resetCategoriesInStorage(categoryIds: string[]): boolean {
  // 空配列は有効な操作（no-op）
  if (categoryIds.length === 0) {
    return true;
  }

  const data = loadFromStorage();
  if (!data) {
    return false;
  }

  const newItemStates = { ...data.itemStates };

  // バッチ操作: すべての削除を実行してから一度だけ保存
  categoryIds.forEach((categoryId) => {
    delete newItemStates[categoryId];
  });

  return saveToStorage({ itemStates: newItemStates });
}

/**
 * すべてのチェックリスト状態をリセット
 */
export function resetAllStorage(): boolean {
  return clearStorage();
}
