import { mutation } from "./_generated/server";

// ダミーデータのシード用mutation
// Convex Dashboardの「Functions」から実行できます
export const seedDummyData = mutation({
  args: {},
  handler: async (ctx) => {
    // まず現在のユーザーを取得（ログインユーザーを使用）
    const users = await ctx.db.query("users").collect();
    if (users.length === 0) {
      throw new Error("ユーザーが存在しません。先にログインしてください。");
    }
    const user = users[0];

    // 店舗データ
    const shopData = [
      // 総合ベスト
      { name: "金色不如帰", address: "東京都新宿区新宿御苑前", url: "https://tabelog.com/tokyo/A1304/A130402/13051841/" },
      { name: "中華そば しば田", address: "東京都調布市仙川町", url: "https://tabelog.com/tokyo/A1326/A132601/13152418/" },
      { name: "中華蕎麦 とみ田", address: "千葉県松戸市松戸", url: "https://tabelog.com/chiba/A1203/A120302/12000649/" },

      // 醤油部門
      { name: "春木屋", address: "東京都杉並区荻窪", url: "https://tabelog.com/tokyo/A1319/A131906/13001128/" },
      { name: "中華そば 多賀野", address: "東京都品川区中延", url: "https://tabelog.com/tokyo/A1317/A131712/13003715/" },
      { name: "銀座 篝", address: "東京都中央区銀座", url: "https://tabelog.com/tokyo/A1301/A130101/13156957/" },

      // 塩部門
      { name: "麺処 しろくろ", address: "東京都新宿区", url: "https://tabelog.com/tokyo/A1304/A130401/13228256/" },
      { name: "SOBA HOUSE 不如帰", address: "東京都新宿区", url: "https://tabelog.com/tokyo/A1304/A130401/13168818/" },

      // 味噌部門
      { name: "味噌麺処 田坂屋", address: "東京都豊島区要町", url: "https://tabelog.com/tokyo/A1322/A132202/13145088/" },
      { name: "すみれ", address: "北海道札幌市豊平区", url: "https://tabelog.com/hokkaido/A0101/A010303/1000640/" },
      { name: "ど・みそ", address: "東京都中央区京橋", url: "https://tabelog.com/tokyo/A1302/A130202/13003596/" },

      // とんこつ部門
      { name: "田中商店", address: "東京都足立区", url: "https://tabelog.com/tokyo/A1324/A132402/13005318/" },
      { name: "博多一幸舎", address: "東京都渋谷区", url: "https://tabelog.com/tokyo/A1303/A130301/13118399/" },
      { name: "無鉄砲", address: "東京都中野区", url: "https://tabelog.com/tokyo/A1319/A131902/13121621/" },

      // 家系部門
      { name: "杉田家", address: "神奈川県横浜市磯子区", url: "https://tabelog.com/kanagawa/A1401/A140310/14000848/" },
      { name: "吉村家", address: "神奈川県横浜市西区", url: "https://tabelog.com/kanagawa/A1401/A140101/14000057/" },
      { name: "武蔵家", address: "東京都中野区", url: "https://tabelog.com/tokyo/A1319/A131902/13027225/" },

      // 二郎系部門
      { name: "ラーメン二郎 三田本店", address: "東京都港区三田", url: "https://tabelog.com/tokyo/A1314/A131402/13001854/" },
      { name: "ラーメン富士丸 神谷本店", address: "東京都北区神谷", url: "https://tabelog.com/tokyo/A1323/A132304/13016253/" },
      { name: "豚山", address: "東京都渋谷区", url: "https://tabelog.com/tokyo/A1303/A130301/13219945/" },

      // つけ麺部門
      { name: "六厘舎", address: "東京都千代田区丸の内", url: "https://tabelog.com/tokyo/A1302/A130201/13099890/" },
      { name: "舎鈴", address: "東京都千代田区", url: "https://tabelog.com/tokyo/A1302/A130201/13149090/" },

      // 担々麺部門
      { name: "鬼金棒", address: "東京都千代田区神田", url: "https://tabelog.com/tokyo/A1310/A131002/13126030/" },
      { name: "担々麺専門店 たんたん亭", address: "東京都杉並区浜田山", url: "https://tabelog.com/tokyo/A1318/A131808/13014746/" },
      { name: "四川担々麺 阿吽", address: "東京都文京区湯島", url: "https://tabelog.com/tokyo/A1311/A131101/13161466/" },
    ];

    // 店舗を作成
    const shopIds: Record<string, string> = {};
    for (const shop of shopData) {
      const existingShop = await ctx.db
        .query("shops")
        .withIndex("by_name", (q) => q.eq("name", shop.name))
        .first();

      if (existingShop) {
        shopIds[shop.name] = existingShop._id;
      } else {
        const shopId = await ctx.db.insert("shops", shop);
        shopIds[shop.name] = shopId;
      }
    }

    // ラーメン記録データ
    const noodleData = [
      // 総合ベスト
      { shop: "金色不如帰", ramenName: "金色の塩そば", genres: ["塩"], evaluation: 5, comment: "貝出汁の繊細な旨味が最高。芸術的な一杯。" },
      { shop: "中華そば しば田", ramenName: "中華そば", genres: ["醤油"], evaluation: 5, comment: "王道の醤油ラーメン。鶏と魚介のバランスが絶妙。" },
      { shop: "中華蕎麦 とみ田", ramenName: "つけめん", genres: ["つけ麺"], evaluation: 5, comment: "濃厚魚介豚骨。麺の存在感がすごい。" },

      // 醤油部門
      { shop: "春木屋", ramenName: "中華そば", genres: ["醤油"], evaluation: 4, comment: "荻窪の名店。昔ながらの東京ラーメン。" },
      { shop: "中華そば 多賀野", ramenName: "中華そば", genres: ["醤油"], evaluation: 5, comment: "透き通った醤油スープが美しい。" },
      { shop: "銀座 篝", ramenName: "鶏白湯SOBA", genres: ["醤油", "鶏白湯"], evaluation: 4, comment: "クリーミーな鶏白湯。銀座らしい上品さ。" },

      // 塩部門
      { shop: "麺処 しろくろ", ramenName: "塩らぁ麺", genres: ["塩"], evaluation: 4, comment: "あっさりながらコクがある塩ラーメン。" },
      { shop: "SOBA HOUSE 不如帰", ramenName: "塩SOBA", genres: ["塩"], evaluation: 5, comment: "ハマグリ出汁の上品な塩。" },

      // 味噌部門
      { shop: "味噌麺処 田坂屋", ramenName: "味噌ラーメン", genres: ["味噌"], evaluation: 5, comment: "濃厚な味噌スープ。寒い日に最高。" },
      { shop: "すみれ", ramenName: "味噌ラーメン", genres: ["味噌"], evaluation: 5, comment: "札幌味噌の真髄。ラードが熱々をキープ。" },
      { shop: "ど・みそ", ramenName: "特みそこってりらーめん", genres: ["味噌"], evaluation: 4, comment: "濃厚味噌好きにはたまらない。" },

      // とんこつ部門
      { shop: "田中商店", ramenName: "ラーメン", genres: ["とんこつ"], evaluation: 5, comment: "東京で食べる本格博多豚骨。" },
      { shop: "博多一幸舎", ramenName: "ラーメン", genres: ["とんこつ"], evaluation: 4, comment: "泡系豚骨の代表格。クリーミー。" },
      { shop: "無鉄砲", ramenName: "とんこつラーメン", genres: ["とんこつ"], evaluation: 5, comment: "超濃厚豚骨。ドロドロスープがクセになる。" },

      // 家系部門
      { shop: "杉田家", ramenName: "ラーメン", genres: ["家系"], evaluation: 5, comment: "吉村家直系の味。固め濃いめ多め。" },
      { shop: "吉村家", ramenName: "ラーメン", genres: ["家系"], evaluation: 5, comment: "家系総本山。全てはここから始まった。" },
      { shop: "武蔵家", ramenName: "ラーメン", genres: ["家系"], evaluation: 4, comment: "中野で食べる本格家系。ライス無料。" },

      // 二郎系部門
      { shop: "ラーメン二郎 三田本店", ramenName: "ラーメン", genres: ["二郎系"], evaluation: 5, comment: "二郎の聖地。全ての始まり。" },
      { shop: "ラーメン富士丸 神谷本店", ramenName: "ラーメン", genres: ["二郎系"], evaluation: 5, comment: "豚が神。二郎インスパイアの最高峰。" },
      { shop: "豚山", ramenName: "ラーメン", genres: ["二郎系"], evaluation: 4, comment: "手軽に食べられる二郎インスパイア。" },

      // つけ麺部門
      { shop: "六厘舎", ramenName: "つけめん", genres: ["つけ麺"], evaluation: 4, comment: "東京駅の定番。濃厚魚介豚骨。" },
      { shop: "舎鈴", ramenName: "つけめん", genres: ["つけ麺"], evaluation: 4, comment: "六厘舎系列。気軽に入れる。" },

      // 担々麺部門
      { shop: "鬼金棒", ramenName: "カラシビ味噌らー麺", genres: ["担々麺", "味噌"], evaluation: 5, comment: "痺れる辛さ。花椒が効いてる。" },
      { shop: "担々麺専門店 たんたん亭", ramenName: "担々麺", genres: ["担々麺"], evaluation: 4, comment: "老舗の担々麺。バランスが良い。" },
      { shop: "四川担々麺 阿吽", ramenName: "担々麺", genres: ["担々麺"], evaluation: 5, comment: "本格四川の味。辛さと痺れのバランスが絶妙。" },
    ];

    // ラーメン記録を作成
    const noodleIds: Record<string, string> = {};
    const now = Date.now();
    for (let i = 0; i < noodleData.length; i++) {
      const noodle = noodleData[i];
      const shopId = shopIds[noodle.shop];
      if (!shopId) continue;

      // 過去1年以内のランダムな日付
      const randomDaysAgo = Math.floor(Math.random() * 365);
      const visitDate = now - randomDaysAgo * 24 * 60 * 60 * 1000;

      const noodleId = await ctx.db.insert("noodles", {
        userId: user._id,
        shopId: shopId as any,
        ramenName: noodle.ramenName,
        genres: noodle.genres,
        visitDate,
        comment: noodle.comment,
        evaluation: noodle.evaluation,
      });
      noodleIds[noodle.shop] = noodleId;
    }

    // マイベストを設定
    const myBestData = [
      { category: "overall", shop: "金色不如帰" },
      { category: "shoyu", shop: "中華そば しば田" },
      { category: "shio", shop: "金色不如帰" },
      { category: "miso", shop: "味噌麺処 田坂屋" },
      { category: "tonkotsu", shop: "田中商店" },
      { category: "iekei", shop: "吉村家" },
      { category: "jiro", shop: "ラーメン二郎 三田本店" },
      { category: "tsukemen", shop: "中華蕎麦 とみ田" },
      { category: "tantan", shop: "四川担々麺 阿吽" },
    ];

    for (const best of myBestData) {
      const noodleId = noodleIds[best.shop];
      if (!noodleId) continue;

      // 既存のマイベストを確認
      const existing = await ctx.db
        .query("myBests")
        .withIndex("by_userId_category", (q) =>
          q.eq("userId", user._id).eq("category", best.category)
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, { noodleId: noodleId as any });
      } else {
        await ctx.db.insert("myBests", {
          userId: user._id,
          category: best.category,
          noodleId: noodleId as any,
        });
      }
    }

    return {
      message: "ダミーデータを作成しました",
      shops: Object.keys(shopIds).length,
      noodles: Object.keys(noodleIds).length,
      myBests: myBestData.length,
    };
  },
});

// データ削除用（開発用）
export const clearAllData = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    if (users.length === 0) return { message: "ユーザーなし" };

    const user = users[0];

    // ユーザーのnoodlesを削除
    const noodles = await ctx.db
      .query("noodles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    for (const noodle of noodles) {
      // 関連するlikesを削除
      const likes = await ctx.db
        .query("likes")
        .withIndex("by_noodleId", (q) => q.eq("noodleId", noodle._id))
        .collect();
      for (const like of likes) {
        await ctx.db.delete(like._id);
      }
      await ctx.db.delete(noodle._id);
    }

    // myBestsを削除
    const myBests = await ctx.db
      .query("myBests")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    for (const best of myBests) {
      await ctx.db.delete(best._id);
    }

    // userBadgesを削除
    const badges = await ctx.db
      .query("userBadges")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    for (const badge of badges) {
      await ctx.db.delete(badge._id);
    }

    return { message: "データを削除しました" };
  },
});
