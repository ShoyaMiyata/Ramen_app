# インサイトページ グラフコンポーネント

インサイトページ用のグラフコンポーネント集です。rechartsを使用した6つのビジュアライゼーションコンポーネントを提供します。

## 📁 コンポーネント一覧

### 1. GenreBarChart
**ジャンル別投稿数を横棒グラフで表示**

```tsx
import { GenreBarChart } from "@/components/features/insights";

<GenreBarChart
  data={[
    { genre: "醤油", count: 150, averageRating: 4.2 },
    { genre: "味噌", count: 120, averageRating: 4.5 },
    // ...
  ]}
/>
```

**特徴**:
- 横棒グラフ（投稿数が多い順にソート）
- 各ジャンルに異なる暖色系カラー
- ホバーでツールチップ表示
- レスポンシブ対応（高さ400px）

---

### 2. GenreRatingChart
**ジャンル別平均評価を縦棒グラフで表示**

```tsx
import { GenreRatingChart } from "@/components/features/insights";

<GenreRatingChart
  data={[
    { genre: "醤油", count: 150, averageRating: 4.2 },
    { genre: "味噌", count: 120, averageRating: 4.5 },
    // ...
  ]}
/>
```

**特徴**:
- 縦棒グラフ（平均評価が高い順にソート）
- Y軸は0-5の評価スケール
- X軸ラベルは45度回転で見やすく配置
- ツールチップに投稿数も表示

---

### 3. PrefectureBarChart
**都道府県別投稿数TOP10を縦棒グラフで表示**

```tsx
import { PrefectureBarChart } from "@/components/features/insights";

<PrefectureBarChart
  data={[
    { prefecture: "東京都", count: 500 },
    { prefecture: "大阪府", count: 350 },
    // ...
  ]}
/>
```

**特徴**:
- 縦棒グラフ（投稿数が多い順にソート、TOP10のみ表示）
- 1位から10位まで異なるカラー（暖色系グラデーション）
- X軸ラベルは45度回転
- 自動的にTOP10を抽出

---

### 4. MonthlyTrendChart
**月別推移を2本の折れ線グラフで表示**

```tsx
import { MonthlyTrendChart } from "@/components/features/insights";

<MonthlyTrendChart
  data={[
    { month: "2024-01", postCount: 100, activeUserCount: 25 },
    { month: "2024-02", postCount: 120, activeUserCount: 30 },
    // ...
  ]}
/>
```

**特徴**:
- デュアル折れ線グラフ（投稿数とアクティブユーザー数）
- 左Y軸: 投稿数（オレンジ）、右Y軸: アクティブユーザー数（レッド）
- X軸は「MM月」形式で表示
- カスタムレジェンド付き

---

### 5. RatingPieChart
**評価分布を円グラフで表示**

```tsx
import { RatingPieChart } from "@/components/features/insights";

<RatingPieChart
  data={[
    { rating: 1, count: 5 },
    { rating: 2, count: 10 },
    { rating: 3, count: 30 },
    { rating: 4, count: 80 },
    { rating: 5, count: 120 },
  ]}
/>
```

**特徴**:
- 円グラフで評価分布を視覚化
- 各セクションにパーセンテージラベル表示（5%以上の場合）
- 評価が高いほど濃い暖色（★1:ライトレッド → ★5:オレンジ）
- カスタムレジェンドに投稿数も表示

---

### 6. TopShopsList
**人気店舗TOP10をカードリストで表示**

```tsx
import { TopShopsList } from "@/components/features/insights";

<TopShopsList
  data={[
    {
      _id: "shop1",
      name: "○○ラーメン",
      station: "渋谷駅",
      prefecture: "東京都",
      postCount: 45,
      averageRating: 4.5,
    },
    // ...
  ]}
/>
```

**特徴**:
- カードリスト形式（グラフではない）
- 1-3位はメダル風のデザイン（金・銀・銅）
- ホバーエフェクト（拡大＋影）
- 投稿数と平均評価をアイコン付きで表示
- 空データ時のメッセージ表示

---

## 🎨 デザイン仕様

### カラーパレット
プロジェクト全体のラーメンテーマに合わせた暖色系カラーを使用：

```typescript
const COLORS = [
  "#F97316", // オレンジ（メインカラー）
  "#EA580C", // ダークオレンジ
  "#FB923C", // ライトオレンジ
  "#EF4444", // レッド
  "#F59E0B", // アンバー
  "#FBBF24", // イエロー
  "#FCA5A5", // ライトレッド
  "#FDE047", // ライトイエロー
];
```

