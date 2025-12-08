"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Id } from "../../convex/_generated/dataModel";

interface TestUserContextType {
  testUserId: Id<"users"> | null;
  setTestUserId: (userId: Id<"users"> | null) => void;
  isTestMode: boolean;
  exitTestMode: () => void;
}

const TestUserContext = createContext<TestUserContextType | undefined>(undefined);

export function TestUserProvider({ children }: { children: ReactNode }) {
  const [testUserId, setTestUserIdState] = useState<Id<"users"> | null>(null);

  const setTestUserId = useCallback((userId: Id<"users"> | null) => {
    setTestUserIdState(userId);
  }, []);

  const exitTestMode = useCallback(() => {
    setTestUserIdState(null);
  }, []);

  return (
    <TestUserContext.Provider
      value={{
        testUserId,
        setTestUserId,
        isTestMode: testUserId !== null,
        exitTestMode,
      }}
    >
      {children}
    </TestUserContext.Provider>
  );
}

export function useTestUser() {
  const context = useContext(TestUserContext);
  if (context === undefined) {
    throw new Error("useTestUser must be used within a TestUserProvider");
  }
  return context;
}
