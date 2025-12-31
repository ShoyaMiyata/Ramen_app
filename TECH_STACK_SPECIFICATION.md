# Nooodle 技術スタック仕様書

## プロジェクト概要

**プロジェクト名**: Nooodle
**バージョン**: 0.1.0
**説明**: ラーメン記録・共有プラットフォーム
**リポジトリ**: new_ramen

---

## 1. フロントエンド

### 1.1 フレームワーク・ライブラリ

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Next.js** | 16.0.7 | React フレームワーク（App Router） |
| **React** | 19.2.0 | UI ライブラリ |
| **React DOM** | 19.2.0 | React DOM レンダリング |
| **TypeScript** | ^5 | 型安全な開発 |

### 1.2 UI コンポーネント・スタイリング

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Tailwind CSS** | ^4 | ユーティリティファーストの CSS フレームワーク |
| **Radix UI** | 各種 ^1-2 | ヘッドレス UI コンポーネント集 |
| ├─ Alert Dialog | ^1.1.15 | モーダルダイアログ |
| ├─ Checkbox | ^1.3.3 | チェックボックス |
| ├─ Dialog | ^1.1.15 | ダイアログ |
| ├─ Dropdown Menu | ^2.1.16 | ドロップダウンメニュー |
| ├─ Label | ^2.1.8 | ラベル |
| ├─ Popover | ^1.1.15 | ポップオーバー |
| ├─ Select | ^2.2.6 | セレクトボックス |
| ├─ Tabs | ^1.1.13 | タブ |
| └─ Tooltip | ^1.2.8 | ツールチップ |
| **Lucide React** | ^0.556.0 | アイコンライブラリ |
| **Framer Motion** | ^12.23.25 | アニメーションライブラリ |
| **clsx** | ^2.1.1 | クラス名の条件分岐ユーティリティ |
| **tailwind-merge** | ^3.4.0 | Tailwind クラス名のマージ |

### 1.3 画像処理

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **browser-image-compression** | ^2.0.2 | クライアントサイド画像圧縮 |
| **react-easy-crop** | ^5.5.6 | 画像クロップ UI |

### 1.4 データ可視化・仮想化

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Recharts** | ^3.5.1 | グラフ・チャート描画ライブラリ |
| **@tanstack/react-virtual** | ^3.13.12 | 仮想スクロール（パフォーマンス最適化） |

---

## 2. バックエンド・データベース

### 2.1 BaaS（Backend as a Service）

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Convex** | ^1.30.0 | リアルタイムデータベース・バックエンドプラットフォーム |

### 2.2 認証・認可

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Clerk** | - | 認証プラットフォーム |
| ├─ @clerk/nextjs | ^6.36.0 | Next.js 統合 |
| ├─ @clerk/clerk-sdk-node | ^4.13.23 | Node.js SDK |
| └─ @clerk/localizations | ^3.29.1 | 日本語対応（jaJP） |

**Clerk 設定**:
- ドメイン: `https://knowing-badger-66.clerk.accounts.dev`
- Application ID: `convex`

---

## 3. インフラ・ストレージ

### 3.1 オブジェクトストレージ

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **AWS S3 / Cloudflare R2** | - | 画像・ファイルストレージ |
| ├─ @aws-sdk/client-s3 | ^3.955.0 | S3 クライアント |
| └─ @aws-sdk/s3-request-presigner | ^3.955.0 | 署名付き URL 生成 |

**設定**:
- Convex Storage（小規模画像）
- Cloudflare R2（最適化後の画像）

---

## 4. 決済

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Stripe** | ^20.1.0 | サブスクリプション決済 |

---

## 5. Webhook・API

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Svix** | ^1.82.0 | Webhook 管理・検証（Clerk Webhook） |

---

## 6. バリデーション

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Zod** | ^4.1.13 | スキーマバリデーション |

---

## 7. 開発ツール

### 7.1 Linter・Formatter

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **ESLint** | ^9 | JavaScript/TypeScript Linter |
| **eslint-config-next** | 16.0.7 | Next.js 公式 ESLint 設定 |

### 7.2 型定義

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **@types/node** | ^20 | Node.js 型定義 |
| **@types/react** | ^19 | React 型定義 |
| **@types/react-dom** | ^19 | React DOM 型定義 |

---

## 8. TypeScript 設定

### 8.1 コンパイラオプション

```json
{
  "target": "ES2017",
  "lib": ["dom", "dom.iterable", "esnext"],
  "allowJs": true,
  "skipLibCheck": true,
  "strict": true,
  "noEmit": true,
  "esModuleInterop": true,
  "module": "esnext",
  "moduleResolution": "bundler",
  "resolveJsonModule": true,
  "isolatedModules": true,
  "jsx": "react-jsx",
  "incremental": true
}
```

### 8.2 パスエイリアス

