'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (loading) return;

        const checkAuth = () => {
            if (!user) {
                router.push('/login');
            } else if (!['admin', 'manager', 'delivery'].includes(user.role)) {
                router.push('/');
            } else {
                setIsAuthorized(true);
            }
        };

        checkAuth();
    }, [user, loading, router]);

    if (loading || !isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin w-8 h-8 border-b-2 border-blue-600 rounded-full"></div>
            </div>
        );
    }

    return <>{children}</>;
}