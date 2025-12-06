"use client";

import { ThemedLayout } from "@/components/layout/themed-layout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemedLayout>{children}</ThemedLayout>;
}
