'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const T = {
    cream: "#F8F4EE",
    parchment: "#EFE9DF",
    clay: "#D4C4B0",
    terra: "#B5623E",
    terraDark: "#8C4530",
    ink: "#1C1814",
    inkMid: "#4A3F35",
    inkLight: "#8C7B6E",
    white: "#FDFCFA",
};

export default function RegisterPage() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState<string | null>(null);
    const { login } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) return setError("Passwords do not match.");
        if (formData.password.length < 8) return setError("Password must be at least 8 characters.");
        if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) return setError("Password must contain at least one letter and one number.");
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
            });
            const data = await res.json();
            if (res.ok) login(data.user, data.token);
            else setError(data.message || "Registration failed");
        } catch { setError("Server error. Please try again later."); }
        finally { setLoading(false); }
    };

    const fields = [
        { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Jane Smith' },
        { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
        { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
        { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
    ];

    /* password strength */
    const pw = formData.password;
    const strength = !pw ? 0 : pw.length < 6 ? 1 : pw.length < 8 || !/(?=.*[A-Za-z])(?=.*\d)/.test(pw) ? 2 : 3;
    const strengthLabel = ['', 'Weak', 'Almost there', 'Strong'];
    const strengthColor = ['', '#EF4444', '#F59E0B', '#3A6B4A'];

    return (
        <div style={{
            fontFamily: "'Outfit', sans-serif",
            backgroundColor: T.white,

            display: 'flex',
            flexDirection: 'column',
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Outfit:wght@300;400;500&display=swap');
        ::selection { background: ${T.terra}; color: ${T.white}; }
        input::placeholder { color: ${T.clay}; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin   { to { transform: rotate(360deg); } }
      `}</style>

            {/* Top accent */}
            <div style={{ height: '3px', background: `linear-gradient(to right, ${T.terra}, ${T.clay}, transparent)` }} />

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '45px 24px' }}>
                <div style={{ width: '100%', maxWidth: '440px', animation: 'fadeUp 0.65s ease both' }}>



                    {/* Heading */}
                    <div style={{ marginBottom: '40px' }}>
                        <p style={{
                            fontSize: '10px', fontWeight: 500, letterSpacing: '0.22em',
                            textTransform: 'uppercase', color: T.terra, marginBottom: '10px',
                        }}>
                            New here
                        </p>
                        <h1 style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '48px', fontWeight: 400, lineHeight: 1.0,
                            color: T.ink, marginBottom: '10px',
                        }}>
                            Create Account
                        </h1>
                        <p style={{ fontSize: '14px', color: T.inkLight, fontWeight: 300 }}>
                            Already have an account?{' '}
                            <Link href="/login" style={{
                                color: T.terra, textDecoration: 'underline',
                                textDecorationColor: T.clay, textUnderlineOffset: '3px',
                            }}>
                                Log in here
                            </Link>
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            marginBottom: '24px', padding: '13px 16px',
                            backgroundColor: '#FEF2F2',
                            border: '1px solid #FECACA', borderLeft: '3px solid #EF4444',
                            borderRadius: '2px',
                        }}>
                            <p style={{ fontSize: '13px', color: '#991B1B', lineHeight: 1.5 }}>⚠ {error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {fields.map(({ name, label, type, placeholder }, i) => (
                            <div key={name} style={{ animationDelay: `${0.05 * i}s` }}>
                                <label style={{
                                    display: 'block', fontSize: '10px', fontWeight: 500,
                                    letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '8px',
                                    color: focused === name ? T.terra : T.inkLight,
                                    transition: 'color 0.2s ease',
                                }}>
                                    {label}
                                </label>
                                <input
                                    name={name} type={type} required
                                    value={formData[name as keyof typeof formData]}
                                    onChange={handleChange}
                                    onFocus={() => setFocused(name)}
                                    onBlur={() => setFocused(null)}
                                    placeholder={placeholder}
                                    style={{
                                        width: '100%', padding: '13px 16px',
                                        border: `1px solid ${focused === name ? T.terra : T.clay}`,
                                        borderRadius: '2px', outline: 'none',
                                        backgroundColor: T.white, color: T.ink,
                                        fontSize: '14px', fontWeight: 300,
                                        fontFamily: "'Outfit', sans-serif",
                                        transition: 'border-color 0.2s ease',
                                        boxSizing: 'border-box',
                                    }}
                                />

                                {/* Password strength bar */}
                                {name === 'password' && pw && (
                                    <div style={{ marginTop: '8px' }}>
                                        <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                            {[1, 2, 3].map(lvl => (
                                                <div key={lvl} style={{
                                                    flex: 1, height: '2px', borderRadius: '2px',
                                                    backgroundColor: strength >= lvl ? strengthColor[strength] : T.parchment,
                                                    transition: 'background-color 0.3s ease',
                                                }} />
                                            ))}
                                        </div>
                                        <p style={{ fontSize: '11px', color: strengthColor[strength], fontWeight: 400 }}>
                                            {strengthLabel[strength]}
                                        </p>
                                    </div>
                                )}

                                {/* Password match indicator */}
                                {name === 'confirmPassword' && formData.confirmPassword && (
                                    <p style={{
                                        fontSize: '11px', marginTop: '6px', fontWeight: 400,
                                        color: formData.password === formData.confirmPassword ? '#3A6B4A' : '#EF4444',
                                    }}>
                                        {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                    </p>
                                )}
                            </div>
                        ))}

                        {/* Password rules hint */}
                        <p style={{ fontSize: '11px', color: T.clay, fontWeight: 300, lineHeight: 1.6, marginTop: '-4px' }}>
                            Min. 8 characters with at least one letter and one number.
                        </p>

                        {/* Submit */}
                        <button
                            type="submit" disabled={loading}
                            style={{
                                width: '100%', padding: '15px',
                                backgroundColor: loading ? T.clay : T.terra,
                                color: T.white, fontSize: '11px', fontWeight: 500,
                                letterSpacing: '0.18em', textTransform: 'uppercase',
                                border: 'none', borderRadius: '2px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontFamily: "'Outfit', sans-serif",
                                transition: 'background-color 0.2s ease',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                marginTop: '4px',
                            }}
                            onMouseEnter={e => { if (!loading) (e.currentTarget.style.backgroundColor = T.terraDark); }}
                            onMouseLeave={e => { if (!loading) (e.currentTarget.style.backgroundColor = T.terra); }}
                        >
                            {loading ? (
                                <>
                                    <span style={{
                                        width: '13px', height: '13px',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTop: '2px solid white', borderRadius: '50%',
                                        display: 'inline-block', animation: 'spin 0.7s linear infinite',
                                    }} />
                                    Creating Account…
                                </>
                            ) : 'Create Account →'}
                        </button>
                    </form>



                </div>
            </div>
        </div>
    );
}