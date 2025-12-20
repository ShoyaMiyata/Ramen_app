"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";

interface GroupJoinButtonProps {
  groupId: Id<"groups">;
  userId: Id<"users">;
  isMember: boolean;
  isCreator: boolean;
}

export function GroupJoinButton({
  groupId,
  userId,
  isMember,
  isCreator,
}: GroupJoinButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const join = useMutation(api.groups.join);
  const leave = useMutation(api.groups.leave);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (isMember) {
        await leave({ groupId, userId });
      } else {
        await join({ groupId, userId });
      }
    } catch (error: any) {
      alert(error.message || "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  // 作成者の場合はボタンを表示しない
  if (isCreator) {
    return null;
  }

  return (
    <Button
      variant={isMember ? "outline" : "default"}
      className="flex-1 gap-2"
      onClick={handleToggle}
      disabled={isLoading}
    >
      {isMember ? (
        <>
          <UserMinus className="w-4 h-4" />
          退出する
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          参加する
        </>
      )}
    </Button>
  );
}
