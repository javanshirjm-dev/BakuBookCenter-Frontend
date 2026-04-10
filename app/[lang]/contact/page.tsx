"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/* ─────────────── DESIGN TOKENS ─────────────── */
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

/* ─────────────── FADE-IN HOOK ─────────────── */
function useFadeIn() {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
        }, { threshold: 0.1 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return { ref, visible };
}

function Reveal({ children, delay = 0, style = {}, className = "" }: {
    children: React.ReactNode; delay?: number; style?: React.CSSProperties; className?: string;
}) {
    const { ref, visible } = useFadeIn();
    return (
        <div ref={ref} className={className} style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(22px)",
            transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
            ...style,
        }}>
            {children}
        </div>
    );
}

/* ─────────────── FIELD COMPONENT ─────────────── */
function Field({ label, type = "text", name, value, onChange, required = false, placeholder = "" }: {
    label: string; type?: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    required?: boolean; placeholder?: string;
}) {
    const [focused, setFocused] = useState(false);
    const isTextarea = type === "textarea";
    const Tag = isTextarea ? "textarea" : "input";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
            <label style={{
                fontSize: "10px",
                fontWeight: 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: focused ? T.terra : T.inkLight,
                fontFamily: "'Outfit', sans-serif",
                transition: "color 0.2s ease",
            }}>
                {label}{required && <span style={{ color: T.terra, marginLeft: "4px" }}>*</span>}
            </label>
            <Tag
                name={name}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={placeholder}
                rows={isTextarea ? 6 : undefined}
                style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "14px",
                    fontWeight: 300,
                    color: T.ink,
                    backgroundColor: T.white,
                    border: `1px solid ${focused ? T.terra : T.clay}`,
                    borderRadius: "2px",
                    padding: isTextarea ? "16px 18px" : "14px 18px",
                    outline: "none",
                    resize: isTextarea ? "vertical" : undefined,
                    transition: "border-color 0.2s ease",
                    width: "100%",
                    minHeight: isTextarea ? "160px" : undefined,
                }}
            />
        </div>
    );
}

