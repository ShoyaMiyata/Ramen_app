# 技術スタック

## Frontend

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 16.0.7 | React フレームワーク (App Router, Turbopack) |
| React | 19.2.0 | UI ライブラリ |
| TypeScript | 5.x | 型安全な開発 |
| Tailwind CSS | 4.x | ユーティリティファースト CSS |
| Radix UI | - | アクセシブルな UI コンポーネント |
| Framer Motion | 12.x | アニメーション |
| Lucide React | 0.555.0 | アイコン |

## UIコンポーネント

| 用途 | 実装方針 |
|------|----------|
| バッジ・称号 | Radix UI + Tailwind CSS でカスタム実装 |
| ランクカラー | CSS Variables + Tailwind テーマ拡張 |
| アニメーション | Framer Motion（獲得時エフェクト等） |
| アイコン | Lucide React + カスタムSVG |

## Backend

| 技術 | 用途 |
|------|------|
| Convex | リアルタイムデータベース・バックエンド |
| Next.js API Routes | REST API エンドポイント |

## 認証・外部サービス

| サービス | 用途 |
|----------|------|
| Clerk | ユーザー認証・セッション管理 |
| OpenAI | AI チャット・記事生成 (GPT-4o-mini) |
| Qiita | 記事投稿 (OAuth連携) |

## 開発ツール

| ツール | 用途 |
|--------|------|
| Biome | Linter / Formatter |
| PostCSS | CSS 処理 |
