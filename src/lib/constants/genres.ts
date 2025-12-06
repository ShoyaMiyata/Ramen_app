export const GENRES = [
  { code: "醤油", label: "醤油" },
  { code: "塩", label: "塩" },
  { code: "味噌", label: "味噌" },
  { code: "とんこつ", label: "とんこつ" },
  { code: "家系", label: "家系" },
  { code: "二郎系", label: "二郎系" },
  { code: "魚介", label: "魚介" },
  { code: "煮干し", label: "煮干し" },
  { code: "つけ麺", label: "つけ麺" },
  { code: "担々麺", label: "担々麺" },
  { code: "鶏白湯", label: "鶏白湯" },
  { code: "その他", label: "その他" },
] as const;

export type GenreCode = (typeof GENRES)[number]["code"];
