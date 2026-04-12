'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

const TERRA = '#B5623E';
const TERRA_DARK = '#8C4530';
const INK = '#1C1814';
const INK_MID = '#4A3F35';
const INK_LIGHT = '#8C7B6E';
const CREAM = '#F8F4EE';
const PARCHMENT = '#EFE9DF';
const CLAY = '#D4C4B0';
const WHITE = '#FDFCFA';

const getLocalizedText = (text: any, lang: string): string => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return text[lang] || text.en || text.az || text.ru || '';
};

const formatDate = (dateStr: string, lang: string): string => {
    try {
        return new Date(dateStr).toLocaleDateString(
            lang === 'en' ? 'en-US' : lang === 'az' ? 'az-AZ' : 'ru-RU',
            { year: 'numeric', month: 'long', day: 'numeric' }
        );
    } catch {
        return dateStr;
    }
};

export default function NewsPage() {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const router = useRouter();
    const lang = (params.lang as string) || 'en';

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/news');
                if (res.ok) {
                    const data = await res.json();
                    setNews(data);
                }
            } catch (error) {
                console.error('Error fetching news:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    const rest = news;

    /* ── LOADING ── */
    if (loading) return (
        <div style={{ minHeight: '100vh', backgroundColor: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap'); @keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '2px solid #EFE9DF', borderTop: '2px solid #B5623E', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontStyle: 'italic', color: INK_LIGHT }}>
                    Loading stories…
                </p>
            </div>
        </div>
    );

    return (
        <div style={{ fontFamily: "'', sans-serif", backgroundColor: WHITE, minHeight: '100vh', color: INK }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap');
        ::selection { background: ${TERRA}; color: ${WHITE}; }

        @keyframes slideDown  { from { opacity:0; transform:translateY(-28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp    { from { opacity:0; transform:translateY(32px);  } to { opacity:1; transform:translateY(0); } }
        @keyframes slideLeft  { from { opacity:0; transform:translateX(32px);  } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeIn     { from { opacity:0; }                            to { opacity:1; } }
        @keyframes imgZoom    { from { transform:scale(1.08); opacity:0; }      to { transform:scale(1); opacity:1; } }

        .anim-down  { animation: slideDown 0.7s cubic-bezier(0.4,0,0.2,1) both; }
        .anim-up    { animation: slideUp   0.7s cubic-bezier(0.4,0,0.2,1) both; }
        .anim-left  { animation: slideLeft 0.7s cubic-bezier(0.4,0,0.2,1) both; }
        .anim-fade  { animation: fadeIn    0.8s ease both; }
        .anim-img   { animation: imgZoom   1s cubic-bezier(0.4,0,0.2,1) both; }

        .d-1 { animation-delay: 0.1s; } .d-2 { animation-delay: 0.2s; }
        .d-3 { animation-delay: 0.3s; } .d-4 { animation-delay: 0.4s; }
        .d-5 { animation-delay: 0.5s; } .d-6 { animation-delay: 0.6s; }

        .news-card { transition: box-shadow 0.25s ease, border-color 0.25s ease; cursor: pointer; }
        .news-card:hover { box-shadow: 0 12px 40px rgba(28,24,20,0.10) !important; border-color: ${CLAY} !important; }
        .news-card:hover .card-img { transform: scale(1.04); }
        .card-img { transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94); }

        .featured-card { cursor: pointer; }
        .featured-card:hover .feat-img { transform: scale(1.03); }
        .feat-img { transition: transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94); }

        .read-link { transition: color 0.2s ease, letter-spacing 0.2s ease; }
        .read-link:hover { color: ${TERRA_DARK} !important; letter-spacing: 0.06em; }

        /* --- RESPONSIVE CLASSES ADDED HERE --- */
        .page-container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 20px;
        }

        .hero-section {
            padding: 48px 0 40px;
        }

        .news-grid {
            display: grid;
            grid-template-columns: repeat(1, 1fr);
            gap: 24px;
        }

        .news-section {
            padding: 40px 0 64px;
        }

        @media (min-width: 768px) {
            .page-container { padding: 0 40px; }
            .hero-section { padding: 72px 0 56px; }
            .news-grid { grid-template-columns: repeat(2, 1fr); }
            .news-section { padding: 56px 0 96px; }
        }

        @media (min-width: 1024px) {
            .news-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

            {/* Accent bar */}
            <div className="anim-fade" style={{ height: '3px', background: 'linear-gradient(to right, #B5623E, #D4C4B0, transparent)' }} />

            <div className="page-container">

                {/* ══════════════════════════════════
            HERO HEADER
        ══════════════════════════════════ */}
                <section className="hero-section" style={{ borderBottom: '1px solid #D4C4B0', position: 'relative', overflow: 'hidden' }}>

                    {/* Ghost watermark */}
                    <div className="anim-fade d-1" style={{
                        position: 'absolute', right: '-10px', top: '-10px',
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(120px, 22vw, 300px)',
                        fontWeight: 300, fontStyle: 'italic',
                        color: PARCHMENT, lineHeight: 1,
                        userSelect: 'none', pointerEvents: 'none',
                        zIndex: 0
                    }}>
                        News.
                    </div>

                    <div style={{ position: 'relative', maxWidth: '640px', zIndex: 1 }}>
                        <div className="anim-down d-1" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                            <div style={{ width: '32px', height: '2px', backgroundColor: TERRA }} />
                            <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.24em', textTransform: 'uppercase', color: TERRA }}>
                                Latest Stories
                            </p>
                        </div>
                        <h1 className="anim-up d-2" style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 'clamp(40px, 6vw, 80px)',
                            fontWeight: 400, lineHeight: 0.98, color: INK, marginBottom: '24px',
                        }}>
                            News &<br />
                            <em style={{ color: TERRA }}>Announcements.</em>
                        </h1>
                        <p className="anim-up d-3" style={{ fontSize: '15px', color: INK_LIGHT, fontWeight: 300, lineHeight: 1.8, maxWidth: '440px' }}>
                            Stories from our shelves, new arrivals, reading guides, and everything happening at Baku Book Center.
                        </p>

                        {/* Article count badge */}
                        {news.length > 0 && (
                            <div className="anim-fade d-4" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
                                <span style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: '32px', fontWeight: 400, color: INK, lineHeight: 1,
                                }}>
                                    {news.length}
                                </span>
                                <span style={{ fontSize: '11px', color: INK_LIGHT, fontWeight: 300, letterSpacing: '0.06em' }}>
                                    {news.length === 1 ? 'article published' : 'articles published'}
                                </span>
                            </div>
                        )}
                    </div>
                </section>

                {/* ══════════════════════════════════
            NEWS GRID
        ══════════════════════════════════ */}
                {rest.length > 0 && (
                    <section className="news-section">
                        <div className="anim-up d-5" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                            <p style={{
                                fontSize: '10px', fontWeight: 500, letterSpacing: '0.22em',
                                textTransform: 'uppercase', color: TERRA, whiteSpace: 'nowrap'
                            }}>
                                All Stories
                            </p>
                            <div style={{ flex: 1, height: '1px', backgroundColor: PARCHMENT, marginLeft: '20px' }} />
                        </div>

                        <div className="news-grid">
                            {rest.map((item: any, i: number) => (
                                <article
                                    key={item._id}
                                    className="news-card anim-up"
                                    onClick={() => router.push(`/${lang}/news/${item._id}`)}
                                    style={{
                                        border: '1px solid #EFE9DF', borderRadius: '4px',
                                        overflow: 'hidden', backgroundColor: WHITE,
                                        animationDelay: `${0.1 + i * 0.07}s`,
                                        display: 'flex', flexDirection: 'column'
                                    }}
                                >
                                    {/* Image */}
                                    <div style={{ height: '220px', overflow: 'hidden', backgroundColor: PARCHMENT, position: 'relative' }}>
                                        {item.images?.[0] ? (
                                            <img
                                                src={item.images[0]}
                                                alt={getLocalizedText(item.title, lang)}
                                                className="card-img"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '100%', height: '100%',
                                                backgroundColor: CREAM, display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                fontFamily: "'Cormorant Garamond', serif",
                                                fontSize: '40px', color: CLAY,
                                            }}>
                                                ◎
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <time style={{
                                            fontSize: '10px', fontWeight: 500, letterSpacing: '0.14em',
                                            textTransform: 'uppercase', color: TERRA, marginBottom: '10px',
                                            display: 'block',
                                        }}>
                                            {formatDate(item.date, lang)}
                                        </time>

                                        <h3 style={{
                                            fontFamily: "'Cormorant Garamond', serif",
                                            fontSize: '22px', fontWeight: 400,
                                            color: INK, lineHeight: 1.25, marginBottom: '12px',
                                            display: '-webkit-box', WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                        }}>
                                            {getLocalizedText(item.title, lang)}
                                        </h3>

                                        {item.summary && (
                                            <p style={{
                                                fontSize: '13px', color: INK_LIGHT, lineHeight: 1.8,
                                                fontWeight: 300, marginBottom: '16px',
                                                display: '-webkit-box', WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                flex: 1
                                            }}>
                                                {getLocalizedText(item.summary, lang)}
                                            </p>
                                        )}

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #EFE9DF', marginTop: 'auto' }}>
                                            <span
                                                className="read-link"
                                                style={{
                                                    fontSize: '11px', fontWeight: 500,
                                                    color: TERRA, letterSpacing: '0.04em',
                                                }}
                                            >
                                                Read More →
                                            </span>
                                            <span style={{
                                                fontFamily: "'Cormorant Garamond', serif",
                                                fontSize: '22px', color: PARCHMENT, lineHeight: 1,
                                                fontStyle: 'italic',
                                            }}>
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {/* ══════════════════════════════════
            EMPTY STATE
        ══════════════════════════════════ */}
                {news.length === 0 && (
                    <section style={{ padding: '120px 20px', textAlign: 'center' }}>
                        <p style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '64px', color: PARCHMENT, lineHeight: 1,
                            marginBottom: '24px',
                        }}>
                            ◎
                        </p>
                        <h2 style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 400, color: INK, marginBottom: '12px',
                        }}>
                            No stories yet.
                        </h2>
                        <p style={{ fontSize: '14px', color: INK_LIGHT, fontWeight: 300 }}>
                            Check back soon — we have plenty to share.
                        </p>
                    </section>
                )}

            </div>
        </div>
    );
}