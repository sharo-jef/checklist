# Vehicle Digital Checklist - GitHub Copilot Instructions

このプロジェクトは、航空機のデジタルチェックリストシステムにインスパイアされた自家用車向けチェックリストアプリケーションです。Next.js 16（App Router）、React 19、TypeScript 5、Tailwind CSS 4を使用し、レトロなCRT風ディスプレイのデザインを実装しています。

## プロジェクト概要

**プロジェクト名**: Vehicle Digital Checklist  
**バージョン**: 0.0.16  
**ライセンス**: MIT  
**リポジトリ**: https://github.com/sharo-jef/checklist

### 目的

自家用車の運転前・運転中・駐車時の安全確認をプロフェッショナルなチェックリストシステムで管理し、確認漏れを防止します。また、事故などの非正常時に必要な手続きもチェックリストとして提供します。

### 主な機能

- **メニューベースのナビゲーション**: NORMAL（通常時）/ NON-NORMAL（非正常時）メニューでチェックリストを整理
- **自動保存**: LocalStorageによるチェック状態の永続化
- **自動進行**: チェック完了時に次の未チェック項目へ自動移動
- **リセット機能**: メニュー全体または個別チェックリストのリセット
- **オーバーライド機能**: 必須項目をスキップする機能
- **没入感のあるデザイン**: CRTディスプレイ風のスキャンライン、グロー効果、ビネット効果
- **自動ドット表示**: チェック項目のフォーマットを自動整形（"Parking brake..........Set"）

## 技術スタック

### フレームワーク・ライブラリ

- **Next.js 16** (App Router)
  - Static Export設定（`output: "export"`）
  - basePath: `/checklist`
  - React Compiler有効化
- **React 19** (Server ComponentsとClient Components混在)
- **TypeScript 5**
- **Tailwind CSS 4** (@tailwindcss/postcss)

### 開発ツール

- **ESLint 9** (Next.js設定 + Prettier統合)
- **Prettier 3.6.2**
- **React Compiler** (babel-plugin-react-compiler)

### 状態管理

- React Hooks（useState, useCallback, useEffect）
- LocalStorage API（クライアントサイドのみ）

## プロジェクト構造

```
checklist/
├── .github/
│   └── copilot-instructions.md    # このファイル
├── public/
│   └── fonts/                      # カスタムフォント
├── src/
│   ├── app/
│   │   ├── page.tsx                # メインページ（Client Component）
│   │   ├── layout.tsx              # ルートレイアウト
│   │   ├── globals.css             # CRT効果のグローバルスタイル
│   │   └── favicon.ico
│   ├── components/
│   │   ├── CRTScreen.tsx           # CRT効果ラッパー
│   │   ├── TopMenu.tsx             # 上部メニューバー
│   │   ├── ChecklistMenu.tsx       # チェックリスト一覧メニュー
│   │   ├── ChecklistDisplay.tsx    # チェックリスト表示
│   │   ├── ChecklistItem.tsx       # チェック項目
│   │   ├── ChecklistStatusBanner.tsx # ステータスバナー
│   │   ├── CheckIcon.tsx           # チェックアイコン
│   │   ├── TabNavigation.tsx       # タブナビゲーション
│   │   ├── TabButton.tsx           # タブボタン
│   │   └── ResetsMenu.tsx          # リセットメニュー
│   ├── hooks/
│   │   ├── useChecklist.ts         # チェックリスト状態管理フック
│   │   └── useLocalStorage.ts      # LocalStorageフック
│   ├── types/
│   │   └── checklist.ts            # TypeScript型定義
│   ├── data/
│   │   └── checklists.ts           # チェックリストデータ
│   ├── utils/
│   │   └── storage.ts              # LocalStorage操作ユーティリティ
│   └── global.d.ts                 # グローバル型定義
├── eslint.config.mjs
├── next.config.ts
├── next-env.d.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── LICENSE
└── README.md
```

## アーキテクチャとデザインパターン

### コンポーネント設計

#### Client Components（"use client"）

すべてのインタラクティブなコンポーネントはClient Componentです：

- `page.tsx`: メインアプリケーションロジック
- すべての`components/`配下のコンポーネント
- `useChecklist`フックを使用するコンポーネント

#### ハイドレーション対策

LocalStorageの読み込みは`useEffect`内で行い、初期状態はサーバーとクライアントで一致させています：

```typescript
const [itemStates, setItemStates] = useState({});

useEffect(() => {
  const stored = loadFromStorage();
  if (stored?.itemStates) {
    queueMicrotask(() => {
      setItemStates(stored.itemStates || {});
    });
  }
}, []);
```

### 状態管理

#### useChecklist フック

チェックリスト全体の状態を管理する中心的なフックです：

**主な状態**:

- `activeCategory`: 現在選択中のカテゴリID
- `activeChecklist`: 現在選択中のチェックリストID
- `itemStates`: 各チェック項目の状態（unchecked/checked/overridden）

**主なメソッド**:

