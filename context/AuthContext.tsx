'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 1. Define the User structure so TS knows about the 'role' property
interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
}

// 2. Define the context data shape
interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: User, token: string) => void;
    logout: () => void;
    isAdmin: boolean;
    loading: boolean; // Added loading state to prevent flickering on refresh
}

// 3. Create the context with the specific type
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error("Failed to parse user from localStorage", error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData: User, token: string) => {
        setUser(userData);
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        router.push('/');
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            logout,
            isAdmin: user?.role === 'admin',
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// 4. Improved hook with a safety check
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider. Ensure you wrapped layout.tsx!");
    }
    return context;
};