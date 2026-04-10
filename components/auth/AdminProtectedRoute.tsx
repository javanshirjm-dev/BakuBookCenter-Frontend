'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
    // 1. Grab the 'loading' state from your context!
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // 2. If AuthContext is still checking local storage/cookies, STOP here and wait!
        if (loading) return;

        // 3. Once loading is completely false, THEN we check the user
        const checkAuth = () => {
            if (!user) {
                // Not logged in -> send to login (Make sure this path is correct for your app!)
                router.push('/login');
            } else if (!['admin', 'manager', 'delivery'].includes(user.role)) {
                // Logged in but wrong role -> send home
                router.push('/');
            } else {
                // User has the right role -> grant access
                setIsAuthorized(true);
            }
        };

        checkAuth();
    }, [user, loading, router]); // <-- Make sure loading is in this array!

    // 4. Show the spinner while AuthContext is loading OR while we authorize
    if (loading || !isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin w-8 h-8 border-b-2 border-blue-600 rounded-full"></div>
            </div>
        );
    }

    // If authorized, render the admin page
    return <>{children}</>;
}