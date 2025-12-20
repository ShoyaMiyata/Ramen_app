"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { User, Crown, UserPlus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import * as Dialog from "@radix-ui/react-dialog";

interface GroupMemberListProps {
  groupId: Id<"groups">;
}

export function GroupMemberList({ groupId }: GroupMemberListProps) {
  const { user: currentUser } = useCurrentUser();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const members = useQuery(api.groups.getMembers, { groupId });
  const searchResults = useQuery(
    api.users.search,
    searchText.length > 0 ? { searchText } : "skip"
  );
  const addMember = useMutation(api.groups.addMember);

  if (members === undefined) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleAddMember = async (targetUserId: Id<"users">) => {
    if (!currentUser) return;

    setIsAdding(true);
    try {
      await addMember({
        groupId,
        adderId: currentUser._id,
        targetUserId,
      });
      setIsAddDialogOpen(false);
      setSearchText("");
    } catch (error: any) {
      alert(error.message || "メンバーの追加に失敗しました");
    } finally {
      setIsAdding(false);
    }
  };

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center shadow-sm">
        <User className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-500">まだメンバーがいません</p>
      </div>
    );
  }

  const memberIds = new Set(members.map((m) => m._id));
  const filteredSearchResults = searchResults?.filter((u) => !memberIds.has(u._id));

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Add Member Button */}
        {currentUser && (
          <div className="p-4 border-b border-gray-100">
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="w-full gap-2"
              variant="outline"
            >
              <UserPlus className="w-4 h-4" />
              メンバーを追加
            </Button>
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {members.map((member) => (
          <Link
            key={member._id}
            href={`/users/${member._id}`}
            className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
          >
            {member.imageUrl ? (
              <img
                src={member.imageUrl}
                alt={member.name || ""}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 truncate">
                  {member.name || "ユーザー"}
                </p>
                {member.isCreator && (
                  <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-500">
                {member.isCreator ? "グループ作成者" : "メンバー"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>

      {/* Add Member Dialog */}
      <Dialog.Root open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl w-[90%] max-w-md max-h-[80vh] overflow-hidden z-50 shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Dialog.Title className="text-lg font-bold text-gray-900">
                メンバーを追加
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </Dialog.Close>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="ユーザー名で検索..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto">
              {searchText.length === 0 ? (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">
                    ユーザー名を入力して検索してください
                  </p>
                </div>
              ) : filteredSearchResults === undefined ? (
                <div className="space-y-3 p-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-12 h-12 rounded-full bg-gray-200" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredSearchResults.length === 0 ? (
                <div className="p-8 text-center">
                  <User className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">
                    {searchResults?.length === 0
                      ? "ユーザーが見つかりませんでした"
                      : "追加できるユーザーがいません"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredSearchResults.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => handleAddMember(user._id)}
                      disabled={isAdding}
                      className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {user.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={user.name || ""}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {user.name || "ユーザー"}
                        </p>
                      </div>
                      <UserPlus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