/* ─────────────── PAGE ─────────────── */
export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [topic, setTopic] = useState("General Enquiry");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const topics = ["General Enquiry", "Order Issue", "Returns & Refunds", "Book Request", "Press & Partnerships"];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    subject: form.subject,
                    message: form.message,
                    topic: topic
                })
            });

            const data = await response.json();

            if (data.success) {
                setSubmitted(true);
                setForm({ name: "", email: "", subject: "", message: "" });
                setTopic("General Enquiry");
            } else {
                alert(data.message || "Failed to send message. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting contact form:", error);
            alert("Failed to send message. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            fontFamily: "'Outfit', sans-serif",
            backgroundColor: T.white,
            color: T.ink,
            minHeight: "100vh",
            overflowX: "hidden"
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Outfit:wght@300;400;500&display=swap');
                
                ::selection { background: ${T.terra}; color: ${T.white}; }
                input::placeholder, textarea::placeholder { color: ${T.clay}; }
                button { font-family: inherit; }
                
                @keyframes spin { to { transform: rotate(360deg); } }

                /* RESPONSIVE UTILITIES */
                .container { padding: 0 24px; max-width: 1280px; margin: 0 auto; }
                @media (min-width: 768px) { .container { padding: 0 40px; } }

                .hero-grid { display: grid; grid-template-columns: 1fr; gap: 40px; align-items: flex-end; position: relative; overflow: hidden; padding: 60px 0 48px; border-bottom: 1px solid ${T.clay}; }
                .hero-ghost { position: absolute; right: -10px; top: -10px; font-family: 'Cormorant Garamond', serif; font-size: clamp(140px, 20vw, 260px); font-weight: 300; color: ${T.parchment}; user-select: none; pointer-events: none; line-height: 1; font-style: italic; z-index: 0; }
                .hero-content { position: relative; z-index: 1; }
                .hero-stats { display: flex; gap: clamp(20px, 4vw, 32px); flex-wrap: wrap; }
                
                @media (min-width: 900px) {
                    .hero-grid { grid-template-columns: 1fr 1fr; gap: 80px; padding: 88px 0 72px; }
                    .hero-ghost { top: -20px; }
                }

                .main-layout { display: grid; grid-template-columns: 1fr; border-bottom: 1px solid ${T.clay}; align-items: start; }
                .form-area { padding: 48px 0; }
                .sidebar-area { padding: 0 0 48px 0; border-top: 1px solid ${T.clay}; padding-top: 48px; }
                
                @media (min-width: 900px) {
                    .main-layout { grid-template-columns: 1fr 340px; }
                    .form-area { padding: 72px 64px 72px 0; border-right: 1px solid ${T.clay}; }
                    .sidebar-area { padding: 72px 0 72px 56px; border-top: none; }
                }

                .form-row { display: grid; grid-template-columns: 1fr; gap: 20px; }
                @media (min-width: 600px) { .form-row { grid-template-columns: 1fr 1fr; } }

                .channels-grid { display: grid; grid-template-columns: 1fr; border: 1px solid ${T.clay}; border-radius: 4px; overflow: hidden; }
                .channel-card { padding: 32px 24px; border-bottom: 1px solid ${T.clay}; }
                .channel-card:last-child { border-bottom: none; }
                
                @media (min-width: 900px) {
                    .channels-grid { grid-template-columns: repeat(3, 1fr); }
                    .channel-card { padding: 44px 40px; border-bottom: none; border-right: 1px solid ${T.clay}; }
                    .channel-card:last-child { border-right: none; }
                }
            `}</style>

            <div className="container">

                {/* ══════════════════════════════════════
            HERO
        ══════════════════════════════════════ */}
                <section className="hero-grid">
                    <div className="hero-ghost">Hi.</div>

                    <div className="hero-content">
                        <Reveal>
                            <p style={{
                                fontSize: "10px", letterSpacing: "0.22em",
                                textTransform: "uppercase", color: T.terra,
                                fontWeight: 500, marginBottom: "18px",
                            }}>
                                Get in Touch
                            </p>
                            <h1 style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: "clamp(44px, 10vw, 78px)",
                                fontWeight: 400, lineHeight: 1.0, color: T.ink,
                            }}>
                                We read every<br />
                                <em style={{ color: T.terra }}>letter</em><br />
                                ourselves.
                            </h1>
                        </Reveal>
                    </div>

                    <div className="hero-content">
                        <Reveal delay={120}>
                            <p style={{
                                fontSize: "15px", color: T.inkLight, lineHeight: 1.85,
                                fontWeight: 300, maxWidth: "420px", marginBottom: "32px",
                            }}>
                                There's no support ticket system here — just people who care about books and about getting things right. We aim to reply within one business day.
                            </p>
                            <div className="hero-stats">
                                {[["~8h", "avg. reply time"], ["Mon–Fri", "when we're around"], ["Always", "read by a human"]].map(([n, l]) => (
                                    <div key={n}>
                                        <p style={{
                                            fontFamily: "'Cormorant Garamond', serif",
                                            fontSize: "28px", fontWeight: 500,
                                            color: T.ink, lineHeight: 1,
                                        }}>{n}</p>
                                        <p style={{ fontSize: "11px", color: T.inkLight, letterSpacing: "0.06em", marginTop: "4px" }}>{l}</p>
                                    </div>
                                ))}
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ══════════════════════════════════════
            MAIN — form + sidebar
        ══════════════════════════════════════ */}
                <section className="main-layout">

                    {/* ── FORM ── */}
                    <div className="form-area">
                        {submitted ? (
                            /* ── SUCCESS STATE ── */
                            <Reveal>
                                <div style={{ textAlign: "center", padding: "80px 20px" }}>
                                    <div style={{
                                        width: "64px", height: "64px", borderRadius: "50%",
                                        backgroundColor: T.terra, display: "flex", alignItems: "center", justifyContent: "center",
                                        margin: "0 auto 32px", fontSize: "24px", color: T.white,
                                    }}>✓</div>
                                    <h2 style={{
                                        fontFamily: "'Cormorant Garamond', serif", fontSize: "40px", fontWeight: 400,
                                        color: T.ink, marginBottom: "16px", lineHeight: 1.2,
                                    }}>
                                        Message received.<br />
                                        <em style={{ color: T.terra }}>Thank you.</em>
                                    </h2>
                                    <p style={{
                                        fontSize: "14px", color: T.inkLight, lineHeight: 1.85,
                                        fontWeight: 300, maxWidth: "400px", margin: "0 auto 36px",
                                    }}>
                                        We'll be in touch within one business day. In the meantime, feel free to browse the shop.
                                    </p>
                                    <Link href="/books" style={{
                                        display: "inline-block", padding: "13px 32px",
                                        backgroundColor: T.ink, color: T.white, fontSize: "11px", fontWeight: 500,
                                        letterSpacing: "0.14em", textTransform: "uppercase",
                                        borderRadius: "2px", textDecoration: "none",
                                    }}>Browse the Shop</Link>
                                </div>
                            </Reveal>
                        ) : (
                            <>
                                <Reveal style={{ marginBottom: "40px" }}>
                                    <p style={{
                                        fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase",
                                        color: T.terra, fontWeight: 500, marginBottom: "10px",
                                    }}>What's this about?</p>
                                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                        {topics.map(t => (
                                            <button key={t} onClick={() => setTopic(t)}
                                                style={{
                                                    padding: "8px 16px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em",
                                                    border: `1px solid ${topic === t ? T.terra : T.clay}`, borderRadius: "2px",
                                                    backgroundColor: topic === t ? T.terra : "transparent",
                                                    color: topic === t ? T.white : T.inkLight, cursor: "pointer", transition: "all 0.2s ease",
                                                }}
                                            >{t}</button>
                                        ))}
                                    </div>
                                </Reveal>

                                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                                    <Reveal delay={60}>
                                        <div className="form-row">
                                            <Field label="Your Name" name="name" value={form.name} onChange={handleChange} required placeholder="Jane Smith" />
                                            <Field label="Email Address" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="jane@example.com" />
                                        </div>
                                    </Reveal>

                                    <Reveal delay={100}>
                                        <Field label="Subject" name="subject" value={form.subject} onChange={handleChange} required placeholder="Tell us in a few words…" />
                                    </Reveal>

                                    <Reveal delay={140}>
                                        <Field label="Your Message" type="textarea" name="message" value={form.message} onChange={handleChange} required placeholder="Write as much or as little as you like. We read everything." />
                                    </Reveal>

                                    <Reveal delay={180}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "20px", paddingTop: "8px", flexWrap: "wrap" }}>
                                            <button type="submit" disabled={loading || !form.name || !form.email || !form.subject || !form.message}
                                                style={{
                                                    padding: "15px 40px", backgroundColor: (loading || !form.name || !form.email || !form.subject || !form.message) ? T.clay : T.terra,
                                                    color: T.white, fontSize: "11px", fontWeight: 500,
                                                    letterSpacing: "0.14em", textTransform: "uppercase",
                                                    border: "none", borderRadius: "2px", cursor: (loading || !form.name || !form.email || !form.subject || !form.message) ? "not-allowed" : "pointer",
                                                    transition: "background-color 0.25s ease", display: "flex", alignItems: "center", gap: "10px",
                                                }}
                                                onMouseEnter={e => { if (!loading && form.name && form.email && form.subject && form.message) (e.currentTarget.style.backgroundColor = T.terraDark); }}
                                                onMouseLeave={e => { if (!loading && form.name && form.email && form.subject && form.message) (e.currentTarget.style.backgroundColor = T.terra); }}
                                            >
                                                {loading ? (
                                                    <><span style={{ width: "12px", height: "12px", border: `2px solid rgba(255,255,255,0.3)`, borderTop: "2px solid white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Sending…</>
                                                ) : "Send Message →"}
                                            </button>
                                            <p style={{ fontSize: "12px", color: T.clay, fontWeight: 300 }}>We'll reply within one business day</p>
                                        </div>
                                    </Reveal>
                                </form>
                            </>
                        )}
                    </div>

                    {/* ── SIDEBAR ── */}
                    <aside className="sidebar-area">
                        <Reveal style={{ marginBottom: "48px" }}>
                            <p style={{ fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: T.terra, fontWeight: 500, marginBottom: "12px" }}>Direct Email</p>
                            <a href="mailto:hello@folio.com" style={{
                                fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: 400, color: T.ink, textDecoration: "none",
                                borderBottom: `1px solid ${T.clay}`, paddingBottom: "2px", transition: "color 0.2s ease, border-color 0.2s ease", display: "inline-block",
                            }}
                                onMouseEnter={e => { e.currentTarget.style.color = T.terra; e.currentTarget.style.borderColor = T.terra; }}
                                onMouseLeave={e => { e.currentTarget.style.color = T.ink; e.currentTarget.style.borderColor = T.clay; }}
                            >hello@folio.com</a>
                            <p style={{ fontSize: "12px", color: T.inkLight, fontWeight: 300, lineHeight: 1.7, marginTop: "10px" }}>For urgent matters, email directly and we'll prioritise your message.</p>
                        </Reveal>

                        <div style={{ width: "100%", height: "1px", backgroundColor: T.parchment, marginBottom: "48px" }} />

                        <Reveal delay={80} style={{ marginBottom: "48px" }}>
                            <p style={{ fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: T.terra, fontWeight: 500, marginBottom: "16px" }}>Helpful Links</p>
                            {[
                                { label: "FAQs", href: "/faq", desc: "Answers to common questions" },
                                { label: "Track Your Order", href: "/orders", desc: "Follow your parcel" },
                            ].map((l) => (
                                <Link key={l.label} href={l.href} style={{
                                    display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0",
                                    borderBottom: `1px solid ${T.parchment}`, textDecoration: "none", color: T.inkMid, transition: "color 0.2s ease",
                                }}
                                    onMouseEnter={e => (e.currentTarget.style.color = T.terra)}
                                    onMouseLeave={e => (e.currentTarget.style.color = T.inkMid)}
                                >
                                    <div>
                                        <p style={{ fontSize: "13px", fontWeight: 500, marginBottom: "2px" }}>{l.label}</p>
                                        <p style={{ fontSize: "11px", color: T.clay, fontWeight: 300 }}>{l.desc}</p>
                                    </div>
                                    <span style={{ fontSize: "14px", color: T.clay }}>→</span>
                                </Link>
                            ))}
                        </Reveal>

                        <div style={{ width: "100%", height: "1px", backgroundColor: T.parchment, marginBottom: "48px" }} />

                        <Reveal delay={160}>
                            <p style={{ fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: T.terra, fontWeight: 500, marginBottom: "16px" }}>Office Hours</p>
                            {[
                                ["Monday – Friday", "9:00 am – 6:00 pm"],
                                ["Saturday", "10:00 am – 2:00 pm"],
                                ["Sunday", "Closed"],
                            ].map(([day, hours]) => (
                                <div key={day} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${T.parchment}` }}>
                                    <span style={{ fontSize: "12px", color: T.inkLight, fontWeight: 300 }}>{day}</span>
                                    <span style={{ fontSize: "12px", fontWeight: 500, color: hours === "Closed" ? T.clay : T.ink }}>{hours}</span>
                                </div>
                            ))}
                        </Reveal>
                    </aside>
                </section>


            </div>
        </div>
    );
}