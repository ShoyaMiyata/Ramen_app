# AI自動入力機能 - 要件定義書兼実装計画書

## 📋 概要

ラーメン店のURLを貼り付けるだけで、店舗情報を自動で取得してフォームに入力する機能。
Google Gemini 1.5 Flash APIを使用して実装。

---

## 🎯 目的

- **ユーザー負担軽減**: 手入力を最小化し、投稿体験を向上
- **データ精度向上**: 店名・住所の誤入力を防止
- **投稿ハードル低下**: URLコピペだけで始められる

---

## ✨ 機能要件

### 1. 対応URL

| サービス | URL例 | 優先度 |
|---------|------|--------|
| 食べログ | `https://tabelog.com/tokyo/A1234/...` | 🔴 必須 |
| Googleマップ | `https://maps.app.goo.gl/...` | 🔴 必須 |
| ぐるなび | `https://r.gnavi.co.jp/...` | 🟡 推奨 |
| Retty | `https://retty.me/...` | 🟢 任意 |
| ホットペッパー | `https://www.hotpepper.jp/...` | 🟢 任意 |

### 2. 自動取得項目

| 項目 | 必須 | 例 | 備考 |
|-----|------|-----|------|
| 店名 | ✅ | "麺屋 武蔵" | ramenName |
| 都道府県 | ✅ | "東京都" | prefecture |
| 最寄り駅 | ✅ | "新宿駅" | nearestStation |
| 住所 | ⭕️ | "新宿区西新宿1-2-3" | address（参考用） |
| ジャンル | ⭕️ | "ラーメン" | 検証用 |

### 3. UI/UX仕様

#### 配置
```
┌─────────────────────────────────────┐
│  一杯を記録する                      │
├─────────────────────────────────────┤
│                                     │
│  🔗 お店のURLを貼り付け              │
│  ┌─────────────────────────────┐  │
│  │ https://tabelog.com/...     │  │
│  └─────────────────────────────┘  │
│  [✨ AIで自動入力]ボタン              │
│                                     │
│  --- 取得中の表示 ---                │
│  🤖 AIが情報を取得しています...       │
│  ⚡ Powered by Google Gemini         │
│                                     │
│  --- 取得後 ---                      │
│  ✅ 店名: 麺屋 武蔵                   │
│  ✅ 都道府県: 東京都                  │
│  ✅ 最寄り駅: 新宿駅                  │
│                                     │
└─────────────────────────────────────┘
```

#### 状態管理
- **初期状態**: URLフィールド + ボタン表示
- **取得中**: ローディング表示 + ボタン無効化
- **成功**: 取得結果プレビュー + フォーム自動入力
- **失敗**: エラーメッセージ + 手動入力へ誘導

#### エラーハンドリング
```
❌ URLが無効です
❌ 店舗情報を取得できませんでした
❌ APIエラーが発生しました（手動で入力してください）
ℹ️  対応URL: 食べログ、Googleマップ、ぐるなび
```

---

## 🏗️ 技術設計

### アーキテクチャ

```
[フロントエンド] → [Convex Action] → [Gemini API] → [Webスクレイピング]
                                          ↓
                                    [構造化データ]
                                          ↓
                              [フォーム自動入力]
```

### 実装コンポーネント

#### 1. フロントエンド（React）

**場所**: `/src/app/(main)/noodles/new/page.tsx`

```typescript
// 新規追加コンポーネント
<AIAutoFillSection
  onDataFetched={(data) => {
    // フォームに自動入力
    setRamenName(data.shopName);
    setPrefecture(data.prefecture);
    setNearestStation(data.station);
  }}
/>
```

**状態管理**:
```typescript
const [url, setUrl] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [fetchedData, setFetchedData] = useState<ShopData | null>(null);
const [error, setError] = useState<string | null>(null);
```

#### 2. バックエンド（Convex Action）

**場所**: `/convex/aiActions.ts`

```typescript
export const extractShopInfo = action({
  args: { url: v.string() },
  handler: async (ctx, { url }) => {
    // 1. URL検証
    // 2. Gemini APIにリクエスト
    // 3. レスポンス解析
    // 4. 構造化データを返す
    return {
      shopName: string;
      prefecture: string;
      station: string;
      address?: string;
      confidence: number; // 信頼度 0-100
    };
  },
});
```

#### 3. Gemini API連携

**プロンプト設計**:
```
あなたはラーメン店情報抽出の専門AIです。
以下のURLから店舗情報を抽出してください。

URL: {url}

必須情報:
- 店名（正式名称）
- 都道府県（47都道府県のいずれか）
- 最寄り駅（「〜駅」の形式）

出力形式（JSON）:
{
  "shopName": "店名",
  "prefecture": "都道府県",
  "station": "駅名",
  "address": "住所",
  "confidence": 95
}

注意:
- 情報が不明な場合はnullを返す
- 駅は最も近い駅を1つ選ぶ
- 都道府県は必ず47都道府県のいずれか
```

**APIリクエスト**:
```typescript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.1, // 低温度で正確性重視
        maxOutputTokens: 500,
      }
    })
  }
);
```

---

## 📁 ファイル構成

```
new_ramen/
├── convex/
│   └── aiActions.ts              # 新規作成: Gemini API連携
├── src/
│   ├── app/(main)/noodles/new/
│   │   └── page.tsx              # 修正: AI自動入力UI追加
│   ├── components/features/
│   │   └── ai-auto-fill.tsx      # 新規作成: AI自動入力コンポーネント
│   └── lib/
│       └── gemini.ts             # 新規作成: Gemini APIクライアント
└── docs/
    └── ai-auto-fill-spec.md      # このファイル
```

