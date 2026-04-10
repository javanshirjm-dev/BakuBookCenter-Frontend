"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import ChatBot from "../ui/homepage/ChatBot";

const T = {
    red: "#7F1D1D",
    redD: "#450A0A",
    redM: "#B91C1C",
    redL: "#FCA5A5",
    ink: "#1C1814",
    inkL: "#8C7B6E",
    terra: "#BFA580",
    parch: "#EFE9DF",
    clay: "#D4C4B0",
    cream: "black",
    white: "#FDFCFA",
};

const SOCIALS = [
    {
        label: "Instagram", href: "#",
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" /></svg>,
    },
    {
        label: "Facebook", href: "#",
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>,
    },
    {
        label: "WhatsApp", href: "#",
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></svg>,
    },
];

const LINKS: Record<string, { label: string; href: string }[]> = {
    Shop: [
        { label: "All Books", href: "/shop" },
        { label: "New Arrivals", href: "/shop" },
        { label: "Bestsellers", href: "/shop" },
        { label: "Fiction", href: "/shop" },
        { label: "Non-Fiction", href: "/shop" },
        { label: "Gift Cards", href: "/shop" },
    ],
    Company: [
        { label: "About Us", href: "/about" },
        { label: "News", href: "/news" },
        { label: "Careers", href: "/about" },
        { label: "Press", href: "/about" },
    ],
    Help: [
        { label: "FAQ", href: "/faq" },
        { label: "Contact Us", href: "/contact" },
        { label: "Shipping Policy", href: "/faq" },
        { label: "Returns", href: "/faq" },
        { label: "Track Order", href: "/orders" },
    ],
};

const PROMISES = [
    { icon: '→', title: 'Free Shipping', body: 'On all orders over $40.' },
    { icon: '↺', title: '30-Day Returns', body: 'No questions asked.' },
    { icon: '◎', title: 'Packed with Care', body: 'A personal note in every order.' },
    { icon: '✦', title: 'Curated Picks', body: 'Every title hand-selected.' },
];

