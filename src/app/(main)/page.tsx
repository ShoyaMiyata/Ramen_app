"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage } from "@/components/ui/loading";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoaded } = useCurrentUser();

  useEffect(() => {
    if (isLoaded && user?._id) {
      router.replace(`/users/${user._id}`);
    }
  }, [isLoaded, user, router]);

  return <LoadingPage />;
}
