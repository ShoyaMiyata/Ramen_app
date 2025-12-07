import { useCurrentUser } from "./useCurrentUser";

export function useAdmin() {
  const { user, isLoaded } = useCurrentUser();

  return {
    isAdmin: user?.isAdmin === true,
    isLoading: !isLoaded,
    user,
  };
}
