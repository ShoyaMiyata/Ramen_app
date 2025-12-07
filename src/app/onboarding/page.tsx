"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { LoadingPage } from "@/components/ui/loading";
import { Soup, User, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useCurrentUser();
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ローディング中
  if (!isLoaded) {
    return <LoadingPage />;
  }

  // 未ログイン
  if (!user) {
    router.push("/sign-in");
    return null;
  }

  // すでにオンボーディング完了済み
  if (user.onboardingComplete) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = nickname.trim();
    if (trimmed.length < 1) {
      setError("ニックネームを入力してください");
      return;
    }
    if (trimmed.length > 20) {
      setError("ニックネームは20文字以内で入力してください");
      return;
    }

    setIsSubmitting(true);
    try {
      await completeOnboarding({
        userId: user._id,
        nickname: trimmed,
      });
      router.push("/");
    } catch (err) {
      setError("エラーが発生しました。もう一度お試しください。");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* ロゴ・ヘッダー */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <Soup className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Nooodleへようこそ！
          </h1>
          <p className="text-gray-500">
            あなたのニックネームを教えてください
          </p>
        </div>

        {/* フォーム */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="mb-6">
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              ニックネーム
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="例: ラーメン太郎"
                maxLength={20}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {nickname.length}/20文字（後から変更できます）
            </p>
            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || nickname.trim().length === 0}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
          >
            {isSubmitting ? (
              "登録中..."
            ) : (
              <>
                はじめる
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </motion.form>

        {/* 補足情報 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>ラーメンの旅を記録しよう</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
