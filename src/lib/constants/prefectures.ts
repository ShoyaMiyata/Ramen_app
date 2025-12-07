// 地方区分
export const REGIONS = [
  { code: "hokkaido", name: "北海道" },
  { code: "tohoku", name: "東北" },
  { code: "kanto", name: "関東" },
  { code: "chubu", name: "中部" },
  { code: "kinki", name: "近畿" },
  { code: "chugoku", name: "中国" },
  { code: "shikoku", name: "四国" },
  { code: "kyushu", name: "九州・沖縄" },
] as const;

export type RegionCode = (typeof REGIONS)[number]["code"];

// 47都道府県
export const PREFECTURES = [
  // 北海道
  { code: "hokkaido", name: "北海道", region: "hokkaido", symbol: "雪の結晶", colors: ["#4ECDC4", "#1A535C"] },
  // 東北
  { code: "aomori", name: "青森県", region: "tohoku", symbol: "りんご", colors: ["#FF6B6B", "#C92A2A"] },
  { code: "iwate", name: "岩手県", region: "tohoku", symbol: "わんこそば", colors: ["#845EF7", "#5F3DC4"] },
  { code: "miyagi", name: "宮城県", region: "tohoku", symbol: "伊達政宗の兜", colors: ["#339AF0", "#1864AB"] },
  { code: "akita", name: "秋田県", region: "tohoku", symbol: "なまはげ", colors: ["#F06595", "#C2255C"] },
  { code: "yamagata", name: "山形県", region: "tohoku", symbol: "さくらんぼ", colors: ["#FF8787", "#E03131"] },
  { code: "fukushima", name: "福島県", region: "tohoku", symbol: "赤べこ", colors: ["#FA5252", "#C92A2A"] },
  // 関東
  { code: "ibaraki", name: "茨城県", region: "kanto", symbol: "納豆", colors: ["#BE4BDB", "#9C36B5"] },
  { code: "tochigi", name: "栃木県", region: "kanto", symbol: "いちご", colors: ["#FF6B6B", "#FA5252"] },
  { code: "gunma", name: "群馬県", region: "kanto", symbol: "だるま", colors: ["#FF922B", "#E8590C"] },
  { code: "saitama", name: "埼玉県", region: "kanto", symbol: "草加せんべい", colors: ["#FFD43B", "#F59F00"] },
  { code: "chiba", name: "千葉県", region: "kanto", symbol: "落花生", colors: ["#94D82D", "#66A80F"] },
  { code: "tokyo", name: "東京都", region: "kanto", symbol: "東京タワー", colors: ["#FF6B6B", "#FA5252"] },
  { code: "kanagawa", name: "神奈川県", region: "kanto", symbol: "赤レンガ倉庫", colors: ["#339AF0", "#1C7ED6"] },
  // 中部
  { code: "niigata", name: "新潟県", region: "chubu", symbol: "米・稲穂", colors: ["#8CE99A", "#51CF66"] },
  { code: "toyama", name: "富山県", region: "chubu", symbol: "ホタルイカ", colors: ["#74C0FC", "#4DABF7"] },
  { code: "ishikawa", name: "石川県", region: "chubu", symbol: "金箔", colors: ["#FFD43B", "#FAB005"] },
  { code: "fukui", name: "福井県", region: "chubu", symbol: "恐竜", colors: ["#69DB7C", "#40C057"] },
  { code: "yamanashi", name: "山梨県", region: "chubu", symbol: "ぶどう", colors: ["#B197FC", "#9775FA"] },
  { code: "nagano", name: "長野県", region: "chubu", symbol: "りんご・山", colors: ["#FF8787", "#4ECDC4"] },
  { code: "gifu", name: "岐阜県", region: "chubu", symbol: "白川郷", colors: ["#63E6BE", "#38D9A9"] },
  { code: "shizuoka", name: "静岡県", region: "chubu", symbol: "富士山・お茶", colors: ["#74C0FC", "#69DB7C"] },
  { code: "aichi", name: "愛知県", region: "chubu", symbol: "しゃちほこ", colors: ["#FFD43B", "#F59F00"] },
  // 近畿
  { code: "mie", name: "三重県", region: "kinki", symbol: "伊勢海老", colors: ["#FF8787", "#FA5252"] },
  { code: "shiga", name: "滋賀県", region: "kinki", symbol: "琵琶湖", colors: ["#74C0FC", "#339AF0"] },
  { code: "kyoto", name: "京都府", region: "kinki", symbol: "五重塔", colors: ["#E599F7", "#BE4BDB"] },
  { code: "osaka", name: "大阪府", region: "kinki", symbol: "たこ焼き", colors: ["#FF922B", "#FD7E14"] },
  { code: "hyogo", name: "兵庫県", region: "kinki", symbol: "神戸牛", colors: ["#E8590C", "#D9480F"] },
  { code: "nara", name: "奈良県", region: "kinki", symbol: "鹿", colors: ["#94D82D", "#74B816"] },
  { code: "wakayama", name: "和歌山県", region: "kinki", symbol: "みかん", colors: ["#FF922B", "#FD7E14"] },
  // 中国
  { code: "tottori", name: "鳥取県", region: "chugoku", symbol: "砂丘", colors: ["#F8E3A3", "#E9ECEF"] },
  { code: "shimane", name: "島根県", region: "chugoku", symbol: "出雲大社", colors: ["#E599F7", "#DA77F2"] },
  { code: "okayama", name: "岡山県", region: "chugoku", symbol: "桃太郎", colors: ["#FFC9C9", "#FF8787"] },
  { code: "hiroshima", name: "広島県", region: "chugoku", symbol: "もみじ饅頭", colors: ["#FF6B6B", "#FA5252"] },
  { code: "yamaguchi", name: "山口県", region: "chugoku", symbol: "ふぐ", colors: ["#74C0FC", "#4DABF7"] },
  // 四国
  { code: "tokushima", name: "徳島県", region: "shikoku", symbol: "阿波踊り", colors: ["#F783AC", "#E64980"] },
  { code: "kagawa", name: "香川県", region: "shikoku", symbol: "うどん", colors: ["#FFE066", "#FFD43B"] },
  { code: "ehime", name: "愛媛県", region: "shikoku", symbol: "みかん", colors: ["#FF922B", "#FD7E14"] },
  { code: "kochi", name: "高知県", region: "shikoku", symbol: "カツオ", colors: ["#339AF0", "#1C7ED6"] },
  // 九州・沖縄
  { code: "fukuoka", name: "福岡県", region: "kyushu", symbol: "明太子", colors: ["#FF6B6B", "#FA5252"] },
  { code: "saga", name: "佐賀県", region: "kyushu", symbol: "有田焼", colors: ["#339AF0", "#74C0FC"] },
  { code: "nagasaki", name: "長崎県", region: "kyushu", symbol: "カステラ", colors: ["#FFD43B", "#FCC419"] },
  { code: "kumamoto", name: "熊本県", region: "kyushu", symbol: "くまモン", colors: ["#212529", "#FF6B6B"] },
  { code: "oita", name: "大分県", region: "kyushu", symbol: "温泉", colors: ["#74C0FC", "#ADB5BD"] },
  { code: "miyazaki", name: "宮崎県", region: "kyushu", symbol: "マンゴー", colors: ["#FF922B", "#FF8787"] },
  { code: "kagoshima", name: "鹿児島県", region: "kyushu", symbol: "桜島", colors: ["#868E96", "#495057"] },
  { code: "okinawa", name: "沖縄県", region: "kyushu", symbol: "シーサー", colors: ["#20C997", "#12B886"] },
] as const;

