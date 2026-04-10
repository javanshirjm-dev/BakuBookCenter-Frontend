'use client';

import { useState, useEffect } from 'react';

// 1. A handy helper function to extract the string out of your translation objects!
const getLocalizedText = (text: any): string => {
    if (!text) return 'Unknown';
    if (typeof text === 'string') return text;
    return text.en || text.az || text.ru || 'Unknown';
};

interface DashboardStats {
    totalBooks: number;
    totalUsers?: number;
    discountedBooks: number;
    totalRevenue?: string;
    averagePrice?: string;
    isAdmin: boolean;
    recentBooks: Array<{
        _id: string;
        name: any; // Changed to 'any' to accept the {az, en, ru} object without TS yelling
        price: number;
        category: any;
        author: any;
        hasDiscount: boolean;
        discountedPrice?: number;
    }>;
    booksByCategory?: Array<{
        _id: any; // The category name might also be an object!
        count: number;
    }>;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string>('user');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserRole(user.role || 'user');
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                const res = await fetch(`${apiUrl}/dashboard/stats?role=${userRole}`);
                if (!res.ok) throw new Error('Failed to fetch stats');
                const data = await res.json();
                setStats(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error loading dashboard');
            } finally {
                setLoading(false);
            }
        };

        if (userRole) {
            fetchStats();
        }
    }, [userRole]);

    const statCards = stats && stats.isAdmin ? [
        { title: 'Total Books', value: stats.totalBooks.toString(), icon: '📚', color: 'bg-blue-50 text-blue-600', borderColor: 'border-blue-200' },
        { title: 'Registered Users', value: stats.totalUsers?.toString() || '0', icon: '👥', color: 'bg-purple-50 text-purple-600', borderColor: 'border-purple-200' },
        { title: 'Books on Sale', value: stats.discountedBooks.toString(), icon: '🏷️', color: 'bg-orange-50 text-orange-600', borderColor: 'border-orange-200' },
        { title: 'Total Revenue', value: `$${stats.totalRevenue}`, icon: '💰', color: 'bg-green-50 text-green-600', borderColor: 'border-green-200' },
    ] : [
        { title: 'Total Books', value: stats?.totalBooks.toString() || '0', icon: '📚', color: 'bg-blue-50 text-blue-600', borderColor: 'border-blue-200' },
        { title: 'Books on Sale', value: stats?.discountedBooks.toString() || '0', icon: '🏷️', color: 'bg-orange-50 text-orange-600', borderColor: 'border-orange-200' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
                        <p className="text-slate-600 mt-2">Loading your analytics...</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-white rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-600 mt-2">
                        Role: <span className="font-semibold capitalize">{userRole}</span>
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {/* Restricted Access Notice */}
                {!stats?.isAdmin && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                        <span className="text-2xl">🔒</span>
                        <div>
                            <p className="font-semibold text-blue-900">Limited Access</p>
                            <p className="text-blue-700 text-sm">As a {userRole}, you can view basic inventory information only. Financial and user data is restricted to admin users.</p>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className={`grid gap-6 mb-8 ${stats?.isAdmin ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
                    {statCards.map((stat, idx) => (
                        <div key={idx} className={`${stat.color} ${stat.borderColor} border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                                    <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                                </div>
                                <span className="text-3xl">{stat.icon}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Admin-Only Metrics */}
                {stats?.isAdmin && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-900">Average Book Price</h3>
                                <span className="text-2xl">📊</span>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">${stats?.averagePrice}</p>
                            <p className="text-sm text-slate-500 mt-2">Based on all books in inventory</p>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-900">Sale Percentage</h3>
                                <span className="text-2xl">%</span>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">
                                {stats?.totalBooks ? ((stats.discountedBooks / stats.totalBooks) * 100).toFixed(1) : 0}%
                            </p>
                            <p className="text-sm text-slate-500 mt-2">Of books have discounts</p>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="font-semibold text-slate-900 mb-4">Quick Stats</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Books per User:</span>
                                    <span className="font-semibold text-slate-900">
                                        {stats?.totalUsers ? (stats.totalBooks / stats.totalUsers).toFixed(2) : 0}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Avg Revenue/Book:</span>
                                    <span className="font-semibold text-slate-900">
                                        ${stats?.totalRevenue ? (parseFloat(stats.totalRevenue) / stats.totalBooks).toFixed(2) : 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Books Section */}
                {stats?.recentBooks && stats.recentBooks.length > 0 && (
                    <div className={`grid gap-6 mb-8 ${stats?.isAdmin ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recently Added Books</h3>
                            <div className="space-y-3">
                                {stats.recentBooks.map((book) => (
                                    <div key={book._id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                {/* 2. We wrap the name and author in our helper function! */}
                                                <p className="font-medium text-slate-900 truncate">{getLocalizedText(book.name)}</p>
                                                <p className="text-sm text-slate-500">{getLocalizedText(book.author)}</p>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-900 ml-2">
                                                {book.hasDiscount ? `$${book.discountedPrice}` : `$${book.price}`}
                                            </span>
                                        </div>
                                        {book.hasDiscount && (
                                            <span className="inline-block mt-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                                                On Sale
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Books by Category - Admin Only */}
                        {stats?.isAdmin && stats?.booksByCategory && stats.booksByCategory.length > 0 && (
                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Books by Category</h3>
                                <div className="space-y-3">
                                    {/* 3. Wrap the category _id in our helper function! */}
                                    {stats.booksByCategory.map((cat, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-slate-700 font-medium">{getLocalizedText(cat._id)}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-32 bg-slate-100 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-500 h-2 rounded-full"
                                                        style={{
                                                            width: `${(cat.count / (stats.totalBooks || 1)) * 100}%`
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-slate-900 font-semibold w-12 text-right">{cat.count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Note */}
                <div className="bg-slate-100 rounded-xl border border-slate-200 p-4 text-center text-sm text-slate-600">
                    {stats?.isAdmin ? (
                        <>📈 Dashboard data updates automatically. Last synced with your MongoDB database.</>
                    ) : (
                        <>📖 You are viewing limited data. Contact an administrator for financial details.</>
                    )}
                </div>
            </div>
        </div>
    );
}