### レスポンシブ対応
- 全コンポーネントは`ResponsiveContainer`でラップ
- 幅は親要素の100%に自動調整
- 高さは400pxに統一（TopShopsListは可変）

### アニメーション
- recharts標準のアニメーション（800ms）
- ホバーエフェクト
- TopShopsListのカードはhover時に拡大

### アクセシビリティ
- カスタムツールチップでデータの詳細情報を提供
- カラーだけでなく、数値やラベルでも情報を伝達
- セマンティックなHTML構造

---

## 📦 型定義

### GenreStats
```typescript
interface GenreStats {
  genre: string;          // ジャンル名
  count: number;          // 投稿数
  averageRating: number;  // 平均評価
}
```

### PrefectureStats
```typescript
interface PrefectureStats {
  prefecture: string;  // 都道府県名
  count: number;       // 投稿数
}
```

### MonthlyTrend
```typescript
interface MonthlyTrend {
  month: string;           // "YYYY-MM" format
  postCount: number;       // 投稿数
  activeUserCount: number; // アクティブユーザー数
}
```

### RatingDistribution
```typescript
interface RatingDistribution {
  rating: number;  // 1-5
  count: number;   // 投稿数
}
```

### TopShop
```typescript
interface TopShop {
  _id: string;           // 店舗ID
  name: string;          // 店舗名
  station?: string;      // 駅名（オプション）
  prefecture?: string;   // 都道府県名（オプション）
  postCount: number;     // 投稿数
  averageRating: number; // 平均評価
}
```

---

## 🔧 技術スタック

- **recharts**: グラフライブラリ（3.5.1）
- **lucide-react**: アイコン
- **TypeScript**: 型安全性
- **Tailwind CSS**: スタイリング

---

## 📝 使用例

```tsx
"use client";

import {
  GenreBarChart,
  GenreRatingChart,
  PrefectureBarChart,
  MonthlyTrendChart,
  RatingPieChart,
  TopShopsList,
} from "@/components/features/insights";

export default function InsightsPage() {
  // Convexクエリでデータ取得（実装はAgent-Backendが担当）
  const genreStats = useQuery(api.insights.getGenreStats);
  const prefectureStats = useQuery(api.insights.getPrefectureStats);
  // ...

  return (
    <div className="space-y-8">
      {/* ジャンル分析セクション */}
      <section>
        <h2 className="text-2xl font-bold mb-4">ジャンル分析</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">投稿数ランキング</h3>
            <GenreBarChart data={genreStats || []} />
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">平均評価ランキング</h3>
            <GenreRatingChart data={genreStats || []} />
          </div>
        </div>
      </section>

      {/* 地域分析セクション */}
      <section>
        <h2 className="text-2xl font-bold mb-4">地域分析</h2>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">都道府県TOP10</h3>
          <PrefectureBarChart data={prefectureStats || []} />
        </div>
      </section>

      {/* 時系列分析セクション */}
      <section>
        <h2 className="text-2xl font-bold mb-4">時系列分析</h2>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">月別推移</h3>
          <MonthlyTrendChart data={monthlyTrends || []} />
        </div>
      </section>

      {/* 評価分布と人気店舗 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">評価と人気店舗</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">評価分布</h3>
            <RatingPieChart data={ratingDistribution || []} />
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">人気店舗TOP10</h3>
            <TopShopsList data={topShops || []} />
          </div>
        </div>
      </section>
    </div>
  );
}
```

---

## ⚠️ 注意事項

1. **型定義**: 現在の型定義（`types.ts`）は一時的なモック型です。`convex/insights.ts`のバックエンド実装完了後、そちらの型定義に置き換えてください。

2. **データの前処理**: 各コンポーネント内で自動的にソートやフィルタリングを行いますが、大量データの場合はバックエンド側でソート済みデータを提供することを推奨します。

3. **エラーハンドリング**: 空データの場合の表示はTopShopsListのみ実装済みです。他のコンポーネントでも必要に応じてエラー表示を追加してください。

4. **パフォーマンス**: rechartsはアニメーションを使用するため、大量データの場合はパフォーマンスに注意してください。

---

## 🔄 今後の改善案

- [ ] ローディング状態の統一的な処理
- [ ] エラー状態の表示
- [ ] データがない場合の空状態デザイン
- [ ] エクスポート機能（PNG/CSV）
- [ ] カラーテーマのカスタマイズ対応
- [ ] モバイル表示の最適化（グラフサイズ調整）
