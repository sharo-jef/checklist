import { StoredData } from '@/types/checklist';

const STORAGE_KEY = 'b747-checklist-state';
const STORAGE_VERSION = '1.0.0';

/**
 * LocalStorageからデータを読み込む
 */
export function loadFromStorage(): StoredData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const data: StoredData = JSON.parse(stored);
    
    // バージョンチェック
    if (data.version !== STORAGE_VERSION) {
      console.warn('Storage version mismatch. Resetting data.');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to load from storage:', error);
    return null;
  }
}

/**
 * LocalStorageにデータを保存する
 */
export function saveToStorage(data: Partial<StoredData>): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const currentData = loadFromStorage();
    const newData: StoredData = {
      version: STORAGE_VERSION,
      lastUpdated: Date.now(),
      checklistStates: data.checklistStates || currentData?.checklistStates || {},
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    return true;
  } catch (error) {
    console.error('Failed to save to storage:', error);
    return false;
  }
}

/**
 * LocalStorageをクリアする
 */
export function clearStorage(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear storage:', error);
    return false;
  }
}

/**
 * 特定のアイテムの完了状態を取得
 */
export function getItemState(
  categoryId: string,
  checklistId: string,
  itemId: string
): boolean {
  const data = loadFromStorage();
  return data?.checklistStates?.[categoryId]?.[checklistId]?.[itemId] ?? false;
}

/**
 * 特定のアイテムの完了状態を設定
 */
export function setItemState(
  categoryId: string,
  checklistId: string,
  itemId: string,
  completed: boolean
): boolean {
  const data = loadFromStorage();
  const checklistStates = data?.checklistStates || {};

  if (!checklistStates[categoryId]) {
    checklistStates[categoryId] = {};
  }
  if (!checklistStates[categoryId][checklistId]) {
    checklistStates[categoryId][checklistId] = {};
  }

  checklistStates[categoryId][checklistId][itemId] = completed;

  return saveToStorage({ checklistStates });
}
