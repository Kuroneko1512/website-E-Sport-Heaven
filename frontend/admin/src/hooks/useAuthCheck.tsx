import { useEffect } from 'react';
import { useAppSelector } from '@app/store/store';
import { useAuth } from '@app/hooks/useAuth'; // ✅ Dùng useAuth như bạn

export const useAuthCheck = () => {
    const auth = useAppSelector((state) => state.auth);
    const { logout } = useAuth(); // ✅ Dùng logout từ useAuth

    const isTokenValid = () => {
        if (!auth.currentUser || !auth.expiresAt) {
            return false;
        }

        const now = new Date();
        const expiresAt = new Date(auth.expiresAt);
        return now < expiresAt;
    };

    const isLoggedIn = !!auth.currentUser && isTokenValid();

    // Auto logout khi token hết hạn
    useEffect(() => {
        if (auth.currentUser && auth.expiresAt) {
            const expiresAt = new Date(auth.expiresAt);
            const now = new Date();

            if (now >= expiresAt) {
                console.log('Token expired, auto logout...');
                logout(); // ✅ Dùng logout từ useAuth
                return;
            }

            // Set timeout để auto logout khi token hết hạn
            const timeUntilExpiry = expiresAt.getTime() - now.getTime();
            const timeoutId = setTimeout(() => {
                console.log('Token expired, auto logout...');
                logout(); // ✅ Dùng logout từ useAuth
            }, timeUntilExpiry);

            return () => clearTimeout(timeoutId);
        }
    }, [auth.expiresAt, auth.currentUser, logout]);

    return { isLoggedIn, auth };
};
