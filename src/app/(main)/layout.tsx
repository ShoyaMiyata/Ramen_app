"use client";

import { ThemedLayout } from "@/components/layout/themed-layout";
import { TestUserProvider } from "@/contexts/TestUserContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TestUserProvider>
      <ThemedLayout>{children}</ThemedLayout>
    </TestUserProvider>
  );
}
