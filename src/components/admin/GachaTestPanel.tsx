"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { RARITY_NAMES } from "@/lib/constants/gachaBadges";
import { Sparkles, RotateCcw, TrendingUp } from "lucide-react";

interface GachaTestPanelProps {
  adminUserId: Id<"users">;
}

interface GachaResult {
  code: string;
  name: string;
  icon: string;
  description: string;
  rarity: number;
  category: string;
}

export function GachaTestPanel({ adminUserId }: GachaTestPanelProps) {
  const [testResults, setTestResults] = useState<GachaResult[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(null);
  const [isTestingGacha, setIsTestingGacha] = useState(false);

  // API呼び出し
  const users = useQuery(api.admin.listUsersForNotification, { adminUserId });
  const gachaStats = useQuery(api.admin.getGachaStats, { adminUserId });
  const testGacha = useMutation(api.admin.testGacha);
  const resetDailyGacha = useMutation(api.admin.resetDailyGacha);
  const resetPityCounter = useMutation(api.admin.resetPityCounter);

  // ガチャテスト実行
  const handleTestGacha = async (count: 1 | 10) => {
    setIsTestingGacha(true);
    try {
      const results = await testGacha({
        adminUserId,
        count,
      });

      // アニメーション付きで結果を表示
      setTestResults([]);
      setTimeout(() => {
        // API response structure: [{badge: {...}, rarity: number}]
        const mappedResults = results.map((r) => ({
          code: r.badge.code,
          name: r.badge.name,
          icon: r.badge.icon,
          description: r.badge.description,
          rarity: r.badge.rarity,
          category: "special", // category is not in API response
        }));
        setTestResults(mappedResults);
      }, 100);
    } catch (error) {
      console.error("Gacha test failed:", error);
      alert("ガチャテストに失敗しました");
    } finally {
      setIsTestingGacha(false);
    }
  };

  // デイリーガチャリセット
  const handleResetDaily = async () => {
    if (!selectedUserId) {
      alert("ユーザーを選択してください");
      return;
    }

    try {
      await resetDailyGacha({
        adminUserId,
        targetUserId: selectedUserId,
      });
      alert("デイリーガチャをリセットしました");
    } catch (error) {
      console.error("Reset daily gacha failed:", error);
      alert("リセットに失敗しました");
    }
  };

  // 天井カウンターリセット
  const handleResetPity = async () => {
    if (!selectedUserId) {
      alert("ユーザーを選択してください");
      return;
    }

    try {
      await resetPityCounter({
        adminUserId,
        targetUserId: selectedUserId,
      });
      alert("天井カウンターをリセットしました");
    } catch (error) {
      console.error("Reset pity counter failed:", error);
      alert("リセットに失敗しました");
    }
  };

  // レアリティ別の色取得
  const getRarityColor = (rarity: number) => {
    switch (rarity) {
      case 5: return "text-yellow-500";
      case 4: return "text-purple-500";
      case 3: return "text-blue-500";
      case 2: return "text-green-500";
      case 1: return "text-gray-500";
      default: return "text-gray-500";
    }
  };

  // レアリティ別の背景色取得
  const getRarityBgColor = (rarity: number) => {
    switch (rarity) {
      case 5: return "bg-gradient-to-br from-yellow-100 to-yellow-200";
      case 4: return "bg-gradient-to-br from-purple-100 to-purple-200";
      case 3: return "bg-gradient-to-br from-blue-100 to-blue-200";
      case 2: return "bg-gradient-to-br from-green-100 to-green-200";
      case 1: return "bg-gradient-to-br from-gray-100 to-gray-200";
      default: return "bg-gray-100";
    }
  };

  // 確率計算
  const calculatePercentage = (count: number, total: number) => {
    if (total === 0) return "0.0";
    return ((count / total) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* ガチャテスト */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          ガチャテスト
        </h3>

        <div className="flex gap-2 mb-4">
          <Button
            onClick={() => handleTestGacha(1)}
            disabled={isTestingGacha}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isTestingGacha ? <Loading size="sm" /> : "1回引く"}
          </Button>
          <Button
            onClick={() => handleTestGacha(10)}
            disabled={isTestingGacha}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isTestingGacha ? <Loading size="sm" /> : "10回引く"}
          </Button>
        </div>

        {/* テスト結果 */}
        {testResults.length > 0 && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            <p className="text-xs font-medium text-gray-600 mb-2">
              テスト結果 ({testResults.length}回)
            </p>
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${getRarityBgColor(result.rarity)} animate-fade-in`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{result.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${getRarityColor(result.rarity)}`}>
                        {"★".repeat(result.rarity)}
                      </span>
                      <span className="font-medium text-gray-900 truncate">
                        {result.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {result.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* リセット機能 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-blue-500" />
          リセット機能
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              対象ユーザー
            </label>
            <select
              value={selectedUserId || ""}
              onChange={(e) =>
                setSelectedUserId(
                  e.target.value ? (e.target.value as Id<"users">) : null
                )
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="">ユーザーを選択</option>
              {users?.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name || "名前なし"} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleResetDaily}
              disabled={!selectedUserId}
              variant="outline"
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              デイリーリセット
            </Button>
            <Button
              onClick={handleResetPity}
              disabled={!selectedUserId}
              variant="outline"
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              天井リセット
            </Button>
          </div>
        </div>
      </div>

      {/* ガチャ統計 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          ガチャ統計
        </h3>

        {gachaStats === undefined ? (
          <div className="text-center py-4">
            <Loading size="sm" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* 総チケット・ガチャ回数 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {gachaStats.totalTickets}
                </div>
                <div className="text-xs text-orange-600/70">総チケット数</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {gachaStats.totalGachaDraws}
                </div>
                <div className="text-xs text-blue-600/70">総ガチャ回数</div>
              </div>
            </div>

            {/* レアリティ別排出 */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600 mb-2">
                レアリティ別排出
              </p>
              <div className="space-y-1.5">
                {[5, 4, 3, 2, 1].map((rarity) => {
                  const count = gachaStats.byRarity[rarity as 1 | 2 | 3 | 4 | 5];
                  const percentage = calculatePercentage(count, gachaStats.totalGachaDraws);
                  return (
                    <div key={rarity} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${getRarityColor(rarity)}`}>
                          {"★".repeat(rarity)}
                        </span>
                        <span className="text-gray-600">
                          {RARITY_NAMES[rarity as 1 | 2 | 3 | 4 | 5]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{count}回</span>
                        <span className="text-xs text-gray-400">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
