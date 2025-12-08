'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { account } from '@/lib/appwrite';
import { Models } from 'appwrite';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: Models.User<Models.Preferences> | null;
    loading: boolean;
    login: () => void; // Redirects to login page
    logout: () => Promise<void>;
    checkUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const checkUser = async () => {
        try {
            const currentUser = await account.get();
            setUser(currentUser);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkUser();
    }, []);

    const login = () => {
        router.push('/login');
    };

    const logout = async () => {
        try {
            await account.deleteSession('current');
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
