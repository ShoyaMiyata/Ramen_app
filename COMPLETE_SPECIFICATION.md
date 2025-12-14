# Nooodle - ラーメン記録・共有プラットフォーム 完全仕様書

## 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [技術スタック](#技術スタック)
3. [プロジェクト構造](#プロジェクト構造)
4. [データモデル](#データモデル)
5. [機能仕様](#機能仕様)
6. [ページ構成](#ページ構成)
7. [UI/UXデザイン](#uiuxデザイン)
8. [ゲーミフィケーション](#ゲーミフィケーション)
9. [認証・権限](#認証権限)
10. [開発環境設定](#開発環境設定)
11. [デプロイメント](#デプロイメント)

---

## プロジェクト概要

### アプリケーション名
**Nooodle（ヌードル）** - ラーメン記録・共有プラットフォーム

### コンセプト
ラーメン愛好家のための記録・共有SNS。食べたラーメンの記録、評価、写真投稿を通じて、ラーメン巡りを楽しく継続できるゲーミフィケーション機能を搭載。

### 主要機能
- ラーメン記録投稿（複数画像・評価・コメント）
- SNS機能（フォロー・いいね・コメント・DM）
- ゲーミフィケーション（ランク・バッジ・制覇マップ）
- 検索・フィルタリング
- ランキング表示
- プッシュ通知
- PWA対応

---

## 技術スタック

### フロントエンド
| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 16.0.7 | React フレームワーク（App Router） |
| React | 19.2.0 | UI ライブラリ |
| TypeScript | 5.x | 型安全性 |
| Tailwind CSS | 4.x | スタイリング |
| Framer Motion | 12.23.25 | アニメーション |

### バックエンド・認証
| 技術 | バージョン | 用途 |
|------|-----------|------|
| Convex | 1.30.0 | BaaS（リアルタイムDB・API） |
| Clerk | 6.36.0 | 認証・ユーザー管理 |
| Svix | 1.82.0 | Webhook管理 |

### UIコンポーネント
| ライブラリ | 用途 |
|-----------|------|
| Radix UI | Headless UIコンポーネント |
| Lucide React | アイコン |
| @tanstack/react-virtual | 仮想スクロール |

### バリデーション
| 技術 | 用途 |
|------|------|
| Zod | スキーマバリデーション |

---

## プロジェクト構造

```
new_ramen/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (main)/                # メインレイアウトグループ
│   │   │   ├── page.tsx           # ホーム（マイページ）
│   │   │   ├── noodles/           # タイムライン・投稿
│   │   │   │   ├── page.tsx       # タイムライン
│   │   │   │   ├── new/           # 新規投稿
│   │   │   │   └── [id]/          # 投稿詳細・編集
│   │   │   ├── users/             # ユーザープロフィール
│   │   │   ├── ranking/           # ランキング
│   │   │   ├── mymen/             # マイメン（フォロー）
│   │   │   ├── likes/             # いいね一覧
│   │   │   ├── notifications/     # 通知
│   │   │   ├── chat/              # チャット
│   │   │   ├── map/               # 制覇マップ
│   │   │   ├── settings/          # 設定
│   │   │   ├── mentenance/        # 麺テナンス（フィードバック）
│   │   │   ├── follow-requests/   # フォローリクエスト
│   │   │   └── admin/             # 管理者画面
│   │   ├── sign-in/               # ログイン
│   │   ├── sign-up/               # サインアップ
│   │   ├── onboarding/            # 初回セットアップ
│   │   ├── layout.tsx             # ルートレイアウト
│   │   └── globals.css            # グローバルスタイル
│   ├── components/
│   │   ├── features/              # 機能別コンポーネント
│   │   │   ├── noodle-card.tsx    # ラーメンカード
│   │   │   ├── noodle-form.tsx    # ラーメン投稿フォーム
│   │   │   ├── gallery.tsx        # ギャラリー表示
│   │   │   ├── rank-display.tsx   # ランク表示
│   │   │   ├── badge-display.tsx  # バッジ表示
│   │   │   ├── taste-profile.tsx  # 味覚プロファイル
│   │   │   ├── my-best.tsx        # マイベスト
│   │   │   ├── user-card.tsx      # ユーザーカード
│   │   │   └── japan-map/         # 日本地図コンポーネント
│   │   ├── layout/                # レイアウトコンポーネント
│   │   │   ├── header.tsx         # ヘッダー
│   │   │   └── themed-layout.tsx  # テーマレイアウト
│   │   └── ui/                    # 基本UIコンポーネント
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── loading.tsx
│   │       └── ...
│   ├── contexts/
│   │   ├── ThemeContext.tsx       # テーマコンテキスト
│   │   └── TestUserContext.tsx    # テストユーザーコンテキスト
│   ├── hooks/
│   │   ├── useCurrentUser.ts      # 現在のユーザー取得
│   │   ├── useViewingUser.ts      # 閲覧中のユーザー取得
│   │   ├── useUserStats.ts        # ユーザー統計
│   │   └── useAdmin.ts            # 管理者権限チェック
│   ├── lib/
│   │   ├── constants/             # 定数定義
│   │   │   ├── ranks.ts           # ランク定義（12段階）
│   │   │   ├── badges.ts          # バッジ定義（80種以上）
│   │   │   ├── genres.ts          # ジャンル定義
│   │   │   ├── prefectures.ts     # 都道府県定義
│   │   │   └── stations.ts        # 駅マスタ
│   │   ├── utils/                 # ユーティリティ
│   │   │   ├── cn.ts              # クラス名マージ
│   │   │   ├── date.ts            # 日付処理
│   │   │   ├── image.ts           # 画像処理
│   │   │   └── prefecture.ts      # 都道府県ユーティリティ
│   │   └── convex.tsx             # Convexプロバイダー
│   └── middleware.ts              # Clerk認証ミドルウェア
├── convex/                        # Convex バックエンド
│   ├── schema.ts                  # データスキーマ定義
│   ├── users.ts                   # ユーザー関連API
│   ├── noodles.ts                 # ラーメン投稿API
│   ├── shops.ts                   # 店舗API
│   ├── likes.ts                   # いいねAPI
│   ├── comments.ts                # コメントAPI
│   ├── commentLikes.ts            # コメントいいねAPI
│   ├── follows.ts                 # フォローAPI
│   ├── notifications.ts           # 通知API
│   ├── chat.ts                    # チャットAPI
│   ├── myBests.ts                 # マイベストAPI
│   ├── badges.ts                  # バッジAPI
│   ├── prefectures.ts             # 都道府県バッジAPI
│   ├── ranking.ts                 # ランキングAPI
│   ├── feedbacks.ts               # フィードバックAPI
│   ├── stations.ts                # 駅マスタAPI
│   ├── admin.ts                   # 管理者API
│   └── auth.config.ts             # 認証設定
├── public/                        # 静的ファイル
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── apple-icon.png
│   └── manifest.json              # PWAマニフェスト
├── .env.local                     # 環境変数
├── next.config.ts                 # Next.js設定
├── tsconfig.json                  # TypeScript設定
├── tailwind.config.js             # Tailwind設定
└── package.json                   # 依存関係
```

---

## データモデル

### データベース設計（Convex Schema）

#### users（ユーザー）
```typescript
{
  clerkId: string                      // Clerk認証ID
  name?: string                        // ユーザー名
  email: string                        // メールアドレス
  imageUrl?: string                    // Clerkプロフィール画像URL
  customImageId?: Id<"_storage">       // カスタムプロフィール画像
  deletedAt?: number                   // 論理削除日時
  createdAt?: number                   // 作成日時
  selectedThemeLevel?: number          // 選択テーマカラーのランクレベル
  isAdmin?: boolean                    // 管理者フラグ
  onboardingComplete?: boolean         // 初回セットアップ完了フラグ
  isPrivate?: boolean                  // 鍵アカウントフラグ
  lastTimelineVisit?: number           // 最終タイムライン訪問日時
}

Indexes:
- by_clerkId: [clerkId]
- by_email: [email]
```

#### shops（店舗）
```typescript
{
  name: string                         // 店舗名
  address?: string                     // 住所
  url?: string                         // URL
  prefecture?: string                  // 都道府県コード（"tokyo", "osaka"など）
  station?: string                     // 最寄り駅名
}

Indexes:
- by_name: [name]
- by_prefecture: [prefecture]
- by_station: [station]
```

#### noodles（ラーメン投稿）
```typescript
{
  userId: Id<"users">                  // 投稿ユーザー
  shopId: Id<"shops">                  // 店舗
  ramenName: string                    // ラーメン名
  genres: string[]                     // ジャンル（複数選択可）
  visitDate?: number                   // 訪問日時
  comment?: string                     // コメント
  evaluation?: number                  // 評価（1-5）
  imageId?: Id<"_storage">             // 単一画像（後方互換）
  imageIds?: Id<"_storage">[]          // 複数画像（最大5枚）
  createdAt?: number                   // 投稿日時
}

Indexes:
- by_userId: [userId]
- by_shopId: [shopId]
- by_evaluation: [evaluation]
- by_visitDate: [visitDate]
```

#### likes（いいね）
```typescript
{
  userId: Id<"users">                  // いいねしたユーザー
  noodleId: Id<"noodles">              // 対象投稿
}

Indexes:
- by_userId: [userId]
- by_noodleId: [noodleId]
- by_userId_noodleId: [userId, noodleId]
```

#### follows（フォロー関係）
```typescript
{
  followerId: Id<"users">              // フォローする人
  followingId: Id<"users">             // フォローされる人
  createdAt: number                    // フォロー日時
}

Indexes:
- by_followerId: [followerId]
- by_followingId: [followingId]
- by_follower_following: [followerId, followingId]
```

#### followRequests（フォローリクエスト）
```typescript
{
  requesterId: Id<"users">             // リクエスト送信者
  targetId: Id<"users">                // リクエスト対象者
  status: "pending" | "approved" | "rejected"  // ステータス
  createdAt: number                    // 作成日時
  updatedAt?: number                   // 更新日時
}

Indexes:
- by_requesterId: [requesterId]
- by_targetId: [targetId]
- by_requester_target: [requesterId, targetId]
- by_targetId_status: [targetId, status]
```

#### comments（コメント）
```typescript
{
  noodleId: Id<"noodles">              // 投稿ID
  userId: Id<"users">                  // コメントユーザー
  content: string                      // コメント内容
  createdAt: number                    // 投稿日時
}

Indexes:
- by_noodleId: [noodleId]
- by_userId: [userId]
```

#### commentLikes（コメントいいね）
```typescript
{
  userId: Id<"users">                  // いいねユーザー
  commentId: Id<"comments">            // コメントID
  createdAt: number                    // いいね日時
}

Indexes:
- by_userId: [userId]
- by_commentId: [commentId]
- by_userId_commentId: [userId, commentId]
```

#### chatRooms（チャットルーム）
```typescript
{
  participants: Id<"users">[]          // 参加者2名
  lastMessageAt?: number               // 最終メッセージ日時
  createdAt: number                    // 作成日時
}

Indexes:
- by_lastMessageAt: [lastMessageAt]
```

#### chatMessages（チャットメッセージ）
```typescript
{
  roomId: Id<"chatRooms">              // チャットルームID
  senderId: Id<"users">                // 送信者
  content: string                      // メッセージ内容
  isRead: boolean                      // 既読フラグ
  createdAt: number                    // 送信日時
}

Indexes:
- by_roomId: [roomId]
- by_roomId_createdAt: [roomId, createdAt]
- by_roomId_isRead: [roomId, isRead]
```

#### notifications（通知）
```typescript
{
  userId: Id<"users">                  // 通知受信者
  type: string                         // 通知タイプ（"follow", "like", "comment"など）
  fromUserId?: Id<"users">             // 通知発生元ユーザー
  targetId?: string                    // 対象ID（投稿IDなど）
  title?: string                       // 管理者通知用タイトル
  message?: string                     // 管理者通知用メッセージ
  isRead: boolean                      // 既読フラグ
  createdAt: number                    // 通知日時
}

Indexes:
- by_userId: [userId]
- by_userId_isRead: [userId, isRead]
```

#### myBests（マイベストラーメン）
```typescript
{
  userId: Id<"users">                  // ユーザー
  category: string                     // カテゴリ（"overall", "shoyu", "shio"など）
  noodleId: Id<"noodles">              // 投稿ID
}

Indexes:
- by_userId: [userId]
- by_userId_category: [userId, category]
```

#### userBadges（獲得バッジ）
```typescript
{
  userId: Id<"users">                  // ユーザー
  badgeCode: string                    // バッジコード
  acquiredAt: number                   // 獲得日時
}

Indexes:
- by_userId: [userId]
```

#### prefectureBadges（都道府県バッジ）
```typescript
{
  userId: Id<"users">                  // ユーザー
  prefecture: string                   // 都道府県コード
  tier: "bronze" | "silver" | "gold"   // ティア
  visitCount: number                   // 訪問店舗数
  earnedAt: number                     // 初回獲得日時
  updatedAt: number                    // 更新日時
}

Indexes:
- by_userId: [userId]
- by_userId_prefecture: [userId, prefecture]
```

#### feedbacks（改善要望）
```typescript
{
  userId: Id<"users">                  // 投稿者
  category: string                     // カテゴリ（"feature", "bug"など）
  message: string                      // メッセージ
  heatLevel: number                    // 熱々度（1-3）
  steamCount?: number                  // 湯気ボタンの共感数
  status?: string                      // ステータス（"new", "in_progress"など）
  createdAt: number                    // 投稿日時
}

Indexes:
- by_createdAt: [createdAt]
```

#### feedbackSteams（フィードバック共感）
```typescript
{
  feedbackId: Id<"feedbacks">          // フィードバックID
  userId: Id<"users">                  // 共感ユーザー
  heatLevel: number                    // 熱々度（1-3）
  createdAt: number                    // 共感日時
}

Indexes:
- by_feedbackId: [feedbackId]
- by_userId_feedbackId: [userId, feedbackId]
```

#### appSettings（アプリ設定）
```typescript
{
  key: string                          // 設定キー
  value: string                        // 設定値（JSON文字列）
  updatedAt: number                    // 更新日時
  updatedBy?: Id<"users">              // 更新者（管理者）
}

Indexes:
- by_key: [key]
```

#### stations（駅マスタ）
```typescript
{
  name: string                         // 駅名
  prefecture?: string                  // 都道府県コード
  line?: string                        // 路線名
  registeredBy?: Id<"users">           // 初回登録ユーザー
  usageCount: number                   // 使用回数
  createdAt: number                    // 登録日時
}

Indexes:
- by_name: [name]
- by_prefecture: [prefecture]
```

---

## 機能仕様

### 1. 認証機能

#### 実装方法
- **Clerk認証** を使用
- 日本語ローカライゼーション対応（`@clerk/localizations/jaJP`）
- 開発モード（`NEXT_PUBLIC_SKIP_AUTH=true`）でスキップ可能

#### 認証フロー
1. サインアップ → Clerk登録
2. Webhook経由でConvexにユーザー作成（`users.upsert`）
3. 初回ログイン時 → オンボーディング画面
4. ニックネーム設定 → `onboardingComplete` フラグ設定

#### ミドルウェア
- `src/middleware.ts` で未認証ユーザーをリダイレクト
- 公開ルート: `/sign-in`, `/sign-up`, `/api/webhooks`

---

### 2. ラーメン投稿機能

#### 投稿フォーム（`src/app/(main)/noodles/new/page.tsx`）
- **店舗情報**
  - 店舗名（必須）
  - 住所（任意）
  - URL（任意）
  - 都道府県（任意）
  - 最寄り駅（任意、サジェスト機能付き）
- **ラーメン情報**
  - ラーメン名（必須、サジェスト機能付き）
  - ジャンル（複数選択可、12種類）
  - 訪問日（カレンダー選択）
  - 評価（星1-5）
  - コメント（任意）
  - 画像（最大5枚、Convex Storageにアップロード）

#### 編集機能（`src/app/(main)/noodles/[id]/edit/page.tsx`）
- 投稿者本人のみ編集可能
- 全項目編集可能
- 画像の追加・削除・並び替え

#### 削除機能
- 投稿者本人のみ削除可能
- 関連データ（いいね、コメント、マイベスト）も連鎖削除

---

### 3. タイムライン機能

#### タイムライン表示（`src/app/(main)/noodles/page.tsx`）
- フォロー中のユーザーの投稿を表示
- リアルタイム更新（Convex Query）
- ページネーション（無限スクロール）
- 新規投稿バッジ表示

#### フィルタリング・検索
- **検索**: 店名・ラーメン名で部分一致検索
- **ジャンルフィルタ**: 複数選択可能
- **都道府県フィルタ**: 複数選択可能
- **評価フィルタ**: 最低評価・最高評価
- **訪問日フィルタ**: 日付範囲指定
- **駅フィルタ**: 駅名で絞り込み
- **並び替え**: 最新順・評価順・訪問日順

#### 鍵アカウント対応
- 鍵アカウント（`isPrivate=true`）の投稿は、フォロワーのみ閲覧可能
- フォロー機能が無効（`appSettings.followEnabled=false`）の場合は制限なし

---

### 4. SNS機能

#### フォロー・フォロワー
- **フォロー機能**
  - 公開アカウント: 即座にフォロー
  - 鍵アカウント: フォローリクエスト送信
- **フォローリクエスト**
  - 承認・拒否機能
  - 通知生成
- **フォロー解除**
  - 相互フォロー解除可能
- **フォロワー削除**
  - 自分をフォローしているユーザーを削除可能

#### いいね機能
- 投稿にいいね可能
- いいね一覧ページ（`/likes`）で自分がいいねした投稿を閲覧
- いいね取り消し可能
- いいね通知生成

#### コメント機能
- 投稿にコメント可能
- コメントへのいいね機能
- コメント削除（投稿者のみ）
- コメント通知生成

#### チャット機能（1対1 DM）
- チャットルーム自動生成
- リアルタイムメッセージング
- 既読・未読管理
- 未読バッジ表示

---

### 5. ゲーミフィケーション

#### ランクシステム（12段階）

| レベル | ランク名 | 必要店舗数 | テーマカラー | 特殊効果 |
|--------|----------|-----------|-------------|---------|
| 1 | 麺見習い | 0 | オレンジ | - |
| 2 | 麺歩き | 5 | ブラウン | 湯気 |
| 3 | 麺探 | 20 | グリーン | どんぶり2個 |
| 4 | 麺匠見習い | 50 | ブルー | 箸 |
| 5 | 麺匠 | 100 | パープル | どんぶり3個 |
| 6 | 麺宗 | 200 | アンバー | スプーン |
| 7 | 麺導 | 300 | レッド | どんぶり4個 |
| 8 | 麺仙 | 500 | シルバー | ゴールド枠 |
| 9 | 麺王 | 700 | イエロー | どんぶり5個 |
| 10 | 麺皇 | 1000 | プラチナ | 王冠 |
| 11 | 麺尊 | 1500 | ゴールド | 全装飾+ゴールドエフェクト |
| 12 | 麺極 | 2500 | レインボー | 全装飾+レインボーエフェクト |

#### テーマカラーシステム
- ランクに応じてアプリ全体のテーマカラーが変化
- 過去に達成したランクのテーマカラーを選択可能
- 設定画面でテーマ切り替え可能

#### バッジシステム（80種類以上）

##### 通常バッジ（公開）
- **投稿バッジ**: はじめの一杯、常連さん、ラーメン通、記録魔、レジェンド、神話級
- **探索バッジ**: はじめの一歩、冒険家、開拓者、百店踏破、探検王
- **ジャンルバッジ**: 醤油マスター、塩の達人、味噌職人、とんこつ狂、家系信者、二郎戦士、つけ麺マニア、担々麺愛好家、鶏白湯マスター、オールラウンダー
- **特殊バッジ**: 目利き、インフルエンサー、スーパースター、はじめてのいいね
- **都道府県バッジ**: 地域探検家（5県）、全国行脚（15県）、半分制覇（25県）、日本制覇（47県）
- **評価バッジ**: 美食家、辛口評論家、完璧主義者
- **ソーシャルバッジ**: コメンテーター、アクティブメンバー、社交家、人気者、ラーメン界の有名人、麺界の伝説、ネットワーカー、議論リーダー
- **連続投稿バッジ**: 三日坊主突破、はじめの一週間、二週間の挑戦、本気の啜り手、鉄の胃袋、ラーメンマラソン、年間無休
- **アニバーサリーバッジ**: 1ヶ月記念、3ヶ月記念、半年記念、1周年記念、2周年記念
- **チャレンジバッジ**: 週間チャレンジャー、週間チャンピオン、月間常連、月間マスター、年間100杯、年間200杯

##### 隠しバッジ（キーワード検出）
- **基本麺類**: 冷麺マスター、うどん探訪者、そば通、焼きそば愛好家、パスタ冒険者、素麺涼風、油そば職人、ちゃんぽん愛
- **アジア麺**: フォー探検家、刀削麺師、ビーフン旅人、春雨使い、ワンタン麺通、台湾麺線愛、ジャージャー麺師、冷やし中華愛好家
- **変わり種**: カップ麺ソムリエ、袋麺マイスター、まぜそばハンター、汁なし担々麺道、あんかけ麺好き、サンマー麺通、タンメン愛
- **ご当地**: 沖縄そば探求者、きしめん道、ほうとう愛、長崎皿うどん通、稲庭うどん師、讃岐うどん巡礼者
- **イタリアン**: ペペロンチーノ職人、カルボナーラ愛、ナポリタン懐古
- **究極**: 麺類博士、麺類マスター、麺神

#### 都道府県制覇システム
- 47都道府県のバッジ（Bronze・Silver・Gold）
- 訪問店舗数に応じてティアアップ
  - Bronze: 1店舗以上
  - Silver: 5店舗以上
  - Gold: 10店舗以上
- 日本地図上で可視化
- 都道府県別訪問店舗数表示

#### マイベストラーメン
- カテゴリ別にベストラーメンを設定
  - 総合
  - 醤油
  - 塩
  - 味噌
  - とんこつ
  - 家系
  - 二郎系
  - つけ麺
  - 担々麺
  - 鶏白湯
  - その他
- プロフィールページに表示

---

### 6. ランキング機能

#### ランキング種類
- **総合ランキング**: 総投稿数順
- **店舗制覇ランキング**: 訪問店舗数順
- **月間ランキング**: 月間投稿数順
- **都道府県別ランキング**: 都道府県別訪問店舗数順

#### 表示形式
- トップ100まで表示
- 自分の順位をハイライト表示
- ランク・バッジ表示

---

### 7. 通知機能

#### 通知タイプ
- **フォロー通知**: `follow`
- **フォローリクエスト通知**: `follow_request`
- **フォローリクエスト承認通知**: `follow_request_approved`
- **いいね通知**: `like`
- **コメント通知**: `comment`
- **コメントいいね通知**: `comment_like`
- **チャットメッセージ通知**: `message`
- **管理者通知**: `admin_announcement`

#### 通知機能
- リアルタイム通知（Convex Query）
- 未読バッジ表示
- 全既読機能
- 個別既読機能
- 通知一覧ページ

---

### 8. 検索・フィルタ機能

#### グローバル検索
- 店名・ラーメン名で部分一致検索
- ユーザー名検索

#### 高度なフィルタリング
- ジャンル（複数選択）
- 都道府県（複数選択）
- 評価範囲（最低・最高）
- 訪問日範囲
- 駅名

#### 並び替え
- 最新順（デフォルト）
- 評価順
- 訪問日順

---

### 9. プロフィール機能

#### マイページ（`src/app/(main)/page.tsx`）
- ユーザー情報（名前・アイコン）
- プロフィール編集（名前・画像）
- 統計情報（総投稿数・訪問店舗数）
- ランク表示・ランクアップモーダル
- 味覚プロファイル（ジャンル別統計）
- マイベストラーメン
- 獲得バッジ一覧
- 投稿一覧（リスト・ギャラリー切り替え）
- フィルタ機能

#### 他ユーザープロフィール（`src/app/(main)/users/[id]/page.tsx`）
- 公開情報表示
- フォロー・フォロー解除ボタン
- フォロワー・フォロー中一覧
- 投稿一覧
- 鍵アカウントの場合: フォロー承認後のみ閲覧可能

#### 設定画面（`src/app/(main)/settings/page.tsx`）
- プライバシー設定（鍵アカウント切り替え）
- テーマカラー選択
- アカウント削除

---

### 10. 管理者機能

#### 管理者画面（`src/app/(main)/admin/page.tsx`）
- **アクセス制御**: `isAdmin=true` のユーザーのみアクセス可能
- **フォロー機能切り替え**: `appSettings.followEnabled` を切り替え
- **全体通知送信**: タイトル・メッセージを全ユーザーに送信
- **フィードバック管理**: フィードバックの閲覧・ステータス更新
- **駅マスタシード**: 主要駅を一括登録

---

### 11. 麺テナンス（フィードバック）機能

#### フィードバック投稿（`src/app/(main)/mentenance/page.tsx`）
- カテゴリ選択
  - `feature`: 新機能要望
  - `bug`: バグ報告
  - `improvement`: 改善提案
  - `other`: その他
- メッセージ入力
- 熱々度選択（1-3）
- 湯気ボタン（共感機能）

#### フィードバック一覧
- 全ユーザーのフィードバックを閲覧
- 湯気ボタンで共感表明
- ステータス表示（`new`, `in_progress`, `resolved`, `rejected`）

---

## ページ構成

### パブリックページ
| パス | 説明 |
|------|------|
| `/sign-in` | ログイン |
| `/sign-up` | サインアップ |
| `/onboarding` | 初回セットアップ（ニックネーム登録） |

### メインページ（認証必須）
| パス | 説明 |
|------|------|
| `/` | ホーム（マイページ） |
| `/noodles` | タイムライン |
| `/noodles/new` | 新規投稿 |
| `/noodles/[id]` | 投稿詳細 |
| `/noodles/[id]/edit` | 投稿編集 |
| `/users` | ユーザー一覧 |
| `/users/[id]` | ユーザープロフィール |
| `/users/[id]/followers` | フォロワー一覧 |
| `/users/[id]/following` | フォロー中一覧 |
| `/users/[id]/map` | ユーザーの制覇マップ |
| `/ranking` | ランキング |
| `/mymen` | マイメン（フォロー中ユーザー） |
| `/likes` | いいね一覧 |
| `/notifications` | 通知一覧 |
| `/chat` | チャット一覧 |
| `/chat/[roomId]` | チャットルーム |
| `/map` | 制覇マップ |
| `/settings` | 設定 |
| `/mentenance` | 麺テナンス（フィードバック） |
| `/follow-requests` | フォローリクエスト |
| `/admin` | 管理者画面 |
| `/admin/seed-stations` | 駅マスタシード |

---

## UI/UXデザイン

### デザインシステム

#### カラーパレット
- **テーマカラー**: ランクに応じて動的変更
- **背景色**: `#F9FAFB`（Gray-50）
- **カード背景**: `#FFFFFF`
- **テキスト**: `#111827`（Gray-900）
- **サブテキスト**: `#6B7280`（Gray-500）

#### タイポグラフィ
- **フォントファミリー**: Geist Sans, Arial, Helvetica, sans-serif
- **モノスペース**: Geist Mono

#### スペーシング
- Tailwind CSS デフォルトスケール使用

#### コンポーネント
- **ボタン**: Radix UI + Tailwind CSS
- **フォーム**: Radix UI + Tailwind CSS
- **モーダル**: Radix UI Dialog
- **ポップオーバー**: Radix UI Popover
- **ドロップダウン**: Radix UI Dropdown Menu
- **タブ**: Radix UI Tabs
- **ツールチップ**: Radix UI Tooltip

### アニメーション
- **Framer Motion** を使用
- ページ遷移アニメーション
- モーダル・ポップアップのフェードイン
- ランクアップ時の特殊エフェクト（ゴールド・レインボー）

### レスポンシブデザイン
- **モバイルファースト**: スマートフォン最適化
- **PWA対応**: ホーム画面追加、オフライン対応
- **タッチ最適化**: ボタンサイズ・スワイプジェスチャー

---

## ゲーミフィケーション

### ランクアップ体験
1. 新店舗訪問時、ランクアップ条件達成
2. `convex/badges.ts` でランクアップチェック
3. ランクアップモーダル表示（`rank-up-modal.tsx`）
4. 新ランク・テーマカラー解放通知
5. バッジ獲得通知

### バッジ獲得体験
1. 条件達成（投稿数・店舗数・いいね数など）
2. `convex/badges.ts` でバッジチェック
3. バッジ獲得通知
4. バッジ一覧に追加

### 隠しバッジ体験
1. 特定キーワードを含むラーメン名を投稿
2. `convex/badges.ts` でキーワード検出
3. 隠しバッジ獲得通知
4. バッジ一覧に追加（隠しフラグ付き）

### 都道府県制覇体験
1. 新都道府県の店舗訪問
2. `convex/prefectures.ts` でバッジ生成・更新
3. ティアアップ通知（Bronze → Silver → Gold）
4. 地図上でバッジ表示

---

## 認証・権限

### 認証方式
- **Clerk** を使用
- Email/Password、Google、GitHub などのプロバイダー対応
- セッション管理・トークンリフレッシュ自動

### 権限管理
- **一般ユーザー**
  - 投稿・編集・削除（自分の投稿のみ）
  - フォロー・いいね・コメント
  - チャット送信
- **管理者**（`isAdmin=true`）
  - 一般ユーザー権限 + 以下
  - フォロー機能切り替え
  - 全体通知送信
  - フィードバック管理
  - 駅マスタシード

### プライバシー設定
- **公開アカウント**（デフォルト）
  - 全ユーザーが投稿・プロフィール閲覧可能
- **鍵アカウント**（`isPrivate=true`）
  - フォロー承認したユーザーのみ投稿・プロフィール閲覧可能
  - フォローリクエスト送信機能

---

## 開発環境設定

### 前提条件
- Node.js 20.x 以上
- npm または pnpm

### 環境変数（`.env.local`）
```bash
# Development mode - skip auth
NEXT_PUBLIC_SKIP_AUTH=true

# Convex
NEXT_PUBLIC_CONVEX_URL=https://warmhearted-sardine-80.convex.cloud
CONVEX_DEPLOYMENT=dev:warmhearted-sardine-80

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_JWT_ISSUER_DOMAIN=https://...clerk.accounts.dev

# OpenAI (Optional)
OPENAI_API_KEY=sk-proj-...
```

### インストール・起動
```bash
# 依存関係インストール
npm install

# Convex開発サーバー起動（別ターミナル）
npx convex dev

# Next.js開発サーバー起動
npm run dev
```

### ビルド・デプロイ
```bash
# 本番ビルド
npm run build

# 本番サーバー起動
npm start
```

---

## デプロイメント

### Vercel デプロイ
1. Vercelにリポジトリ連携
2. 環境変数を設定
3. デプロイ実行

### Convex デプロイ
```bash
# Convex本番環境デプロイ
npx convex deploy
```

### 環境変数設定（本番）
- Vercel Dashboard で環境変数を設定
- `NEXT_PUBLIC_SKIP_AUTH` を `false` に設定
- Clerk本番キーを設定
- Convex本番URLを設定

---

## 付録

### ジャンル一覧
1. 醤油
2. 塩
3. 味噌
4. とんこつ
5. 家系
6. 二郎系
7. 魚介
8. 煮干し
9. つけ麺
10. 担々麺
11. 鶏白湯
12. その他

### 都道府県コード一覧
- `hokkaido`, `aomori`, `iwate`, ..., `okinawa`（全47都道府県）

### 主要駅マスタ
- 東京駅、新宿駅、渋谷駅、池袋駅、横浜駅、大阪駅、京都駅、神戸駅、名古屋駅、札幌駅、仙台駅、福岡駅など（100駅以上）

---

## まとめ

本仕様書に基づいて、以下の要素を再現することで同等のアプリケーションを構築可能です：

1. **技術スタック**: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + Convex + Clerk
2. **データモデル**: Convex Schema に基づく14テーブル設計
3. **機能実装**: 投稿・SNS・ゲーミフィケーション・ランキング・通知・チャット
4. **UI/UX**: Radix UI + Framer Motion によるモダンデザイン
5. **ゲーミフィケーション**: 12段階ランク + 80種類以上のバッジ + 都道府県制覇
6. **認証・権限**: Clerk認証 + ロールベース権限管理 + プライバシー設定

---

**作成日**: 2025年12月12日
**バージョン**: 1.0
**著者**: Claude Code Reverse Engineering
