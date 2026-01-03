import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, CurrentUser, LoginCredentials, clearAuthToken, getAuthToken } from '../services/api';

interface AuthContextType {
    user: CurrentUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check if we have a stored token and fetch user on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = getAuthToken();
            if (token) {
                try {
                    const profile = await authApi.profile();
                    setUser(profile);
                } catch (err) {
                    // Token is invalid or expired
                    clearAuthToken();
                    setUser(null);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            // Login to get the token set
            await authApi.login(credentials);

            // Fetch full user profile after login
            const profile = await authApi.profile();
            setUser(profile);

            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await authApi.logout();
        } catch (err) {
            // Ignore logout errors - we're clearing token anyway
            console.error('Logout error:', err);
        } finally {
            clearAuthToken();
            setUser(null);
            setIsLoading(false);
        }
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const profile = await authApi.profile();
            setUser(profile);
        } catch (err) {
            console.error('Failed to refresh user:', err);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        refreshUser,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Hook to require authentication
export function useRequireAuth(): AuthContextType & { isReady: boolean } {
    const auth = useAuth();

    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated) {
            window.location.href = '/login';
        }
    }, [auth.isLoading, auth.isAuthenticated]);

    return {
        ...auth,
        isReady: !auth.isLoading && auth.isAuthenticated,
    };
}

export default AuthContext;
