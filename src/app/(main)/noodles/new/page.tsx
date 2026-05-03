"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";
import { NoodleForm } from "@/components/features/noodle-form";
import { ArrowLeft } from "lucide-react";

function NewNoodleContent() {
  const router = useRouter();
  const { isLoaded } = useCurrentUser();
  const searchParams = useSearchParams();

  const shopIdParam = searchParams.get("shopId");
  const ramenNameParam = searchParams.get("ramenName") ?? undefined;
  const fromBookmarkNoodleIdParam = searchParams.get("fromBookmarkNoodleId") ?? undefined;

  const prefilledShop = useQuery(
    api.shops.getById,
    shopIdParam ? { shopId: shopIdParam as Id<"shops">, viewerId: undefined } : "skip"
  );

  if (!isLoaded) {
    return <LoadingPage />;
  }

  const isLoadingPrefill = shopIdParam && prefilledShop === undefined;
  if (isLoadingPrefill) {
    return <LoadingPage />;
  }

  const prefill = shopIdParam && prefilledShop
    ? {
        shop: {
          _id: prefilledShop._id,
          _creationTime: prefilledShop._creationTime,
          name: prefilledShop.name,
          address: prefilledShop.address,
          prefecture: prefilledShop.prefecture,
          station: prefilledShop.station,
        } as any,
        ramenName: ramenNameParam,
        fromBookmarkNoodleId: fromBookmarkNoodleIdParam as Id<"noodles"> | undefined,
      }
    : undefined;

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">戻る</span>
      </button>

      <h1 className="font-bold text-xl text-gray-900">今日の一杯を記録</h1>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <NoodleForm prefill={prefill} />
      </div>
    </div>
  );
}

export default function NewNoodlePage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <NewNoodleContent />
    </Suspense>
  );
}
