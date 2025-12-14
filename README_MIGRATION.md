# Nooodle - Expo + Supabase 移行ガイド

このドキュメントは、**Next.js + Clerk + Convex** から **Expo + Supabase** への移行をサポートします。

---

## 📚 ドキュメント一覧

### 1. **仕様書**
- **`EXPO_SUPABASE_SPECIFICATION.md`**: Expo + Supabase版の完全仕様書
  - 技術スタック、データモデル、機能仕様、画面構成を網羅

### 2. **セットアップガイド**
- **`SUPABASE_SETUP_GUIDE.md`**: Supabaseプロジェクトのセットアップ（ハンズオン形式）
  - プロジェクト作成 → データベース構築 → RLS設定 → Storage設定 → 認証設定
- **`EXPO_SETUP_GUIDE.md`**: Expoプロジェクトのセットアップ
  - プロジェクト作成 → 依存関係インストール → Supabase統合 → EAS設定

### 3. **データベースSQL**
- **`supabase/01_schema.sql`**: データベーススキーマ（全18テーブル）
- **`supabase/02_rls_policies.sql`**: Row Level Security ポリシー

---

## 🚀 クイックスタート

### ステップ1: Supabaseプロジェクト作成

```bash
# 1. Supabaseにアクセス
open https://supabase.com

# 2. SUPABASE_SETUP_GUIDE.md を参照して、プロジェクトをセットアップ
```

### ステップ2: データベース構築

```bash
# Supabase Dashboard → SQL Editor で以下を実行

# 1. スキーマ作成
cat supabase/01_schema.sql
# → SQL Editorにペーストして実行

# 2. RLSポリシー作成
cat supabase/02_rls_policies.sql
# → SQL Editorにペーストして実行
```

### ステップ3: Expoプロジェクト作成

```bash
# 1. Expoプロジェクト作成
npx create-expo-app@latest nooodle-mobile --template tabs
cd nooodle-mobile

# 2. 依存関係インストール
npm install @supabase/supabase-js @react-native-async-storage/async-storage
npm install @tanstack/react-query zustand
npm install react-native-paper expo-image-picker expo-camera
npm install react-native-reanimated react-native-gesture-handler
npm install expo-notifications zod

# 3. 環境変数設定
cp .env.example .env
# → .envにSupabase APIキーを設定

# 4. 開発サーバー起動
npm start
```

### ステップ4: 実装開始

```bash
# EXPO_SETUP_GUIDE.md を参照して、以下を実装

# 1. 認証機能（Week 1）
# 2. 基本CRUD機能（Week 2-3）
# 3. SNS機能（Week 4-5）
# 4. ゲーミフィケーション（Week 6-7）
# 5. 高度な機能（Week 8-9）
# 6. テスト・最適化（Week 10）
# 7. リリース準備（Week 11-12）
```

---

## 📊 技術スタック比較

| 項目 | Web版（旧） | Mobile版（新） |
|------|------------|---------------|
| **フレームワーク** | Next.js 16 | Expo ~51.0 |
| **UI** | React 19 (Web) | React Native 0.74 |
| **言語** | TypeScript | TypeScript |
| **認証** | Clerk | Supabase Auth |
| **データベース** | Convex | PostgreSQL (Supabase) |
| **ストレージ** | Convex Storage | Supabase Storage |
| **リアルタイム** | Convex Query | Supabase Realtime |
| **スタイリング** | Tailwind CSS v4 | NativeWind + Paper |
| **デプロイ** | Vercel | EAS Build |
| **プラットフォーム** | Web | iOS + Android |

---

## 🔄 移行マッピング

### 認証

| Clerk（旧） | Supabase Auth（新） |
|------------|-------------------|
| `useUser()` | `useAuth()` |
| `SignIn` | `supabase.auth.signInWithPassword()` |
| `SignUp` | `supabase.auth.signUp()` |
| `signOut()` | `supabase.auth.signOut()` |

### データフェッチ

| Convex（旧） | Supabase + React Query（新） |
|-------------|----------------------------|
| `useQuery(api.users.getCurrent)` | `useQuery(['user'], () => supabase.from('users').select('*'))` |
| `useMutation(api.noodles.create)` | `useMutation((data) => supabase.from('noodles').insert(data))` |

### ストレージ

| Convex Storage（旧） | Supabase Storage（新） |
|---------------------|----------------------|
| `generateUploadUrl()` | `supabase.storage.from('noodle-images').upload()` |
| `ctx.storage.getUrl()` | `supabase.storage.from('noodle-images').getPublicUrl()` |

---