---

## 🔐 環境変数

**追加が必要**:

```bash
# .env.local
GEMINI_API_KEY=your_api_key_here
```

**Convexダッシュボードでも設定**:
```
Environment Variables > Add
Key: GEMINI_API_KEY
Value: your_api_key_here
```

---

## 📊 データフロー

```
1. ユーザーがURLを入力
   ↓
2. [AIで自動入力]ボタンをクリック
   ↓
3. フロントエンド: Convex Actionを呼び出し
   ↓
4. Convex Action: Gemini APIにプロンプト送信
   ↓
5. Gemini: URLを解析して情報抽出
   ↓
6. Gemini: JSON形式で返却
   ↓
7. Convex Action: データ検証・整形
   ↓
8. フロントエンド: フォームに自動入力
   ↓
9. ユーザー: 確認・修正後に投稿
```

---

## ⚠️ 制約・考慮事項

### 1. API制限
- **Gemini 1.5 Flash**: 無料枠 15 RPM (1分間に15リクエスト)
- **対策**: フロントエンドでレートリミット実装

### 2. 精度
- **期待値**: 90%以上の精度
- **対策**:
  - 信頼度スコアを表示
  - ユーザーが確認・修正可能なUI

### 3. セキュリティ
- **課題**: APIキーの保護
- **対策**:
  - Convex Actionで実行（サーバーサイド）
  - APIキーは環境変数で管理
  - クライアントには露出しない

### 4. パフォーマンス
- **目標**: 3秒以内にレスポンス
- **対策**:
  - Gemini Flash（高速モデル）使用
  - タイムアウト設定（10秒）

### 5. 対応範囲
- **Phase 1**: 食べログ、Googleマップのみ
- **理由**: 最も利用頻度が高い

---

## 🧪 テストケース

### 正常系
| # | URL | 期待結果 |
|---|-----|---------|
| 1 | 食べログURL（東京） | 店名・都道府県・駅が正しく取得される |
| 2 | GoogleマップURL（大阪） | 店名・都道府県・駅が正しく取得される |
| 3 | ぐるなびURL（福岡） | 店名・都道府県・駅が正しく取得される |

### 異常系
| # | 入力 | 期待結果 |
|---|-----|---------|
| 4 | 無効なURL | エラーメッセージ表示 |
| 5 | ラーメン店以外のURL | エラーメッセージ or 部分的に取得 |
| 6 | API障害 | エラーメッセージ + 手動入力へ誘導 |
| 7 | タイムアウト | エラーメッセージ表示 |

---

## 📈 実装ステップ（順序）

### Step 1: 環境準備 ✅
- [ ] Gemini APIキー取得
- [ ] Convexに環境変数設定
- [ ] 動作確認用の簡単なテスト

### Step 2: バックエンド実装 🔧
- [ ] `/convex/aiActions.ts` 作成
- [ ] Gemini API連携コード実装
- [ ] プロンプトエンジニアリング
- [ ] レスポンス解析・検証ロジック
- [ ] エラーハンドリング

### Step 3: フロントエンド実装 🎨
- [ ] `/src/components/features/ai-auto-fill.tsx` 作成
- [ ] URL入力フィールド
- [ ] [AIで自動入力]ボタン
- [ ] ローディング表示
- [ ] 結果プレビュー
- [ ] エラー表示

### Step 4: 統合 🔗
- [ ] 投稿ページにコンポーネント追加
- [ ] フォーム自動入力ロジック
- [ ] 状態管理の統合

### Step 5: テスト 🧪
- [ ] 単体テスト（各関数）
- [ ] 統合テスト（E2E）
- [ ] 実際のURLでの動作確認
- [ ] エラーケースの確認

### Step 6: UI/UX改善 ✨
- [ ] アニメーション追加
- [ ] フィードバック改善
- [ ] モバイル対応確認

### Step 7: デプロイ 🚀
- [ ] 本番環境にAPIキー設定
- [ ] デプロイ
- [ ] 動作確認

---

## 💰 コスト見積もり

### Gemini 1.5 Flash API
- **無料枠**: 15 RPM (1分間に15リクエスト)
- **有料**: $0.00001875 / 1000文字（入力）
- **月間想定**:
  - 1000ユーザー × 月2回 = 2000リクエスト
  - 1リクエスト約500文字 = 1,000,000文字
  - コスト: 約$0.02/月（**ほぼ無料**）

---

## 📝 備考

### 将来の拡張可能性
1. **画像からの情報抽出**（Gemini Vision）
2. **レビュー文の自動生成**
3. **類似店舗のレコメンド**
4. **メニュー価格の自動入力**

### 代替案
- **Geminiの代わりに**:
  - OpenAI GPT-4o（より高精度だが有料）
  - Claude 3.5 Sonnet（高精度）
  - スクレイピング + 正規表現（無料だが精度低）

---

## ✅ 承認

| 役割 | 名前 | 日付 | 承認 |
|-----|------|------|------|
| プロダクトオーナー | - | 2025-12-30 | ⬜️ |
| 開発者 | Claude Code | 2025-12-30 | ✅ |

---

**作成日**: 2025-12-30
**バージョン**: 1.0
**最終更新**: 2025-12-30
