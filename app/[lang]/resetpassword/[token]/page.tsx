'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

export default function ResetPasswordPage() {
    const router = useRouter();
    const params = useParams();

    // Get token from URL params: /en/resetpassword/[token]
    const token = params?.token ? (Array.isArray(params.token) ? params.token[0] : params.token) : '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(true);

    // Validate token on mount
    useEffect(() => {
        if (!token) {
            setTokenValid(false);
            setError('Invalid or missing reset token. Please request a new password reset.');
        }
    }, [token]);

    const validatePassword = (pwd: string): { valid: boolean; message: string } => {
        if (pwd.length < 8) {
            return { valid: false, message: 'Password must be at least 8 characters' };
        }
        if (!/[A-Za-z]/.test(pwd)) {
            return { valid: false, message: 'Password must contain at least one letter' };
        }
        if (!/\d/.test(pwd)) {
            return { valid: false, message: 'Password must contain at least one number' };
        }
        return { valid: true, message: '' };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords
        const validation = validatePassword(password);
        if (!validation.valid) {
            setError(validation.message);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!token) {
            setError('Invalid reset token');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, confirmPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setPassword('');
                setConfirmPassword('');
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/en/login');
                }, 3000);
            } else {
                setError(data.message || 'Failed to reset password. Please try again.');

                // If token expired, mark it invalid
                if (data.message?.includes('expired')) {
                    setTokenValid(false);
                }
            }
        } catch (err) {
            console.error('Reset password error:', err);
            setError('Server error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Image/Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900">
                <div className="absolute inset-0 bg-black/50 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1507842872343-583f20270319?q=80&w=2000&auto=format&fit=crop"
                    alt="Create new password"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="relative z-20 flex flex-col justify-center px-20 text-white">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h1 className="text-5xl font-bold leading-tight mb-4">Create a New Password.</h1>
                    <p className="text-lg text-slate-200 max-w-md">
                        Set a strong password to secure your account. Make sure it's unique and contains letters, numbers, and special characters.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 py-16 bg-slate-50">
                <div className="max-w-md w-full">

                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-extrabold text-slate-900">Reset Password</h2>
                        <p className="text-slate-500 mt-2">Create a strong new password for your account</p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50/80 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg text-sm mb-6 flex items-start shadow-sm">
                            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="font-semibold">Password reset successful!</p>
                                <p className="text-green-600 mt-1">Your password has been updated. Redirecting to login...</p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50/80 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg text-sm mb-6 flex items-start shadow-sm">
                            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div>{error}</div>
                        </div>
                    )}

                    {!success && tokenValid ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">New Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white shadow-sm transition-all outline-none"
                                        placeholder="••••••••"
                                        disabled={loading}
                                    />
                                </div>
                                <p className="text-slate-500 text-xs mt-2">
                                    ✓ At least 8 characters
                                    <br />
                                    ✓ Contains letters and numbers
                                </p>
                            </div>

                            {/* Confirm Password Input */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white shadow-sm transition-all outline-none"
                                        placeholder="••••••••"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Password Match Indicator */}
                            {password && confirmPassword && (
                                <div className={`text-sm font-medium flex items-center ${password === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                                    {password === confirmPassword ? (
                                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !password || !confirmPassword}
                                className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-md hover:shadow-lg flex justify-center items-center ${loading || !password || !confirmPassword
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5'
                                    }`}
                            >
                                {loading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : null}
                                {loading ? 'Resetting Password...' : 'Reset Password'}
                            </button>
                        </form>
                    ) : null}

                    {!tokenValid && !success && (
                        <div className="bg-yellow-50/80 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-r-lg text-sm mb-6 flex items-start shadow-sm">
                            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="font-semibold">Reset link expired or invalid</p>
                                <p className="text-yellow-600 mt-1">Please request a new password reset to proceed.</p>
                            </div>
                        </div>
                    )}

                    {/* Back to Login Link */}
                    <p className="text-center text-slate-600 mt-8 text-sm">
                        Remember your password?{' '}
                        <Link href="/en/login" className="text-blue-600 font-bold hover:underline transition-all">
                            Back to sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
