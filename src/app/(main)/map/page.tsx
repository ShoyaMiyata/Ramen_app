"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useViewingUser } from "@/hooks/useViewingUser";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { LoadingPage } from "@/components/ui/loading";
import { PrefectureDetailModal } from "@/components/features/japan-map/prefecture-detail-modal";
import { BadgeCollection } from "@/components/features/prefecture-badge";
import { LockedFeatureOverlay } from "@/components/features/rank-restriction";
import {
  REGIONS,
  getPrefecturesByRegion,
  BADGE_TIERS,
  type PrefectureCode,
} from "@/lib/constants/prefectures";
import { useTheme } from "@/contexts/ThemeContext";
import { MapPin, Trophy, Check, Users, Globe, User, ChevronDown, Search, X, Check as CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import * as Popover from "@radix-ui/react-popover";

type ViewMode = "my" | "group" | "global";

export default function MapPage() {
  const { user, isLoaded } = useViewingUser();
  const { themeColor } = useTheme();
  const [selectedPrefecture, setSelectedPrefecture] =
    useState<PrefectureCode | null>(null);

  // View Mode State
  const [viewMode, setViewMode] = useState<ViewMode>("my");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Group Selector State
  const [isGroupSelectorOpen, setIsGroupSelectorOpen] = useState(false);
  const [groupSearchText, setGroupSearchText] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<{
    _id: string;
    name: string;
    coverImageUrl?: string | null;
  } | null>(null);

  // Queries
  const myStats = useQuery(
    api.prefectures.getVisitStats,
    user?._id ? { userId: user._id } : "skip"
  );

  const allGroups = useQuery(api.groups.list, {
    limit: 50,
    searchText: groupSearchText
  });

  const groupStats = useQuery(
    api.prefectures.getGroupVisitStats,
    viewMode === "group" && selectedGroupId
      ? { groupId: selectedGroupId as any }
      : "skip"
  );

  const globalStats = useQuery(
    api.prefectures.getGlobalVisitStats,
    viewMode === "global" ? {} : "skip"
  );

  const { canAccessConquestMap, shopCount } = useFeatureAccess();

  // Update selectedGroup object when ID changes or data loads
  useEffect(() => {
    if (selectedGroupId && allGroups?.groups) {
      const group = allGroups.groups.find(g => g._id === selectedGroupId);
      if (group) {
        setSelectedGroup(group);
      }
    }
  }, [selectedGroupId, allGroups]);

  // Set default group if none selected
  useEffect(() => {
    if (!selectedGroupId && allGroups?.groups && allGroups.groups.length > 0) {
      setSelectedGroupId(allGroups.groups[0]._id);
      setSelectedGroup(allGroups.groups[0]);
    }
  }, [allGroups, selectedGroupId]);

  if (!isLoaded) {
    return <LoadingPage />;
  }

  // Determine which stats to show
  const currentStats =
    viewMode === "my" ? myStats :
      viewMode === "group" ? groupStats :
        viewMode === "global" ? globalStats : null;

  const isLoadingStats = viewMode === "my" ? !myStats :
    viewMode === "group" ? !groupStats :
      viewMode === "global" ? !globalStats : true;

  // 制覇マップへのアクセス制限（麺歩き Lv2, 5店舗で解放）
  // 自分のマップを見るときだけ制限をかけるか、全体にかけるか。
  // ここでは全体にかけておく（機能自体がロック解除報酬という位置づけ）
  if (!canAccessConquestMap) {
    return (
      <LockedFeatureOverlay
        requiredLevel={2}
        requiredShops={5}
        currentShops={shopCount}
        featureName="制覇マップ"
        description="47都道府県の訪問状況を地図で確認できます"
      >
        <div className="space-y-4 pb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" style={{ color: themeColor }} />
            <h1 className="font-bold text-xl text-gray-900">制覇マップ</h1>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm h-32" />
          <div className="bg-white rounded-xl p-4 shadow-sm h-48" />
          <div className="bg-white rounded-xl p-4 shadow-sm h-64" />
        </div>
      </LockedFeatureOverlay>
    );
  }

  // Stats Data
  const prefectures = currentStats?.prefectures || {};
  const summary = currentStats?.summary || { total: 0, bronze: 0, silver: 0, gold: 0 };

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5" style={{ color: themeColor }} />
          <h1 className="font-bold text-xl text-gray-900">制覇マップ</h1>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white p-1 rounded-xl shadow-sm flex">
        <button
          onClick={() => setViewMode("my")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all",
            viewMode === "my"
              ? "bg-gray-100 text-gray-900 shadow-sm"
              : "text-gray-500 hover:bg-gray-50"
          )}
        >
          <User className="w-4 h-4" />
          自分
        </button>
        <button
          onClick={() => setViewMode("group")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all",
            viewMode === "group"
              ? "bg-gray-100 text-gray-900 shadow-sm"
              : "text-gray-500 hover:bg-gray-50"
          )}
        >
          <Users className="w-4 h-4" />
          グループ
        </button>
        <button
          onClick={() => setViewMode("global")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all",
            viewMode === "global"
              ? "bg-gray-100 text-gray-900 shadow-sm"
              : "text-gray-500 hover:bg-gray-50"
          )}
        >
          <Globe className="w-4 h-4" />
          全ユーザー
        </button>
      </div>

      {/* Group Selector (only for group mode) */}
      {viewMode === "group" && (
        <div className="bg-white p-3 rounded-xl shadow-sm">
          <Popover.Root open={isGroupSelectorOpen} onOpenChange={setIsGroupSelectorOpen}>
            <Popover.Trigger asChild>
              <button className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg p-2.5 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  {selectedGroup ? (
                    <>
                      {selectedGroup.coverImageUrl ? (
                        <img src={selectedGroup.coverImageUrl} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <Users className="w-3 h-3 text-orange-500" />
                        </div>
                      )}
                      <span className="truncate">{selectedGroup.name}</span>
                    </>
                  ) : (
                    <span className="text-gray-500">グループを選択</span>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content className="w-[calc(100vw-32px)] max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-200" align="start" sideOffset={5}>
                {/* Search Input */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="グループを検索..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    value={groupSearchText}
                    onChange={(e) => setGroupSearchText(e.target.value)}
                  />
                  {groupSearchText && (
                    <button
                      onClick={() => setGroupSearchText("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Group List */}
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {!allGroups ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500 mx-auto" />
                    </div>
                  ) : allGroups.groups.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      グループが見つかりません
                    </div>
                  ) : (
                    allGroups.groups.map((group) => (
                      <button
                        key={group._id}
                        onClick={() => {
                          setSelectedGroupId(group._id);
                          setSelectedGroup(group);
                          setIsGroupSelectorOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors",
                          selectedGroupId === group._id
                            ? "bg-orange-50 text-orange-900 font-medium"
                            : "hover:bg-gray-50 text-gray-700"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {group.coverImageUrl ? (
                            <img src={group.coverImageUrl} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                              <Users className="w-3 h-3 text-orange-500" />
                            </div>
                          )}
                          <span className="truncate">{group.name}</span>
                        </div>
                        {selectedGroupId === group._id && (
                          <CheckIcon className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      )}

      {isLoadingStats ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : (
        <>
          {/* Stats Summary */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4" style={{ color: themeColor }} />
              <span className="font-bold text-gray-900">統計 ({viewMode === "my" ? "自分" : viewMode === "group" ? "グループ" : "全体"})</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold" style={{ color: themeColor }}>
                  {summary.total}
                </div>
                <div className="text-xs text-gray-500">制覇</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <div
                  className="text-2xl font-bold"
                  style={{ color: BADGE_TIERS.bronze.color }}
                >
                  {summary.bronze}
                </div>
                <div className="text-xs text-gray-500">銅</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <div
                  className="text-2xl font-bold"
                  style={{ color: BADGE_TIERS.silver.color }}
                >
                  {summary.silver}
                </div>
                <div className="text-xs text-gray-500">銀</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <div
                  className="text-2xl font-bold"
                  style={{ color: BADGE_TIERS.gold.color }}
                >
                  {summary.gold}
                </div>
                <div className="text-xs text-gray-500">金</div>
              </div>
            </div>
          </div>

          {/* Region Progress */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3">地方別進捗</h2>
            <div className="space-y-3">
              {REGIONS.map((region) => {
                const regionPrefectures = getPrefecturesByRegion(region.code);
                const visitedCount = regionPrefectures.filter(
                  (p) => prefectures[p.code]?.visitCount > 0
                ).length;
                const total = regionPrefectures.length;
                const progress = (visitedCount / total) * 100;
                const isComplete = visitedCount === total;

                return (
                  <div key={region.code}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-700">{region.name}</span>
                        {isComplete && (
                          <Check
                            className="w-4 h-4"
                            style={{ color: themeColor }}
                          />
                        )}
                      </div>
                      <span className="text-gray-500">
                        {visitedCount}/{total}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: isComplete
                            ? BADGE_TIERS.gold.color
                            : themeColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badge Collection (Only show for My Map for now, or adapted for others?) */}
          {/* BadgeCollection component specifically takes a userId. 
              We might want to hide it or adapt it for Group/Global views since it's personal badges.
              For now, hide it if not 'my' mode because it fetches `userBadges` table which is personal.
           */}
          {viewMode === "my" && user && <BadgeCollection userId={user._id} showLocked />}

          {/* Prefecture List by Region */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3">都道府県一覧</h2>
            <div className="space-y-4">
              {REGIONS.map((region) => {
                const regionPrefectures = getPrefecturesByRegion(region.code);

                return (
                  <div key={region.code}>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      {region.name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {regionPrefectures.map((pref) => {
                        const data = prefectures[pref.code];
                        const tier = data?.tier;
                        const bgColor = tier
                          ? BADGE_TIERS[tier].color
                          : "#E9ECEF";
                        const textColor = tier ? "white" : "#6B7280";

                        return (
                          <button
                            key={pref.code}
                            onClick={() =>
                              // Only allow detail view if "my" mode? 
                              // Detail modal shows "my" posts.
                              // For group/global, we might just show simplified info or nothing.
                              // For now, let's keep it clickable but maybe warn or just show same modal (which might be confusing if it shows PERSONAL posts).
                              // Actually `PrefectureDetailModal` fetches `noodles` by `userId`.
                              // So it only works for "My" mode currently.
                              viewMode === "my" ? setSelectedPrefecture(pref.code as PrefectureCode) : null
                            }
                            className={cn(
                              "px-2 py-1 rounded text-xs font-medium transition-transform active:scale-95",
                              viewMode !== "my" && "cursor-default active:scale-100"
                            )}
                            style={{
                              backgroundColor: bgColor,
                              color: textColor,
                            }}
                          >
                            {pref.name.replace(/[県府都道]$/, "")}
                            {data && (
                              <span className="ml-1 opacity-80">
                                ({data.visitCount})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Prefecture Detail Modal (Only for My Mode) */}
      {viewMode === "my" && user && (
        <PrefectureDetailModal
          prefectureCode={selectedPrefecture}
          userId={user._id}
          onClose={() => setSelectedPrefecture(null)}
        />
      )}
    </div>
  );
}
