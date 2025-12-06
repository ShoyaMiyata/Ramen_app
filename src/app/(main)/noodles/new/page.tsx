"use client";

import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";
import { NoodleForm } from "@/components/features/noodle-form";
import { ArrowLeft } from "lucide-react";

export default function NewNoodlePage() {
  const router = useRouter();
  const { isLoaded } = useCurrentUser();

  if (!isLoaded) {
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

      <h1 className="font-bold text-xl text-gray-900">新しい記録</h1>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <NoodleForm />
      </div>
    </div>
  );
}
