"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";

export default function SeedStationsPage() {
  const { user } = useCurrentUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; createdCount: number } | null>(null);
  const seedStations = useMutation(api.stations.seedInitialStations);

  // 管理者のみアクセス可能
  if (user && !user.isAdmin) {
    router.push("/");
    return null;
  }

  const handleSeed = async () => {
    setIsLoading(true);
    try {
      const res = await seedStations({});
      setResult(res);
    } catch (error) {
      console.error("Error seeding stations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">駅マスタデータ初期登録</h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          ⚠️ この操作は1度だけ実行してください。<br />
          既に登録済みの駅はスキップされます。
        </p>
      </div>

      <Button
        onClick={handleSeed}
        disabled={isLoading}
        className="w-full mb-4"
      >
        {isLoading ? "登録中..." : "44駅を登録する"}
      </Button>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            ✅ 完了: {result.createdCount}件の駅を新規登録しました
          </p>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-bold mb-4">登録される駅一覧</h2>
        <div className="bg-white rounded-lg border p-4 text-sm">
          <p className="mb-2"><strong>東京:</strong> 渋谷、新宿、池袋、東京、品川、上野、秋葉原、六本木、恵比寿、中野、吉祥寺、立川</p>
          <p className="mb-2"><strong>神奈川:</strong> 横浜、川崎、武蔵小杉、関内、藤沢</p>
          <p className="mb-2"><strong>大阪:</strong> 梅田、難波、天王寺、京橋、本町、新大阪、心斎橋、淀屋橋</p>
          <p className="mb-2"><strong>愛知:</strong> 名古屋、栄、金山</p>
          <p className="mb-2"><strong>福岡:</strong> 博多、天神、西新、薬院</p>
          <p className="mb-2"><strong>北海道:</strong> 札幌、すすきの</p>
          <p className="mb-2"><strong>宮城:</strong> 仙台</p>
          <p className="mb-2"><strong>広島:</strong> 広島</p>
          <p className="mb-2"><strong>京都:</strong> 京都、四条、河原町</p>
          <p className="mb-2"><strong>兵庫:</strong> 三宮、神戸</p>
          <p className="mb-2"><strong>沖縄:</strong> 県庁前</p>
          <p><strong>埼玉:</strong> 大宮、川越</p>
        </div>
      </div>
    </div>
  );
}
