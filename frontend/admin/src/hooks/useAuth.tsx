// src/hooks/useAuth.ts
import { AuthService } from "@app/services/auth.service";
import { setCurrentUser } from "@app/store/reducers/auth";
import { useAppDispatch } from "@app/store/store";
import { useState, useCallback } from "react";

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback(
        async (identifier: string, password: string) => {
            try {
                setLoading(true);
                setError(null);
                const response = await AuthService.login({ identifier, password });
                dispatch(setCurrentUser(response.user));
                return response;
            } catch (err: any) {
                setError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [dispatch]
    );

    const register = useCallback(
        async (identifier: string, password: string, name: string, phone: string) => {
            try {
                setLoading(true);
                setError(null);
                const response = await AuthService.register({
                    identifier,
                    password,
                    name,
                    phone
                });
                dispatch(setCurrentUser(response.user));
                return response;
            } catch (err: any) {
                setError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [dispatch]
    );

    const logout = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            await AuthService.logout();
            dispatch(setCurrentUser(null));
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    return {
        loading,
        error,
        login,
        register,
        logout,
    };
};
