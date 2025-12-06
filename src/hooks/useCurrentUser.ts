"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useRef } from "react";

export function useCurrentUser() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const upsertUser = useMutation(api.users.upsert);
  const hasUpserted = useRef(false);

  const convexUser = useQuery(
    api.users.getCurrent,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  // Sync user to Convex on first load
  useEffect(() => {
    if (clerkUser && convexUser === null && !hasUpserted.current) {
      hasUpserted.current = true;
      upsertUser({
        clerkId: clerkUser.id,
        name:
          clerkUser.fullName ||
          clerkUser.username ||
          clerkUser.emailAddresses[0]?.emailAddress ||
          "ユーザー",
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        imageUrl: clerkUser.imageUrl,
      });
    }
  }, [clerkUser, convexUser, upsertUser]);

  return {
    user: convexUser,
    clerkUser,
    isLoaded: isClerkLoaded && convexUser !== undefined,
    isSignedIn: !!clerkUser,
  };
}