- `updateItemStatus()`: 項目の状態を変更
- `resetAll()`: すべてのチェックをリセット
- `resetNormal()`: NORMALメニューのみリセット
- `resetNonNormal()`: NON-NORMALメニューのみリセット
- `resetChecklist()`: 特定のチェックリストをリセット
- `overrideChecklist()`: チェックリスト全体をオーバーライド
- `getProgress()`: 進捗情報を計算
- `getCurrentChecklist()`: 現在のチェックリストを取得
- `getCurrentItems()`: 現在の項目を状態付きで取得

#### LocalStorage永続化

**キー**: `b747-checklist-state`

**データ構造**:

```typescript
interface StoredData {
  version: string;
  lastUpdated: number;
  itemStates: {
    [categoryId: string]: {
      [checklistId: string]: {
        [itemId: string]: ChecklistItemStatus;
      };
    };
  };
}
```

### 型システム

#### 主要な型定義（`src/types/checklist.ts`）

```typescript
enum MenuType {
  NORMAL = "normal",
  NON_NORMAL = "non-normal",
  RESETS = "resets",
}

type ChecklistItemStatus = "unchecked" | "checked" | "overridden";

interface ChecklistItem {
  id: string;
  item: string; // 項目名（左側）
  value: string; // ステータス/値（右側）
  completed: boolean; // 後方互換性
  required?: boolean; // 必須項目フラグ
  notes?: string; // 補足メモ
}

interface Checklist {
  id: string;
  name: string;
  items: ChecklistItem[];
}

interface ChecklistCategory {
  id: string;
  title: string;
  checklists: Checklist[];
  menuType: MenuType;
}
```

## チェックリストデータ（`src/data/checklists.ts`）

現在のチェックリストカテゴリ：

1. **PREDRIVE** (NORMAL)
   - Parking brake, Gears, Master switch の確認
2. **BEFORE START** (NORMAL)
   - Doors, Mirrors, Belts, Master switch の確認
3. **BEFORE DEPARTURE** (NORMAL)
   - Navigation, Master switch, Caution lights, Lights, Roof, Parking brake の確認
4. **PARKING** (NORMAL)
   - Gears, Parking brake, Roof, Doors, Windows, Seat heaters, Master switch の確認
5. **ACCIDENT** (NON-NORMAL)
   - Call ambulance, Call police, Call dealer, Call insurer

### データ追加方法

```typescript
{
  id: 'unique-id',
  title: 'CATEGORY NAME',
  menuType: MenuType.NORMAL, // または MenuType.NON_NORMAL
  checklists: [
    {
      id: 'checklist-id',
      name: 'CHECKLIST NAME',
      items: [
        {
          id: 'item-1',
          item: 'Item name',      // 左側の項目名
          value: 'Expected value', // 右側の値
          completed: false,
          required: true
        }
      ]
    }
  ]
}
```

**自動ドット表示**: `item`と`value`を分けて記述すると、表示時に自動的にドット（`.`）で埋められます。

## スタイリングとデザイン

### CRT風エフェクト（`src/app/globals.css`）

#### 主要なカスタムプロパティ

```css
:root {
  --crt-text-primary: #00ff00; /* 明るい緑 */
  --crt-text-secondary: #33ff33; /* 中程度の緑 */
  --crt-text-dim: #006600; /* 暗い緑 */
  --crt-screen-bg: #001a00; /* ディスプレイ背景 */
  --crt-bezel-bg: #1a1a1a; /* ベゼル背景 */
}
```

#### CRT効果の実装

1. **スキャンライン**: `repeating-linear-gradient`による水平線
2. **グロー効果**: `text-shadow`による緑色の発光
3. **ビネット**: 画面周囲の暗い縁取り
4. **画面反射**: 微細なノイズテクスチャ
5. **カスタムスクロールバー**: 緑色のスタイリング

### Tailwind CSS設定

Tailwind CSS 4（`@tailwindcss/postcss`）を使用しています。カスタムスタイルは`globals.css`で定義されたCSS変数とTailwindのユーティリティクラスを組み合わせて実装されています。

## ビルドと配信

### Next.js設定（`next.config.ts`）

```typescript
const nextConfig: NextConfig = {
  output: "export", // 静的エクスポート
  basePath: "/checklist", // GitHub Pagesなどのサブパス対応
  images: {
    unoptimized: true, // 静的エクスポート用
  },
  reactCompiler: true, // React Compiler有効化
};
```

### スクリプト

```bash
npm run dev      # 開発サーバー起動（localhost:3000）
npm run build    # プロダクションビルド（静的エクスポート）
npm run start    # プロダクションサーバー起動
npm run lint     # ESLint実行
npm run format   # Prettier実行
```

## 開発ガイドライン

### コーディング規約

1. **TypeScript**: すべてのファイルで厳密な型定義を使用
2. **命名規則**:
   - コンポーネント: PascalCase
   - フック: `use` プレフィックス + camelCase
   - 型: PascalCase
   - 定数: SCREAMING_SNAKE_CASE
3. **ファイル構成**: 機能ごとにディレクトリを分割（components, hooks, types, utils）
4. **import順序**: React → Next.js → サードパーティ → 内部モジュール

### コンポーネント作成ガイド

#### 基本的なコンポーネント構造

