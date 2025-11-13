# Vehicle Digital Checklist

自分用自家用車向けチェックリスト

## ✨ 特徴

- 📋 **メニューベースのナビゲーション** - NORMAL/NON-NORMAL メニューで整理されたチェックリスト
- 💾 **自動保存** - LocalStorage による状態の永続化
- ✅ **自動進行** - チェック完了時に次の項目へ自動移動
- 🔄 **リセット機能** - メニュー全体または個別チェックリストのリセット
- 🎨 **没入感のあるデザイン** - プロフェッショナルなディスプレイの雰囲気を再現
- ⚙️ **自動ドット表示** - チェック項目のフォーマットを自動整形

## 🚀 Getting Started

### 前提条件

- Node.js 18.x 以上
- npm / yarn / pnpm / bun

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/sharo-jef/checklist.git
cd checklist

# 依存関係をインストール
npm install
```

### 開発サーバーの起動

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## 📁 プロジェクト構成

```
checklist/
├── src/
│   ├── app/
│   │   ├── page.tsx          # メインページ
│   │   ├── layout.tsx        # ルートレイアウト
│   │   └── globals.css       # グローバルスタイル（CRT効果）
│   ├── components/           # UIコンポーネント
│   │   ├── CRTScreen.tsx     # CRT効果ラッパー
│   │   ├── ChecklistDisplay.tsx
│   │   ├── ChecklistItem.tsx
│   │   ├── ChecklistMenu.tsx
│   │   ├── CheckIcon.tsx
│   │   ├── TabNavigation.tsx
│   │   ├── TabButton.tsx
│   │   └── TopMenu.tsx
│   ├── hooks/                # カスタムフック
│   │   ├── useChecklist.ts   # チェックリスト状態管理
│   │   └── useLocalStorage.ts
│   ├── types/                # TypeScript型定義
│   │   └── checklist.ts
│   ├── data/                 # チェックリストデータ
│   │   └── checklists.ts
│   └── utils/                # ユーティリティ
│       └── storage.ts        # LocalStorage操作
├── PROGRESS.md               # 開発進捗管理
└── README.md
```

## 🛠️ 技術スタック

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Compiler**: [React Compiler](https://react.dev/learn/react-compiler)
- **State Management**: React Hooks
- **Storage**: LocalStorage API

## 📋 チェックリストカテゴリ

1. **PREDRIVE** - 運転前の準備
2. **BEFORE START** - エンジン始動前
3. **BEFORE DEPARTURE** - 出発前
4. **BEFORE SHUTDOWN** - シャットダウン前
5. **ACCIDENT** - 事故時（非正常時チェックリスト）

## 🎨 デザインコンセプト

### CRT 風エフェクト

- スキャンライン効果
- テキストグロー（発光）
- ビネット効果
- 画面反射
- カスタムスクロールバー

### カラーパレット

```css
--crt-text-primary: #00ff00; /* 明るい緑 */
--crt-text-secondary: #33ff33; /* 中程度の緑 */
--crt-text-dim: #006600; /* 暗い緑 */
--crt-screen-bg: #001a00; /* ディスプレイ背景 */
```

## 🔧 カスタマイズ

### チェックリストデータの編集

`src/data/checklists.ts` を編集して、独自のチェックリストを追加できます。

チェック項目は `item`（項目名）と `value`（値/ステータス）を分けて記述すると、自動的にドットが挿入されます：

```typescript
import { ChecklistCategory, MenuType } from '@/types/checklist';

{
  id: 'custom-category',
  title: 'CUSTOM CATEGORY',
  menuType: MenuType.NORMAL, // または MenuType.NON_NORMAL（非正常時）
  checklists: [
    {
      id: 'custom-list',
      name: 'CUSTOM CHECKLIST',
      items: [
        // 表示: "Parking brake..........Set"
        { id: 'item-1', item: 'Parking brake', value: 'Set', completed: false, required: true },
        // 表示: "Master switch..........CUTOFF"
        { id: 'item-2', item: 'Master switch', value: 'CUTOFF', completed: false, required: true }
      ]
    }
  ]
}
```

### スタイルのカスタマイズ

`src/app/globals.css` で CRT 効果やカラーテーマを調整できます。

## 📝 開発進捗

詳細な開発進捗は [PROGRESS.md](PROGRESS.md) を参照してください。

## 🤝 コントリビューション

プルリクエストを歓迎します！大きな変更の場合は、まず Issue を開いて変更内容を議論してください。

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🙏 謝辞

- 航空機のデジタルチェックリストシステムにインスパイアされました
- レトロな CRT ディスプレイのデザインを再現
- 安全運転のための確認習慣をサポート

---

**Built with ❤️ using Next.js and TypeScript**
