# Cloudflare R2 セットアップガイド

このドキュメントでは、Cloudflare R2を使用した画像ストレージの設定方法を説明します。

## 1. Cloudflare R2バケットの作成

### 1.1 Cloudflareダッシュボードにアクセス

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. 左サイドバーから **R2** を選択
3. **Create bucket** ボタンをクリック

### 1.2 バケットの作成

1. **Bucket name**: `ramen-images`（任意の名前）
2. **Location**: 自動選択（Automatic）または最寄りのリージョン
3. **Create bucket** をクリック

### 1.3 バケットの公開設定

バケットを作成したら、公開アクセスを設定します：

1. 作成したバケット（`ramen-images`）をクリック
2. **Settings** タブを開く
3. **Public access** セクションで **Allow Access** をクリック
4. カスタムドメインを設定（推奨）または R2.dev サブドメインを使用

**カスタムドメインの例:**
- `https://images.yourdomain.com`
- Cloudflare DNSでCNAMEレコードを追加する必要があります

**R2.dev サブドメインの例:**
- `https://pub-xxxxxxxxxxxx.r2.dev`
- 自動的に生成されます

## 2. API トークンの作成

### 2.1 R2 API トークンの取得

1. Cloudflareダッシュボードで **R2** セクションに移動
2. 右上の **Manage R2 API Tokens** をクリック
3. **Create API token** をクリック

### 2.2 トークンの設定

1. **Token name**: `nooodle-app-token`（任意の名前）
2. **Permissions**:
   - Object Read & Write（オブジェクトの読み書き）
   - ✅ **Admin Read & Write** を選択
3. **TTL**: 選択しない（無期限）
4. **Create API Token** をクリック

### 2.3 認証情報の保存

トークン作成後、以下の情報が表示されます：

```
Access Key ID: xxxxxxxxxxxxxxxxxxxx
Secret Access Key: yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

⚠️ **重要**: Secret Access Keyは一度しか表示されないため、必ず保存してください！

## 3. 環境変数の設定

### 3.1 `.env.local` ファイルの編集

プロジェクトルートの `.env.local` ファイルを開き、以下のように設定します：

```env
# Cloudflare R2
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_access_key_id_from_step_2.3
R2_SECRET_ACCESS_KEY=your_secret_access_key_from_step_2.3
R2_BUCKET_NAME=ramen-images
R2_PUBLIC_URL=https://images.yourdomain.com
```

### 3.2 各環境変数の説明

| 環境変数 | 説明 | 取得方法 |
|---------|------|----------|
| `R2_ACCOUNT_ID` | CloudflareアカウントID | ダッシュボードのURL（`https://dash.cloudflare.com/[ACCOUNT_ID]`）から取得 |
| `R2_ACCESS_KEY_ID` | R2 APIアクセスキーID | ステップ2.3で取得 |
| `R2_SECRET_ACCESS_KEY` | R2 APIシークレットキー | ステップ2.3で取得 |
| `R2_BUCKET_NAME` | バケット名 | ステップ1.2で設定した名前 |
| `R2_PUBLIC_URL` | 公開URL | ステップ1.3で設定したカスタムドメインまたはR2.devサブドメイン |

### 3.3 Account IDの確認方法

1. Cloudflareダッシュボードにログイン
2. ブラウザのURLバーを確認：
   ```
   https://dash.cloudflare.com/[ここがAccount ID]/r2/...
   ```
3. または、右上のプロファイルアイコン → **Account Home** で確認

## 4. 動作確認

### 4.1 開発サーバーの再起動

環境変数を設定したら、開発サーバーを再起動します：

```bash
npm run dev
```

### 4.2 画像アップロードのテスト

1. アプリにログイン
2. 新規投稿を作成
3. 画像を選択してアップロード
4. エラーが出ないことを確認

### 4.3 Cloudflareダッシュボードで確認

1. Cloudflare R2 ダッシュボードに移動
2. `ramen-images` バケットを開く
3. `images/user_[userId]/` フォルダに画像がアップロードされているか確認

## 5. トラブルシューティング

### エラー: "The AWS Access Key Id you provided does not exist in our records"

- `R2_ACCESS_KEY_ID` と `R2_SECRET_ACCESS_KEY` が正しいか確認
- APIトークンの権限が **Admin Read & Write** になっているか確認

### エラー: "NoSuchBucket"

- `R2_BUCKET_NAME` が正しいか確認
- バケットが実際に存在するか Cloudflare ダッシュボードで確認

### エラー: "SignatureDoesNotMatch"

- `R2_SECRET_ACCESS_KEY` が正しいか確認
- APIトークンが期限切れでないか確認

### 画像が表示されない

- `R2_PUBLIC_URL` が正しいか確認
- バケットの公開設定（Public access）が有効になっているか確認
- カスタムドメインを使用している場合、DNSレコードが正しく設定されているか確認

### CORSエラーが発生する場合

R2バケットのCORS設定が必要な場合があります：

1. バケットの **Settings** → **CORS Policy**
2. 以下のポリシーを追加：

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## 6. 本番環境のデプロイ

### Vercel の場合

1. Vercel ダッシュボードでプロジェクトを選択
2. **Settings** → **Environment Variables**
3. 以下の環境変数を追加：
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
   - `R2_PUBLIC_URL`

4. **Redeploy** をクリック

### 注意事項

- 本番環境では必ずカスタムドメインを使用してください
- R2.dev サブドメインは開発・テスト用です
- APIトークンは絶対に公開リポジトリにコミットしないでください

## 7. コスト

Cloudflare R2の料金体系：

- **ストレージ**: $0.015/GB/月（最初の10GBは無料）
- **Class A操作** (書き込み): 100万リクエストあたり $4.50
- **Class B操作** (読み込み): 100万リクエストあたり $0.36
- **データ転送**: 無料（Egress料金なし）

**月間10,000ユーザーの想定コスト:**
- ストレージ: 50GB → $0.60
- 書き込み: 10万リクエスト → $0.45
- 読み込み: 100万リクエスト → $0.36
- **合計**: 約 $1.41/月

## 8. セキュリティのベストプラクティス

1. **APIトークンの権限を最小限に**
   - 必要な権限のみを付与

2. **環境変数の管理**
   - `.env.local` をgitignoreに追加（デフォルトで追加済み）
   - チーム内で安全に共有（1Password、Vaultなど）

3. **画像のバリデーション**
   - ファイルサイズ制限（現在: 5MB）
   - ファイル形式制限（現在: JPEG, PNG, WebP）
   - 実装済み: `src/lib/r2.ts`

4. **ユーザー権限のチェック**
   - アップロード時に認証確認
   - 削除時にファイル所有者確認
   - 実装済み: `src/app/api/upload/route.ts`

## 参考リンク

- [Cloudflare R2 公式ドキュメント](https://developers.cloudflare.com/r2/)
- [R2 API リファレンス](https://developers.cloudflare.com/r2/api/s3/api/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
