# Noodleインサイト - 統計ロジック説明書

このドキュメントでは、Noodleインサイトページで表示される全ての統計データの算出ロジックを詳しく説明します。

## 目次
1. [サマリー統計](#1-サマリー統計)
2. [ジャンル分析](#2-ジャンル分析)
3. [地域分析](#3-地域分析)
4. [月別推移](#4-月別推移)
5. [評価分布](#5-評価分布)
6. [人気店舗TOP10](#6-人気店舗top10)

---

## 1. サマリー統計

### 総杯数 (totalPosts)
**定義**: 全メンバーが投稿したラーメンの総数

**計算ロジック**:
```typescript
const noodles = await ctx.db.query("noodles").collect();
const totalPosts = noodles.length;
```

**説明**: `noodles`テーブルの全レコード数をカウントします。削除された投稿も含まれます（現在削除機能なし）。

---

### メンバー (totalUsers)
**定義**: アプリに登録している総ユーザー数（削除済みユーザーを除く）

**計算ロジック**:
```typescript
const users = await ctx.db.query("users").collect();
const activeUsers = users.filter((u) => !u.deletedAt);
const totalUsers = activeUsers.length;
```

**説明**:
- `users`テーブルから全ユーザーを取得
- `deletedAt`フィールドがnullのユーザーのみカウント
- アカウント削除済みのユーザーは除外されます

---

### 総店舗数 (totalShops)
**定義**: メンバーが実際に訪問して投稿した店舗の総数

**計算ロジック**:
```typescript
const noodles = await ctx.db.query("noodles").collect();
const visitedShopIds = new Set(noodles.map((n) => n.shopId));
const totalShops = visitedShopIds.size;
```

**説明**:
- 全投稿から店舗IDを抽出
- Setを使用して重複を除外
- **重要**: データベースに登録されている全店舗数ではなく、実際に投稿がある店舗のみカウント
- これにより、実際にメンバーが訪れた店舗数が正確に表示されます

---

### 制覇都道府県 (totalPrefectures)
**定義**: メンバーが訪問した店舗がある都道府県の総数

**計算ロジック**:
```typescript
const shops = await ctx.db.query("shops").collect();
const visitedShops = shops.filter((s) => visitedShopIds.has(s._id));
const prefectures = new Set(
  visitedShops.map((s) => s.prefecture).filter((p): p is string => !!p)
);
const totalPrefectures = prefectures.size;
```

**説明**:
- 投稿がある店舗のみを対象
- 各店舗の`prefecture`フィールドから都道府県を抽出
- nullや空文字を除外
- Setで重複除外してカウント

---

### 今週の一杯 (weeklyPosts)
**定義**: 過去7日間の投稿数

**計算ロジック**:
```typescript
const now = Date.now();
const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
const weeklyPosts = noodles.filter((n) =>
  (n.createdAt || n._creationTime) >= weekAgo
).length;
```

**説明**:
- 現在時刻から7日前（168時間前）を計算
- 各投稿の`createdAt`（カスタムタイムスタンプ）または`_creationTime`（Convex自動生成）を使用
- 7日以内に作成された投稿をカウント

---

### 今月の新メンバー (monthlyNewUsers)
**定義**: 過去30日間に新規登録したメンバー数

**計算ロジック**:
```typescript
const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
const monthlyNewUsers = activeUsers.filter(
  (u) => (u.createdAt || u._creationTime) >= monthAgo
).length;
```

**説明**:
- 現在時刻から30日前を計算
- 削除されていないユーザー（activeUsers）のみ対象
- 30日以内に作成されたユーザーをカウント

---

## 2. ジャンル分析

### 概要
各ラーメンジャンル（醤油、味噌、塩など）ごとの投稿数と平均評価を分析します。

### 計算ロジック
```typescript
const genreMap = new Map<
  string,
  { count: number; totalRating: number; ratedCount: number }
>();

for (const noodle of noodles) {
  for (const genre of noodle.genres) {
    const existing = genreMap.get(genre) || {
      count: 0,
      totalRating: 0,
      ratedCount: 0,
    };
    existing.count++;
    if (noodle.evaluation) {
      existing.totalRating += noodle.evaluation;
      existing.ratedCount++;
    }
    genreMap.set(genre, existing);
  }
}

const genres = Array.from(genreMap.entries())
  .map(([genre, stats]) => ({
    genre,
    postCount: stats.count,
    avgRating: stats.ratedCount > 0
      ? Math.round((stats.totalRating / stats.ratedCount) * 10) / 10
      : null,
  }))
  .sort((a, b) => b.postCount - a.postCount);
```

### 詳細説明

1. **複数ジャンル対応**:
   - 1つの投稿は複数のジャンルを持つことができます
   - 例: ["醤油", "つけ麺"] → 両方のジャンルでカウント

2. **投稿数カウント (postCount)**:
   - そのジャンルが含まれる投稿の総数
   - ジャンル複数選択の場合、それぞれにカウント

3. **平均評価 (avgRating)**:
   - 評価（1-5星）が入力されている投稿のみ対象
   - 評価なしの投稿は平均計算から除外
   - 小数点第1位まで表示（四捨五入）
   - 評価がない場合は`null`

4. **ソート順**:
   - 投稿数の多い順（降順）
   - ジャンル名でのソートではありません

### グラフ表示
- **タイプ**: 横棒グラフ（BarChart with vertical layout）
- **X軸**: 投稿数
- **Y軸**: ジャンル名
- **色**: 暖色系グラデーション（ラーメンテーマ）

---

## 3. 地域分析（TOP10）

### 概要
都道府県別の投稿数を集計し、上位10都道府県を表示します。

### 計算ロジック
```typescript
// 店舗IDから都道府県を取得するマップ
const shopPrefectureMap = new Map(
  shops.map((s) => [s._id, s.prefecture])
);

// 都道府県別に投稿数を集計
const prefectureMap = new Map<string, number>();
for (const noodle of noodles) {
  const prefecture = shopPrefectureMap.get(noodle.shopId);
  if (prefecture) {
    prefectureMap.set(
      prefecture,
      (prefectureMap.get(prefecture) || 0) + 1
    );
  }
}

// TOP10を取得
const prefectures = Array.from(prefectureMap.entries())
  .map(([prefecture, count]) => ({
    prefecture,
    prefectureName: PREFECTURE_NAMES[prefecture] || prefecture,
    postCount: count,
  }))
  .sort((a, b) => b.postCount - a.postCount)
  .slice(0, 10);
```

### 詳細説明

1. **都道府県の特定**:
   - 各投稿の`shopId`から店舗情報を参照
   - 店舗の`prefecture`フィールドを使用

2. **コード変換**:
   - データベースには`tokyo`, `osaka`などのコードで保存
   - `PREFECTURE_NAMES`マップで「東京都」「大阪府」に変換

3. **TOP10の選出**:
   - 全都道府県を投稿数でソート
   - 上位10件のみ表示
   - 同率順位は考慮されません（単純な上位10件）

4. **フィルタリング**:
   - 都道府県情報がない店舗は除外されます

### グラフ表示
- **タイプ**: 縦棒グラフ（BarChart）
- **X軸**: 都道府県名（45度傾き表示）
- **Y軸**: 投稿数
- **色**: 順位別グラデーション（1位が最も濃い）

### アクセス制御
- **麺見習い**: ロック（要5店舗訪問）
- **麺歩き以上**: 表示

---

## 4. 月別推移（過去12ヶ月）

### 概要
過去12ヶ月間の投稿数とアクティブユーザー数の推移を表示します。

### 計算ロジック
```typescript
const now = Date.now();
const twelveMonthsAgo = now - 365 * 24 * 60 * 60 * 1000;

// 過去12ヶ月分の月別データを初期化
const monthlyData = new Map<
  string,
  { postCount: number; activeUserIds: Set<string> }
>();

for (let i = 11; i >= 0; i--) {
  const date = new Date(now - i * 30 * 24 * 60 * 60 * 1000);
  const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  monthlyData.set(month, { postCount: 0, activeUserIds: new Set() });
}

// 投稿を月別に集計
for (const noodle of noodles) {
  const createdAt = noodle.createdAt || noodle._creationTime;
  if (createdAt >= twelveMonthsAgo) {
    const date = new Date(createdAt);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    const data = monthlyData.get(month);
    if (data) {
      data.postCount++;
      data.activeUserIds.add(noodle.userId);
    }
  }
}
```

### 詳細説明

1. **期間設定**:
   - 過去365日間のデータを対象
   - 30日単位で12ヶ月分に分割
   - 現在月を含む直近12ヶ月

2. **月フォーマット**:
   - `YYYY-MM`形式（例: "2025-01"）
   - ゼロパディング（1月 → "01"）

3. **投稿数 (postCount)**:
   - その月に作成された投稿の総数

4. **アクティブユーザー数 (activeUserCount)**:
   - その月に1回以上投稿したユニークユーザー数
   - Setで重複除外（同じユーザーが複数回投稿しても1人とカウント）

5. **データの欠損**:
   - 投稿がない月も0件として表示
   - グラフの連続性を保証

### グラフ表示
- **タイプ**: 折れ線グラフ（LineChart）
- **X軸**: 月（MM月形式）
- **左Y軸**: 投稿数（オレンジ）
- **右Y軸**: アクティブユーザー数（レッド）
- **期間**: 時系列順（古い月から新しい月へ）

### アクセス制御
- **麺見習い**: ロック（要5店舗訪問）
- **麺歩き以上**: 表示

---

## 5. 評価分布

### 概要
1-5星の評価別に投稿数を集計し、円グラフで分布を表示します。

### 計算ロジック
```typescript
// 1-5星の枠を初期化
const ratingMap = new Map<number, number>();
for (let i = 1; i <= 5; i++) {
  ratingMap.set(i, 0);
}

// 評価をカウント
for (const noodle of noodles) {
  if (noodle.evaluation) {
    const rating = Math.round(noodle.evaluation);
    if (rating >= 1 && rating <= 5) {
      ratingMap.set(rating, (ratingMap.get(rating) || 0) + 1);
    }
  }
}

const distribution = Array.from(ratingMap.entries())
  .map(([rating, count]) => ({ rating, count }))
  .sort((a, b) => a.rating - b.rating);
```

### 詳細説明

1. **評価の丸め**:
   - `Math.round()`で最も近い整数に丸める
   - 3.4 → 3星、3.5 → 4星、3.6 → 4星

2. **評価なし投稿の扱い**:
   - `evaluation`がnullまたは未定義の投稿は除外
   - 円グラフには表示されません
   - 評価数 ≠ 総投稿数の理由

3. **全評価の表示**:
   - 投稿が0件でも1-5星すべての枠を表示
   - データなしの星は0杯として表示

4. **ソート順**:
   - 1星から5星へ昇順

### グラフ表示
- **タイプ**: 円グラフ（PieChart）
- **色**: 評価が高いほど濃い色（5星が最も濃い暖色）
- **ラベル**: 5%以上のセグメントにパーセンテージ表示
- **凡例**: 各星の投稿数を表示

### アクセス制御
- **麺見習い**: ロック（要5店舗訪問）
- **麺歩き以上**: 表示

---

## 6. 人気店舗TOP10

### 概要
投稿数が多い店舗をランキング形式で表示します。同率順位に対応した公平なランキングシステムです。

### 計算ロジック
```typescript
// 店舗別に投稿数を集計
const shopPostCount = new Map<string, number>();
for (const noodle of noodles) {
  shopPostCount.set(
    noodle.shopId,
    (shopPostCount.get(noodle.shopId) || 0) + 1
  );
}

// 投稿数でソート
const sortedShops = Array.from(shopPostCount.entries())
  .map(([shopId, count]) => {
    const shop = shopMap.get(shopId);
    return {
      shop: {
        _id: shop._id,
        name: shop.name,
        address: shop.address,
        url: shop.url,
        prefecture: shop.prefecture,
        station: shop.station,
      },
      postCount: count,
    };
  })
  .sort((a, b) => b.postCount - a.postCount);

// 同率順位を計算
const shopsWithRank = [];
let currentRank = 1;
let prevCount: number | null = null;

for (let i = 0; i < sortedShops.length; i++) {
  const item = sortedShops[i];

  // 投稿数が変わったら順位を更新
  if (prevCount !== null && item.postCount < prevCount) {
    currentRank = i + 1;
  }

  shopsWithRank.push({
    ...item,
    rank: currentRank,
  });

  prevCount = item.postCount;

  // 10位以降の店舗は除外（ただし10位と同率の店舗は含める）
  if (currentRank > 10) break;
}
```

### 詳細説明

1. **投稿数カウント**:
   - 各店舗の`shopId`ごとに投稿数を集計
   - 同じ店舗への複数回訪問もすべてカウント

2. **同率順位ロジック（重要）**:
   - **原則**: 同じ投稿数の店舗は同じ順位
   - **次順位**: 投稿数が変わった時点での配列位置

   **例1**: 10杯が3店舗、8杯が2店舗の場合
   ```
   店舗A: 10杯 → 1位
   店舗B: 10杯 → 1位
   店舗C: 10杯 → 1位
   店舗D: 8杯  → 4位（2位・3位は飛ばす）
   店舗E: 8杯  → 4位
   ```

   **例2**: 順位の連続性
   ```
   店舗A: 15杯 → 1位
   店舗B: 12杯 → 2位
   店舗C: 12杯 → 2位
   店舗D: 10杯 → 4位
   店舗E: 9杯  → 5位
   ```

3. **TOP10の定義**:
   - 「10位まで」ではなく「10位以内」
   - 10位と同率の店舗はすべて含む
   - 実際には10店舗以上表示される可能性あり

4. **店舗情報**:
   - 店舗名、住所、URL、都道府県、最寄り駅を含む
   - 駅情報がない場合は表示されません

### 表示スタイル

1. **順位バッジ**:
   - 1位: 金色背景 + 白文字
   - 2位: 銀色背景 + グレー文字
   - 3位: 銅色背景 + 白文字
   - 4位以降: グレー背景 + グレー文字

2. **背景色**:
   - 1位: 淡い黄色
   - 2位: 淡いグレー
   - 3位: 淡い琥珀色
   - 4位以降: 白

3. **ホバー効果**:
   - マウスオーバーで背景色変化
   - 1.02倍に拡大

### インフォメーションツールチップ
タイトル横のインフォメーションアイコンにマウスを乗せると、ランキングロジックの説明が表示されます:

> 投稿数が多い順にランキング。同じ投稿数の店舗は同じ順位となり、次の順位は投稿数が変わった時点での位置になります。（例：1位が3店舗ある場合、次は4位）

### アクセス制御
- **麺見習い**: ロック（要5店舗訪問）
- **麺歩き以上**: 表示

---

## データソース

### 使用テーブル
- **noodles**: 投稿データ（ラーメン記録）
- **users**: ユーザーデータ
- **shops**: 店舗データ

### タイムスタンプ
全ての時系列計算で以下のフォールバック機能を使用:
```typescript
createdAt || _creationTime
```
- `createdAt`: カスタムタイムスタンプ（アプリ独自）
- `_creationTime`: Convex自動生成タイムスタンプ（バックアップ）

### 都道府県コード
データベース内部コード → 表示名変換:
```typescript
const PREFECTURE_NAMES: Record<string, string> = {
  tokyo: "東京都",
  osaka: "大阪府",
  hokkaido: "北海道",
  // ... 全47都道府県
}
```

---

## アクセス制御システム

### ランクシステム
1. **麺見習い（Rank 1）**: 0-4店舗訪問
2. **麺歩き（Rank 2）**: 5-9店舗訪問
3. **麺職人（Rank 3）**: 10-19店舗訪問
4. **麺マスター（Rank 4）**: 20-49店舗訪問
5. **麺伝説（Rank 5）**: 50店舗以上訪問

### 機能制限
| 機能 | 麺見習い | 麺歩き以上 |
|------|----------|------------|
| サマリー統計 | ✓ | ✓ |
| ジャンル分析 | ✓ | ✓ |
| 地域分析 | ✗ | ✓ |
| 月別推移 | ✗ | ✓ |
| 評価分布 | ✗ | ✓ |
| 人気店舗 | ✗ | ✓ |

### ロック画面
制限された機能にはぼかし効果とロックアイコンが表示され、必要な条件が明示されます。

---

## パフォーマンス最適化

### クエリ戦略
1. **並列フェッチ**: 6つの統計クエリを同時実行
2. **キャッシング**: Convexのリアクティブキャッシュを活用
3. **インデックス**: userId, shopIdにインデックス使用

### データ構造
- **Map**: O(1)検索でパフォーマンス向上
- **Set**: 重複除外とユニーク性確保
- **配列ソート**: 必要最小限のデータのみソート

---

## まとめ

Noodleインサイトは、全メンバーのラーメン記録を多角的に分析し、コミュニティ全体のトレンドを可視化します。

### 主要な設計思想
1. **公平性**: 同率順位の適切な扱い
2. **正確性**: 実データのみカウント（訪問済み店舗など）
3. **リアルタイム性**: Convexリアクティブクエリ
4. **直感性**: ビジュアルで分かりやすい統計表示
5. **ゲーミフィケーション**: ランクシステムで機能解放

すべての統計は、メンバーのラーメン探求のモチベーション向上と、コミュニティの活性化を目的としています。