export default function Footer() {
    const params = useParams();
    const lang = (params?.lang as string) || 'en';

    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const [focused, setFocused] = useState(false);

    const submit = (e: React.FormEvent) => { e.preventDefault(); if (email.trim()) setSubscribed(true); };

    return (
        <footer style={{ fontFamily: "'Outfit', sans-serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Outfit:wght@300;400;500&display=swap');

        .ft-link   { font-size:13px; font-weight:300; color:${T.inkL}; text-decoration:none; display:block; padding:5px 0; transition:color 0.18s; }
        .ft-link:hover { color:${T.ink}; }

        .ft-social { width:36px; height:36px; border:1px solid ${T.parch}; border-radius:2px; display:flex; align-items:center; justify-content:center; color:${T.inkL}; text-decoration:none; transition:all 0.2s; flex-shrink:0; }
        .ft-social:hover { border-color:${T.red}; color:${T.red}; background-color:${T.cream}; }

        .ft-legal  { font-size:11px; color:rgba(255,255,255,0.28); text-decoration:none; transition:color 0.2s; }
        .ft-legal:hover { color:rgba(255,255,255,0.6); }

        .ft-main   { display:grid; grid-template-columns:360px 1fr; }
        .ft-cols   { display:grid; grid-template-columns:repeat(3,1fr); gap:32px; }
        .ft-proms  { display:grid; grid-template-columns:repeat(4,1fr); }

        @media (max-width:1100px) { .ft-proms { grid-template-columns:repeat(2,1fr); } }
        @media (max-width:900px)  { .ft-main  { grid-template-columns:1fr; } .ft-left-border { border-right:none !important; border-bottom:1px solid ${T.parch}; } }
        @media (max-width:640px)  { .ft-cols  { grid-template-columns:1fr 1fr; } .ft-proms { grid-template-columns:1fr 1fr; } .ft-tagline { display:none !important; } }
        @media (max-width:400px)  { .ft-cols  { grid-template-columns:1fr; } }
      `}</style>

            {/* ══════════════════════
          MAIN — cream
      ══════════════════════ */}
            <div style={{ backgroundColor: T.cream, borderTop: `1px solid ${T.parch}` }}>
                <div className="ft-main" style={{ maxWidth: '1280px', margin: '0 auto' }}>

                    {/* LEFT */}
                    <div className="ft-left-border" style={{ padding: '52px 40px 52px 24px', borderRight: `1px solid ${T.parch}` }}>
                        <Link href={`/${lang}`} style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '18px' }}>
                            <img src="https://bakubookcenter.az/media/img/bakubookcenter.png" alt="BakuBookCenter" style={{ height: '36px', width: 'auto' }} />
                        </Link>

                        <p style={{ fontSize: '14px', color: T.inkL, fontWeight: 300, lineHeight: 1.8, marginBottom: '32px', maxWidth: '280px' }}>
                            Baku's curated bookstore. Every title hand-picked, every order packed with care.
                        </p>

                        {/* Newsletter */}
                        <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.red, marginBottom: '10px' }}>
                            The Reading List
                        </p>
                        <p style={{ fontSize: '13px', color: T.inkL, fontWeight: 300, lineHeight: 1.6, marginBottom: '14px' }}>
                            New arrivals, curated picks & stories from the shelves.
                        </p>

                        {subscribed ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 14px', backgroundColor: '#EEF6F1', border: '1px solid #B8DEC9', borderLeft: '3px solid #3A6B4A', borderRadius: '2px' }}>
                                <span style={{ color: '#3A6B4A' }}>✓</span>
                                <p style={{ fontSize: '13px', color: '#2A5438', fontWeight: 400 }}>You're subscribed. Happy reading.</p>
                            </div>
                        ) : (
                            <form onSubmit={submit} style={{ display: 'flex' }}>
                                <input type="email" value={email} required onChange={e => setEmail(e.target.value)}
                                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                                    placeholder="your@email.com"
                                    style={{ flex: 1, padding: '10px 13px', border: `1px solid ${focused ? T.red : T.clay}`, borderRight: 'none', borderRadius: '2px 0 0 2px', outline: 'none', fontSize: '13px', fontWeight: 300, color: T.ink, backgroundColor: T.white, fontFamily: "'Outfit', sans-serif", transition: 'border-color 0.2s' }}
                                />
                                <button type="submit" style={{ padding: '10px 16px', backgroundColor: T.red, color: T.white, border: 'none', borderRadius: '0 2px 2px 0', cursor: 'pointer', fontSize: '10px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: "'Outfit', sans-serif", transition: 'background-color 0.2s', whiteSpace: 'nowrap' }}
                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = T.redD)}
                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = T.red)}
                                >Subscribe</button>
                            </form>
                        )}

                        {/* Socials */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                            {SOCIALS.map(s => (
                                <a key={s.label} href={s.href} aria-label={s.label} className="ft-social">{s.icon}</a>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT — links + contact */}
                    <div style={{ padding: '52px 24px 52px 40px' }}>
                        <div className="ft-cols">
                            {Object.entries(LINKS).map(([section, links]) => (
                                <div key={section}>
                                    <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.red, marginBottom: '14px' }}>
                                        {section}
                                    </p>
                                    {links.map(l => (
                                        <Link key={l.label} href={`/${lang}${l.href}`} className="ft-link">{l.label}</Link>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Contact row */}
                        <div style={{ marginTop: '36px', paddingTop: '24px', borderTop: `1px solid ${T.parch}`, display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
                            {[
                                { icon: '✆', text: '+994 12 404 04 04', href: 'tel:+994124040404' },
                                { icon: '✉', text: 'hello@bakubookcenter.az', href: 'mailto:hello@bakubookcenter.az' },
                                { icon: '⏱︎ ', text: 'Mon–Sun  9:00 – 21:00', href: undefined },
                            ].map(({ icon, text, href }) => (
                                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '13px' }}>{icon}</span>
                                    {href
                                        ? <a href={href} style={{ fontSize: '13px', color: T.inkL, fontWeight: 300, textDecoration: 'none', transition: 'color 0.2s' }}
                                            onMouseEnter={e => (e.currentTarget.style.color = T.red)}
                                            onMouseLeave={e => (e.currentTarget.style.color = T.inkL)}
                                        >{text}</a>
                                        : <span style={{ fontSize: '13px', color: T.inkL, fontWeight: 300 }}>{text}</span>
                                    }
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════════════════════
          PROMISE BAND — red
      ══════════════════════ */}
            <div style={{ backgroundColor: T.red }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                    <div className="ft-proms">
                        {PROMISES.map((p, i) => (
                            <div key={p.title} style={{
                                padding: '26px 24px',
                                borderRight: i < PROMISES.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                display: 'flex', alignItems: 'flex-start', gap: '12px',
                            }}>
                                <span style={{ fontSize: '18px', color: T.redL, flexShrink: 0, marginTop: '1px' }}>{p.icon}</span>
                                <div>
                                    <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.white, marginBottom: '3px' }}>{p.title}</p>
                                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.42)', fontWeight: 300, lineHeight: 1.5 }}>{p.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════════════════
          BOTTOM BAR — darkest
      ══════════════════════ */}
            <div style={{ backgroundColor: T.redD, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', fontWeight: 300 }}>
                        © {new Date().getFullYear()} Baku Book Center. All rights reserved.
                    </p>
                    <p className="ft-tagline" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '13px', fontStyle: 'italic', color: 'rgba(255,255,255,0.18)' }}>
                        Books change everything.
                    </p>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        {['Privacy Policy', 'Terms of Use', 'Cookies'].map(item => (
                            <a key={item} href="#" className="ft-legal"
                                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
                            >{item}</a>
                        ))}
                    </div>
                </div>
            </div>
            <ChatBot />
        </footer>
    );
}