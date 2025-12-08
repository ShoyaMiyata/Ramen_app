"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "./useCurrentUser";
import { useTestUser } from "@/contexts/TestUserContext";

/**
 * テストモード対応のユーザーフック
 * - 通常時: 現在のログインユーザーを返す
 * - テストモード時: テストユーザーを返す（管理者のみ）
 *
 * 重要: 書き込み操作は常にrealUserを使用すること
 */
export function useViewingUser() {
  const { user: realUser, isLoaded, isSignedIn, clerkUser } = useCurrentUser();
  const { testUserId, isTestMode } = useTestUser();

  const testUser = useQuery(
    api.users.getById,
    testUserId ? { id: testUserId } : "skip"
  );

  // テストモードかつ管理者かつテストユーザーが取得できている場合
  const isValidTestMode = isTestMode && realUser?.isAdmin && testUser;

  return {
    // 表示用ユーザー（テストモード時はテストユーザー）
    user: isValidTestMode ? testUser : realUser,
    // 実際のログインユーザー（書き込み操作に使用）
    realUser,
    clerkUser,
    isLoaded: isLoaded && (isTestMode ? testUser !== undefined : true),
    isSignedIn,
    isTestMode: isValidTestMode,
  };
}
