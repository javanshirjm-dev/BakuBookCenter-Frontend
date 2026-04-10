'use client';

import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';
import { AuthProvider, useAuth } from '@/context/AuthContext'; // <-- IMPORT AUTHPROVIDER HERE
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '../../app/globals.css'; // <-- Add your global css so Tailwind works here! Adjust path if needed.

// 1. Rename your original layout to this inner component
function AdminSidebarLayout({ children }: { children: React.ReactNode }) {
    // We use pathname to highlight the active link in the sidebar
    const pathname = usePathname();
    const { user } = useAuth(); // <-- This now works because it's wrapped by AuthProvider below!

    // Define the navigation links for the admin dashboard
    const navItems = [
        {
            name: 'Dashboard',
            href: '/admin',
            icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
            roles: ['admin', 'manager', 'delivery']
        },
        {
            name: 'Manage Books',
            href: '/admin/books',
            icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
            roles: ['admin', 'manager']
        },
        {
            name: 'Manage News',
            href: '/admin/news',
            icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-3l-4 4z',
            roles: ['admin', 'manager']
        },
        {
            name: 'Manage Users',
            href: '/admin/users',
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
            roles: ['admin']
        },
        {
            name: 'Orders',
            href: '/admin/orders',
            icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
            roles: ['admin', 'delivery']
        }
    ];

    const allowedNavItems = navItems.filter(item => user && item.roles.includes(user.role));

    return (
        <AdminProtectedRoute>
            <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
                {/* Left Sidebar */}
                <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Admin Panel</h2>
                        <p className="text-sm text-slate-500 mt-1 capitalize">{user?.role} Access</p>
                    </div>

                    <nav className="p-4 space-y-2 flex-1">
                        {allowedNavItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                                    </svg>
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Back to main site button */}
                    <div className="p-4 mt-auto border-t border-slate-800">
                        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="font-medium">Back to Store</span>
                        </Link>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                    {children}
                </main>
            </div>
        </AdminProtectedRoute>
    );
}

// 2. Export the REAL root layout for the Admin section
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <AdminSidebarLayout>
                        {children}
                    </AdminSidebarLayout>
                </AuthProvider>
            </body>
        </html>
    );
}