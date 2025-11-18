# Vehicle Digital Checklist

航空機のデジタルチェックリストシステムにインスパイアされた自家用車向けチェックリストアプリケーション。
運転前・運転中・駐車時の安全確認をプロフェッショナルに管理し、確認漏れを防止します。

## 🚀 クイックスタート

### 前提条件

- Node.js 20.x 以上
- npm / yarn / pnpm / bun

### インストールと起動

```bash
# リポジトリをクローン
git clone https://github.com/sharo-jef/checklist.git
cd checklist

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000/checklist](http://localhost:3000/checklist) を開いてアプリケーションを確認できます。

### ビルドとデプロイ

```bash
# プロダクションビルド（静的エクスポート）
npm run build

# ビルド結果は out/ ディレクトリに生成されます
# GitHub Pages や Netlify などの静的ホスティングサービスにデプロイ可能
```

## 📖 使い方

1. **初期画面**: NORMAL / NON-NORMAL ボタンが表示されます
2. **NORMALボタン**: 通常運転時のチェックリストに移動
3. **NON-NORMALボタン**: 事故など非正常時のチェックリストに移動
4. **チェック実行**: 項目をクリックしてチェック、自動的に次の項目へ移動
5. **リセット**: "RESETS"タブから全体または個別にリセット可能

## 🚗 チェックリストカテゴリ

### NORMAL（通常時）

日常的な運転前・運転中・駐車時の確認項目。

| カテゴリ             | 説明             | 主なチェック項目                                                                  |
| -------------------- | ---------------- | --------------------------------------------------------------------------------- |
| **PREDRIVE**         | 運転前の準備     | Parking brake, Gears, Master switch                                               |
| **BEFORE START**     | エンジン始動前   | Doors, Mirrors, Belts, Master switch                                              |
| **BEFORE DEPARTURE** | 出発前の最終確認 | Navigation, Master switch, Caution lights, Lights, Roof, Room lamp, Parking brake |
| **PARKING**          | 駐車時の確認     | Gears, Parking brake, Roof, Doors, Windows, Seat heaters, Master switch           |
| **SECURE**           | 車両セキュリティ | ETC card, Room lamp, Doors                                                        |

### NON-NORMAL（非正常時）

事故や緊急時の対応手順。

| カテゴリ     | 説明             | 主なチェック項目                                       |
| ------------ | ---------------- | ------------------------------------------------------ |
| **ACCIDENT** | 事故発生時の対応 | Call ambulance, Call police, Call dealer, Call insurer |

### カスタムカテゴリの追加

`src/data/checklists.ts`を編集して、独自のカテゴリやチェックリストを追加できます。詳しくは[カスタマイズ](#-カスタマイズ)セクションを参照してください。

## 🔧 カスタマイズ

`src/data/checklists.ts`を編集して、独自のチェックリストを追加できます。詳細は[開発ガイド](.github/copilot-instructions.md)を参照してください。

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

---

**Built with ❤️ using Next.js and TypeScript**
