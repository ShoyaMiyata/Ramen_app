/**
 * 駅名マスタデータ
 * 主要な駅を都道府県別に定義
 */

export interface Station {
  code: string; // "tokyo-shibuya"
  name: string; // "渋谷"
  prefecture: string; // "tokyo"
  line?: string; // "JR山手線、東急東横線など"
}

export const STATIONS: Station[] = [
  // 東京都 (tokyo)
  { code: "tokyo-tokyo", name: "東京", prefecture: "tokyo", line: "JR各線、東京メトロ丸ノ内線" },
  { code: "tokyo-shibuya", name: "渋谷", prefecture: "tokyo", line: "JR山手線、東急東横線など" },
  { code: "tokyo-shinjuku", name: "新宿", prefecture: "tokyo", line: "JR各線、小田急線など" },
  { code: "tokyo-ikebukuro", name: "池袋", prefecture: "tokyo", line: "JR山手線、東武東上線など" },
  { code: "tokyo-shinagawa", name: "品川", prefecture: "tokyo", line: "JR各線、京急線" },
  { code: "tokyo-ueno", name: "上野", prefecture: "tokyo", line: "JR各線、東京メトロ" },
  { code: "tokyo-akihabara", name: "秋葉原", prefecture: "tokyo", line: "JR各線、東京メトロ" },
  { code: "tokyo-roppongi", name: "六本木", prefecture: "tokyo", line: "東京メトロ日比谷線・大江戸線" },
  { code: "tokyo-ebisu", name: "恵比寿", prefecture: "tokyo", line: "JR山手線、東京メトロ日比谷線" },
  { code: "tokyo-meguro", name: "目黒", prefecture: "tokyo", line: "JR山手線、東急目黒線など" },
  { code: "tokyo-nakano", name: "中野", prefecture: "tokyo", line: "JR中央線" },
  { code: "tokyo-kichijoji", name: "吉祥寺", prefecture: "tokyo", line: "JR中央線" },
  { code: "tokyo-machida", name: "町田", prefecture: "tokyo", line: "JR横浜線、小田急線" },
  { code: "tokyo-tachikawa", name: "立川", prefecture: "tokyo", line: "JR中央線" },

  // 神奈川県 (kanagawa)
  { code: "kanagawa-yokohama", name: "横浜", prefecture: "kanagawa", line: "JR各線、東急東横線など" },
  { code: "kanagawa-kawasaki", name: "川崎", prefecture: "kanagawa", line: "JR各線" },
  { code: "kanagawa-kannai", name: "関内", prefecture: "kanagawa", line: "JR根岸線" },
  { code: "kanagawa-shin-yokohama", name: "新横浜", prefecture: "kanagawa", line: "JR横浜線、新幹線" },
  { code: "kanagawa-fujisawa", name: "藤沢", prefecture: "kanagawa", line: "JR東海道線、小田急江ノ島線" },

  // 大阪府 (osaka)
  { code: "osaka-umeda", name: "梅田", prefecture: "osaka", line: "JR大阪駅、阪急・阪神各線" },
  { code: "osaka-namba", name: "難波", prefecture: "osaka", line: "南海線、近鉄線" },
  { code: "osaka-tennoji", name: "天王寺", prefecture: "osaka", line: "JR各線、地下鉄" },
  { code: "osaka-shin-osaka", name: "新大阪", prefecture: "osaka", line: "JR各線、新幹線" },
  { code: "osaka-honmachi", name: "本町", prefecture: "osaka", line: "地下鉄御堂筋線" },

  // 京都府 (kyoto)
  { code: "kyoto-kyoto", name: "京都", prefecture: "kyoto", line: "JR各線、近鉄線、地下鉄" },
  { code: "kyoto-kawaramachi", name: "河原町", prefecture: "kyoto", line: "阪急京都線" },
  { code: "kyoto-gion-shijo", name: "祇園四条", prefecture: "kyoto", line: "京阪本線" },

  // 兵庫県 (hyogo)
  { code: "hyogo-sannomiya", name: "三宮", prefecture: "hyogo", line: "JR、阪急、阪神各線" },
  { code: "hyogo-kobe", name: "神戸", prefecture: "hyogo", line: "JR各線" },
  { code: "hyogo-himeji", name: "姫路", prefecture: "hyogo", line: "JR各線、新幹線" },

  // 愛知県 (aichi)
  { code: "aichi-nagoya", name: "名古屋", prefecture: "aichi", line: "JR各線、名鉄線、近鉄線" },
  { code: "aichi-sakae", name: "栄", prefecture: "aichi", line: "地下鉄東山線・名城線" },
  { code: "aichi-kanayama", name: "金山", prefecture: "aichi", line: "JR各線、名鉄線" },

  // 北海道 (hokkaido)
  { code: "hokkaido-sapporo", name: "札幌", prefecture: "hokkaido", line: "JR各線、地下鉄" },
  { code: "hokkaido-susukino", name: "すすきの", prefecture: "hokkaido", line: "地下鉄南北線" },

  // 福岡県 (fukuoka)
  { code: "fukuoka-hakata", name: "博多", prefecture: "fukuoka", line: "JR各線、新幹線、地下鉄" },
  { code: "fukuoka-tenjin", name: "天神", prefecture: "fukuoka", line: "地下鉄空港線" },

  // 宮城県 (miyagi)
  { code: "miyagi-sendai", name: "仙台", prefecture: "miyagi", line: "JR各線、新幹線、地下鉄" },

  // 広島県 (hiroshima)
  { code: "hiroshima-hiroshima", name: "広島", prefecture: "hiroshima", line: "JR各線、新幹線" },

  // 埼玉県 (saitama)
  { code: "saitama-omiya", name: "大宮", prefecture: "saitama", line: "JR各線、新幹線" },
  { code: "saitama-kawagoe", name: "川越", prefecture: "saitama", line: "JR川越線、東武東上線" },

  // 千葉県 (chiba)
  { code: "chiba-chiba", name: "千葉", prefecture: "chiba", line: "JR各線、千葉都市モノレール" },
  { code: "chiba-funabashi", name: "船橋", prefecture: "chiba", line: "JR総武線" },
  { code: "chiba-kashiwa", name: "柏", prefecture: "chiba", line: "JR常磐線" },
];

/**
 * 駅名で検索（部分一致）
 */
export function searchStations(query: string): Station[] {
  if (!query || query.length === 0) {
    return STATIONS.slice(0, 20); // デフォルトで主要20駅を返す
  }

  const queryLower = query.toLowerCase();
  return STATIONS.filter((station) =>
    station.name.toLowerCase().includes(queryLower) ||
    station.line?.toLowerCase().includes(queryLower)
  ).slice(0, 20);
}

/**
 * 都道府県で絞り込み
 */
export function getStationsByPrefecture(prefecture: string): Station[] {
  return STATIONS.filter((station) => station.prefecture === prefecture);
}
