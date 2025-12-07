"use client";

import { BADGE_TIERS, type PrefectureCode } from "@/lib/constants/prefectures";

interface JapanMapSVGProps {
  prefectureData: Record<string, { tier: "bronze" | "silver" | "gold" | null; visitCount: number }>;
  onPrefectureClick?: (code: PrefectureCode) => void;
  className?: string;
}

// 未訪問色
const UNVISITED_COLOR = "#E9ECEF";

function getPrefectureColor(tier: "bronze" | "silver" | "gold" | null): string {
  if (!tier) return UNVISITED_COLOR;
  return BADGE_TIERS[tier].color;
}

export function JapanMapSVG({ prefectureData, onPrefectureClick, className }: JapanMapSVGProps) {
  const getColor = (code: string) => {
    const data = prefectureData[code];
    return getPrefectureColor(data?.tier || null);
  };

  const handleClick = (code: string) => {
    if (onPrefectureClick) {
      onPrefectureClick(code as PrefectureCode);
    }
  };

  // 共通のパススタイル
  const pathStyle = (code: string) => ({
    fill: getColor(code),
    stroke: "#ffffff",
    strokeWidth: 1,
    cursor: onPrefectureClick ? "pointer" : "default",
    transition: "fill 0.2s ease, opacity 0.2s ease",
  });

  const hoverProps = onPrefectureClick ? {
    onMouseEnter: (e: React.MouseEvent<SVGPathElement>) => {
      e.currentTarget.style.opacity = "0.8";
    },
    onMouseLeave: (e: React.MouseEvent<SVGPathElement>) => {
      e.currentTarget.style.opacity = "1";
    },
  } : {};

  return (
    <svg
      viewBox="0 0 1000 1200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 北海道 */}
      <path
        id="hokkaido"
        d="M783.2,167.5l-12.6-5.4l-9.3,3.4l-7.8-4.8l-0.5-8.3l7.3-7.3l-2.9-5.4l5.9-9.3l-1.5-5.9l5.9-4.4
        l-1-8.3l4.9-7.3l-2.4-12.7l8.8-2.4l4.4,4.9l8.3-2l2.4-10.2l9.3,0.5l2.9,5.4l10.7-1l5.4,8.8l9.8-1.5l12.2,5.9l8.8,13.7l-2,10.7
        l3.9,8.8l-5.4,12.2l-2.9,16.1l-12.7,8.3l-6.8,14.2l-16.6,8.8l-20,0.5l-8.8,5.9l-13.2-1.5l-5.4-10.2l3.4-9.8l6.4,2.4l4.9-6.4
        l-2.9-8.3l8.3-2.4l5.4,6.8l7.8-7.8L783.2,167.5z
        M849.5,93.7l8.3,5.9l-1,10.2l-13.2,1l-3.4-9.8l-5.4,2l-2.9-8.8l9.3-4.4L849.5,93.7z
        M855.9,60.2l3.9,10.2l-11.7,3.4l-1-11.2l-7.8,3.4l-8.8-9.3l9.8-7.8l10.2,5.4L855.9,60.2z"
        style={pathStyle("hokkaido")}
        onClick={() => handleClick("hokkaido")}
        {...hoverProps}
      />

      {/* 青森 */}
      <path
        id="aomori"
        d="M761.7,243.9l-2.4-12.7l-8.8,2l-2.4-12.7l9.3-2.9l-1-16.1l-15.1-2.4l-8.8,4.9l-13.2-3.4l-1-8.3l-10.2,5.4
        l-10.7-2.4l2-9.3l-12.2,4.9l-3.9,9.8l-9.8,0l1.5,11.7l9.8,3.4l-2,6.4l6.4,4.4l-3.4,7.8l4.4,2.4l2.4,10.7l10.2-5.4l8.3,2
        l7.8-8.3l5.4,5.4l9.8,1l-1,8.8l7.8-1l3.9,8.3l9.8-1.5L761.7,243.9z"
        style={pathStyle("aomori")}
        onClick={() => handleClick("aomori")}
        {...hoverProps}
      />

      {/* 岩手 */}
      <path
        id="iwate"
        d="M761.7,243.9l2.4,7.8l-3.4,14.6l2,8.8l-3.4,10.7l-7.3,10.2l0.5,11.2l-7.3,15.6l-1.5,10.7l-11.2,1.5l-3.4-5.4
        l-10.7,2l-2-5.9l-9.8,0.5l-1-15.1l-6.8-2.9l3.4-13.2l-7.3-14.1l5.4-7.3l-0.5-11.2l7.8-9.3l10.2,1l5.9-7.8l10.7,1l2-9.8l7.8,1.5
        l-1-8.8l9.8-1l-5.4-5.4l7.8-8.3l-8.3-2l10.2-5.4l-2.4-10.7l7.8,1.5l3.9,8.3l9.8-1.5l-2.4,11.2l9.8-2l2.4,12.7L761.7,243.9z"
        style={pathStyle("iwate")}
        onClick={() => handleClick("iwate")}
        {...hoverProps}
      />

      {/* 宮城 */}
      <path
        id="miyagi"
        d="M730.8,329.5l11.2-1.5l1.5-10.7l7.3-15.6l-0.5-11.2l9.8,4.4l7.8,16.1l-8.3,2l3.4,9.3l-5.4,4.9l5.9,4.4
        l-3.9,12.7l-10.2-0.5l-3.4,6.8l-10.2-1l-0.5-10.2l-9.8,1.5l0.5-8.8L730.8,329.5z"
        style={pathStyle("miyagi")}
        onClick={() => handleClick("miyagi")}
        {...hoverProps}
      />

      {/* 秋田 */}
      <path
        id="akita"
        d="M688.5,245.4l2-9.8l-10.2-1l-5.9,7.8l-10.7-1l0.5,11.2l-5.4,7.3l7.3,14.1l-3.4,13.2l6.8,2.9l1,15.1
        l-9.3,5.4l-4.9-5.4l-10.2,1.5l-1.5-15.6l-8.3-1.5l0-15.6l-6.4-16.1l3.9-11.2l8.3-2l1.5-14.6l14.1-3.9l2.9,4.9l8.3-9.3l8.8,0.5
        l2.4,7.8l9.8-3.4L688.5,245.4z"
        style={pathStyle("akita")}
        onClick={() => handleClick("akita")}
        {...hoverProps}
      />

      {/* 山形 */}
      <path
        id="yamagata"
        d="M660.9,306.2l9.8-0.5l2,5.9l10.7-2l3.4,5.4l-5.4,2.4l0.5,8.8l9.8-1.5l0.5,10.2l-6.8-1l-5.4,9.8l-7.3-4.9
        l-11.2,2.9l-5.4-5.4l0.5-14.6l-8.8-2.4l2.4-9.8l4.9,5.4l9.3-5.4L660.9,306.2z"
        style={pathStyle("yamagata")}
        onClick={() => handleClick("yamagata")}
        {...hoverProps}
      />

      {/* 福島 */}
      <path
        id="fukushima"
        d="M724.1,346.2l10.2,1l3.4-6.8l10.2,0.5l-0.5,10.2l-5.9,7.3l2,5.9l-6.4,9.3l-6.8-1l-5.4,5.9l-14.6-5.9
        l-12.2,2l-4.9-9.8l-10.7-3.4l-7.8,7.3l-13.2-8.8l1.5-8.8l-7.3-1.5l6.4-9.3l11.2-2.9l7.3,4.9l5.4-9.8l6.8,1l10.2,1l-0.5-10.2
        l-9.8,1.5l-0.5-8.8l5.4-2.4l11.2-1.5l7.3-10.2l3.4-10.7l-2-8.8l3.4-14.6l-2.4-7.8l8.8-2l-9.3,2.9l-9.8,4.4l7.8,16.1l-8.3,2
        l3.4,9.3l-5.4,4.9l5.9,4.4l-3.9,12.7l5.9,2.4l2.9,8.3l8.3,0.5L724.1,346.2z"
        style={pathStyle("fukushima")}
        onClick={() => handleClick("fukushima")}
        {...hoverProps}
      />

      {/* 茨城 */}
      <path
        id="ibaraki"
        d="M714.4,377.3l6.4-9.3l-2-5.9l5.9-7.3l4.9,1.5l-0.5,9.8l8.3,5.9l-3.4,11.7l-1,15.6l-12.2,2.9l-5.9-4.4
        l0.5-10.2l-7.8,3.9l1.5-9.3L714.4,377.3z"
        style={pathStyle("ibaraki")}
        onClick={() => handleClick("ibaraki")}
        {...hoverProps}
      />

      {/* 栃木 */}
      <path
        id="tochigi"
        d="M709.5,373.4l5.4-5.9l6.8,1l-4.9-1.5l-5.9,7.3l2,5.9l-6.4,9.3l-5.4,4.9l-7.3-3.9l-5.9,2.4l-1-9.3l-7.3-5.9
        l7.8-7.3l10.7,3.4l4.9,9.8l12.2-2L709.5,373.4z"
        style={pathStyle("tochigi")}
        onClick={() => handleClick("tochigi")}
        {...hoverProps}
      />

      {/* 群馬 */}
      <path
        id="gunma"
        d="M655.5,361.1l7.3,1.5l-1.5,8.8l13.2,8.8l-7.8,7.3l7.3,5.9l1,9.3l-11.2,3.9l-2.4-5.9l-11.2-1.5l-5.4-12.7
        l-10.2,1.5l-0.5-11.7l8.8-8.3l5.9,2.4L655.5,361.1z"
        style={pathStyle("gunma")}
        onClick={() => handleClick("gunma")}
        {...hoverProps}
      />

      {/* 埼玉 */}
      <path
        id="saitama"
        d="M661.5,401.4l11.2-3.9l5.9-2.4l7.3,3.9l-4.4,7.8l-9.3,5.4l-7.8-4.4l-15.1,2.4l-1-6.4l2.4-5.4l11.2,1.5
        L661.5,401.4z"
        style={pathStyle("saitama")}
        onClick={() => handleClick("saitama")}
        {...hoverProps}
      />

      {/* 千葉 */}
      <path
        id="chiba"
        d="M709.5,399.5l12.2-2.9l1-15.6l3.4-11.7l5.4,2.9l5.4,14.1l-3.4,15.6l-1.5,14.6l-10.7,10.7l-12.7,2l-3.4-9.8
        l5.4-5.4l-6.4-4.9L709.5,399.5z"
        style={pathStyle("chiba")}
        onClick={() => handleClick("chiba")}
        {...hoverProps}
      />

      {/* 東京 */}
      <path
        id="tokyo"
        d="M663.4,418.1l7.8,4.4l9.3-5.4l4.4-7.8l5.4,4.9l-4.9,7.8l-0.5,7.8l-5.9-1l-2.9,4.9l-8.3-2.4l-2.4-7.8
        L663.4,418.1z"
        style={pathStyle("tokyo")}
        onClick={() => handleClick("tokyo")}
        {...hoverProps}
      />

      {/* 神奈川 */}
      <path
        id="kanagawa"
        d="M648.3,410.3l15.1-2.4l2,5.4l-0.5,9.3l8.3,2.4l2.9-4.9l5.9,1l-1.5,8.3l-18.1,2.4l-5.4-3.9l-6.8,2.4
        l-5.4-7.8L648.3,410.3z"
        style={pathStyle("kanagawa")}
        onClick={() => handleClick("kanagawa")}
        {...hoverProps}
      />

      {/* 新潟 */}
      <path
        id="niigata"
        d="M636.1,273.1l8.3,1.5l1.5,15.6l10.2-1.5l4.9,5.4l-2.4,9.8l8.8,2.4l-0.5,14.6l5.4,5.4l-6.4,9.3l-5.9-2.4
        l-8.8,8.3l0.5,11.7l-14.1-7.3l-5.9,4.4l-16.1-2.4l-3.9-6.4l-9.8-2.9l6.4-17.6l-7.3-4.4l2-11.7l-6.8-2.9l11.7-17.6l-0.5-12.7
        l10.7-6.4l7.3,5.4L636.1,273.1z"
        style={pathStyle("niigata")}
        onClick={() => handleClick("niigata")}
        {...hoverProps}
      />

      {/* 富山 */}
      <path
        id="toyama"
        d="M580.1,336.2l9.8,2.9l3.9,6.4l16.1,2.4l-6.8,6.8l-2.4,13.7l-11.7-5.9l-13.2,5.4l-4.4-7.3l4.9-9.3l-2.4-8.3
        L580.1,336.2z"
        style={pathStyle("toyama")}
        onClick={() => handleClick("toyama")}
        {...hoverProps}
      />

      {/* 石川 */}
      <path
        id="ishikawa"
        d="M552.2,331.8l-5.4,9.3l6.8,8.8l5.9,18l-5.4,3.9l4.4,7.3l13.2-5.4l11.7,5.9l2.4-13.7l6.8-6.8l5.9-4.4
        l14.1,7.3l10.2-1.5l5.4,12.7l-13.2-1l-2.9,9.3l-5.9-4.9l-10.2,3.4l0,6.8l-8.3,2.9l-1,7.8l-10.7-2l-6.4,10.7l-16.1-3.4l-9.3,5.9
        l-5.9-6.4l2-14.1l-10.7-5.9l9.3-9.8l-1.5-12.2l-7.8-7.8l5.4-14.1l9.8-5.4L552.2,331.8z"
        style={pathStyle("ishikawa")}
        onClick={() => handleClick("ishikawa")}
        {...hoverProps}
      />

      {/* 福井 */}
      <path
        id="fukui"
        d="M534.4,407.8l5.9,6.4l9.3-5.9l16.1,3.4l6.4-10.7l10.7,2l1-7.8l8.3-2.9l-2.4,11.7l-8.8,2.9l-5.9,10.2
        l-12.2,1.5l-3.4,5.9l-12.2-0.5l-1-9.3l-14.1,0l2.4-12.2L534.4,407.8z"
        style={pathStyle("fukui")}
        onClick={() => handleClick("fukui")}
        {...hoverProps}
      />

      {/* 山梨 */}
      <path
        id="yamanashi"
        d="M644.4,385.9l5.4,12.7l-1.5,11.7l-4.4,6.8l-12.7,1.5l-5.9-8.3l2.4-12.2l6.8-4.4l2.4-9.3l4.4,2L644.4,385.9z"
        style={pathStyle("yamanashi")}
        onClick={() => handleClick("yamanashi")}
        {...hoverProps}
      />

      {/* 長野 */}
      <path
        id="nagano"
        d="M600.5,365.6l2.4-13.7l-5.9-4.4l14.1,7.3l-10.2,1.5l-5.4-12.7l11.2,1.5l2.9-9.3l13.2,1l5.9,4.9l-2.9,9.3
        l-4.4-2l-2.4,9.3l-6.8,4.4l-2.4,12.2l5.9,8.3l-4.4,4.9l-14.1-1l-5.9-9.3l-8.8-1l2-12.2l6.4-5.4L600.5,365.6z"
        style={pathStyle("nagano")}
        onClick={() => handleClick("nagano")}
        {...hoverProps}
      />

      {/* 岐阜 */}
      <path
        id="gifu"
        d="M545.6,423.4l12.2,0.5l3.4-5.9l12.2-1.5l5.9-10.2l8.8-2.9l2.4-11.7l0-6.8l10.2-3.4l-2-12.2l-6.4,5.4
        l-2,12.2l8.8,1l5.9,9.3l-7.8,3.9l-5.4,9.3l-13.2-1.5l-3.9,7.3l-8.8-2l-3.4,10.7l-8.3-2l-3.4-7.3L545.6,423.4z"
        style={pathStyle("gifu")}
        onClick={() => handleClick("gifu")}
        {...hoverProps}
      />

      {/* 静岡 */}
      <path
        id="shizuoka"
        d="M625.3,410.3l12.7-1.5l4.4-6.8l1.5-11.7l2.4,5.9l-2,5.4l1,6.4l4.4,11.2l5.4,3.9l-6.8,3.9l-23.4,6.8
        l-9.3-2.9l-8.3-9.8l6.8-4.4L625.3,410.3z"
        style={pathStyle("shizuoka")}
        onClick={() => handleClick("shizuoka")}
        {...hoverProps}
      />

      {/* 愛知 */}
      <path
        id="aichi"
        d="M569.6,431.2l3.4,7.3l8.3,2l3.4-10.7l8.8,2l3.9-7.3l13.2,1.5l5.4-9.3l7.8-3.9l14.1,1l4.4-4.9l-5.9,3.9
        l-11.2,6.4l-6.8,4.4l8.3,9.8l-9.8,0l-9.3,4.4l1,5.4l-14.6-2.4l-2-5.4l-8.3,3.4l-7.3-2.9L569.6,431.2z"
        style={pathStyle("aichi")}
        onClick={() => handleClick("aichi")}
        {...hoverProps}
      />

      {/* 三重 */}
      <path
        id="mie"
        d="M569.6,431.2l-2.9,4.4l7.3,2.9l8.3-3.4l2,5.4l14.6,2.4l-1-5.4l9.3-4.4l-1.5,8.3l-3.4,2.4l-7.3,13.7
        l-10.7,15.1l-6.8,1.5l-2.9-5.4l-11.2-1l-5.4-9.3l4.4-10.2l-1.5-11.7L569.6,431.2z"
        style={pathStyle("mie")}
        onClick={() => handleClick("mie")}
        {...hoverProps}
      />

      {/* 滋賀 */}
      <path
        id="shiga"
        d="M549.5,421l-3.9,2.4l1,9.3l-8.3,3.9l5.9,8.8l1.5,7.3l6.8,0.5l5.9,6.8l8.8-4.9l1.5-11.7l-4.4,10.2l5.4,9.3
        l-6.8-6.8l-7.8-0.5l-2.9,4.4l2.9-4.4l-1.5-7.3l-5.9-8.8l8.3-3.9l-1-9.3l3.9-2.4L549.5,421z"
        style={pathStyle("shiga")}
        onClick={() => handleClick("shiga")}
        {...hoverProps}
      />

      {/* 京都 */}
      <path
        id="kyoto"
        d="M509.3,389.1l10.7,5.9l-2,14.1l14.1,0l-5.4,11.7l3.9-2.4l14.1,0l-1,9.3l-8.3,3.9l5.9,8.8l1.5,7.3l-10.2,1.5
        l-8.8-1.5l-2.4-8.8l-9.8,2.9l-4.9-10.2l-7.8,1l-0.5-11.2l6.8-7.8l0.5-14.6L509.3,389.1z"
        style={pathStyle("kyoto")}
        onClick={() => handleClick("kyoto")}
        {...hoverProps}
      />

      {/* 大阪 */}
      <path
        id="osaka"
        d="M521.5,429.6l8.8,1.5l10.2-1.5l7.8,0.5l6.8,6.8l-5.4-9.3l11.2,1l2.9,5.4l-5.4,4.4l-2.4,8.3l-4.9-1l-5.4,7.3
        l-6.4-3.4l-9.3,3.9l0-6.4l-6.4-4.9l-1-6.4L521.5,429.6z"
        style={pathStyle("osaka")}
        onClick={() => handleClick("osaka")}
        {...hoverProps}
      />

      {/* 兵庫 */}
      <path
        id="hyogo"
        d="M469,401l7.3,4.9l9.8-1.5l11.2,2.9l4.4,8.8l8.3-3.9l0.5,14.6l-6.8,7.8l0.5,11.2l-9.3-2.4l-4.9,3.4
        l-4.9-5.4l-3.4,5.4l-6.8-1l-0.5-6.4l-11.7,1.5l2.4-6.8l-2.4-7.3l5.4-6.8l-7.8-6.4l0.5-8.8L469,401z"
        style={pathStyle("hyogo")}
        onClick={() => handleClick("hyogo")}
        {...hoverProps}
      />

      {/* 奈良 */}
      <path
        id="nara"
        d="M549.5,452.2l5.4,4.4l-2.9,5.4l6.8-1.5l10.7-15.1l7.3-13.7l3.4-2.4l1.5-8.3l9.8,0l9.3,2.9l-8.8,7.3
        l-3.4,16.1l-7.8,2.4l-6.4,10.7l-6.4-1l-2.4-7.8l-9.8,5.4l-4.4-8.3L549.5,452.2z"
        style={pathStyle("nara")}
        onClick={() => handleClick("nara")}
        {...hoverProps}
      />

      {/* 和歌山 */}
      <path
        id="wakayama"
        d="M541.2,456.6l4.4,8.3l9.8-5.4l2.4,7.8l6.4,1l6.4-10.7l7.8-2.4l3.4-16.1l8.8-7.3l23.4-6.8l6.8-3.9
        l-18.1,2.4l-10.2,18.5l-8.8,7.8l-18.5,11.7l-9.3-1l-8.8,5.4l-7.8-12.2L541.2,456.6z"
        style={pathStyle("wakayama")}
        onClick={() => handleClick("wakayama")}
        {...hoverProps}
      />

      {/* 鳥取 */}
      <path
        id="tottori"
        d="M449.5,396.6l19.5,4.4l8.3,3.9l-4.4-8.8l-11.2-2.9l-9.8,1.5l-7.3-4.9l2-14.1l10.7,5.9l-9.3,9.8
        l7.8,7.8l1.5,12.2l-12.7,1.5l-7.8-13.7l1.5-5.9L449.5,396.6z"
        style={pathStyle("tottori")}
        onClick={() => handleClick("tottori")}
        {...hoverProps}
      />

      {/* 島根 */}
      <path
        id="shimane"
        d="M369.9,378.5l7.8,4.9l16.1-2l8.3,8.3l17.6,2.9l7.3,11.7l11.7-7.3l12.7-1.5l-1.5-12.2l-7.8-7.8l9.3-9.8
        l-10.7-5.9l0.5-8.8l-7.8,6.4l-9.8,0.5l-3.4,6.8l-12.2-0.5l-6.4,5.4l-17.6,2L369.9,378.5z"
        style={pathStyle("shimane")}
        onClick={() => handleClick("shimane")}
        {...hoverProps}
      />

      {/* 岡山 */}
      <path
        id="okayama"
        d="M449.5,418.3l7.8,13.7l4.9,6.4l5.9-1l7.8,4.9l11.7-1.5l0.5,6.4l6.8,1l-2-8.3l4.9-3.4l9.3,2.4
        l-0.5-11.2l7.8-1l4.9,10.2l-2.4-8.8l8.8,1.5l-1.5-6.8l-8.8,4.9l-5.9-6.8l-6.8-0.5l-8.8,4.9l-5.9-8.8l1-9.3l-14.1,0l5.4-11.7
        l-10.2-4.4l-7.3,11.7l-11.7,7.3L449.5,418.3z"
        style={pathStyle("okayama")}
        onClick={() => handleClick("okayama")}
        {...hoverProps}
      />

      {/* 広島 */}
      <path
        id="hiroshima"
        d="M390.9,421l9.8,5.4l10.2-1l9.3,6.4l14.1,0.5l8.3,5.9l7.3-6.8l-5.9,1l-4.9-6.4l-7.8-13.7l12.7-1.5
        l7.8,13.7l-1.5,5.9l-12.7,1.5l-11.7-7.3l10.2,4.4l-17.6,2.9l-9.8-4.9l-4.4,4.4l-10.2,1L390.9,421z"
        style={pathStyle("hiroshima")}
        onClick={() => handleClick("hiroshima")}
        {...hoverProps}
      />

      {/* 山口 */}
      <path
        id="yamaguchi"
        d="M346.8,412.7l9.8,6.8l16.1,0.5l10.7,5.4l7.3-4.4l10.2-1l4.4-4.4l9.8,4.9l17.6-2.9l-10.2-4.4l11.7,7.3
        l-7.3,11.7l-8.3-5.9l-14.1-0.5l-9.3-6.4l-10.2,1l-9.8-5.4l-11.2,5.4l-5.9-2.9l-6.4,5.4l-8.3-2.9L346.8,412.7z"
        style={pathStyle("yamaguchi")}
        onClick={() => handleClick("yamaguchi")}
        {...hoverProps}
      />

      {/* 徳島 */}
      <path
        id="tokushima"
        d="M513.7,469.7l-3.4,7.8l-8.3,0l-3.9,6.4l-8.3-1l-3.9,5.9l-10.2-1.5l1-10.2l14.6,2l6.4-12.2l7.8,1.5
        L513.7,469.7z"
        style={pathStyle("tokushima")}
        onClick={() => handleClick("tokushima")}
        {...hoverProps}
      />

      {/* 香川 */}
      <path
        id="kagawa"
        d="M475.4,466.3l-6.4,12.2l-14.6-2l9.3-14.1l4.4,2.9l8.3,0L475.4,466.3z"
        style={pathStyle("kagawa")}
        onClick={() => handleClick("kagawa")}
        {...hoverProps}
      />

      {/* 愛媛 */}
      <path
        id="ehime"
        d="M409.5,449.2l7.3,5.4l6.8,12.2l7.8,2.4l8.8,9.3l5.4,1.5l6.4,10.7l-6.8,2l-3.9-7.3l-12.2-3.9l-4.4-5.9
        l-8.3,3.9l-13.2-6.4l-2.4-10.2l6.4-8.8L409.5,449.2z"
        style={pathStyle("ehime")}
        onClick={() => handleClick("ehime")}
        {...hoverProps}
      />

      {/* 高知 */}
      <path
        id="kochi"
        d="M445.6,490.6l6.8-2l-6.4-10.7l-5.4-1.5l-8.8-9.3l-7.8-2.4l-6.8-12.2l-7.3-5.4l2.9-2.9l-5.9-2l2.9-9.8
        l10.7,5.4l11.2-5.4l4.4,9.8l-9.3,14.1l-1,10.2l10.2,1.5l3.9-5.9l8.3,1l3.9-6.4l8.3,0l3.4-7.8l-8.3-1.5l7.8,1.5l8.8,5.4
        l-8.8-5.4l9.3,1l8.8-5.4l7.8,12.2l-17.1,11.2l-10.2,17.1l-5.4,2l-4.4-6.8L445.6,490.6z"
        style={pathStyle("kochi")}
        onClick={() => handleClick("kochi")}
        {...hoverProps}
      />

      {/* 福岡 */}
      <path
        id="fukuoka"
        d="M346.8,450.7l11.7,2l5.9,6.8l9.3-2l9.3,2.4l-3.4,9.8l-6.4,5.4l-7.3-2.4l-5.9,5.4l-14.6-2l-2-10.7l4.4-6.8
        L346.8,450.7z"
        style={pathStyle("fukuoka")}
        onClick={() => handleClick("fukuoka")}
        {...hoverProps}
      />

      {/* 佐賀 */}
      <path
        id="saga"
        d="M340.4,468.9l-4.4,6.8l2,10.7l-8.8,2.9l-9.8-2.4l-2.9-12.7l13.2,1.5l2.9-5.9L340.4,468.9z"
        style={pathStyle("saga")}
        onClick={() => handleClick("saga")}
        {...hoverProps}
      />

      {/* 長崎 */}
      <path
        id="nagasaki"
        d="M289.9,471.4l-3.4,10.2l11.7,4.9l6.4-11.7l9.8,2.4l8.8-2.9l14.6,2l-7.3,5.9l-9.8,0.5l-4.9,13.2
        l-10.7,1.5l1.5-8.3l-6.4-1.5l-1,11.2l-6.4-7.8l-7.3,3.4l1.5-9.3l-7.8,2.9l3.4-7.8l7.8-1.5L289.9,471.4z"
        style={pathStyle("nagasaki")}
        onClick={() => handleClick("nagasaki")}
        {...hoverProps}
      />

      {/* 熊本 */}
      <path
        id="kumamoto"
        d="M354.6,477.8l5.9-5.4l7.3,2.4l6.4-5.4l3.4-9.8l9.3,5.9l0.5,8.8l-2.9,15.6l-13.7,4.4l-8.8-2.4l-7.8,7.8
        l-5.9-7.3l-2.9-8.3l9.8-0.5L354.6,477.8z"
        style={pathStyle("kumamoto")}
        onClick={() => handleClick("kumamoto")}
        {...hoverProps}
      />

      {/* 大分 */}
      <path
        id="oita"
        d="M383.4,457.5l-9.3-2.4l-9.3,2l-5.9-6.8l-11.7-2l1-7.8l8.3,2.9l6.4-5.4l5.9,2.9l11.2-5.4l7.3,4.4l-0.5,6.4
        l-2.9,9.8l5.9,2L383.4,457.5z"
        style={pathStyle("oita")}
        onClick={() => handleClick("oita")}
        {...hoverProps}
      />

      {/* 宮崎 */}
      <path
        id="miyazaki"
        d="M383.4,457.5l5.4,6.8l-2.9,2.9l-2.4,10.2l13.2,6.4l8.3-3.9l4.4,5.9l12.2,3.9l3.9,7.3l-2,9.3l-7.8,6.8
        l-17.1-5.9l-2.9-19l-8.8,2.4l13.7-4.4l2.9-15.6l-0.5-8.8l-9.3-5.9L383.4,457.5z"
        style={pathStyle("miyazaki")}
        onClick={() => handleClick("miyazaki")}
        {...hoverProps}
      />

      {/* 鹿児島 */}
      <path
        id="kagoshima"
        d="M330.1,498.6l5.9,7.3l7.8-7.8l-2.9,19l17.1,5.9l-2,13.2l-11.7,5.9l-16.6-1.5l1-6.8l-9.8,1.5l-3.9-5.9
        l-12.2,2.9l2-9.3l9.3-6.4l-0.5-9.3l10.7-1.5l4.9-13.2L330.1,498.6z"
        style={pathStyle("kagoshima")}
        onClick={() => handleClick("kagoshima")}
        {...hoverProps}
      />

      {/* 沖縄（右下に別枠で表示） */}
      <g transform="translate(720, 850)">
        {/* 沖縄本島 */}
        <path
          id="okinawa"
          d="M50,30l15,5l20,25l-5,30l-20,15l-25,-5l-15,-20l5,-30l15,-15z
          M0,120l10,-5l15,10l-5,15l-15,5l-10,-10z"
          style={pathStyle("okinawa")}
          onClick={() => handleClick("okinawa")}
          {...hoverProps}
        />
        {/* 枠線 */}
        <rect
          x="-30"
          y="-20"
          width="150"
          height="180"
          fill="none"
          stroke="#ccc"
          strokeWidth="1"
          strokeDasharray="4,2"
        />
        <text x="45" y="170" fontSize="14" fill="#999" textAnchor="middle">沖縄</text>
      </g>
    </svg>
  );
}