```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

---

## 9. Next.js 設定

### 9.1 画像最適化

```typescript
{
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.convex.cloud" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "*.r2.dev" }
    ],
    minimumCacheTTL: 604800, // 7日間
    deviceSizes: [320, 420, 640, 750, 828],
    imageSizes: [16, 32, 48, 64, 96, 128, 256]
  }
}
```

### 9.2 実験的機能

```typescript
{
  experimental: {
    scrollRestoration: false // カスタムスクロール復元のため無効化
  }
}
```

---

## 10. データベーススキーマ（Convex）

### 10.1 主要テーブル

| テーブル名 | 説明 |
|-----------|------|
| **users** | ユーザー情報（Clerk 連携、プラン、設定） |
| **shops** | ラーメン店舗情報 |
| **noodles** | ラーメン投稿（画像、評価、コメント） |
| **likes** | 投稿へのいいね |
| **comments** | 投稿へのコメント |
| **commentLikes** | コメントへのいいね |
| **follows** | フォロー関係 |
| **followRequests** | フォローリクエスト（鍵アカウント用） |
| **groups** | グループ |
| **groupMembers** | グループメンバー |
| **myBests** | マイベストラーメン |
| **userBadges** | ユーザーバッジ |
| **prefectureBadges** | 都道府県バッジ |
| **stations** | 駅マスタデータ |
| **feedbacks** | 改善要望（麺テナンス） |
| **feedbackSteams** | フィードバックへの共感 |
| **notifications** | 通知 |
| **appSettings** | アプリ全体設定 |
| **chatRooms** | 1対1チャットルーム |
| **chatMessages** | チャットメッセージ |
| **contacts** | お問い合わせ |

### 10.2 主要機能

- **公開範囲制御**: `visibility` フィールド（public, followers, private）
- **鍵アカウント**: `isPrivate` フィールド + フォローリクエスト
- **グループ共有**: `groupIds` 配列によるグループ限定投稿
- **アーカイブ/下書き**: `isArchived`, `isDraft` フラグ
- **複数画像対応**: `imageIds` 配列（最大5枚）
- **R2 ストレージ**: `r2ImageUrl`, `r2ImageKey` による外部ストレージ連携
- **リアルタイム通知**: Convex のリアクティブクエリ
- **全文検索**: グループ名検索（`searchIndex`）

---

## 11. 実行コマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run start` | プロダクションサーバー起動 |
| `npm run lint` | ESLint 実行 |

---

## 12. 主要機能

### 12.1 ユーザー機能
- ユーザー登録・認証（Clerk）
- プロフィール編集（アイコン、名前、公開範囲）
- 鍵アカウント設定
- フォロー・フォロワー管理
- フォローリクエスト承認/拒否

### 12.2 投稿機能
- ラーメン投稿（最大5枚画像、評価、コメント）
- 画像圧縮・クロップ
- 公開範囲設定（全体公開/フォロワー限定/非公開）
- グループ共有
- アーカイブ・下書き
- 店舗情報登録（都道府県、最寄り駅）

### 12.3 インタラクション
- いいね
- コメント
- コメントへのいいね
- 1対1チャット（DM）

### 12.4 バッジ・ランキング
- 都道府県バッジ（Bronze/Silver/Gold）
- ユーザーバッジ
- マイベストラーメン登録

### 12.5 その他
- タイムライン（フォロー中のユーザー投稿）
- 通知機能
- 改善要望投稿（麺テナンス）
- お問い合わせ
- Stripe サブスクリプション（Premium プラン）

---

## 13. セキュリティ・パフォーマンス

### 13.1 セキュリティ
- Clerk による認証・認可
- Convex の行レベルセキュリティ
- 画像アップロード時の検証
- Webhook 署名検証（Svix）

### 13.2 パフォーマンス最適化
- 画像の段階的圧縮（Convex → R2）
- 仮想スクロール（@tanstack/react-virtual）
- 画像キャッシュ（7日間）
- Next.js Image 最適化
- インクリメンタルビルド

---

## 14. ディレクトリ構成

```
new_ramen/
├── convex/              # Convex バックエンド関数・スキーマ
│   ├── schema.ts        # データベーススキーマ定義
│   ├── auth.config.ts   # Clerk 認証設定
│   ├── *.ts             # Convex クエリ・ミューテーション
│   └── _generated/      # Convex 自動生成ファイル
├── src/
│   ├── app/             # Next.js App Router
│   ├── components/      # React コンポーネント
│   ├── contexts/        # React Context
│   ├── hooks/           # カスタムフック
│   ├── lib/             # ユーティリティ・設定
│   └── middleware.ts    # Next.js ミドルウェア（Clerk 認証）
├── public/              # 静的ファイル
├── docs/                # ドキュメント
├── .env                 # 環境変数（サンプル）
├── .env.local           # 環境変数（実際の設定）
├── next.config.ts       # Next.js 設定
├── tsconfig.json        # TypeScript 設定
├── eslint.config.mjs    # ESLint 設定
└── package.json         # npm パッケージ設定
```

---

## 15. 環境変数

```bash
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Cloudflare R2 (AWS S3互換)
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=
R2_PUBLIC_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## 16. PWA 対応

### 16.1 Viewport 設定
```typescript
{
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
}
```

### 16.2 アイコン
- `/icon-192.png` (192x192)
- `/icon-512.png` (512x512)
- `/apple-icon.png` (Apple Touch Icon)

---

## 17. 今後の技術的課題

- [ ] PWA マニフェスト作成
- [ ] Service Worker 実装（オフライン対応）
- [ ] E2E テスト導入（Playwright など）
- [ ] Storybook 導入（コンポーネントドキュメント）
- [ ] CI/CD パイプライン構築
- [ ] パフォーマンスモニタリング（Vercel Analytics など）
- [ ] エラートラッキング（Sentry など）

---

**作成日**: 2025-12-30
**最終更新**: 2025-12-30
