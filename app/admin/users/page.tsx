'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

export default function ManageUsersPage() {
    const { token } = useAuth(); // Assuming your AuthContext provides the token
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal State
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState({ name: '', role: '' });

    // Fetch all users on load
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // Fallback to localStorage if token isn't in context directly
            const authToken = token || localStorage.getItem('token');

            const res = await fetch('http://localhost:5000/api/users', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const data = await res.json();

            if (res.ok) {
                setUsers(data);
            } else {
                setError(data.message || 'Failed to fetch users');
            }
        } catch (err) {
            setError('Server error while fetching users');
        } finally {
            setLoading(false);
        }
    };

    // Open Modal
    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setEditForm({ name: user.name, role: user.role });
        setIsEditing(true);
    };

    // Submit Edit
    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        try {
            const authToken = token || localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/users/${selectedUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                // Update local state so we don't need to refresh the page
                setUsers(users.map(u => u._id === selectedUser._id ? { ...u, ...editForm } : u));
                setIsEditing(false);
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to update user');
            }
        } catch (err) {
            alert('Server error while updating user');
        }
    };

    if (loading) return <div className="p-8 text-slate-500">Loading users...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Manage Users</h1>
                    <p className="text-slate-500 mt-1">View and edit user permissions.</p>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-slate-900">{user.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEditClick(user)}
                                        className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit User Modal */}
            {isEditing && selectedUser && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900">Edit User</h3>
                            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="text"
                                    disabled
                                    value={selectedUser.email}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                >
                                    <option value="user">User (Customer)</option>
                                    <option value="manager">Inventory Manager</option>
                                    <option value="delivery">Delivery</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}