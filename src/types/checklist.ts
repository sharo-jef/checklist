/**
 * B747-8i デジタルチェックリスト型定義
 */

/**
 * メニュータイプ
 */
export enum MenuType {
  NORMAL = "normal",
  NON_NORMAL = "non-normal",
  RESETS = "resets",
}

/**
 * チェックリスト項目のステータス
 */
export type ChecklistItemStatus =
  | "unchecked"
  | "checked"
  | "overridden"
  | "checked-overridden";

/**
 * チェックリスト項目
 *
 * Note: 完了状態は itemStates マッピング（ChecklistItemStatus）で管理され、
 * この型には含まれません。状態はカテゴリID → チェックリストID → アイテムID の
 * 階層構造で LocalStorage に保存されます。
 */
export interface ChecklistItem {
  /** 一意識別子 */
  id: string;
  /** 項目名（左側） */
  item: string;
  /** ステータス/値（右側） */
  value: string;
  /** 必須項目フラグ */
  required?: boolean;
  /** 補足メモ */
  notes?: string;
}

/**
 * チェックリスト
 */
export interface Checklist {
  /** 一意識別子 */
  id: string;
  /** チェックリスト名 */
  name: string;
  /** チェック項目リスト */
  items: ChecklistItem[];
}

/**
 * チェックリストカテゴリ（タブ）
 */
export interface ChecklistCategory {
  /** 一意識別子 */
  id: string;
  /** カテゴリ名（タブ表示名） */
  title: string;
  /** このカテゴリに含まれるチェックリスト */
  checklists: Checklist[];
  /** メニュータイプ */
  menuType: MenuType;
}

/**
 * アプリケーション状態
 */
export interface AppState {
  /** 現在選択中のカテゴリID */
  activeCategory: string;
  /** 現在選択中のチェックリストID */
  activeChecklist: string;
  /** 全カテゴリデータ */
  categories: ChecklistCategory[];
  /** 最終更新日時 */
  lastUpdated?: number;
}

/**
 * 進捗情報
 */
export interface Progress {
  /** 完了数 */
  completed: number;
  /** 総数 */
  total: number;
  /** 完了率（0-100） */
  percentage: number;
}

/**
 * アイテム状態マップ構造の型エイリアス
 * マッピング: カテゴリID → チェックリストID → アイテムID → ステータス
 */
export type ItemStatesMap = {
  [categoryId: string]: {
    [checklistId: string]: {
      [itemId: string]: ChecklistItemStatus;
    };
  };
};

/**
 * LocalStorage保存用データ
 */
export interface StoredData {
  /** データバージョン */
  version: string;
  /** 最終更新日時 */
  lastUpdated: number;
  /** チェックリスト状態（カテゴリID -> チェックリストID -> アイテムID -> status） */
  itemStates: ItemStatesMap;
}
