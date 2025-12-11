"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { Ticket, Sparkles, Clock, TrendingUp } from "lucide-react";
import { GachaAnimation } from "@/components/gacha/GachaAnimation";
import { GachaHistory } from "@/components/gacha/GachaHistory";
import { motion } from "framer-motion";
import { getBadgeByCode } from "@/lib/constants/gachaBadges";

export default function GachaPage() {
  const { userId: clerkUserId } = useAuth();
  const [showAnimation, setShowAnimation] = useState(false);
  const [gachaResult, setGachaResult] = useState<{
    badge: any;
    isNew: boolean;
    rarity: number;
    counter50: number;
    counter100: number;
  } | null>(null);

  // ユーザー情報取得
  const currentUser = useQuery(
    api.users.getByClerkId,
    clerkUserId ? { clerkId: clerkUserId } : "skip"
  );

  // ガチャ情報取得
  const tickets = useQuery(
    api.gacha.getUserTickets,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const dailyStatus = useQuery(
    api.gacha.checkDailyGacha,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const pityCounter = useQuery(
    api.gacha.getPityCounter,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const history = useQuery(
    api.gacha.getGachaHistory,
    currentUser?._id ? { userId: currentUser._id, limit: 20 } : "skip"
  );

  // ガチャ実行
  const drawGacha = useMutation(api.gacha.drawGacha);

  // デイリーガチャのリセット時間計算
  const [timeUntilReset, setTimeUntilReset] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeUntilReset(`${hours}時間${minutes}分${seconds}秒`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDrawDaily = async () => {
    if (!currentUser?._id || !dailyStatus?.canDraw) return;

    try {
      const result = await drawGacha({
        userId: currentUser._id,
        gachaType: "daily"
      });
      const badgeInfo = getBadgeByCode(result.badge.code);

      setGachaResult({
        badge: {
          ...result.badge,
          ...badgeInfo,
        },
        isNew: result.isNew,
        rarity: result.badge.rarity,
        counter50: result.pityInfo.counter50,
        counter100: result.pityInfo.counter100,
      });
      setShowAnimation(true);
    } catch (error) {
      console.error("Failed to draw daily gacha:", error);
      alert("デイリーガチャの実行に失敗しました");
    }
  };

  const handleDrawTicket = async () => {
    if (!currentUser?._id || !tickets || tickets.ticketCount < 1) return;

    try {
      const result = await drawGacha({
        userId: currentUser._id,
        gachaType: "ticket"
      });
      const badgeInfo = getBadgeByCode(result.badge.code);

      setGachaResult({
        badge: {
          ...result.badge,
          ...badgeInfo,
        },
        isNew: result.isNew,
        rarity: result.badge.rarity,
        counter50: result.pityInfo.counter50,
        counter100: result.pityInfo.counter100,
      });
      setShowAnimation(true);
    } catch (error) {
      console.error("Failed to draw ticket gacha:", error);
      alert("チケットガチャの実行に失敗しました");
    }
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    setGachaResult(null);
  };

  // ログインチェック
  if (!clerkUserId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">ログインが必要です</p>
          <p className="text-sm text-gray-500">ガチャを引くにはログインしてください</p>
        </div>
      </div>
    );
  }

  // データ読み込み中
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent"
        >
          ラーメンガチャ
        </motion.h1>
        <p className="text-gray-600 text-sm">
          デイリーガチャやチケットで限定バッジをゲット！
        </p>
      </div>

      {/* 天井カウンター */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 mb-6 border border-purple-200"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h2 className="font-bold text-purple-900">天井カウンター</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {pityCounter?.counter50 || 0}
            </div>
            <div className="text-xs text-gray-600 mt-1">/ 50連</div>
            <div className="text-xs text-gray-500 mt-1">★4以上確定まであと{50 - (pityCounter?.counter50 || 0)}回</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {pityCounter?.counter100 || 0}
            </div>
            <div className="text-xs text-gray-600 mt-1">/ 100連</div>
            <div className="text-xs text-gray-500 mt-1">★5確定まであと{100 - (pityCounter?.counter100 || 0)}回</div>
          </div>
        </div>
      </motion.div>

      {/* ガチャボタン */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {/* デイリーガチャ */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-300 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-orange-500" />
              <h3 className="font-bold text-lg text-orange-900">デイリーガチャ</h3>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              毎日1回無料で引けるガチャ
            </p>

            {dailyStatus?.canDraw ? (
              <button
                onClick={handleDrawDaily}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                無料で引く
              </button>
            ) : (
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">次回リセットまで</div>
                <div className="flex items-center justify-center gap-2 text-orange-600 font-bold">
                  <Clock className="w-4 h-4" />
                  <span>{timeUntilReset}</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* チケットガチャ */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-300 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Ticket className="w-6 h-6 text-purple-500" />
              <h3 className="font-bold text-lg text-purple-900">チケットガチャ</h3>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">所持チケット</div>
              <div className="text-3xl font-bold text-purple-600">
                {tickets?.ticketCount || 0}
                <span className="text-lg text-gray-500 ml-1">枚</span>
              </div>
            </div>

            <button
              onClick={handleDrawTicket}
              disabled={!tickets || tickets.ticketCount < 1}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {tickets && tickets.ticketCount > 0 ? "チケットで引く" : "チケット不足"}
            </button>

            <p className="text-xs text-gray-500 mt-2 text-center">
              投稿でチケットをゲット！
            </p>
          </div>
        </motion.div>
      </div>

      {/* ガチャ履歴 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
      >
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          ガチャ履歴
        </h2>

        {history ? (
          <GachaHistory history={history} />
        ) : (
          <div className="text-center py-8 text-gray-400">
            読み込み中...
          </div>
        )}
      </motion.div>

      {/* ガチャアニメーション */}
      {showAnimation && gachaResult && (
        <GachaAnimation
          isOpen={showAnimation}
          rarity={gachaResult.rarity}
          badgeName={gachaResult.badge.name}
          badgeIcon={gachaResult.badge.icon}
          badgeDescription={gachaResult.badge.description}
          isNew={gachaResult.isNew}
          onComplete={handleAnimationComplete}
        />
      )}
    </div>
  );
}
