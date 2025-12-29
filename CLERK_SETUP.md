# Clerk Webhook Setup

## 問題
新規ユーザーがログイン後にアプリにアクセスできない問題が発生しています。
原因：Clerk WebhookがConvexにユーザーデータを同期できていない

## 解決手順

### 1. Clerk Dashboard でWebhookを設定

1. [Clerk Dashboard](https://dashboard.clerk.com) にアクセス
2. プロジェクト「knowing-badger-66」を選択
3. 左メニューから **Webhooks** を選択
4. **+ Add Endpoint** をクリック

### 2. Webhookエンドポイント設定

**開発環境用：**
```
Endpoint URL: https://<your-vercel-url>/api/webhooks/clerk
```

**本番環境用：**
```
Endpoint URL: https://ramenapp.vercel.app/api/webhooks/clerk
```

**購読するイベント：**
- ✅ `user.created`
- ✅ `user.updated`
- ✅ `user.deleted`

### 3. Webhook Secretを取得

1. Webhookエンドポイントを作成すると、**Signing Secret** が表示されます
2. この値をコピー（`whsec_` で始まる文字列）

### 4. 環境変数を更新

#### ローカル開発環境 (`.env.local`)

```bash
CLERK_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

#### Vercel環境変数

1. [Vercel Dashboard](https://vercel.com) にアクセス
2. プロジェクトを選択
3. **Settings** → **Environment Variables**
4. 以下の変数を追加/更新：

```
CLERK_WEBHOOK_SECRET=whsec_your_actual_secret_here
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/onboarding
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

**重要：** 環境変数を更新したら、Vercelで **Redeploy** を実行してください。

### 5. テスト手順

#### ブラウザのCookie/セッションをクリア

1. Chrome DevTools (F12) を開く
2. **Application** タブを選択
3. 左メニューの **Storage** → **Clear site data** をクリック
4. ページをリロード

#### 新規ユーザーでテスト

1. ブラウザのシークレットモード/プライベートウィンドウを開く
2. `https://ramenapp.vercel.app/sign-up` にアクセス
3. 新しいメールアドレスで登録
4. 登録後、`/onboarding` ページに自動遷移することを確認
5. ニックネームを入力して「はじめる」をクリック
6. ホーム画面に遷移することを確認

### 6. デバッグ方法

セッション情報を確認：
```
https://ramenapp.vercel.app/api/debug/session
```

レスポンス例：
```json
{
  "userId": "user_xxxxx",
  "sessionId": "sess_xxxxx",
  "isAuthenticated": true,
  "timestamp": "2025-12-29T12:00:00.000Z"
}
```

### トラブルシューティング

#### Webhookが動作しているか確認

Clerk Dashboard → Webhooks → エンドポイントを選択 → **Logs** タブ
- ステータスコード `200` なら成功
- エラーが表示されている場合は、エラーメッセージを確認

#### Convexにユーザーが作成されているか確認

Convex Dashboard → Data → `users` テーブル
- 新規登録したユーザーのレコードが存在するか確認
- `clerkId` が正しく保存されているか確認

#### よくある問題

1. **Webhook Secretが間違っている**
   - エラー: "Error occurred - invalid signature"
   - 解決: Clerk Dashboardで正しいSecretを確認

2. **環境変数が反映されていない**
   - Vercelで環境変数を追加後、Redeployを忘れている
   - 解決: Vercel Dashboardから手動でRedeploy

3. **古いセッションが残っている**
   - ブラウザのCookie/セッションをクリア
   - シークレットモードでテスト
