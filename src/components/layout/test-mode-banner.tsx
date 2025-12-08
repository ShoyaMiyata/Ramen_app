"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useTestUser } from "@/contexts/TestUserContext";
import { X, Eye } from "lucide-react";

export function TestModeBanner() {
  const { testUserId, isTestMode, exitTestMode } = useTestUser();

  const testUser = useQuery(
    api.users.getById,
    testUserId ? { id: testUserId } : "skip"
  );

  if (!isTestMode || !testUser) {
    return null;
  }

  return (
    <div className="sticky top-14 z-40 bg-purple-600 text-white">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">
            {testUser.name || "ユーザー"} として閲覧中
          </span>
        </div>
        <button
          onClick={exitTestMode}
          className="p-1 hover:bg-purple-500 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
