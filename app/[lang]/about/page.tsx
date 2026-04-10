'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { translations, Language } from '../../../locales/translations'; // Make sure this path is correct for your structure!

const TERRA = '#B5623E';
const TERRA_DARK = '#8C4530';
const INK = '#1C1814';
const INK_MID = '#4A3F35';
const INK_LIGHT = '#8C7B6E';
const CREAM = '#F8F4EE';
const PARCHMENT = '#EFE9DF';
const CLAY = '#D4C4B0';
const WHITE = '#FDFCFA';

interface StatItem { num: string; label: string; }
interface ValueItem { num: string; title: string; body: string; }
interface TeamItem { name: string; role: string; bio: string; initial: string; }
interface TimelineItem { year: string; event: string; }

export default function AboutPage() {
    const params = useParams();
    const currentLang = (params?.lang as Language) || 'en';
    const t = translations[currentLang]?.about || translations['en'].about;

    const [hoveredTeam, setHoveredTeam] = useState<string | null>(null);

    // Arrays moved inside so they can use the `t` translation object
    const STATS: StatItem[] = [
        { num: t.stats.booksNum, label: t.stats.booksLabel },
        { num: t.stats.countriesNum, label: t.stats.countriesLabel },
        { num: t.stats.yearNum, label: t.stats.yearLabel },
        { num: t.stats.readersNum, label: t.stats.readersLabel },
    ];

    const VALUES: ValueItem[] = t.values;
    const TEAM: TeamItem[] = t.team;
    const TIMELINE: TimelineItem[] = t.timeline;

    // Zipping the original icons with the newly translated promises
    const PROMISES: string[][] = [
        ['◎', t.promises[0]],
        ['→', t.promises[1]],
        ['↺', t.promises[2]],
        ['✦', t.promises[3]],
    ];

    return (
        <div style={{ fontFamily: "'Outfit', sans-serif", backgroundColor: WHITE, minHeight: '100vh', color: INK, overflowX: 'hidden' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Outfit:wght@300;400;500&display=swap');
        ::selection { background: ${TERRA}; color: ${WHITE}; }

        @keyframes slideDown  { from { opacity:0; transform:translateY(-28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp    { from { opacity:0; transform:translateY(36px);  } to { opacity:1; transform:translateY(0); } }
        @keyframes slideLeft  { from { opacity:0; transform:translateX(36px);  } to { opacity:1; transform:translateX(0); } }
        @keyframes slideRight { from { opacity:0; transform:translateX(-36px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeIn     { from { opacity:0; }                            to { opacity:1; } }
        @keyframes numIn      { from { opacity:0; transform:translateY(14px) scale(0.94); } to { opacity:1; transform:translateY(0) scale(1); } }

        .anim-down  { animation: slideDown  0.75s cubic-bezier(0.4,0,0.2,1) both; }
        .anim-up    { animation: slideUp    0.75s cubic-bezier(0.4,0,0.2,1) both; }
        .anim-left  { animation: slideLeft  0.75s cubic-bezier(0.4,0,0.2,1) both; }
        .anim-right { animation: slideRight 0.75s cubic-bezier(0.4,0,0.2,1) both; }
        .anim-fade  { animation: fadeIn     0.8s ease both; }
        .anim-num   { animation: numIn      0.8s cubic-bezier(0.4,0,0.2,1) both; }

        .d-0{animation-delay:0s}    .d-1{animation-delay:.08s}
        .d-2{animation-delay:.16s}  .d-3{animation-delay:.24s}
        .d-4{animation-delay:.32s}  .d-5{animation-delay:.40s}
        .d-6{animation-delay:.48s}  .d-7{animation-delay:.56s}
        .d-8{animation-delay:.64s}  .d-9{animation-delay:.72s}

        .team-card   { transition: background-color .25s ease, border-color .25s ease; }
        .team-card:hover { background-color: ${CREAM} !important; border-color: ${CLAY} !important; }
        .val-card    { transition: background-color .2s ease; }
        .val-card:hover  { background-color: ${CREAM} !important; }
        .tl-row      { transition: background-color .2s ease; }
        .tl-row:hover    { background-color: ${CREAM} !important; }
        .shop-btn:hover  { background-color: ${TERRA_DARK} !important; }
        .ghost-btn:hover { border-color: ${INK} !important; color: ${INK} !important; }

        /* --- RESPONSIVE OVERRIDES --- */
        @media (max-width: 1024px) {
            .values-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .val-card { border-right: 1px solid #EFE9DF !important; border-bottom: 1px solid #EFE9DF !important; }
            .val-card:nth-child(even) { border-right: none !important; }
            .val-card:nth-child(n+3) { border-bottom: none !important; }
            .team-grid { grid-template-columns: 1fr !important; }
            .team-card { border-right: none !important; border-bottom: 1px solid #EFE9DF !important; }
            .timeline-grid { grid-template-columns: 200px 1fr !important; }
        }

        @media (max-width: 768px) {
            .main-container { padding: 0 24px !important; }
            .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
            .origin-grid { grid-template-columns: 1fr !important; }
            .origin-quote { border-right: none !important; border-bottom: 1px solid #EFE9DF !important; padding: 40px 0 !important; }
            .origin-text { padding: 40px 0 !important; }
            .dark-band-grid { grid-template-columns: 1fr !important; }
            .dark-text { padding: 48px 24px !important; }
            .dark-promises { padding: 48px 24px !important; border-left: none !important; border-top: 1px solid #EFE9DF !important; }
            .timeline-grid { grid-template-columns: 1fr !important; }
            .timeline-sticky { position: static !important; border-right: none !important; padding: 40px 0 20px 0 !important; }
            .tl-row { grid-template-columns: 60px 1fr !important; padding: 24px 0 !important; gap: 16px !important; padding-left: 0 !important; }
            .cta-grid { grid-template-columns: 1fr !important; gap: 40px !important; padding: 60px 0 !important; }
        }

        @media (max-width: 480px) {
            .values-grid { grid-template-columns: 1fr !important; }
            .val-card { border-right: none !important; border-bottom: 1px solid #EFE9DF !important; }
            .val-card:last-child { border-bottom: none !important; }
            .stats-grid { grid-template-columns: 1fr !important; }
            .stat-card { border-right: none !important; border-bottom: 1px solid #EFE9DF !important; }
            .stat-card:last-child { border-bottom: none !important; }
        }
      `}</style>

            {/* Accent bar */}
            <div className="anim-fade d-0" style={{ height: '3px', background: 'linear-gradient(to right, #B5623E, #D4C4B0, transparent)' }} />

            <div className="main-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 40px' }}>

                {/* ══ HERO ══ */}
                <section style={{ padding: '80px 0 72px', borderBottom: '1px solid #D4C4B0', position: 'relative', overflow: 'hidden' }}>
                    {/* Ghost watermark */}
                    <div className="anim-fade d-0" style={{
                        position: 'absolute', right: '-15px', bottom: '-30px',
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(120px, 24vw, 320px)',
                        fontWeight: 300, fontStyle: 'italic',
                        color: PARCHMENT, lineHeight: 1,
                        userSelect: 'none', pointerEvents: 'none', whiteSpace: 'nowrap',
                    }}>{t.watermark}</div>

                    <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'flex-end', position: 'relative' }}>
                        <div>
                            <div className="anim-down d-1" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ width: '32px', height: '2px', backgroundColor: TERRA }} />
                                <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.24em', textTransform: 'uppercase', color: TERRA }}>{t.ourStory}</p>
                            </div>
                            <h1 className="anim-up d-2" style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: 'clamp(48px, 6.5vw, 88px)',
                                fontWeight: 400, lineHeight: 0.96, color: INK,
                            }}>
                                {t.heroLine1}<br />
                                <em style={{ color: TERRA }}>{t.heroLine2}</em>
                                <br />{t.heroLine3}
                            </h1>
                        </div>

                        <div className="anim-left d-3">
                            <p style={{ fontSize: '15px', color: INK_LIGHT, lineHeight: 1.85, fontWeight: 300, marginBottom: '40px' }}>
                                {t.heroDesc}
                            </p>
                            {/* Stats */}
                            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', border: '1px solid #EFE9DF', borderRadius: '4px', overflow: 'hidden' }}>
                                {STATS.map((s: StatItem, i: number) => (
                                    <div key={s.label} className={`stat-card anim-num d-${i + 4}`} style={{
                                        padding: '20px 24px',
                                        borderRight: i % 2 === 0 ? '1px solid #EFE9DF' : 'none',
                                        borderBottom: i < 2 ? '1px solid #EFE9DF' : 'none',
                                    }}>
                                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '34px', fontWeight: 400, color: INK, lineHeight: 1, marginBottom: '4px' }}>{s.num}</p>
                                        <p style={{ fontSize: '11px', color: INK_LIGHT, fontWeight: 300, letterSpacing: '0.03em' }}>{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══ ORIGIN STORY ══ */}
                <section className="origin-grid" style={{ borderBottom: '1px solid #D4C4B0', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <div className="origin-quote anim-right d-2" style={{ borderRight: '1px solid #EFE9DF', padding: '80px 64px 80px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ width: '36px', height: '1px', backgroundColor: CLAY, marginBottom: '32px' }} />
                        <blockquote style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 'clamp(22px, 2.5vw, 30px)',
                            fontWeight: 400, fontStyle: 'italic',
                            color: INK, lineHeight: 1.45, margin: 0,
                        }}>
                            {t.originQuote}
                        </blockquote>
                        <p style={{ marginTop: '24px', fontSize: '11px', color: CLAY, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                            {t.originAuthor}
                        </p>
                    </div>

                    <div className="origin-text anim-left d-3" style={{ padding: '80px 0 80px 64px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: TERRA, marginBottom: '24px' }}>{t.originTitle}</p>
                        {[t.originP1, t.originP2, t.originP3].map((p: string, i: number) => (
                            <p key={i} style={{ fontSize: '14px', color: INK_LIGHT, lineHeight: 1.9, fontWeight: 300, marginBottom: '20px' }}>{p}</p>
                        ))}
                    </div>
                </section>

                {/* ══ VALUES ══ */}
                <section style={{ borderBottom: '1px solid #D4C4B0', padding: '80px 0' }}>
                    <div className="anim-up d-2" style={{ marginBottom: '52px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: TERRA, marginBottom: '12px' }}>{t.valuesLabel}</p>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 4vw, 50px)', fontWeight: 400, color: INK, lineHeight: 1.1, maxWidth: '500px' }}>
                            {t.valuesTitle}
                        </h2>
                    </div>
                    <div className="values-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid #EFE9DF' }}>
                        {VALUES.map((v: ValueItem, i: number) => (
                            <div key={v.num} className={`val-card anim-up d-${i + 3}`} style={{ padding: '40px 32px', borderRight: i < 3 ? '1px solid #EFE9DF' : 'none' }}>
                                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '40px', fontWeight: 300, color: PARCHMENT, lineHeight: 1, marginBottom: '16px' }}>{v.num}</p>
                                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 500, color: INK, marginBottom: '12px', lineHeight: 1.3 }}>{v.title}</h3>
                                <p style={{ fontSize: '13px', color: INK_LIGHT, lineHeight: 1.85, fontWeight: 300 }}>{v.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══ DARK BAND ══ */}
                <section className="dark-band-grid anim-fade d-3" style={{ borderBottom: '1px solid #D4C4B0', display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '340px' }}>
                    <div className="dark-text" style={{ backgroundColor: INK, padding: '64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                            <div style={{ width: '24px', height: '2px', backgroundColor: TERRA }} />
                            <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: TERRA }}>{t.darkLabel}</p>
                        </div>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 400, color: WHITE, lineHeight: 1.15, marginBottom: '18px' }}>
                            {t.darkTitle1}<br /><em style={{ color: TERRA }}>{t.darkTitle2}</em>
                        </h2>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.85, fontWeight: 300, maxWidth: '360px' }}>
                            {t.darkDesc}
                        </p>
                    </div>
                    <div className="dark-promises" style={{ backgroundColor: CREAM, padding: '64px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '1px solid #EFE9DF' }}>
                        {PROMISES.map(([icon, text]: string[]) => (
                            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid #EFE9DF' }}>
                                <span style={{ fontSize: '16px', color: TERRA, width: '20px', flexShrink: 0 }}>{icon}</span>
                                <span style={{ fontSize: '14px', color: INK_MID, fontWeight: 300 }}>{text}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══ TIMELINE ══ */}
                <section className="timeline-grid" style={{ borderBottom: '1px solid #D4C4B0', display: 'grid', gridTemplateColumns: '300px 1fr' }}>
                    <div className="timeline-sticky" style={{ borderRight: '1px solid #EFE9DF', padding: '80px 56px 80px 0', position: 'sticky', top: '0', alignSelf: 'start' }}>
                        <div className="anim-right d-2">
                            <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: TERRA, marginBottom: '12px' }}>{t.timelineLabel}</p>
                            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '34px', fontWeight: 400, color: INK, lineHeight: 1.2, fontStyle: 'italic' }}>
                                {t.timelineTitle1}<br />{t.timelineTitle2}
                            </h2>
                        </div>
                    </div>
                    <div>
                        {TIMELINE.map((item: TimelineItem, i: number) => (
                            <div key={item.year} className={`tl-row anim-up d-${i + 2}`} style={{
                                display: 'grid', gridTemplateColumns: '80px 1fr',
                                gap: '32px', padding: '36px 0 36px 56px',
                                borderBottom: i < TIMELINE.length - 1 ? '1px solid #EFE9DF' : 'none',
                                alignItems: 'start',
                            }}>
                                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '14px', color: TERRA, paddingTop: '3px', letterSpacing: '0.06em', fontWeight: 500 }}>{item.year}</span>
                                <p style={{ fontSize: '15px', color: INK_LIGHT, lineHeight: 1.75, fontWeight: 300 }}>{item.event}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══ TEAM ══ */}
                <section style={{ borderBottom: '1px solid #D4C4B0', padding: '80px 0' }}>
                    <div className="anim-up d-2" style={{ marginBottom: '52px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: TERRA, marginBottom: '12px' }}>{t.teamLabel}</p>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 4vw, 50px)', fontWeight: 400, color: INK }}>
                            {t.teamTitle}
                        </h2>
                    </div>
                    <div className="team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '1px solid #EFE9DF', borderRadius: '4px', overflow: 'hidden' }}>
                        {TEAM.map((m: TeamItem, i: number) => (
                            <div
                                key={m.name}
                                className={`team-card anim-up d-${i + 3}`}
                                onMouseEnter={() => setHoveredTeam(m.name)}
                                onMouseLeave={() => setHoveredTeam(null)}
                                style={{
                                    padding: '44px 40px',
                                    borderRight: i < TEAM.length - 1 ? '1px solid #EFE9DF' : 'none',
                                    backgroundColor: hoveredTeam === m.name ? CREAM : WHITE,
                                }}
                            >
                                <div style={{
                                    width: '52px', height: '52px', borderRadius: '2px',
                                    border: '1px solid #EFE9DF', backgroundColor: CREAM,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '24px',
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: '22px', color: INK_LIGHT, fontStyle: 'italic',
                                }}>
                                    {m.initial}
                                </div>
                                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 500, color: INK, marginBottom: '4px' }}>{m.name}</h3>
                                <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: TERRA, marginBottom: '16px' }}>{m.role}</p>
                                <p style={{ fontSize: '13px', color: INK_LIGHT, lineHeight: 1.8, fontWeight: 300, fontStyle: 'italic' }}>{m.bio}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══ CTA ══ */}
                <section className="cta-grid anim-fade d-4" style={{ padding: '96px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: TERRA, marginBottom: '16px' }}>{t.ctaLabel}</p>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 400, color: INK, lineHeight: 1.1, marginBottom: '20px' }}>
                            {t.ctaTitle1}<br /><em style={{ color: TERRA }}>{t.ctaTitle2}</em>
                        </h2>
                        <p style={{ fontSize: '14px', color: INK_LIGHT, fontWeight: 300, lineHeight: 1.8, maxWidth: '380px' }}>
                            {t.ctaDesc}
                        </p>
                    </div>
                    <div style={{ border: '1px solid #EFE9DF', borderRadius: '4px', padding: '48px', backgroundColor: CREAM }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', fontStyle: 'italic', color: INK_LIGHT, lineHeight: 1.75, marginBottom: '32px', paddingBottom: '28px', borderBottom: '1px solid #EFE9DF' }}>
                            {t.ctaQuote}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <Link href={`/${currentLang}/shop`} className="shop-btn" style={{
                                padding: '13px 28px', backgroundColor: TERRA, color: WHITE,
                                fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em',
                                textTransform: 'uppercase', borderRadius: '2px', textDecoration: 'none',
                                transition: 'background-color 0.2s ease', display: 'inline-block',
                            }}>{t.btnShop}</Link>
                            <Link href={`/${currentLang}/contact`} className="ghost-btn" style={{
                                padding: '13px 28px', border: '1px solid #D4C4B0', color: INK_MID,
                                fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em',
                                textTransform: 'uppercase', borderRadius: '2px', textDecoration: 'none',
                                transition: 'all 0.2s ease', display: 'inline-block',
                            }}>{t.btnContact}</Link>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}