## 📝 実装チェックリスト

### フェーズ1: 認証機能（Week 1）
- [ ] Supabase Auth統合
- [ ] ログイン画面
- [ ] サインアップ画面
- [ ] オンボーディング画面
- [ ] セッション管理

### フェーズ2: 基本CRUD（Week 2-3）
- [ ] 店舗作成API
- [ ] ラーメン投稿作成API
- [ ] 画像アップロード機能
- [ ] 投稿一覧表示
- [ ] 投稿詳細表示
- [ ] 投稿編集・削除

### フェーズ3: SNS機能（Week 4-5）
- [ ] フォロー・フォロワー機能
- [ ] いいね機能
- [ ] コメント機能
- [ ] チャット機能
- [ ] 通知機能

### フェーズ4: ゲーミフィケーション（Week 6-7）
- [ ] ランクシステム
- [ ] バッジシステム
- [ ] 都道府県制覇システム
- [ ] マイベストラーメン

### フェーズ5: 高度な機能（Week 8-9）
- [ ] 検索・フィルタリング
- [ ] ランキング
- [ ] プッシュ通知
- [ ] オフライン対応

### フェーズ6: テスト・最適化（Week 10）
- [ ] ユニットテスト
- [ ] E2Eテスト
- [ ] パフォーマンス最適化
- [ ] バグ修正

### フェーズ7: リリース準備（Week 11-12）
- [ ] アイコン・スプラッシュスクリーン
- [ ] スクリーンショット作成
- [ ] プライバシーポリシー
- [ ] EAS Build
- [ ] TestFlight / Internal Testing
- [ ] 本番リリース

---

## 🛠️ 開発ワークフロー

### 日次ワークフロー

```bash
# 1. 最新コードを取得
git pull

# 2. 開発サーバー起動
npm start

# 3. 実機でテスト（Expo Go）
# QRコードをスキャンしてアプリ起動

# 4. 変更をコミット
git add .
git commit -m "feat: 〇〇機能実装"
git push
```

### ビルド・デプロイワークフロー

```bash
# Development Build（開発用）
eas build --profile development --platform ios
eas build --profile development --platform android

# Preview Build（内部テスト用）
eas build --profile preview --platform ios
eas build --profile preview --platform android

# Production Build（本番用）
eas build --profile production --platform ios
eas build --profile production --platform android

# App Store / Play Store提出
eas submit --platform ios
eas submit --platform android
```

---

## 📱 App Store / Play Store リリース準備

### 必要な素材

1. **アプリアイコン**
   - iOS: 1024×1024px（PNG、透過なし）
   - Android: 512×512px（PNG、透過OK）

2. **スプラッシュスクリーン**
   - 推奨サイズ: 1242×2208px

3. **スクリーンショット**
   - iPhone 6.7": 1290×2796px（3-10枚）
   - iPhone 6.5": 1242×2688px（3-10枚）
   - Android Phone: 1080×1920px（2-8枚）
   - Android Tablet: 1920×1200px（2-8枚）

4. **プライバシーポリシー**
   - URL形式で公開（例: `https://yoursite.com/privacy`）

5. **利用規約**
   - URL形式で公開（例: `https://yoursite.com/terms`）

6. **アプリ説明文**
   - 短い説明（80文字以内）
   - 詳細説明（4000文字以内）

---

## 🔍 トラブルシューティング

### Supabase接続エラー

```typescript
// .envファイルを確認
console.log(process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

// Supabaseクライアントが正しく初期化されているか確認
import { supabase } from '@/lib/supabase';
const { data, error } = await supabase.auth.getSession();
console.log('Session:', data, error);
```

### RLSポリシーエラー

```sql
-- Supabase Dashboard → SQL Editorで実行
-- ポリシーが正しく設定されているか確認
SELECT * FROM pg_policies WHERE tablename = 'users';

-- テストユーザーでログインして確認
SELECT auth.uid(); -- 現在のユーザーID
```

### 画像アップロードエラー

```typescript
// Storageバケットが存在するか確認
const { data, error } = await supabase.storage.listBuckets();
console.log('Buckets:', data, error);

// アップロード権限を確認
const { data: policies } = await supabase
  .from('storage.objects')
  .select('*')
  .eq('bucket_id', 'noodle-images');
```

---

## 📞 サポート

質問や問題が発生した場合は、以下を参照してください：

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Expo公式ドキュメント](https://docs.expo.dev/)
- [React Native公式ドキュメント](https://reactnative.dev/docs/getting-started)

---

**作成日**: 2025年12月12日
**バージョン**: 1.0
**著者**: Claude Code
