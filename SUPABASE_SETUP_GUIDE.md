# Nooodle Mobile - Supabase セットアップハンズオンガイド

このガイドでは、Supabaseプロジェクトを**ゼロから構築**し、データベース・認証・ストレージをセットアップします。

---

## 📋 目次

1. [前提条件](#前提条件)
2. [Supabaseプロジェクト作成](#step-1-supabaseプロジェクト作成)
3. [データベーススキーマ作成](#step-2-データベーススキーマ作成)
4. [Row Level Security設定](#step-3-row-level-security設定)
5. [Storageバケット作成](#step-4-storageバケット作成)
6. [Authentication設定](#step-5-authentication設定)
7. [API Keys取得](#step-6-api-keys取得)
8. [動作確認](#step-7-動作確認)

---

## 前提条件

- Googleアカウント（Supabaseログイン用）
- ブラウザ（Chrome、Firefox、Safariなど）
- テキストエディタ（このリポジトリのSQLファイルを開ける）

---

## Step 1: Supabaseプロジェクト作成

### 1-1. Supabaseにサインアップ

1. [https://supabase.com](https://supabase.com) にアクセス
2. 右上の **「Start your project」** または **「Sign up」** をクリック
3. **「Continue with GitHub」** でログイン（またはEmailで登録）

### 1-2. 新規プロジェクト作成

1. ダッシュボードで **「New project」** をクリック
2. 以下の情報を入力：

| 項目 | 入力内容 |
|------|---------|
| **Organization** | 既存のOrganizationを選択、または **「New organization」** で新規作成（例: `my-org`） |
| **Name** | `nooodle-mobile` |
| **Database Password** | **強力なパスワードを生成**（例: `Abc123!@#XYZ789`）<br>⚠️ **必ず保存してください！** |
| **Region** | **`Northeast Asia (Tokyo)`** を推奨（日本からのアクセスが速い） |
| **Pricing Plan** | **`Free`**（開発・テスト用）または **`Pro`**（本番用） |

3. **「Create new project」** をクリック
4. プロジェクトの作成に **2-3分** かかります（完了まで待ちます）

✅ **プロジェクト作成完了！**

---

## Step 2: データベーススキーマ作成

### 2-1. SQL Editorを開く

1. Supabase Dashboard 左メニューから **「SQL Editor」** をクリック
2. **「New query」** をクリック

### 2-2. スキーマSQLを実行

1. テキストエディタで `supabase/01_schema.sql` を開く
2. **全文をコピー**
3. SQL Editorに**ペースト**
4. 右下の **「Run」** ボタンをクリック（または `Cmd/Ctrl + Enter`）

#### 実行結果の確認

- ✅ 成功メッセージ: `✅ Nooodle Database Schema created successfully!`
- ⚠️ エラーが出た場合: エラーメッセージを確認し、再度実行してください

### 2-3. テーブル作成の確認

1. 左メニューから **「Table Editor」** をクリック
2. 以下のテーブルが作成されていることを確認：
   - `users`
   - `shops`
   - `noodles`
   - `likes`
   - `follows`
   - `follow_requests`
   - `comments`
   - `comment_likes`
   - `chat_rooms`
   - `chat_messages`
   - `notifications`
   - `my_bests`
   - `user_badges`
   - `prefecture_badges`
   - `feedbacks`
   - `feedback_steams`
   - `app_settings`
   - `stations`

✅ **データベーススキーマ作成完了！**

---

## Step 3: Row Level Security設定

### 3-1. RLSポリシーSQLを実行

1. SQL Editorで **「New query」** をクリック
2. テキストエディタで `supabase/02_rls_policies.sql` を開く
3. **全文をコピー**
4. SQL Editorに**ペースト**
5. **「Run」** ボタンをクリック

#### 実行結果の確認

- ✅ 成功メッセージ: `✅ Row Level Security (RLS) Policies created successfully!`

### 3-2. RLS有効化の確認

1. 左メニューから **「Authentication」** → **「Policies」** をクリック
2. 各テーブルにRLSポリシーが設定されていることを確認
   - 例: `users` テーブルに `Anyone can view non-deleted users` などのポリシーが表示される

✅ **Row Level Security設定完了！**

---

## Step 4: Storageバケット作成

### 4-1. Storageバケット作成

1. 左メニューから **「Storage」** をクリック
2. **「Create a new bucket」** をクリック
3. 以下の情報を入力：

| 項目 | 入力内容 |
|------|---------|
| **Name** | `noodle-images` |
| **Public bucket** | **ON**（画像を公開アクセス可能にする） |
| **File size limit** | `5 MB`（1画像あたり） |
| **Allowed MIME types** | `image/jpeg, image/png, image/webp` |

4. **「Create bucket」** をクリック

### 4-2. Storageポリシー設定

1. 作成した `noodle-images` バケットをクリック
2. **「Policies」** タブをクリック
3. **「New policy」** をクリック
4. **「For full customization」** を選択

#### ポリシー1: 画像アップロード（認証済みユーザーのみ）

- **Policy name**: `Authenticated users can upload images`
- **Allowed operation**: `INSERT`
- **Policy definition**:
  ```sql
  (bucket_id = 'noodle-images'::text) AND (auth.role() = 'authenticated'::text)
  ```
- **「Review」** → **「Save policy」**

#### ポリシー2: 画像閲覧（全ユーザー）

- **Policy name**: `Anyone can view images`
- **Allowed operation**: `SELECT`
- **Policy definition**:
  ```sql
  (bucket_id = 'noodle-images'::text)
  ```
- **「Review」** → **「Save policy」**

#### ポリシー3: 画像削除（認証済みユーザー、自分のファイルのみ）

- **Policy name**: `Users can delete their own images`
- **Allowed operation**: `DELETE`
- **Policy definition**:
  ```sql
  (bucket_id = 'noodle-images'::text)
  AND (auth.role() = 'authenticated'::text)
  AND ((storage.foldername(name))[1] = (SELECT id::text FROM users WHERE auth_id = auth.uid()))
  ```
- **「Review」** → **「Save policy」**

✅ **Storageバケット作成完了！**

---

## Step 5: Authentication設定

### 5-1. Email Provider有効化

1. 左メニューから **「Authentication」** → **「Providers」** をクリック
2. **「Email」** を探してクリック
3. **「Enable Email provider」** を **ON**
4. **「Confirm email」** を **ON**（本番環境では推奨）
5. **「Save」** をクリック

### 5-2. OAuth Providers設定（オプション）

#### Google認証を有効化

1. **「Providers」** タブで **「Google」** をクリック
2. **「Enable Sign in with Google」** を **ON**
3. Google Cloud Console で OAuth 2.0 クライアントIDを作成：
   - [Google Cloud Console](https://console.cloud.google.com/)
   - **「APIとサービス」** → **「認証情報」**
   - **「認証情報を作成」** → **「OAuth 2.0 クライアントID」**
   - **アプリケーションの種類**: `Webアプリケーション`
   - **承認済みのリダイレクトURI**: Supabaseのコールバック URL（Supabaseダッシュボードに表示）
     - 例: `https://your-project.supabase.co/auth/v1/callback`
   - **作成** → **クライアントID** と **クライアントシークレット** をコピー
4. Supabase に戻り、**Client ID** と **Client Secret** を貼り付け
5. **「Save」** をクリック

#### Apple認証を有効化（iOS必須）

1. **「Providers」** タブで **「Apple」** をクリック
2. **「Enable Sign in with Apple」** を **ON**
3. Apple Developer Console で設定：
   - [Apple Developer](https://developer.apple.com/)
   - **「Certificates, Identifiers & Profiles」**
   - **「Identifiers」** → **「+」** → **「Services IDs」**
   - Service ID を作成し、Supabaseのコールバック URL を設定
   - **「Keys」** → **「+」** で Sign in with Apple 用のキーを作成
4. Supabase に **Service ID** と **Key ID**、**Team ID** を設定
5. **「Save」** をクリック

✅ **Authentication設定完了！**

---

## Step 6: API Keys取得

### 6-1. Project APIキー取得

1. 左メニューから **「Settings」** → **「API」** をクリック
2. 以下の情報をコピーして保存：

| 項目 | 説明 | 用途 |
|------|------|------|
| **Project URL** | `https://your-project.supabase.co` | Supabaseエンドポイント |
| **anon public** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | 公開APIキー（クライアント側） |
| **service_role** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | サービスロールキー（**サーバー側のみ**） |

⚠️ **重要**:
- `anon public` キーは **クライアント側（Expoアプリ）** で使用
- `service_role` キーは **絶対にクライアント側に含めない**（RLSをバイパスします）

### 6-2. `.env`ファイル作成

プロジェクトルートに `.env` ファイルを作成し、以下をペースト：

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# DO NOT COMMIT service_role key to Git!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **`.gitignore`** に `.env` を追加してください！

```bash
echo ".env" >> .gitignore
```

✅ **API Keys取得完了！**

---

## Step 7: 動作確認

### 7-1. テストユーザー作成

1. SQL Editorで以下を実行：

```sql
-- テストユーザーのAuth作成
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role
) VALUES (
  gen_random_uuid(),
  'test@example.com',
  crypt('password123', gen_salt('bf')),  -- パスワード: password123
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"テストユーザー"}'::jsonb,
  NOW(),
  NOW(),
  'authenticated'
);

-- 作成されたユーザーを確認
SELECT id, email, created_at FROM auth.users WHERE email = 'test@example.com';
```

2. `users` テーブルにレコードが自動作成されているか確認：

```sql
SELECT * FROM users WHERE email = 'test@example.com';
```

✅ トリガーが正常に動作していれば、`users` テーブルにレコードが作成されています！

### 7-2. Supabase ClientでAPI接続テスト

ローカルでテスト（Node.jsまたはExpoプロジェクト）：

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// ログインテスト
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'password123',
});

if (error) {
  console.error('❌ Login failed:', error.message);
} else {
  console.log('✅ Login success:', data.user?.email);
}

// ユーザー情報取得テスト
const { data: userData, error: userError } = await supabase
  .from('users')
  .select('*')
  .eq('email', 'test@example.com')
  .single();

if (userError) {
  console.error('❌ Fetch user failed:', userError.message);
} else {
  console.log('✅ User fetched:', userData);
}
```

✅ **動作確認完了！**

---

## 🎉 セットアップ完了！

これで Supabase のセットアップは完了です！

### 次のステップ

1. **Expoプロジェクト作成**: `EXPO_SETUP_GUIDE.md` を参照
2. **アプリ実装開始**: `IMPLEMENTATION_GUIDE.md` を参照

---

## 🛠️ トラブルシューティング

### エラー: `permission denied for table users`

- **原因**: RLSポリシーが正しく設定されていない
- **解決策**: `02_rls_policies.sql` を再実行

### エラー: `bucket not found`

- **原因**: Storageバケット `noodle-images` が作成されていない
- **解決策**: Step 4 を再実行

### エラー: `relation "users" does not exist`

- **原因**: スキーマSQLが実行されていない
- **解決策**: Step 2 を再実行

### テストユーザーでログインできない

- **原因**: Emailプロバイダーが無効、または `email_confirmed_at` が null
- **解決策**:
  ```sql
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE email = 'test@example.com';
  ```

---

## 📚 参考リンク

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

---

**作成日**: 2025年12月12日
**著者**: Claude Code
