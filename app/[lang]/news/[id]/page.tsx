'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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

export default function NewsDetailPage() {
    const [newsItem, setNewsItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const params = useParams();
    const router = useRouter();
    const lang = (params.lang as string) || 'en';
    const newsId = params.id as string;

    useEffect(() => {
        const fetchNewsDetail = async () => {
            try {
                // Tip: Swap this out for your production URL when you deploy!
                const res = await fetch(`http://localhost:5000/api/news/${newsId}`);
                if (res.ok) {
                    const data = await res.json();
                    setNewsItem(data);
                }
            } catch (error) {
                console.error('Error fetching news detail:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNewsDetail();
    }, [newsId]);

    /* ── LOADING ── */
    if (loading) return (
        <div style={{ minHeight: '100vh', backgroundColor: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Outfit:wght@300;400;500&display=swap'); @keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '2px solid #EFE9DF', borderTop: '2px solid #B5623E', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontStyle: 'italic', color: INK_LIGHT }}>
                    Loading story…
                </p>
            </div>
        </div>
    );

    /* ── NOT FOUND ── */
    if (!newsItem) return (
        <div style={{ minHeight: '100vh', backgroundColor: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Outfit:wght@300;400;500&display=swap');`}</style>
            <div style={{ textAlign: 'center', maxWidth: '400px', padding: '0 20px' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '64px', color: PARCHMENT, lineHeight: 1, marginBottom: '20px' }}>◎</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 400, color: INK, marginBottom: '12px' }}>
                    Story not found.
                </h2>
                <p style={{ fontSize: '13px', color: INK_LIGHT, fontWeight: 300, marginBottom: '28px' }}>
                    This article may have moved or been removed.
                </p>
                <Link href={`/${lang}/news`} style={{ display: 'inline-block', padding: '12px 28px', backgroundColor: TERRA, color: WHITE, fontSize: '10px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', borderRadius: '2px', textDecoration: 'none' }}>
                    ← Back to News
                </Link>
            </div>
        </div>
    );

    const title = getLocalizedText(newsItem.title, lang);
    const description = getLocalizedText(newsItem.description, lang);
    const images = newsItem.images || [];
    const currentImage = images[selectedImageIndex] || null;

    /* ── PAGE ── */
    return (
        <div style={{ fontFamily: "'Outfit', sans-serif", backgroundColor: WHITE, minHeight: '100vh', color: INK }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Outfit:wght@300;400;500&display=swap');
        ::selection { background: ${TERRA}; color: ${WHITE}; }

        @keyframes fadeIn   { from { opacity:0; }                             to { opacity:1; } }
        @keyframes slideUp  { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes imgReveal { from { opacity:0; transform:scale(1.04); }    to { opacity:1; transform:scale(1); } }

        .anim-fade { animation: fadeIn   0.7s ease both; }
        .anim-up   { animation: slideUp  0.7s cubic-bezier(0.4,0,0.2,1) both; }
        .anim-img  { animation: imgReveal 0.9s cubic-bezier(0.4,0,0.2,1) both; }

        .d-1 { animation-delay: 0.05s; } .d-2 { animation-delay: 0.15s; }
        .d-3 { animation-delay: 0.25s; } .d-4 { animation-delay: 0.35s; }
        .d-5 { animation-delay: 0.45s; } .d-6 { animation-delay: 0.55s; }

        .thumb-btn { transition: border-color 0.2s ease, opacity 0.2s ease; }
        .thumb-btn:hover { opacity: 1 !important; }

        .back-link { transition: color 0.2s ease; }
        .back-link:hover { color: ${TERRA} !important; }

        .back-btn { transition: background-color 0.2s ease; }
        .back-btn:hover { background-color: ${TERRA_DARK} !important; }

        /* --- RESPONSIVE CLASSES ADDED HERE --- */
        .page-container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 20px;
        }

        .header-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 32px;
            padding: 40px 0 32px;
        }

        .content-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 48px;
            padding: 40px 0 64px;
            align-items: start;
        }

        .meta-sidebar {
            position: static;
        }

        @media (min-width: 768px) {
            .page-container { padding: 0 40px; }
            .header-grid { padding: 48px 0 40px; }
            .content-grid { padding: 48px 0 80px; }
        }

        @media (min-width: 1024px) {
            .header-grid {
                grid-template-columns: 1fr 320px;
                gap: 64px;
                align-items: flex-end;
                padding: 56px 0 48px;
            }
            .content-grid {
                grid-template-columns: 1fr 280px;
                gap: 64px;
                padding: 56px 0 96px;
            }
            .meta-sidebar {
                position: sticky;
                top: 32px;
            }
        }
      `}</style>

            {/* Accent bar */}
            <div style={{ height: '3px', background: 'linear-gradient(to right, #B5623E, #D4C4B0, transparent)' }} />

            <div className="page-container">

                {/* ── BREADCRUMB ── */}
                <div className="anim-fade d-1" style={{ padding: '24px 0', borderBottom: '1px solid #EFE9DF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link href={`/${lang}/news`} className="back-link" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: TERRA, textDecoration: 'none' }}>
                        News
                    </Link>
                    <span style={{ fontSize: '10px', color: CLAY }}>›</span>
                    <span style={{ fontSize: '11px', color: INK_LIGHT, fontWeight: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                        {title}
                    </span>
                </div>

                {/* ── ARTICLE HEADER ── */}
                <header className="header-grid" style={{ borderBottom: '1px solid #D4C4B0' }}>
                    <div>
                        <div className="anim-up d-1" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ width: '28px', height: '2px', backgroundColor: TERRA }} />
                            <time style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: TERRA }}>
                                {formatDate(newsItem.date, lang)}
                            </time>
                        </div>

                        <h1 className="anim-up d-2" style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 'clamp(32px, 5vw, 64px)',
                            fontWeight: 400, lineHeight: 1.0, color: INK,
                        }}>
                            {title}
                        </h1>
                    </div>

                    {/* Side meta */}
                    <div className="anim-fade d-3" style={{ paddingBottom: '8px' }}>
                        <div style={{ borderLeft: '2px solid #EFE9DF', paddingLeft: '24px' }}>
                            <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK_LIGHT, marginBottom: '8px' }}>
                                Baku Book Center
                            </p>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '15px', fontStyle: 'italic', color: INK_LIGHT, lineHeight: 1.6 }}>
                                Stay updated with our latest announcements and stories from the shelves.
                            </p>
                            {images.length > 0 && (
                                <p style={{ fontSize: '11px', color: CLAY, fontWeight: 300, marginTop: '12px' }}>
                                    {images.length} {images.length === 1 ? 'photo' : 'photos'}
                                </p>
                            )}
                        </div>
                    </div>
                </header>

                {/* ── MAIN IMAGE ── */}
                {currentImage && (
                    <div className="anim-img d-3" style={{ margin: '0', borderBottom: '1px solid #EFE9DF', overflow: 'hidden', position: 'relative' }}>
                        <div style={{ width: '100%', height: 'clamp(240px, 55vh, 580px)', overflow: 'hidden', backgroundColor: PARCHMENT }}>
                            <img
                                src={currentImage}
                                alt={title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                            />
                        </div>

                        {/* Image counter badge */}
                        {images.length > 1 && (
                            <div style={{
                                position: 'absolute', bottom: '20px', right: '24px',
                                backgroundColor: 'rgba(28,24,20,0.75)',
                                color: WHITE, fontSize: '10px', fontWeight: 500,
                                letterSpacing: '0.1em', padding: '6px 12px', borderRadius: '2px',
                            }}>
                                {selectedImageIndex + 1} / {images.length}
                            </div>
                        )}
                    </div>
                )}

                {/* ── THUMBNAIL STRIP ── */}
                {images.length > 1 && (
                    <div className="anim-fade d-4" style={{
                        display: 'flex', gap: '8px',
                        padding: '16px 0',
                        borderBottom: '1px solid #EFE9DF',
                        overflowX: 'auto',
                    }}>
                        {images.map((img: string, i: number) => (
                            <button
                                key={i}
                                onClick={() => setSelectedImageIndex(i)}
                                className="thumb-btn"
                                style={{
                                    flexShrink: 0,
                                    width: '72px', height: '72px',
                                    border: selectedImageIndex === i ? '2px solid #B5623E' : '2px solid #EFE9DF',
                                    borderRadius: '2px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    padding: 0,
                                    opacity: selectedImageIndex === i ? 1 : 0.55,
                                    background: 'none',
                                }}
                            >
                                <img src={img} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </button>
                        ))}
                    </div>
                )}

                {/* ── ARTICLE BODY ── */}
                <div className="content-grid">

                    {/* Body text */}
                    <article className="anim-up d-4">
                        {/* Opening rule */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '36px' }}>
                            <div style={{ width: '48px', height: '2px', backgroundColor: TERRA }} />
                            <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: TERRA }}>
                                Full Story
                            </p>
                        </div>

                        <div style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '20px', fontWeight: 300,
                            color: INK_MID, lineHeight: 2.0,
                            whiteSpace: 'pre-wrap',
                            borderLeft: '2px solid #EFE9DF',
                            paddingLeft: 'clamp(16px, 4vw, 28px)', // Slightly smaller indent on mobile
                        }}>
                            {description}
                        </div>
                    </article>

                    {/* Sidebar */}
                    <aside className="anim-fade d-5 meta-sidebar">

                        {/* Date card */}
                        <div style={{ border: '1px solid #EFE9DF', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                            <div style={{ padding: '20px 24px', backgroundColor: CREAM, borderBottom: '1px solid #EFE9DF' }}>
                                <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: TERRA, marginBottom: '6px' }}>
                                    Published
                                </p>
                                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 400, color: INK }}>
                                    {formatDate(newsItem.date, lang)}
                                </p>
                            </div>
                            <div style={{ padding: '20px 24px' }}>
                                <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_LIGHT, marginBottom: '6px' }}>
                                    Source
                                </p>
                                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', fontStyle: 'italic', color: INK_LIGHT }}>
                                    Baku Book Center
                                </p>
                            </div>
                        </div>

                        {/* Photo count */}
                        {images.length > 0 && (
                            <div style={{ border: '1px solid #EFE9DF', borderRadius: '4px', padding: '20px 24px', marginBottom: '16px', backgroundColor: WHITE }}>
                                <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_LIGHT, marginBottom: '8px' }}>
                                    Photos
                                </p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 400, color: INK, lineHeight: 1 }}>
                                        {images.length}
                                    </span>
                                    <span style={{ fontSize: '12px', color: INK_LIGHT, fontWeight: 300 }}>
                                        {images.length === 1 ? 'image' : 'images'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Back button */}
                        <Link
                            href={`/${lang}/news`}
                            className="back-btn"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                padding: '14px',
                                backgroundColor: INK, color: WHITE,
                                fontSize: '10px', fontWeight: 500,
                                letterSpacing: '0.16em', textTransform: 'uppercase',
                                borderRadius: '2px', textDecoration: 'none',
                                transition: 'background-color 0.2s ease',
                            }}
                        >
                            ← Back to All News
                        </Link>
                    </aside>
                </div>

            </div>
        </div>
    );
}