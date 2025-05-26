import { useAppSelector } from '@app/store/store';

export const useIsLoggedIn = (): boolean => {
  const auth = useAppSelector((state) => state.auth);

  if (!auth.currentUser || !auth.accessToken) {
    return false;
  }

  if (!auth.expiresAt) {
    return true; // No expiration info, assume valid
  }

  const expiresAt = new Date(auth.expiresAt).getTime();
  const now = Date.now();

  return now < expiresAt;
};
