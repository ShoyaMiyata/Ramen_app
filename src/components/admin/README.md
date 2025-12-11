# Admin Components

## GachaTestPanel

管理者がガチャシステムをテストするためのUIコンポーネント。

### 機能

1. **ガチャテスト**: 実際のガチャロジックをテスト実行（1回/10回）
2. **テスト結果表示**: レアリティ別に色分けされた結果表示
3. **デイリーガチャリセット**: 対象ユーザーのデイリーガチャ実行回数をリセット
4. **天井カウンターリセット**: 対象ユーザーの天井カウント（50連/100連）をリセット
5. **ガチャ統計表示**:
   - 総チケット数
   - 総ガチャ回数
   - レアリティ別排出数と確率

### 使い方

```tsx
import { GachaTestPanel } from "@/components/admin";

export default function AdminPage() {
  const { user } = useAdmin();

  return (
    <div>
      <GachaTestPanel adminUserId={user._id} />
    </div>
  );
}
```

### 管理画面への統合例

既存の管理画面にタブとして追加する場合:

```tsx
// src/app/(main)/admin/page.tsx

import { GachaTestPanel } from "@/components/admin";

// タブ定義に追加
const tabs = [
  // ... 既存のタブ
  { id: "gacha" as Tab, label: "ガチャ", icon: Sparkles },
];

// タブコンテンツに追加
{activeTab === "gacha" && user?._id && (
  <GachaTestPanel adminUserId={user._id} />
)}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| adminUserId | Id<"users"> | Yes | 管理者のユーザーID |

### 使用しているConvex関数

- `api.admin.testGacha`: ガチャテスト実行
- `api.admin.resetDailyGacha`: デイリーガチャリセット
- `api.admin.resetPityCounter`: 天井カウンターリセット
- `api.admin.getGachaStats`: ガチャ統計取得
- `api.admin.listUsersForNotification`: ユーザー一覧取得

### レアリティ別の色

- ★5 (ウルトラレア): 金色 (text-yellow-500)
- ★4 (スーパーレア): 紫色 (text-purple-500)
- ★3 (レア): 青色 (text-blue-500)
- ★2 (コモン): 緑色 (text-green-500)
- ★1 (ノーマル): 灰色 (text-gray-500)

### デザイン

- Tailwind CSSでスタイリング
- lucide-reactのアイコンを使用
- レスポンシブ対応
- アニメーション付きの結果表示

### エラーハンドリング

- API呼び出しエラーはアラートで表示
- ユーザー未選択時のバリデーション
- ローディング状態の表示

---

## TicketDistributionPanel

管理者がユーザーにガチャチケットを配布するためのUIコンポーネント。

### 機能

1. **配布枚数の設定**: 1〜100枚の範囲でチケット枚数を指定
2. **配布対象の選択**:
   - 全ユーザー: システムの全アクティブユーザーに配布
   - 選択したユーザー: 個別にユーザーを選択して配布
3. **ユーザー検索**: 名前またはメールアドレスで検索
4. **複数選択**: チェックボックスで複数ユーザーを選択
5. **確認ダイアログ**: 配布前に内容を確認
6. **結果表示**: 配布完了後に成功メッセージを表示

### 使い方

```tsx
import { TicketDistributionPanel } from "@/components/admin";

export default function AdminPage() {
  const { user } = useAdmin();

  return (
    <div>
      <TicketDistributionPanel adminUserId={user._id} />
    </div>
  );
}
```

### 管理画面への統合例

既存の管理画面にタブとして追加する場合:

```tsx
// src/app/(main)/admin/page.tsx

import { TicketDistributionPanel } from "@/components/admin";

// タブ定義に追加
const tabs = [
  // ... 既存のタブ
  { id: "tickets" as Tab, label: "チケット", icon: Ticket },
];

// タブコンテンツに追加
{activeTab === "tickets" && user?._id && (
  <TicketDistributionPanel adminUserId={user._id} />
)}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| adminUserId | Id<"users"> | Yes | 管理者のユーザーID |

### 使用しているConvex関数

- `api.admin.listUsersForNotification`: ユーザー一覧取得
- `api.admin.distributeTickets`: チケット配布実行

### バリデーション

- 配布枚数は1〜100枚の範囲
- 選択モードの場合、最低1人のユーザーを選択する必要がある
- 削除済みユーザーには配布されない

### デザイン

- Tailwind CSSでスタイリング
- Radix UIのDialogコンポーネントを使用
- lucide-reactのアイコンを使用
- レスポンシブ対応

### エラーハンドリング

- バリデーションエラーはUIで表示
- API呼び出しエラーはアラートで表示
- 成功時は緑色のメッセージを3秒間表示