export type PrefectureCode = (typeof PREFECTURES)[number]["code"];

// バッジティア
export const BADGE_TIERS = {
  bronze: { name: "銅", requiredVisits: 1, color: "#CD7F32" },
  silver: { name: "銀", requiredVisits: 5, color: "#C0C0C0" },
  gold: { name: "金", requiredVisits: 10, color: "#FFD700" },
} as const;

export type BadgeTier = keyof typeof BADGE_TIERS;

// ヘルパー関数
export function getPrefectureByCode(code: string) {
  return PREFECTURES.find((p) => p.code === code);
}

export function getPrefecturesByRegion(regionCode: RegionCode) {
  return PREFECTURES.filter((p) => p.region === regionCode);
}

export function getRegionByCode(code: string) {
  return REGIONS.find((r) => r.code === code);
}

export function getTierByVisitCount(count: number): BadgeTier | null {
  if (count >= BADGE_TIERS.gold.requiredVisits) return "gold";
  if (count >= BADGE_TIERS.silver.requiredVisits) return "silver";
  if (count >= BADGE_TIERS.bronze.requiredVisits) return "bronze";
  return null;
}

// 地方別にグループ化した都道府県リスト
export function getPrefecturesGroupedByRegion() {
  return REGIONS.map((region) => ({
    ...region,
    prefectures: getPrefecturesByRegion(region.code),
  }));
}
