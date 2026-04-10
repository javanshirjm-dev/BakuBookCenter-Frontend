'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setEmail('');
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/en/login');
                }, 3000);
            } else {
                // This should never happen due to anti-enumeration, but handle gracefully
                setError(data.message || 'An error occurred. Please try again.');
            }
        } catch (err) {
            console.error('Forgot password error:', err);
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
                    src="https://images.unsplash.com/photo-150784272343-583f20270319?q=80&w=2000&auto=format&fit=crop"
                    alt="Security and trust"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="relative z-20 flex flex-col justify-center px-20 text-white">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-5xl font-bold leading-tight mb-4">Reset Your Password.</h1>
                    <p className="text-lg text-slate-200 max-w-md">
                        We'll help you regain access to your account securely. Enter your email and we'll send you a password reset link.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 py-16 bg-slate-50">
                <div className="max-w-md w-full">

                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-extrabold text-slate-900">Forgot Password?</h2>
                        <p className="text-slate-500 mt-2">No problem. We'll send you a reset link.</p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50/80 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg text-sm mb-6 flex items-start shadow-sm">
                            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="font-semibold">Check your email!</p>
                                <p className="text-green-600 mt-1">If an account exists with this email, you'll receive a password reset link within minutes.</p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50/80 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg text-sm mb-6 flex items-center shadow-sm">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {!success ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white shadow-sm transition-all outline-none"
                                        placeholder="you@example.com"
                                        disabled={loading}
                                    />
                                </div>
                                <p className="text-slate-500 text-xs mt-1">We'll send a password reset link to this email address</p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-md hover:shadow-lg flex justify-center items-center ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5'
                                    }`}
                            >
                                {loading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : null}
                                {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
                            </button>
                        </form>
                    ) : null}

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