```typescript
"use client"; // 必要に応じて

import { useState } from "react";

interface ComponentProps {
  // propsの型定義
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // ロジック

  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

### State更新のベストプラクティス

```typescript
// ✅ Good: 関数形式のstate更新
setItemStates((prev) => ({
  ...prev,
  [key]: newValue,
}));

// ❌ Bad: 直接的なstate更新
setItemStates({ ...itemStates, [key]: newValue });
```

### LocalStorage操作

すべてのLocalStorage操作は`src/utils/storage.ts`を経由して行います：

```typescript
import { loadFromStorage, setItemStatus } from "@/utils/storage";

// 読み込み
const stored = loadFromStorage();

// 保存
setItemStatus(categoryId, checklistId, itemId, status);
```

## UI/UXの仕様

### ユーザーフロー

1. **初期画面**: NORMAL / NON-NORMAL ボタンが表示
2. **NORMALボタン**: 次の未完了チェックリストに直接移動
3. **NON-NORMALボタン**: 次の未完了チェックリストに直接移動
4. **メニュー表示**: トップメニューから各カテゴリを選択可能
5. **チェックリスト実行**: 項目をチェック → 自動的に次の項目へフォーカス移動
6. **完了後**: 次のチェックリストへの移動（NORMAL時のみ）

### キーボードナビゲーション

現在は実装されていませんが、将来的には以下のような対応が想定されます：

- `↑/↓`: 項目間移動
- `Space/Enter`: チェックトグル
- `Esc`: メニューに戻る

### チェック項目の状態遷移

```
unchecked → [クリック] → checked → [クリック] → unchecked
    ↓                         ↓
[Override]               [Override]
    ↓                         ↓
overridden ← [クリック] ← overridden
```

- **unchecked**: 未チェック（通常状態）
- **checked**: チェック済み（緑色のチェックマーク）
- **overridden**: オーバーライド（黄色の"OVR"表示）

### 進捗表示

各チェックリストの進捗は以下の形式で表示されます：

```
[✓✓__] 50% (2/4)
```

- チェック済み: `✓`
- 未チェック: `_`
- パーセンテージと数値

## トラブルシューティング

### よくある問題

#### ハイドレーションエラー

**原因**: サーバーサイドとクライアントサイドのレンダリング結果が不一致

**解決策**: LocalStorageの読み込みを`useEffect`内で行う

```typescript
const [state, setState] = useState({}); // 初期状態は空

useEffect(() => {
  const stored = loadFromStorage();
  if (stored) {
    queueMicrotask(() => setState(stored));
  }
}, []);
```

#### LocalStorageが保存されない

**原因**: プライベートブラウジングモード、またはストレージ容量制限

**解決策**: `try-catch`でエラーハンドリングを追加

```typescript
try {
  localStorage.setItem(key, value);
} catch (error) {
  console.error("LocalStorage save failed:", error);
}
```

## 拡張性とカスタマイズ

### 新しいチェックリストの追加

1. `src/data/checklists.ts`に新しいカテゴリを追加
2. `MenuType.NORMAL`または`MenuType.NON_NORMAL`を指定
3. 必要に応じて`src/types/checklist.ts`の型を拡張

### 新しい機能の追加

1. **新しいフック**: `src/hooks/`に追加
2. **新しいコンポーネント**: `src/components/`に追加
3. **新しいユーティリティ**: `src/utils/`に追加

### スタイルのカスタマイズ

1. **カラーテーマ変更**: `src/app/globals.css`のCSS変数を編集
2. **CRT効果の調整**: スキャンライン、グロー、ビネットのパラメータを変更
3. **フォント変更**: `public/fonts/`にフォントを追加し、`globals.css`で指定

## パフォーマンス最適化

### React Compiler

React 19のコンパイラが有効化されており、自動的に最適化されています。

### メモ化

必要に応じて`useCallback`と`useMemo`を使用していますが、React Compilerが自動最適化するため、過度なメモ化は避けています。

### バンドルサイズ

- 静的エクスポートによりサーバーサイドのオーバーヘッドなし
- 必要最小限の依存関係のみをインストール

## セキュリティとプライバシー

- **データ保存**: すべてのデータはユーザーのブラウザ（LocalStorage）にのみ保存
- **外部通信なし**: ネットワーク通信は一切行わない
- **プライバシー**: ユーザーデータは外部に送信されない

## 今後の拡張予定

- [ ] キーボードナビゲーション対応
- [ ] 音声フィードバック（チェック音）
- [ ] チェックリストのエクスポート/インポート機能
- [ ] カスタムチェックリストの作成UI
- [ ] ダークモード/ライトモードの切り替え
- [ ] PWA対応（オフライン動作）
- [ ] タイマー機能（時間制限のあるチェック項目）

## 参考リソース

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**GitHub Copilotへの注意**: このプロジェクトは航空機のチェックリストシステムを模倣していますが、実際の運航には使用されません。自家用車の安全確認を支援する教育・補助ツールです。コードを更新した際は、このドキュメントも最新の状態に保つようにしてください。 git 管理しているので変更日時等を記載する必要はありません。
