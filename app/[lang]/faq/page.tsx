'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { translations, Language } from '@/locales/translations';

const TERRA = '#B5623E';
const TERRA_DARK = '#8C4530';
const INK = '#1C1814';
const INK_MID = '#4A3F35';
const INK_LIGHT = '#8C7B6E';
const CREAM = '#F8F4EE';
const PARCHMENT = '#EFE9DF';
const CLAY = '#D4C4B0';
const WHITE = '#FDFCFA';

interface FaqItem { q: string; a: string; }
interface FaqGroup { category: string; icon: string; label: string; items: FaqItem[]; }
interface CardItem { icon: string; title: string; body: string; cta: string; href: string; }

export default function FAQPage() {
    const { language: lang } = useLanguage();
    const t = translations[lang as Language];
    const faq = t.faq;
    const FAQS = (faq?.faqCategories || []) as FaqGroup[];

    const [activeCat, setActiveCat] = useState<string>(FAQS.length > 0 ? FAQS[0].category : '');
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const group = FAQS.find((f) => f.category === activeCat);

    const selectCat = (cat: string) => {
        setActiveCat(cat);
        setOpenIndex(0);
    };

    const toggleItem = (i: number) => {
        setOpenIndex((prev) => (prev === i ? null : i));
    };

    return (
        <div style={{ fontFamily: "'Outfit', sans-serif", backgroundColor: WHITE, minHeight: '100vh', color: INK, overflowX: 'hidden' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Outfit:wght@300;400;500&display=swap');

        ::selection { background: ${TERRA}; color: ${WHITE}; }

        /* ── Page entrance animations ── */
        @keyframes slideDown  { from { opacity: 0; transform: translateY(-32px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp    { from { opacity: 0; transform: translateY(40px);  } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideLeft  { from { opacity: 0; transform: translateX(40px);  } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeIn     { from { opacity: 0; }                              to { opacity: 1; } }
        @keyframes numberUp   { from { opacity: 0; transform: translateY(20px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .anim-slide-down  { animation: slideDown  0.7s cubic-bezier(0.4,0,0.2,1) both; }
        .anim-slide-up    { animation: slideUp    0.7s cubic-bezier(0.4,0,0.2,1) both; }
        .anim-slide-left  { animation: slideLeft  0.7s cubic-bezier(0.4,0,0.2,1) both; }
        .anim-fade        { animation: fadeIn     0.8s ease both; }
        .anim-number      { animation: numberUp   0.8s cubic-bezier(0.4,0,0.2,1) both; }

        .d-0  { animation-delay: 0s;    }
        .d-1  { animation-delay: 0.1s;  }
        .d-2  { animation-delay: 0.2s;  }
        .d-3  { animation-delay: 0.3s;  }
        .d-4  { animation-delay: 0.4s;  }
        .d-5  { animation-delay: 0.5s;  }

        /* ── Hover states ── */
        .cat-tab       { transition: all 0.25s ease; border-bottom: 2px solid transparent; }
        .cat-tab:hover { color: ${INK} !important; border-bottom-color: ${CLAY} !important; }
        .cat-tab-active { color: ${INK} !important; border-bottom: 2px solid ${TERRA} !important; }

        .faq-row         { transition: background-color 0.2s ease; cursor: pointer; }
        .faq-row:hover   { background-color: ${CREAM} !important; }
        .faq-row-open    { background-color: ${CREAM} !important; }

        .contact-btn:hover  { background-color: ${INK_MID} !important; }
        .nav-btn:hover span { color: ${INK} !important; }

        /* ── Responsive Layout Classes ── */
        .page-container { max-width: 1280px; margin: 0 auto; padding: 0 40px; }
        .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: flex-end; position: relative; }
        .stats-row { display: flex; gap: 32px; }
        .cat-tabs-container { display: flex; border-bottom: 1px solid #EFE9DF; }
        .main-layout-grid { display: grid; grid-template-columns: 280px 1fr; padding-bottom: 80px; border-bottom: 1px solid #D4C4B0; align-items: start; }
        .sidebar-wrapper { border-right: 1px solid #EFE9DF; padding: 52px 40px 52px 0; position: sticky; top: 24px; }
        .accordion-wrapper { padding: 52px 0 52px 52px; }
        .faq-q-text { font-size: 20px; }
        .faq-answer-inner { padding: 0 24px 24px 68px; }

        /* Tablet/Small Desktop */
        @media (max-width: 992px) {
            .hero-grid { grid-template-columns: 1fr; gap: 40px; align-items: flex-start; }
            .main-layout-grid { grid-template-columns: 1fr; }
            .sidebar-wrapper { border-right: none; padding: 40px 0 24px 0; position: relative; top: 0; border-bottom: 1px solid #EFE9DF; }
            .accordion-wrapper { padding: 32px 0 52px 0; }
        }

        /* Mobile */
        @media (max-width: 768px) {
            .page-container { padding: 0 20px; }
            .stats-row { flex-wrap: wrap; gap: 24px; }
            
            /* Make tabs horizontally scrollable on mobile */
            .cat-tabs-container { overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
            .cat-tabs-container::-webkit-scrollbar { display: none; }
            .cat-tab { padding: 16px 20px !important; flex-shrink: 0; }
            
            .faq-row { padding: 16px 20px !important; }
            .faq-q-text { font-size: 18px !important; }
            .faq-answer-inner { padding: 0 20px 20px 20px !important; }
            
            /* Ghost number adjustments for small screens */
            .ghost-number { font-size: clamp(120px, 28vw, 200px) !important; right: -10px !important; top: 10px !important; opacity: 0.5; }
        }
      `}</style>

            {/* ── TERRACOTTA TOP BAR ── */}
            <div className="anim-fade d-0" style={{ height: '3px', background: 'linear-gradient(to right, #B5623E, #D4C4B0, transparent)', transformOrigin: 'left' }} />

            <div className="page-container">

                {/* ══════════════════════════════════
            HERO — bold typographic
        ══════════════════════════════════ */}
                <section style={{ padding: '80px 0 64px', borderBottom: '1px solid #D4C4B0', position: 'relative', overflow: 'hidden' }}>

                    {/* Giant ghost number */}
                    <div className="anim-number d-0 ghost-number" style={{
                        position: 'absolute', right: '-20px', top: '-10px',
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(160px, 28vw, 360px)',
                        fontWeight: 300, color: PARCHMENT,
                        lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
                        fontStyle: 'italic',
                    }}>
                        {faq.watermark}
                    </div>

                    <div className="hero-grid">
                        <div>
                            {/* Label */}
                            <div className="anim-slide-down d-1" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ width: '32px', height: '2px', backgroundColor: TERRA }} />
                                <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.24em', textTransform: 'uppercase', color: TERRA }}>
                                    {faq.helpCentre}
                                </p>
                            </div>

                            {/* Headline */}
                            <h1 className="anim-slide-up d-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(44px, 6vw, 88px)', fontWeight: 400, lineHeight: 0.95, color: INK }}>
                                {faq.heroLine1}<br />
                                <em style={{ color: TERRA }}>{faq.heroLine2}</em><br />
                                {faq.heroLine3}
                            </h1>
                        </div>

                        <div className="anim-slide-left d-3">
                            <p style={{ fontSize: '15px', color: INK_LIGHT, lineHeight: 1.85, fontWeight: 300, marginBottom: '32px' }}>
                                {faq.heroDesc}
                                <Link href={`/${lang}/contact`} style={{ color: TERRA, textDecoration: 'underline', textDecorationColor: CLAY, textUnderlineOffset: '3px' }}>
                                    {faq.contactUsDirectly}
                                </Link>
                                { }
                            </p>

                            {/* Stats row */}
                            <div className="stats-row">
                                {[[faq.questionsAnswered, faq.questionsAnsweredLabel], [faq.topicCategories, faq.topicCategoriesLabel], [faq.avgReplyTime, faq.avgReplyTimeLabel]].map(([num, lbl]) => (
                                    <div key={lbl}>
                                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 400, color: INK, lineHeight: 1, marginBottom: '4px' }}>{num}</p>
                                        <p style={{ fontSize: '10px', color: INK_LIGHT, letterSpacing: '0.06em', fontWeight: 300 }}>{lbl}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════
            CATEGORY TABS — horizontal bar
        ══════════════════════════════════ */}
                <div className="anim-slide-up d-4 cat-tabs-container">
                    {FAQS.map((f) => {
                        const isActive = activeCat === f.category;
                        return (
                            <button
                                key={f.category}
                                onClick={() => selectCat(f.category)}
                                className={isActive ? 'cat-tab cat-tab-active' : 'cat-tab'}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '20px 28px',
                                    background: 'none', border: 'none', borderBottom: '2px solid transparent',
                                    cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                                    color: isActive ? INK : INK_LIGHT,
                                }}
                            >
                                <span style={{ fontSize: '16px', color: isActive ? TERRA : CLAY }}>{f.icon}</span>
                                <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    {f.category}
                                </span>
                                <span style={{
                                    fontSize: '10px', fontWeight: 500,
                                    backgroundColor: isActive ? TERRA : PARCHMENT,
                                    color: isActive ? WHITE : INK_LIGHT,
                                    padding: '2px 7px', borderRadius: '10px',
                                    transition: 'all 0.2s ease',
                                }}>
                                    {f.items.length}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* ══════════════════════════════════
            BODY — sidebar + accordion
        ══════════════════════════════════ */}
                <section className="main-layout-grid">

                    {/* SIDEBAR */}
                    <aside className="anim-fade d-5 sidebar-wrapper">

                        {/* Active group info */}
                        {group && (
                            <div style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 300, color: PARCHMENT, lineHeight: 1 }}>
                                        {group.label}
                                    </span>
                                </div>
                                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontStyle: 'italic', color: INK, marginBottom: '6px', lineHeight: 1.2 }}>
                                    {group.category}
                                </p>
                                <p style={{ fontSize: '12px', color: INK_LIGHT, fontWeight: 300 }}>
                                    {group.items.length} questions in this section
                                </p>
                                <div style={{ width: '32px', height: '2px', backgroundColor: TERRA, marginTop: '16px' }} />
                            </div>
                        )}

                        {/* Nav */}
                        <nav>
                            {FAQS.map((f) => {
                                const active = activeCat === f.category;
                                return (
                                    <button
                                        key={f.category}
                                        onClick={() => selectCat(f.category)}
                                        className="nav-btn"
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            width: '100%', textAlign: 'left', padding: '13px 0',
                                            background: 'none', border: 'none',
                                            borderBottom: '1px solid #EFE9DF',
                                            cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                                        }}
                                    >
                                        <span style={{
                                            fontFamily: "'Cormorant Garamond', serif",
                                            fontSize: '13px', color: active ? TERRA : CLAY,
                                            minWidth: '22px', fontWeight: 400,
                                            transition: 'color 0.2s ease',
                                        }}>
                                            {f.label}
                                        </span>
                                        <span style={{
                                            fontSize: '12px', fontWeight: active ? 500 : 300,
                                            color: active ? INK : INK_LIGHT,
                                            transition: 'color 0.2s ease',
                                            flex: 1,
                                        }}>
                                            {f.category}
                                        </span>
                                        {active && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: TERRA, flexShrink: 0 }} />}
                                    </button>
                                );
                            })}
                        </nav>

                        <div style={{ marginTop: '32px', padding: '20px', backgroundColor: CREAM, borderRadius: '4px', border: '1px solid #EFE9DF' }}>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '15px', fontStyle: 'italic', color: INK_MID, lineHeight: 1.5, marginBottom: '14px' }}>
                                {faq.stillNeedHelp}
                            </p>
                            <Link
                                href={`/${lang}/contact`}
                                className="contact-btn"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    padding: '10px 18px',
                                    backgroundColor: INK, color: WHITE,
                                    fontSize: '10px', fontWeight: 500,
                                    letterSpacing: '0.14em', textTransform: 'uppercase',
                                    borderRadius: '2px', textDecoration: 'none',
                                    transition: 'background-color 0.2s ease',
                                }}
                            >
                                {faq.contactUs}
                            </Link>
                        </div>
                    </aside>

                    {/* ACCORDION */}
                    <div className="accordion-wrapper">

                        {/* Section heading */}
                        {group && (
                            <div className="anim-slide-up d-5" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #EFE9DF' }}>
                                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '44px', color: TERRA, lineHeight: 1 }}>
                                    {group.icon}
                                </span>
                                <div>
                                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 400, color: INK, marginBottom: '2px' }}>
                                        {group.category}
                                    </h2>
                                    <p style={{ fontSize: '12px', color: INK_LIGHT, fontWeight: 300 }}>
                                        {group.items.length} answers below
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {group?.items.map((item: FaqItem, i: number) => {
                                const isOpen = openIndex === i;
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            border: '1px solid #EFE9DF',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            transition: 'border-color 0.2s ease',
                                            borderColor: isOpen ? CLAY : '#EFE9DF',
                                        }}
                                    >
                                        {/* Question */}
                                        <button
                                            onClick={() => toggleItem(i)}
                                            className={isOpen ? 'faq-row faq-row-open' : 'faq-row'}
                                            style={{
                                                width: '100%', display: 'flex',
                                                alignItems: 'center', justifyContent: 'space-between',
                                                gap: '16px', padding: '20px 24px',
                                                border: 'none', textAlign: 'left',
                                            }}
                                        >
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
                                                {/* Number badge */}
                                                <div style={{
                                                    width: '28px', height: '28px', flexShrink: 0,
                                                    borderRadius: '50%',
                                                    backgroundColor: isOpen ? TERRA : PARCHMENT,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transition: 'background-color 0.25s ease',
                                                }}>
                                                    <span style={{
                                                        fontFamily: "'Cormorant Garamond', serif",
                                                        fontSize: '12px', fontWeight: 500,
                                                        color: isOpen ? WHITE : INK_LIGHT,
                                                        transition: 'color 0.25s ease',
                                                        lineHeight: 1,
                                                    }}>
                                                        {String(i + 1).padStart(2, '0')}
                                                    </span>
                                                </div>

                                                <span className="faq-q-text" style={{
                                                    fontFamily: "'Cormorant Garamond', serif",
                                                    fontWeight: isOpen ? 500 : 400,
                                                    color: isOpen ? INK : INK_MID,
                                                    lineHeight: 1.3, transition: 'all 0.2s ease',
                                                }}>
                                                    {item.q}
                                                </span>
                                            </div>

                                            {/* Chevron */}
                                            <div style={{
                                                width: '32px', height: '32px', flexShrink: 0,
                                                border: isOpen ? '1px solid #B5623E' : '1px solid #D4C4B0',
                                                borderRadius: '2px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.3s ease',
                                                transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                                                backgroundColor: isOpen ? TERRA : 'transparent',
                                            }}>
                                                <span style={{
                                                    fontSize: '16px', lineHeight: 1,
                                                    color: isOpen ? WHITE : INK_LIGHT,
                                                    transition: 'color 0.2s ease',
                                                }}>+</span>
                                            </div>
                                        </button>

                                        {/* Answer */}
                                        <div style={{
                                            maxHeight: isOpen ? '360px' : '0',
                                            overflow: 'hidden',
                                            transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}>
                                            <div className="faq-answer-inner" style={{ backgroundColor: CREAM }}>
                                                <div style={{ width: '24px', height: '1px', backgroundColor: TERRA, marginBottom: '12px' }} />
                                                <p style={{ fontSize: '14px', color: INK_LIGHT, lineHeight: 1.9, fontWeight: 300, maxWidth: '580px' }}>
                                                    {item.a}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}