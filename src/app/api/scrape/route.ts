import { NextRequest, NextResponse } from "next/server";

// 食べログやGoogle MapsのURLからお店情報を抽出
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    console.log("[Scrape] Fetching URL:", url);

    // URLからHTMLを取得
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ja,en;q=0.9",
      },
    });

    if (!response.ok) {
      console.log("[Scrape] Failed to fetch:", response.status);
      return NextResponse.json(
        { error: "Failed to fetch URL" },
        { status: 400 }
      );
    }

    const html = await response.text();
    console.log("[Scrape] HTML length:", html.length);

    let result;

    // 食べログの場合
    if (url.includes("tabelog.com")) {
      result = parseTabelog(html, url);
    }
    // Google Mapsの場合
    else if (url.includes("google.com/maps") || url.includes("goo.gl/maps") || url.includes("maps.app.goo.gl")) {
      result = parseGoogleMaps(html, url);
    }
    // ラーメンデータベースの場合
    else if (url.includes("ramendb.supleks.jp")) {
      result = parseRamenDB(html, url);
    }
    // その他のサイトはOGP情報を取得
    else {
      result = parseGeneric(html, url);
    }

    console.log("[Scrape] Result:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: "Failed to scrape URL" },
      { status: 500 }
    );
  }
}

function parseTabelog(html: string, url: string) {
  const shopName = extractMeta(html, "og:title")?.replace(/ - 食べログ$/, "").split(" (")[0] || "";
  const address = extractByPattern(html, /<span class="rstinfo-table__address"[^>]*>([^<]+)<\/span>/);

  return {
    shopName: shopName.trim(),
    address: address?.trim(),
    url,
    source: "tabelog",
  };
}

function parseGoogleMaps(html: string, url: string) {
  const title = extractMeta(html, "og:title") || "";
  // Google Mapsのタイトルは「店名 · 住所」形式
  const parts = title.split(" · ");

  return {
    shopName: parts[0]?.trim() || "",
    address: parts[1]?.trim(),
    url,
    source: "google_maps",
  };
}

function parseRamenDB(html: string, url: string) {
  const shopName = extractMeta(html, "og:title")?.replace(/ \| ラーメンデータベース$/, "") || "";

  return {
    shopName: shopName.trim(),
    url,
    source: "ramendb",
  };
}

function parseGeneric(html: string, url: string) {
  const shopName = extractMeta(html, "og:title") || extractTag(html, "title") || "";

  return {
    shopName: shopName.trim(),
    url,
    source: "generic",
  };
}

function extractMeta(html: string, property: string): string | null {
  const regex = new RegExp(
    `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']+)["']`,
    "i"
  );
  const match = html.match(regex);
  if (match) return match[1];

  // content属性が先に来るパターン
  const regex2 = new RegExp(
    `<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']${property}["']`,
    "i"
  );
  const match2 = html.match(regex2);
  return match2?.[1] || null;
}

function extractTag(html: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([^<]+)<\/${tag}>`, "i");
  const match = html.match(regex);
  return match?.[1] || null;
}

function extractByPattern(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern);
  return match?.[1] || null;
}
