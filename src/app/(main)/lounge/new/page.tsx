"use client";

import { NoodleForm } from "@/components/features/noodle-form";

export default function LoungeNewPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-bold text-xl text-gray-900">ラウンジに投稿</h1>
      <NoodleForm room="lounge" />
    </div>
  );
}
