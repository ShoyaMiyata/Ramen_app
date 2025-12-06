"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";
import { NoodleForm } from "@/components/features/noodle-form";
import { ArrowLeft } from "lucide-react";

export default function NoodleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoaded } = useCurrentUser();

  const noodle = useQuery(api.noodles.getById, {
    id: id as Id<"noodles">,
  });

  if (!isLoaded || noodle === undefined) {
    return <LoadingPage />;
  }

  if (!noodle) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">記録が見つかりません</p>
      </div>
    );
  }

  if (user?._id !== noodle.userId) {
    router.push(`/noodles/${id}`);
    return <LoadingPage />;
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">戻る</span>
      </button>

      <h1 className="font-bold text-xl text-gray-900">記録を編集</h1>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <NoodleForm noodle={noodle} />
      </div>
    </div>
  );
}
