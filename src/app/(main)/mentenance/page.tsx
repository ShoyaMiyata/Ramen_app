"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  Send,
  CheckCircle,
  Lightbulb,
  Wrench,
  Bug,
  MessageCircle,
  Flame,
  Soup,
  ClipboardList,
  Home,
} from "lucide-react";
import Link from "next/link";
import { Id } from "../../../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { code: "feature", label: "新機能の提案", Icon: Lightbulb, color: "#F59E0B" },
  { code: "improvement", label: "改善要望", Icon: Wrench, color: "#3B82F6" },
  { code: "bug", label: "不具合報告", Icon: Bug, color: "#EF4444" },
  { code: "other", label: "その他", Icon: MessageCircle, color: "#8B5CF6" },
];

const HEAT_LEVELS = [
  { level: 1, label: "ぬるめ", flames: 1, description: "いつでも" },
  { level: 2, label: "あつあつ", flames: 2, description: "できれば早めに" },
  { level: 3, label: "激アツ", flames: 3, description: "今すぐ欲しい！" },
];

const getCategoryIcon = (code: string) => {
  const cat = CATEGORIES.find((c) => c.code === code);
  return cat ? { Icon: cat.Icon, color: cat.color } : { Icon: Soup, color: "#F97316" };
};

export default function MentenancePage() {
  const { user } = useCurrentUser();
  const { themeColor } = useTheme();
  const createFeedback = useMutation(api.feedbacks.create);
  const addSteam = useMutation(api.feedbacks.addSteam);
  const feedbacks = useQuery(api.feedbacks.getAll);
  const userSteams = useQuery(
    api.feedbacks.getUserSteams,
    user?._id ? { userId: user._id } : "skip"
  );

  const [category, setCategory] = useState<string>("");
  const [heatLevel, setHeatLevel] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!user?._id || !category || !heatLevel || !message.trim()) return;

    setIsSubmitting(true);
    try {
      await createFeedback({
        userId: user._id,
        category,
        message: message.trim(),
        heatLevel,
      });
      setIsSubmitted(true);
      setCategory("");
      setHeatLevel(0);
      setMessage("");
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSteam = async (feedbackId: Id<"feedbacks">, heatLevel: number) => {
    if (!user?._id) return;
    try {
      await addSteam({ feedbackId, userId: user._id, heatLevel });
    } catch (error) {
      console.error("Failed to add steam:", error);
    }
  };

  const getUserSteamLevel = (feedbackId: Id<"feedbacks">) => {
    return userSteams?.[feedbackId] || 0;
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <CheckCircle
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: themeColor }}
          />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            ご意見ありがとうございます！
          </h1>
          <p className="text-gray-500 mb-6">
            いただいた麺テナンス情報は、
            <br />
            サービス改善に活用させていただきます。
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => setIsSubmitted(false)}
              style={{ backgroundColor: themeColor }}
              className="text-white flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              続けて送信する
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                マイページへ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${themeColor}20` }}
          >
            <Soup className="w-5 h-5" style={{ color: themeColor }} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900">麺テナンス</h1>
            <p className="text-xs text-gray-500">MEN-TENANCE</p>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Nooodleをより良くするためのご意見・ご要望をお聞かせください。
          味の濃い薄いがあれば、調整いたします。
        </p>
      </div>

      {/* Category Selection */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-3">カテゴリ</h2>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.code;
            return (
              <button
                key={cat.code}
                onClick={() => setCategory(cat.code)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${isSelected
                  ? "border-current scale-[1.02] shadow-md"
                  : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                  }`}
                style={{
                  borderColor: isSelected ? cat.color : undefined,
                  backgroundColor: isSelected ? `${cat.color}10` : "#FAFAFA",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  <cat.Icon
                    className="w-4 h-4"
                    style={{ color: cat.color }}
                  />
                </div>
                <p
                  className={`text-sm font-medium ${isSelected ? "" : "text-gray-700"
                    }`}
                  style={{ color: isSelected ? cat.color : undefined }}
                >
                  {cat.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Heat Level Selection */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-2">熱々度</h2>
        <p className="text-xs text-gray-500 mb-3">
          熱いうちにそっと教えてください。
        </p>
        <div className="flex gap-2">
          {HEAT_LEVELS.map((heat) => {
            const isSelected = heatLevel === heat.level;
            const flameColor = heat.level === 1 ? "#94A3B8" : heat.level === 2 ? "#F97316" : "#EF4444";
            return (
              <button
                key={heat.level}
                onClick={() => setHeatLevel(heat.level)}
                className={`flex-1 p-3 rounded-xl border-2 transition-all text-center ${isSelected
                  ? "scale-105 shadow-md"
                  : "border-gray-100 hover:border-gray-200"
                  }`}
                style={{
                  borderColor: isSelected ? flameColor : undefined,
                  backgroundColor: isSelected ? `${flameColor}10` : "#FAFAFA",
                }}
              >
                <div className="flex justify-center gap-0.5 mb-1">
                  {[...Array(heat.flames)].map((_, i) => (
                    <Flame
                      key={i}
                      className="w-4 h-4"
                      style={{ color: isSelected ? flameColor : "#D1D5DB" }}
                    />
                  ))}
                </div>
                <p
                  className={`text-xs font-medium ${isSelected ? "" : "text-gray-700"
                    }`}
                  style={{ color: isSelected ? flameColor : undefined }}
                >
                  {heat.label}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {heat.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-3">メッセージ</h2>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="ご意見・ご要望をお書きください..."
          className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:border-transparent"
          style={
            {
              "--tw-ring-color": themeColor,
            } as React.CSSProperties
          }
        />
        <p className="text-xs text-gray-400 mt-2">
          ※ いただいた内容は匿名で処理されます
        </p>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!category || !heatLevel || !message.trim() || isSubmitting}
        className="w-full gap-2 text-white"
        style={{ backgroundColor: themeColor }}
      >
        <Send className="w-4 h-4" />
        {isSubmitting ? "送信中..." : "熱いうちに送信"}
      </Button>

      {/* Feedback List */}
      {feedbacks && feedbacks.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-gray-600" />
            <h2 className="font-bold text-gray-900">みんなの麺テナンス</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            共感したら熱々ボタンで応援しよう！
          </p>

          <div className="space-y-3">
            <AnimatePresence>
              {feedbacks.map((feedback) => {
                const userSteamLevel = getUserSteamLevel(feedback._id);
                const { Icon, color } = getCategoryIcon(feedback.category);
                const flameCount = feedback.heatLevel || 1;
                return (
                  <motion.div
                    key={feedback._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${color}15` }}
                      >
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 break-words">
                          {feedback.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex gap-0.5">
                            {[...Array(flameCount)].map((_, i) => (
                              <Flame
                                key={i}
                                className="w-3 h-3"
                                style={{
                                  color:
                                    flameCount === 1
                                      ? "#94A3B8"
                                      : flameCount === 2
                                        ? "#F97316"
                                        : "#EF4444",
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(feedback.createdAt).toLocaleDateString("ja-JP")}
                          </span>
                        </div>
                      </div>
                      {/* 3段階の炎ボタン（縦配置・中央揃え） */}
                      <div className="flex flex-col items-center gap-0.5">
                        {[3, 2, 1].map((level) => {
                          const isSelected = userSteamLevel === level;
                          const flameColor =
                            level === 1 ? "#94A3B8" : level === 2 ? "#F97316" : "#EF4444";
                          return (
                            <button
                              key={level}
                              onClick={() => handleSteam(feedback._id, level)}
                              className={`p-1 rounded-lg transition-all ${isSelected
                                ? "scale-110 shadow-sm"
                                : "hover:bg-gray-100"
                                }`}
                              style={{
                                backgroundColor: isSelected ? `${flameColor}20` : undefined,
                              }}
                            >
                              <motion.div
                                animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ duration: 0.2 }}
                                className="flex"
                              >
                                {[...Array(level)].map((_, i) => (
                                  <Flame
                                    key={i}
                                    className="w-3 h-3 -ml-0.5 first:ml-0"
                                    style={{
                                      color: isSelected ? flameColor : "#D1D5DB",
                                    }}
                                  />
                                ))}
                              </motion.div>
                            </button>
                          );
                        })}
                        <span className="text-[10px] font-medium text-gray-500 mt-0.5">
                          {feedback.steamCount || 0}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
