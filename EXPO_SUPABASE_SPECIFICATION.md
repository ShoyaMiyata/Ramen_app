# Nooodle Mobile - ラーメン記録・共有プラットフォーム（Expo + Supabase版）完全仕様書

## 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [技術スタック](#技術スタック)
3. [プロジェクト構造](#プロジェクト構造)
4. [データモデル](#データモデル)
5. [機能仕様](#機能仕様)
6. [画面構成](#画面構成)
7. [UI/UXデザイン](#uiuxデザイン)
8. [ゲーミフィケーション](#ゲーミフィケーション)
9. [認証・権限](#認証権限)
10. [Supabaseセットアップ](#supabaseセットアップ)
11. [Expoプロジェクトセットアップ](#expoプロジェクトセットアップ)
12. [実装ガイド](#実装ガイド)

---

## プロジェクト概要

### アプリケーション名
**Nooodle Mobile（ヌードル モバイル）** - ラーメン記録・共有プラットフォーム

### コンセプト
ラーメン愛好家のための記録・共有SNSネイティブアプリ。食べたラーメンの記録、評価、写真投稿を通じて、ラーメン巡りを楽しく継続できるゲーミフィケーション機能を搭載。

### プラットフォーム
- **iOS**: App Store公開
- **Android**: Google Play Store公開

### 主要機能
- ラーメン記録投稿（複数画像・評価・コメント）
- SNS機能（フォロー・いいね・コメント・DM）
- ゲーミフィケーション（ランク・バッジ・制覇マップ）
- 検索・フィルタリング
- ランキング表示
- プッシュ通知
- オフライン対応

---

## 技術スタック

### フロントエンド（モバイル）
| 技術 | バージョン | 用途 |
|------|-----------|------|
| Expo | ~51.0.0 | React Nativeフレームワーク |
| React Native | 0.74.x | UIライブラリ |
| TypeScript | 5.x | 型安全性 |
| Expo Router | 3.x | ファイルベースルーティング |
| React Navigation | 6.x | ナビゲーション（Expo Routerの内部） |

### バックエンド・認証
| 技術 | バージョン | 用途 |
|------|-----------|------|
| Supabase | Latest | BaaS（認証・DB・ストレージ・リアルタイム） |
| PostgreSQL | 15.x | データベース（Supabaseマネージド） |
| Supabase Auth | Latest | 認証・ユーザー管理 |
| Supabase Storage | Latest | 画像ストレージ |
| Supabase Realtime | Latest | リアルタイム通信 |

### 状態管理・データフェッチ
| 技術 | 用途 |
|------|------|
| TanStack Query (React Query) | サーバーステート管理・キャッシング |
| Zustand | クライアントステート管理 |
| @supabase/supabase-js | Supabaseクライアント |

### UIコンポーネント・スタイリング
| ライブラリ | 用途 |
|-----------|------|
| React Native Paper | Material Design UIコンポーネント |
| React Native Reanimated | アニメーション |
| React Native Gesture Handler | ジェスチャー |
| NativeWind | Tailwind CSS for React Native |
| Expo Vector Icons | アイコン |

### 画像・メディア
| 技術 | 用途 |
|------|------|
| Expo Image Picker | 画像選択 |
| Expo Image | 最適化された画像コンポーネント |
| Expo Camera | カメラアクセス |

### プッシュ通知
| 技術 | 用途 |
|------|------|
| Expo Notifications | プッシュ通知 |
| Supabase Edge Functions | 通知トリガー |

### バリデーション
| 技術 | 用途 |
|------|------|
| Zod | スキーマバリデーション |

### ビルド・デプロイ
| 技術 | 用途 |
|------|------|
| EAS Build | クラウドビルドサービス |
| EAS Submit | App Store / Play Store提出 |
| EAS Update | OTAアップデート |

---

## プロジェクト構造

```
nooodle-mobile/
├── app/                           # Expo Router (ファイルベースルーティング)
│   ├── (auth)/                    # 認証グループ
│   │   ├── sign-in.tsx            # ログイン
│   │   ├── sign-up.tsx            # サインアップ
│   │   └── onboarding.tsx         # 初回セットアップ
│   ├── (tabs)/                    # タブナビゲーション
│   │   ├── _layout.tsx            # タブレイアウト
│   │   ├── index.tsx              # ホーム（マイページ）
│   │   ├── timeline.tsx           # タイムライン
│   │   ├── search.tsx             # 検索
│   │   ├── notifications.tsx      # 通知
│   │   └── profile.tsx            # プロフィール
│   ├── noodles/
│   │   ├── new.tsx                # 新規投稿
│   │   ├── [id].tsx               # 投稿詳細
│   │   └── [id]/edit.tsx          # 投稿編集
│   ├── users/
│   │   ├── [id].tsx               # ユーザープロフィール
│   │   ├── [id]/followers.tsx    # フォロワー一覧
│   │   ├── [id]/following.tsx    # フォロー中一覧
│   │   └── [id]/map.tsx           # ユーザーの制覇マップ
│   ├── ranking.tsx                # ランキング
│   ├── mymen.tsx                  # マイメン（フォロー中）
│   ├── likes.tsx                  # いいね一覧
│   ├── chat/
│   │   ├── index.tsx              # チャット一覧
│   │   └── [roomId].tsx           # チャットルーム
│   ├── map.tsx                    # 制覇マップ
│   ├── settings.tsx               # 設定
│   ├── feedback.tsx               # 麺テナンス（フィードバック）
│   ├── follow-requests.tsx        # フォローリクエスト
│   ├── admin.tsx                  # 管理者画面
│   ├── _layout.tsx                # ルートレイアウト
│   └── +not-found.tsx             # 404ページ
├── components/
│   ├── features/                  # 機能別コンポーネント
│   │   ├── NoodleCard.tsx         # ラーメンカード
│   │   ├── NoodleForm.tsx         # ラーメン投稿フォーム
│   │   ├── Gallery.tsx            # ギャラリー表示
│   │   ├── RankDisplay.tsx        # ランク表示
│   │   ├── BadgeDisplay.tsx       # バッジ表示
│   │   ├── TasteProfile.tsx       # 味覚プロファイル
│   │   ├── MyBest.tsx             # マイベスト
│   │   ├── UserCard.tsx           # ユーザーカード
│   │   └── JapanMap/              # 日本地図コンポーネント
│   ├── layout/                    # レイアウトコンポーネント
│   │   ├── Header.tsx             # ヘッダー
│   │   └── TabBar.tsx             # タブバー
│   └── ui/                        # 基本UIコンポーネント
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Loading.tsx
│       ├── Card.tsx
│       └── ...
├── lib/
│   ├── supabase.ts                # Supabaseクライアント
│   ├── constants/                 # 定数定義
│   │   ├── ranks.ts               # ランク定義（12段階）
│   │   ├── badges.ts              # バッジ定義（80種以上）
│   │   ├── genres.ts              # ジャンル定義
│   │   ├── prefectures.ts         # 都道府県定義
│   │   └── stations.ts            # 駅マスタ
│   ├── hooks/                     # カスタムフック
│   │   ├── useAuth.ts             # 認証フック
│   │   ├── useUser.ts             # ユーザー取得
│   │   ├── useNoodles.ts          # ラーメン投稿取得
│   │   ├── useRealtime.ts         # リアルタイム購読
│   │   └── ...
│   ├── api/                       # API関数
│   │   ├── users.ts
│   │   ├── noodles.ts
│   │   ├── shops.ts
│   │   ├── likes.ts
│   │   ├── follows.ts
│   │   └── ...
│   ├── stores/                    # Zustand ストア
│   │   ├── authStore.ts
│   │   └── themeStore.ts
│   └── utils/                     # ユーティリティ
│       ├── date.ts
│       ├── image.ts
│       └── prefecture.ts
├── assets/                        # 静的ファイル
│   ├── images/
│   ├── fonts/
│   └── icons/
├── supabase/                      # Supabase設定（ローカル開発用）
│   ├── migrations/                # マイグレーションSQL
│   ├── seed.sql                   # シードデータ
│   └── config.toml                # Supabase設定
├── .env                           # 環境変数
├── app.json                       # Expo設定
├── eas.json                       # EAS Build設定
├── tsconfig.json                  # TypeScript設定
└── package.json                   # 依存関係
```

---

## データモデル

### PostgreSQL データベース設計（Supabase）

#### users（ユーザー）
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  custom_avatar_url TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  selected_theme_level INTEGER DEFAULT 1,
  is_admin BOOLEAN DEFAULT FALSE,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  last_timeline_visit TIMESTAMPTZ,
  CONSTRAINT unique_auth_id UNIQUE (auth_id)
);

CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
```

#### shops（店舗）
```sql
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  url TEXT,
  prefecture TEXT,
  station TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shops_name ON shops(name);
CREATE INDEX idx_shops_prefecture ON shops(prefecture);
CREATE INDEX idx_shops_station ON shops(station);
```

#### noodles（ラーメン投稿）
```sql
CREATE TABLE noodles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  ramen_name TEXT NOT NULL,
  genres TEXT[] NOT NULL DEFAULT '{}',
  visit_date TIMESTAMPTZ,
  comment TEXT,
  evaluation INTEGER CHECK (evaluation >= 1 AND evaluation <= 5),
  image_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_noodles_user_id ON noodles(user_id);
CREATE INDEX idx_noodles_shop_id ON noodles(shop_id);
CREATE INDEX idx_noodles_evaluation ON noodles(evaluation);
CREATE INDEX idx_noodles_visit_date ON noodles(visit_date);
CREATE INDEX idx_noodles_created_at ON noodles(created_at DESC);
```

#### likes（いいね）
```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  noodle_id UUID REFERENCES noodles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_noodle_like UNIQUE (user_id, noodle_id)
);

CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_noodle_id ON likes(noodle_id);
```

#### follows（フォロー関係）
```sql
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
```

#### follow_requests（フォローリクエスト）
```sql
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE follow_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status request_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_follow_request UNIQUE (requester_id, target_id),
  CONSTRAINT no_self_request CHECK (requester_id != target_id)
);

CREATE INDEX idx_follow_requests_requester_id ON follow_requests(requester_id);
CREATE INDEX idx_follow_requests_target_id ON follow_requests(target_id);
CREATE INDEX idx_follow_requests_target_status ON follow_requests(target_id, status);
```

#### comments（コメント）
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  noodle_id UUID REFERENCES noodles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_noodle_id ON comments(noodle_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
```

#### comment_likes（コメントいいね）
```sql
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_comment_like UNIQUE (user_id, comment_id)
);

CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
```

#### chat_rooms（チャットルーム）
```sql
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_ids UUID[] NOT NULL,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT two_participants CHECK (array_length(participant_ids, 1) = 2)
);

CREATE INDEX idx_chat_rooms_last_message_at ON chat_rooms(last_message_at DESC);
CREATE INDEX idx_chat_rooms_participants ON chat_rooms USING GIN(participant_ids);
```

#### chat_messages（チャットメッセージ）
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_room_created ON chat_messages(room_id, created_at DESC);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
```

#### notifications（通知）
```sql
CREATE TYPE notification_type AS ENUM (
  'follow',
  'follow_request',
  'follow_request_approved',
  'like',
  'comment',
  'comment_like',
  'message',
  'admin_announcement'
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID,
  title TEXT,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

#### my_bests（マイベストラーメン）
```sql
CREATE TABLE my_bests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  noodle_id UUID REFERENCES noodles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_category UNIQUE (user_id, category)
);

CREATE INDEX idx_my_bests_user_id ON my_bests(user_id);
```

#### user_badges（獲得バッジ）
```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_code TEXT NOT NULL,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_badge UNIQUE (user_id, badge_code)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
```

#### prefecture_badges（都道府県バッジ）
```sql
CREATE TYPE badge_tier AS ENUM ('bronze', 'silver', 'gold');

CREATE TABLE prefecture_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prefecture TEXT NOT NULL,
  tier badge_tier NOT NULL,
  visit_count INTEGER NOT NULL DEFAULT 0,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_prefecture UNIQUE (user_id, prefecture)
);

CREATE INDEX idx_prefecture_badges_user_id ON prefecture_badges(user_id);
```

#### feedbacks（改善要望）
```sql
CREATE TYPE feedback_category AS ENUM ('feature', 'bug', 'improvement', 'other');
CREATE TYPE feedback_status AS ENUM ('new', 'in_progress', 'resolved', 'rejected');

CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category feedback_category NOT NULL,
  message TEXT NOT NULL,
  heat_level INTEGER CHECK (heat_level >= 1 AND heat_level <= 3),
  steam_count INTEGER DEFAULT 0,
  status feedback_status DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedbacks_created_at ON feedbacks(created_at DESC);
CREATE INDEX idx_feedbacks_status ON feedbacks(status);
```

#### feedback_steams（フィードバック共感）
```sql
CREATE TABLE feedback_steams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID REFERENCES feedbacks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  heat_level INTEGER CHECK (heat_level >= 1 AND heat_level <= 3),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_feedback_steam UNIQUE (user_id, feedback_id)
);

CREATE INDEX idx_feedback_steams_feedback_id ON feedback_steams(feedback_id);
```

#### app_settings（アプリ設定）
```sql
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_app_settings_key ON app_settings(key);
```

#### stations（駅マスタ）
```sql
CREATE TABLE stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  prefecture TEXT,
  line TEXT,
  registered_by UUID REFERENCES users(id),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stations_name ON stations(name);
CREATE INDEX idx_stations_prefecture ON stations(prefecture);
```

---

## 機能仕様

### 1. 認証機能

#### 実装方法
- **Supabase Auth** を使用
- Email/Password、Google、Apple認証対応
- Magic Link（パスワードレス）対応

#### 認証フロー
1. サインアップ → Supabase Auth登録
2. Database Trigger で `users` テーブルに自動作成
3. 初回ログイン時 → オンボーディング画面
4. ニックネーム設定 → `onboarding_complete` フラグ設定

#### セッション管理
- Supabase AuthのセッショントークンをSecureStoreに保存
- 自動リフレッシュ機能
- ログアウト時にトークン削除

---

### 2. ラーメン投稿機能

#### 投稿フォーム
- **店舗情報**
  - 店舗名（必須）
  - 住所（任意）
  - URL（任意）
  - 都道府県（Picker選択）
  - 最寄り駅（検索・サジェスト）
- **ラーメン情報**
  - ラーメン名（必須、サジェスト機能付き）
  - ジャンル（複数選択可、12種類）
  - 訪問日（DateTimePicker）
  - 評価（星1-5）
  - コメント（任意）
  - 画像（最大5枚、Expo Image Picker + Supabase Storageアップロード）

#### 画像アップロード
```typescript
// Supabase Storageバケット: noodle-images
// パス: {userId}/{noodleId}/{timestamp}_{index}.jpg
```

#### 編集・削除機能
- 投稿者本人のみ編集・削除可能
- RLS（Row Level Security）で権限チェック

---

### 3. タイムライン機能

#### タイムライン表示
- フォロー中のユーザーの投稿を表示
- React Query + Supabase Query でデータフェッチ
- FlatList + 無限スクロール（ページネーション）
- Pull to Refresh

#### リアルタイム更新
- Supabase Realtime で新規投稿を購読
- 新規投稿バッジ表示

#### フィルタリング・検索
- 検索バー（店名・ラーメン名）
- ジャンルフィルタ（Bottom Sheet）
- 都道府県フィルタ（Bottom Sheet）
- 評価フィルタ
- 訪問日フィルタ
- 駅フィルタ
- 並び替え（最新順・評価順・訪問日順）

---

### 4. SNS機能

#### フォロー・フォロワー
- フォロー機能（公開アカウント・鍵アカウント対応）
- フォローリクエスト（承認・拒否）
- フォロー解除
- フォロワー削除

#### いいね機能
- 投稿にいいね
- いいね一覧画面
- いいね取り消し
- 楽観的UI更新

#### コメント機能
- 投稿にコメント
- コメントへのいいね
- コメント削除（投稿者のみ）
- リアルタイムコメント表示

#### チャット機能（1対1 DM）
- チャットルーム自動生成
- Supabase Realtime でリアルタイムメッセージング
- 既読・未読管理
- 未読バッジ表示
- プッシュ通知連携

---

### 5. ゲーミフィケーション

#### ランクシステム（12段階）
- Web版と同じ12段階ランク
- ランクアップ時にアニメーション表示
- テーマカラー変更（AsyncStorage保存）

#### バッジシステム（80種類以上）
- 通常バッジ（公開）
- 隠しバッジ（キーワード検出）
- バッジ獲得時にモーダル表示

#### 都道府県制覇システム
- 47都道府県のバッジ（Bronze・Silver・Gold）
- React Native SVG で日本地図表示
- タップで都道府県詳細表示

#### マイベストラーメン
- カテゴリ別にベストラーメンを設定
- プロフィール画面に表示

---

### 6. プッシュ通知

#### 通知タイプ
- フォロー通知
- フォローリクエスト通知
- いいね通知
- コメント通知
- チャットメッセージ通知
- 管理者通知

#### 実装方法
1. Expo Notifications でデバイストークン取得
2. Supabase の `users` テーブルに `push_token` カラム追加
3. Supabase Edge Functions でプッシュ通知送信
4. Database Trigger で通知イベント発火

---

## 画面構成

### タブナビゲーション（Bottom Tab）
| タブ | 画面 | アイコン |
|------|------|---------|
| ホーム | マイページ | home |
| タイムライン | フォロー中の投稿 | feed |
| 検索 | 検索・フィルタ | search |
| 通知 | 通知一覧 | bell |
| プロフィール | プロフィール設定 | user |

### スタックナビゲーション
| 画面 | 説明 |
|------|------|
| `/sign-in` | ログイン |
| `/sign-up` | サインアップ |
| `/onboarding` | 初回セットアップ |
| `/noodles/new` | 新規投稿 |
| `/noodles/[id]` | 投稿詳細 |
| `/noodles/[id]/edit` | 投稿編集 |
| `/users/[id]` | ユーザープロフィール |
| `/users/[id]/followers` | フォロワー一覧 |
| `/users/[id]/following` | フォロー中一覧 |
| `/users/[id]/map` | ユーザーの制覇マップ |
| `/ranking` | ランキング |
| `/mymen` | マイメン（フォロー中） |
| `/likes` | いいね一覧 |
| `/chat` | チャット一覧 |
| `/chat/[roomId]` | チャットルーム |
| `/map` | 制覇マップ |
| `/settings` | 設定 |
| `/feedback` | 麺テナンス |
| `/follow-requests` | フォローリクエスト |
| `/admin` | 管理者画面 |

---

## UI/UXデザイン

### デザインシステム

#### React Native Paper テーマ
```typescript
const theme = {
  ...MD3LightTheme,
  colors: {
    primary: '#F97316', // オレンジ（ランクに応じて動的変更）
    secondary: '#EA580C',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    error: '#EF4444',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#111827',
    onSurface: '#111827',
  },
};
```

#### タイポグラフィ
- **システムフォント**: iOS（San Francisco）、Android（Roboto）
- **カスタムフォント**: Geist Sans（オプション）

#### スペーシング
- 4px グリッドシステム

### アニメーション
- **React Native Reanimated** を使用
- 画面遷移アニメーション
- ボタン・カードのインタラクション
- ランクアップ時の特殊エフェクト

### ジェスチャー
- **React Native Gesture Handler**
- スワイプでいいね
- 長押しでメニュー表示
- Pull to Refresh

---

## 認証・権限

### Supabase Auth + RLS

#### Row Level Security (RLS) ポリシー

##### users テーブル
```sql
-- 全ユーザーが自分のレコードを閲覧可能
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = auth_id);

-- 全ユーザーが自分のレコードを更新可能
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = auth_id);
```

##### noodles テーブル
```sql
-- 公開投稿は全員閲覧可能、鍵アカウントはフォロワーのみ
CREATE POLICY "Public noodles are viewable by everyone" ON noodles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = noodles.user_id
      AND (users.is_private = FALSE OR users.id = auth.uid()::uuid OR
           EXISTS (SELECT 1 FROM follows WHERE follows.follower_id = auth.uid()::uuid AND follows.following_id = users.id))
    )
  );

-- 投稿者のみ編集・削除可能
CREATE POLICY "Users can update their own noodles" ON noodles
  FOR UPDATE USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can delete their own noodles" ON noodles
  FOR DELETE USING (user_id = auth.uid()::uuid);
```

##### likes, comments テーブル
```sql
-- 認証済みユーザーのみ作成可能
CREATE POLICY "Authenticated users can create likes" ON likes
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

-- 自分のいいねのみ削除可能
CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE USING (auth.uid()::uuid = user_id);
```

---

## Supabaseセットアップ

### ステップ1: Supabaseプロジェクト作成

1. [Supabase](https://supabase.com) にアクセス
2. 「New Project」をクリック
3. プロジェクト情報を入力：
   - **Organization**: 新規作成または既存選択
   - **Name**: `nooodle-mobile`
   - **Database Password**: 強力なパスワードを設定（保存必須）
   - **Region**: `Northeast Asia (Tokyo)` を推奨
   - **Pricing Plan**: Free（開発）または Pro（本番）
4. 「Create new project」をクリック（数分かかります）

### ステップ2: データベースセットアップ

#### 2-1. SQL Editorでスキーマ作成

1. Supabase Dashboard → 「SQL Editor」を開く
2. 「New Query」をクリック
3. 以下のSQLを実行（次のセクションで提供）

### ステップ3: Storage バケット作成

1. Supabase Dashboard → 「Storage」を開く
2. 「Create a new bucket」をクリック
3. バケット情報を入力：
   - **Name**: `noodle-images`
   - **Public bucket**: ON（画像を公開）
4. 「Create bucket」をクリック

### ステップ4: Authentication 設定

#### 4-1. Email Provider 有効化
1. Supabase Dashboard → 「Authentication」 → 「Providers」
2. 「Email」を有効化
3. 「Enable Email Confirmations」を ON

#### 4-2. OAuth Providers 設定（オプション）

##### Google認証
1. 「Providers」 → 「Google」を有効化
2. Google Cloud Console で OAuth 2.0 クライアントID作成
3. Supabase に Client ID と Client Secret を設定

##### Apple認証
1. 「Providers」 → 「Apple」を有効化
2. Apple Developer Console で Sign in with Apple 設定
3. Supabase に Service ID と Key ID を設定

### ステップ5: API Keys 取得

1. Supabase Dashboard → 「Settings」 → 「API」
2. 以下をコピー：
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public**: `eyJhbG...`（公開APIキー）
   - **service_role**: `eyJhbG...`（管理者APIキー、**機密**）

---

## Expoプロジェクトセットアップ

### ステップ1: Expoプロジェクト作成

```bash
# Expo CLIインストール（グローバル）
npm install -g expo-cli eas-cli

# プロジェクト作成
npx create-expo-app@latest nooodle-mobile --template tabs

cd nooodle-mobile
```

### ステップ2: 必要なパッケージインストール

```bash
# Core依存関係
npm install @supabase/supabase-js @react-native-async-storage/async-storage

# TanStack Query
npm install @tanstack/react-query

# Zustand
npm install zustand

# UI・スタイリング
npm install react-native-paper react-native-vector-icons
npm install nativewind tailwindcss

# ナビゲーション（Expo Routerに含まれる）
# 追加不要

# 画像・メディア
npm install expo-image-picker expo-image expo-camera

# アニメーション
npm install react-native-reanimated react-native-gesture-handler

# 通知
npm install expo-notifications

# バリデーション
npm install zod

# Dev依存関係
npm install --save-dev @types/react @types/react-native typescript
```

### ステップ3: 環境変数設定

#### `.env` ファイル作成
```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# App Config
EXPO_PUBLIC_APP_NAME=Nooodle
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### ステップ4: Supabaseクライアント設定

#### `lib/supabase.ts` 作成
```typescript
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### ステップ5: EAS設定

```bash
# EAS初期化
eas init

# eas.json が生成される
```

#### `eas.json` 設定
```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### ステップ6: app.json 設定

```json
{
  "expo": {
    "name": "Nooodle",
    "slug": "nooodle-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#F97316"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.nooodle",
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "ラーメンの写真を投稿するために写真ライブラリへのアクセスが必要です",
        "NSCameraUsageDescription": "ラーメンの写真を撮影するためにカメラへのアクセスが必要です"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#F97316"
      },
      "package": "com.yourcompany.nooodle",
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#F97316"
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

---

## 実装ガイド

### フェーズ1: 認証機能実装（Week 1）

#### タスク
1. Supabase Auth フック作成
2. ログイン画面実装
3. サインアップ画面実装
4. オンボーディング画面実装
5. セッション管理

#### 実装例: `lib/hooks/useAuth.ts`
```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初期セッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // セッション変更を購読
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, loading };
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
```

### フェーズ2: 基本CRUD機能実装（Week 2-3）

#### タスク
1. 店舗作成API
2. ラーメン投稿作成API
3. 画像アップロード機能
4. 投稿一覧表示
5. 投稿詳細表示
6. 投稿編集・削除

### フェーズ3: SNS機能実装（Week 4-5）

#### タスク
1. フォロー・フォロワー機能
2. いいね機能
3. コメント機能
4. チャット機能
5. 通知機能

### フェーズ4: ゲーミフィケーション実装（Week 6-7）

#### タスク
1. ランクシステム
2. バッジシステム
3. 都道府県制覇システム
4. マイベストラーメン

### フェーズ5: 高度な機能実装（Week 8-9）

#### タスク
1. 検索・フィルタリング
2. ランキング
3. プッシュ通知
4. オフライン対応

### フェーズ6: テスト・最適化（Week 10）

#### タスク
1. ユニットテスト
2. E2Eテスト
3. パフォーマンス最適化
4. バグ修正

### フェーズ7: リリース準備（Week 11-12）

#### タスク
1. アイコン・スプラッシュスクリーン作成
2. App Store / Play Store スクリーンショット作成
3. プライバシーポリシー・利用規約作成
4. EAS Build でビルド
5. TestFlight / Internal Testing で配信
6. 本番リリース

---

## ビルド・デプロイ

### Development Build

```bash
# iOS Simulator用
eas build --profile development --platform ios

# Android Emulator用
eas build --profile development --platform android

# 実機用
eas build --profile development --platform all
```

### Preview Build（内部テスト）

```bash
# iOS TestFlight用
eas build --profile preview --platform ios

# Android Internal Testing用
eas build --profile preview --platform android
```

### Production Build（本番）

```bash
# App Store提出用
eas build --profile production --platform ios
eas submit --platform ios

# Play Store提出用
eas build --profile production --platform android
eas submit --platform android
```

---

## まとめ

この仕様書に基づいて、以下の要素を実装することで**Expo + Supabase版のNooodleアプリ**を構築できます：

### 技術スタック変更点
| 項目 | Web版 | Mobile版 |
|------|-------|---------|
| フレームワーク | Next.js 16 | Expo ~51.0 |
| UI | React 19 (Web) | React Native 0.74 |
| 認証 | Clerk | Supabase Auth |
| データベース | Convex | Supabase (PostgreSQL) |
| ストレージ | Convex Storage | Supabase Storage |
| リアルタイム | Convex Query | Supabase Realtime |
| デプロイ | Vercel | EAS Build |

### 次のステップ

1. **Supabaseプロジェクト作成** → データベーススキーマSQL実行
2. **Expoプロジェクト作成** → 依存関係インストール
3. **認証機能実装** → フェーズ1から順次実装
4. **ビルド・テスト** → TestFlight / Internal Testing
5. **本番リリース** → App Store / Play Store提出

---

**作成日**: 2025年12月12日
**バージョン**: 1.0 (Expo + Supabase)
**著者**: Claude Code Architecture Migration
