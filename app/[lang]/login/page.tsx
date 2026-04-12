'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/locales/translations';

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

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState<string | null>(null);
    const { login } = useAuth();
    const { language } = useLanguage();

    const lo = translations[language as keyof typeof translations].login;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok) login(data.user, data.token);
            else setError(data.message || lo.errorDefault);
        } catch { setError(lo.errorServer); }
        finally { setLoading(false); }
    };

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

            {/* ── TOP BORDER ACCENT ── */}
            <div style={{ height: '3px', background: `linear-gradient(to right, ${T.terra}, ${T.clay}, transparent)` }} />

            {/* ── PAGE ── */}
            <div style={{
                flex: 1, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                padding: '45px 24px',
            }}>
                <div style={{ width: '100%', maxWidth: '440px', animation: 'fadeUp 0.65s ease both' }}>

                    {/* Heading */}
                    <div style={{ marginBottom: '40px' }}>
                        <p style={{
                            fontSize: '10px', fontWeight: 500, letterSpacing: '0.22em',
                            textTransform: 'uppercase', color: T.terra, marginBottom: '10px',
                        }}>
                            {lo.welcomeBack}
                        </p>
                        <h1 style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '48px', fontWeight: 400, lineHeight: 1.0,
                            color: T.ink, marginBottom: '10px',
                        }}>
                            {lo.title}
                        </h1>
                        <p style={{ fontSize: '14px', color: T.inkLight, fontWeight: 300 }}>
                            {lo.noAccount}{' '}
                            <Link href="/register" style={{
                                color: T.terra, textDecoration: 'underline',
                                textDecorationColor: T.clay, textUnderlineOffset: '3px',
                            }}>
                                {lo.createOne}
                            </Link>
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            marginBottom: '24px', padding: '13px 16px',
                            backgroundColor: '#FEF2F2',
                            border: '1px solid #FECACA', borderLeft: `3px solid #EF4444`,
                            borderRadius: '2px',
                        }}>
                            <p style={{ fontSize: '13px', color: '#991B1B', lineHeight: 1.5 }}>⚠ {error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Email */}
                        <div>
                            <label style={{
                                display: 'block', fontSize: '10px', fontWeight: 500,
                                letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '8px',
                                color: focused === 'email' ? T.terra : T.inkLight,
                                transition: 'color 0.2s ease',
                            }}>
                                {lo.emailLabel}
                            </label>
                            <input
                                type="email" value={email} required
                                onChange={e => setEmail(e.target.value)}
                                onFocus={() => setFocused('email')}
                                onBlur={() => setFocused(null)}
                                placeholder={lo.emailPlaceholder}
                                style={{
                                    width: '100%', padding: '13px 16px',
                                    border: `1px solid ${focused === 'email' ? T.terra : T.clay}`,
                                    borderRadius: '2px', outline: 'none',
                                    backgroundColor: T.white, color: T.ink,
                                    fontSize: '14px', fontWeight: 300,
                                    fontFamily: "'Outfit', sans-serif",
                                    transition: 'border-color 0.2s ease',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{
                                    fontSize: '10px', fontWeight: 500,
                                    letterSpacing: '0.18em', textTransform: 'uppercase',
                                    color: focused === 'password' ? T.terra : T.inkLight,
                                    transition: 'color 0.2s ease',
                                }}>
                                    {lo.passwordLabel}
                                </label>
                                <Link href="/en/forgetpassword" style={{
                                    fontSize: '11px', color: T.inkLight, textDecoration: 'none',
                                    transition: 'color 0.2s ease',
                                }}
                                    onMouseEnter={e => (e.currentTarget.style.color = T.terra)}
                                    onMouseLeave={e => (e.currentTarget.style.color = T.inkLight)}
                                >
                                    {lo.forgotPassword}
                                </Link>
                            </div>
                            <input
                                type="password" value={password} required
                                onChange={e => setPassword(e.target.value)}
                                onFocus={() => setFocused('password')}
                                onBlur={() => setFocused(null)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%', padding: '13px 16px',
                                    border: `1px solid ${focused === 'password' ? T.terra : T.clay}`,
                                    borderRadius: '2px', outline: 'none',
                                    backgroundColor: T.white, color: T.ink,
                                    fontSize: '14px', fontWeight: 300,
                                    fontFamily: "'Outfit', sans-serif",
                                    transition: 'border-color 0.2s ease',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>

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
                                    {lo.signingIn}
                                </>
                            ) : lo.signIn}
                        </button>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: T.parchment }} />
                            <span style={{ fontSize: '10px', color: T.clay, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{lo.or}</span>
                            <div style={{ flex: 1, height: '1px', backgroundColor: T.parchment }} />
                        </div>

                        {/* Guest */}
                        <Link href="/shop" style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '13px', border: `1px solid ${T.parchment}`,
                            borderRadius: '2px', fontSize: '11px', fontWeight: 500,
                            letterSpacing: '0.12em', textTransform: 'uppercase',
                            color: T.inkLight, textDecoration: 'none',
                            fontFamily: "'Outfit', sans-serif",
                            transition: 'all 0.2s ease',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = T.clay; e.currentTarget.style.color = T.ink; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = T.parchment; e.currentTarget.style.color = T.inkLight; }}
                        >
                            {lo.browseAsGuest}
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    );
}