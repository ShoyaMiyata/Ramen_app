import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// 駅一覧を取得（静的マスタ + DB登録駅）
export const list = query({
  args: {
    searchText: v.optional(v.string()),
    prefecture: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let stations = await ctx.db.query("stations").collect();

    // 都道府県フィルタ
    if (args.prefecture) {
      stations = stations.filter((s) => s.prefecture === args.prefecture);
    }

    // 検索フィルタ
    if (args.searchText) {
      const searchLower = args.searchText.toLowerCase();
      stations = stations.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.line?.toLowerCase().includes(searchLower)
      );
    }

    // 使用回数でソート
    return stations.sort((a, b) => b.usageCount - a.usageCount).slice(0, 20);
  },
});

// 駅を取得または作成
export const getOrCreate = mutation({
  args: {
    name: v.string(),
    prefecture: v.optional(v.string()),
    line: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // 既存の駅を検索
    const existing = await ctx.db
      .query("stations")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      // 使用回数をインクリメント
      await ctx.db.patch(existing._id, {
        usageCount: existing.usageCount + 1,
      });

      // 都道府県や路線情報があれば更新
      if (args.prefecture && !existing.prefecture) {
        await ctx.db.patch(existing._id, {
          prefecture: args.prefecture,
        });
      }
      if (args.line && !existing.line) {
        await ctx.db.patch(existing._id, {
          line: args.line,
        });
      }

      return existing._id;
    }

    // 新規作成
    return await ctx.db.insert("stations", {
      name: args.name,
      prefecture: args.prefecture,
      line: args.line,
      registeredBy: args.userId,
      usageCount: 1,
      createdAt: Date.now(),
    });
  },
});

// 初期マスタデータを登録（一度だけ実行）
export const seedInitialStations = mutation({
  args: {},
  handler: async (ctx) => {
    const initialStations = [
      // 東京 (12駅)
      { name: "渋谷駅", prefecture: "tokyo", line: "JR山手線、東急東横線など" },
      { name: "新宿駅", prefecture: "tokyo", line: "JR各線、小田急線など" },
      { name: "池袋駅", prefecture: "tokyo", line: "JR山手線、東武東上線など" },
      { name: "東京駅", prefecture: "tokyo", line: "JR各線、東京メトロ丸ノ内線" },
      { name: "品川駅", prefecture: "tokyo", line: "JR山手線、京急本線" },
      { name: "上野駅", prefecture: "tokyo", line: "JR山手線、東京メトロ銀座線" },
      { name: "秋葉原駅", prefecture: "tokyo", line: "JR山手線、つくばエクスプレス" },
      { name: "六本木駅", prefecture: "tokyo", line: "東京メトロ日比谷線、都営大江戸線" },
      { name: "恵比寿駅", prefecture: "tokyo", line: "JR山手線、東京メトロ日比谷線" },
      { name: "中野駅", prefecture: "tokyo", line: "JR中央線、東京メトロ東西線" },
      { name: "吉祥寺駅", prefecture: "tokyo", line: "JR中央線、京王井の頭線" },
      { name: "立川駅", prefecture: "tokyo", line: "JR中央線、南武線、多摩モノレール" },

      // 神奈川 (5駅)
      { name: "横浜駅", prefecture: "kanagawa", line: "JR各線、東急東横線など" },
      { name: "川崎駅", prefecture: "kanagawa", line: "JR東海道線、京急本線" },
      { name: "武蔵小杉駅", prefecture: "kanagawa", line: "JR横須賀線、東急東横線" },
      { name: "関内駅", prefecture: "kanagawa", line: "JR根岸線、横浜市営地下鉄" },
      { name: "藤沢駅", prefecture: "kanagawa", line: "JR東海道線、小田急江ノ島線" },

      // 大阪 (8駅)
      { name: "梅田駅", prefecture: "osaka", line: "阪急線、阪神線、大阪メトロ御堂筋線" },
      { name: "難波駅", prefecture: "osaka", line: "南海線、近鉄線、大阪メトロ御堂筋線" },
      { name: "天王寺駅", prefecture: "osaka", line: "JR各線、大阪メトロ御堂筋線" },
      { name: "京橋駅", prefecture: "osaka", line: "JR環状線、京阪本線" },
      { name: "本町駅", prefecture: "osaka", line: "大阪メトロ御堂筋線、中央線" },
      { name: "新大阪駅", prefecture: "osaka", line: "JR東海道新幹線、大阪メトロ御堂筋線" },
      { name: "心斎橋駅", prefecture: "osaka", line: "大阪メトロ御堂筋線、長堀鶴見緑地線" },
      { name: "淀屋橋駅", prefecture: "osaka", line: "大阪メトロ御堂筋線、京阪本線" },

      // 愛知 (3駅)
      { name: "名古屋駅", prefecture: "aichi", line: "JR各線、名鉄名古屋線など" },
      { name: "栄駅", prefecture: "aichi", line: "名古屋市営地下鉄東山線、名城線" },
      { name: "金山駅", prefecture: "aichi", line: "JR東海道線、名鉄名古屋線" },

      // 福岡 (4駅)
      { name: "博多駅", prefecture: "fukuoka", line: "JR鹿児島本線、福岡市地下鉄空港線" },
      { name: "天神駅", prefecture: "fukuoka", line: "福岡市地下鉄空港線、西鉄天神大牟田線" },
      { name: "西新駅", prefecture: "fukuoka", line: "福岡市地下鉄空港線" },
      { name: "薬院駅", prefecture: "fukuoka", line: "福岡市地下鉄七隈線" },

      // 北海道 (2駅)
      { name: "札幌駅", prefecture: "hokkaido", line: "JR函館本線、札幌市営地下鉄南北線" },
      { name: "すすきの駅", prefecture: "hokkaido", line: "札幌市営地下鉄南北線" },

      // 宮城 (1駅)
      { name: "仙台駅", prefecture: "miyagi", line: "JR東北新幹線、仙台市地下鉄南北線" },

      // 広島 (1駅)
      { name: "広島駅", prefecture: "hiroshima", line: "JR山陽本線、広島電鉄" },

      // 京都 (3駅)
      { name: "京都駅", prefecture: "kyoto", line: "JR各線、近鉄京都線" },
      { name: "四条駅", prefecture: "kyoto", line: "京都市営地下鉄烏丸線" },
      { name: "河原町駅", prefecture: "kyoto", line: "阪急京都線" },

      // 兵庫 (2駅)
      { name: "三宮駅", prefecture: "hyogo", line: "JR神戸線、阪急神戸線など" },
      { name: "神戸駅", prefecture: "hyogo", line: "JR神戸線" },

      // 沖縄 (1駅)
      { name: "県庁前駅", prefecture: "okinawa", line: "ゆいレール" },

      // 埼玉 (2駅)
      { name: "大宮駅", prefecture: "saitama", line: "JR各線、東武野田線など" },
      { name: "川越駅", prefecture: "saitama", line: "JR川越線、東武東上線" },
    ];

    let createdCount = 0;
    for (const station of initialStations) {
      const existing = await ctx.db
        .query("stations")
        .withIndex("by_name", (q) => q.eq("name", station.name))
        .first();

      if (!existing) {
        await ctx.db.insert("stations", {
          name: station.name,
          prefecture: station.prefecture,
          line: station.line,
          usageCount: 0,
          createdAt: Date.now(),
        });
        createdCount++;
      }
    }

    return { success: true, createdCount };
  },
});
