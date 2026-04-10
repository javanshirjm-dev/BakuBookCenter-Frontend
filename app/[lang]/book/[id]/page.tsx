'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import BookCard from '@/components/ui/homepage/BookCard';
import { translations, Language } from '@/locales/translations';

/* ─────────────── DESIGN TOKENS ─────────────── */
const T = {
    cream: '#F8F4EE',
    parchment: '#EFE9DF',
    clay: '#D4C4B0',
    terra: '#B5623E',
    terraDark: '#8C4530',
    ink: '#1C1814',
    inkMid: '#4A3F35',
    inkLight: '#8C7B6E',
    white: '#FDFCFA',
};

type LocalizedField = string | { [key: string]: string };

interface Book {
    _id: string;
    name: LocalizedField;
    description: LocalizedField;
    image: string;
    category: LocalizedField;
    author: LocalizedField;
    publishinghouse: LocalizedField;
    language: LocalizedField;
    pages: number;
    price?: number;
    hasDiscount?: boolean;
    discountedPrice?: number;
    bestseller?: boolean;
}

export default function BookDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const { language } = useLanguage();

    const currentLang = (params?.lang as Language) || 'en';
    const t = translations[currentLang] || translations['en'];

    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [randomBooks, setRandomBooks] = useState<Book[]>([]);
    const [randomBooksLoading, setRandomBooksLoading] = useState(false);

    const bookId = params.id;

    useEffect(() => {
        if (!bookId) return;
        const fetchBook = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5000/api/books/${bookId}`);
                if (!response.ok) throw new Error('Book not found');
                const data = await response.json();
                setBook(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [bookId]);

    useEffect(() => {
        const fetchRandomBooks = async () => {
            try {
                setRandomBooksLoading(true);
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                const response = await fetch(`${apiUrl}/books/random`, { cache: 'no-store' });
                const data = await response.json();
                setRandomBooks(data);
            } catch (err) {
                console.error('Error fetching random books:', err);
            } finally {
                setRandomBooksLoading(false);
            }
        };
        fetchRandomBooks();
    }, []);

    const getLocalizedText = (field: LocalizedField | undefined) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        return field[language] || field.en || field[Object.keys(field)[0]];
    };

    const handleAddToCart = () => {
        if (!book) return;
        for (let i = 0; i < quantity; i++) addToCart(book);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
        setQuantity(1);
    };

    const displayPrice = book?.hasDiscount && book?.discountedPrice ? book.discountedPrice : book?.price;
    const discountPercent = book?.hasDiscount && book?.discountedPrice && book?.price
        ? ((1 - book.discountedPrice / book.price) * 100).toFixed(0)
        : null;

    /* ── LOADING ── */
    if (loading) return (
        <div style={{
            minHeight: '100vh', backgroundColor: T.white,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Outfit', sans-serif",
        }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Outfit:wght@300;400;500&display=swap');`}</style>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '48px', height: '48px',
                    border: `2px solid ${T.clay}`,
                    borderTop: `2px solid ${T.terra}`,
                    borderRadius: '50%',
                    margin: '0 auto 20px',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '20px', fontStyle: 'italic', color: T.inkLight,
                }}>
                    Finding your book…
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );

    /* ── ERROR ── */
    if (error || !book) return (
        <div style={{
            minHeight: '100vh', backgroundColor: T.white,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Outfit', sans-serif",
        }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Outfit:wght@300;400;500&display=swap');`}</style>
            <div style={{ textAlign: 'center', maxWidth: '400px', padding: '0 20px' }}>
                <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '48px', color: T.clay, marginBottom: '16px',
                }}>◎</p>
                <h2 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '28px', fontWeight: 400, color: T.ink, marginBottom: '12px',
                }}>
                    {error || 'Book not found'}
                </h2>
                <p style={{ fontSize: '13px', color: T.inkLight, fontWeight: 300, marginBottom: '28px' }}>
                    This title may have moved or been removed from our catalogue.
                </p>
                <button
                    onClick={() => router.back()}
                    style={{
                        padding: '12px 28px',
                        backgroundColor: T.terra, color: T.white,
                        fontSize: '11px', fontWeight: 500,
                        letterSpacing: '0.14em', textTransform: 'uppercase',
                        border: 'none', borderRadius: '2px', cursor: 'pointer',
                    }}
                >
                    ← Go Back
                </button>
            </div>
        </div>
    );

    /* ── PAGE ── */
    return (
        <div style={{
            fontFamily: "'Outfit', sans-serif",
            backgroundColor: T.white,
            color: T.ink,
            minHeight: '100vh',
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Outfit:wght@300;400;500&display=swap');
                ::selection { background: ${T.terra}; color: ${T.white}; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

                /* ── RESPONSIVE CLASSES ── */
                .page-wrapper { max-width: 1280px; margin: 0 auto; padding: 0 40px; }
                .main-grid { display: grid; grid-template-columns: 330px 1fr; gap: 80px; padding: 64px 0 80px; border-bottom: 1px solid ${T.clay}; align-items: start; }
                .cover-col { position: sticky; top: 140px; }
                .cover-box { position: relative; overflow: hidden; background-color: ${T.parchment}; width: 100%; height: 500px; box-shadow: 0 32px 80px rgba(28,24,20,0.18), 0 8px 24px rgba(28,24,20,0.10); animation: fadeUp 0.7s ease both; }
                .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); border: 1px solid ${T.parchment}; border-radius: 4px; overflow: hidden; margin-bottom: 40px; }
                .action-row { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
                .action-cart-btn { flex: 1; }

                /* Tablet Breakpoint */
                @media (max-width: 900px) {
                    .page-wrapper { padding: 0 24px; }
                    .main-grid { grid-template-columns: 1fr; gap: 48px; padding: 40px 0; }
                    .cover-col { position: relative; top: 0; max-width: 420px; margin: 0 auto; width: 100%; }
                    .cover-box { height: auto; aspect-ratio: 2/3; }
                }

                /* Mobile Breakpoint */
                @media (max-width: 600px) {
                    .page-wrapper { padding: 0 20px; }
                    .meta-grid { grid-template-columns: 1fr; }
                    .meta-item { border-right: none !important; border-bottom: 1px solid ${T.parchment} !important; }
                    .meta-item:last-child { border-bottom: none !important; }
                }

                /* Small Mobile (Stacking buttons) */
                @media (max-width: 400px) {
                    .action-row { display: grid; grid-template-columns: 1fr auto; gap: 12px; }
                    .action-cart-btn { grid-column: 1 / -1; width: 100%; }
                    .qty-stepper { width: 100%; justify-content: space-between; }
                }
            `}</style>

            <div className="page-wrapper">

                {/* ── MAIN GRID ── */}
                <div className="main-grid">

                    {/* ── LEFT: COVER ── */}
                    <div className="cover-col">
                        <div className="cover-box">
                            {book.image ? (
                                <img
                                    src={book.image}
                                    alt={getLocalizedText(book.name)}
                                    onLoad={() => setImgLoaded(true)}
                                    style={{
                                        width: '100%', height: '100%',
                                        objectFit: 'cover',
                                        opacity: imgLoaded ? 1 : 0,
                                        transition: 'opacity 0.5s ease',
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '100%', height: '100%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: '14px', color: T.inkLight, fontStyle: 'italic',
                                }}>
                                    No cover available
                                </div>
                            )}

                            {/* Badges */}
                            <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {discountPercent && (
                                    <span style={{
                                        backgroundColor: T.terra, color: T.white,
                                        fontSize: '10px', fontWeight: 500,
                                        letterSpacing: '0.1em', textTransform: 'uppercase',
                                        padding: '5px 10px', borderRadius: '2px',
                                    }}>
                                        −{discountPercent}%
                                    </span>
                                )}
                                {book.bestseller && (
                                    <span style={{
                                        backgroundColor: T.ink, color: T.white,
                                        fontSize: '10px', fontWeight: 500,
                                        letterSpacing: '0.1em', textTransform: 'uppercase',
                                        padding: '5px 10px', borderRadius: '2px',
                                    }}>
                                        Bestseller
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Decorative terracotta line under cover */}
                        <div style={{
                            height: '3px', marginTop: '20px',
                            background: `linear-gradient(to right, ${T.terra}, transparent)`,
                            borderRadius: '2px',
                        }} />
                    </div>

                    {/* ── RIGHT: DETAILS ── */}
                    <div style={{ animation: 'fadeUp 0.7s ease 0.1s both' }}>

                        {/* Category pill */}
                        {book.category && (
                            <p style={{
                                fontSize: '10px', fontWeight: 500,
                                letterSpacing: '0.22em', textTransform: 'uppercase',
                                color: T.terra, marginBottom: '16px',
                            }}>
                                {getLocalizedText(book.category)}
                            </p>
                        )}

                        {/* Title */}
                        <h1 style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 'clamp(32px, 5vw, 58px)',
                            fontWeight: 400, lineHeight: 1.05,
                            color: T.ink, marginBottom: '12px',
                        }}>
                            {getLocalizedText(book.name)}
                        </h1>

                        {/* Author */}
                        {book.author && (
                            <p style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: '20px', fontStyle: 'italic',
                                color: T.inkLight, marginBottom: '32px', fontWeight: 300,
                            }}>
                                by {getLocalizedText(book.author)}
                            </p>
                        )}

                        {/* Divider */}
                        <div style={{ width: '100%', height: '1px', backgroundColor: T.parchment, marginBottom: '32px' }} />

                        {/* Price block */}
                        <div style={{ marginBottom: '32px' }}>
                            {book.hasDiscount && book.discountedPrice && book.price ? (
                                <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '14px' }}>
                                    <span style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontSize: '44px', fontWeight: 500, color: T.ink, lineHeight: 1,
                                    }}>
                                        ${book.discountedPrice.toFixed(2)}
                                    </span>
                                    <span style={{
                                        fontSize: '18px', color: T.clay,
                                        textDecoration: 'line-through', fontWeight: 300,
                                    }}>
                                        ${book.price.toFixed(2)}
                                    </span>
                                    <span style={{
                                        fontSize: '11px', fontWeight: 500,
                                        letterSpacing: '0.1em', textTransform: 'uppercase',
                                        color: T.terra, border: `1px solid ${T.terra}`,
                                        padding: '3px 8px', borderRadius: '2px',
                                        marginTop: '4px'
                                    }}>
                                        Save {discountPercent}%
                                    </span>
                                </div>
                            ) : (
                                <span style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: '44px', fontWeight: 500, color: T.ink, lineHeight: 1,
                                }}>
                                    ${book.price?.toFixed(2) || '—'}
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        {book.description && (
                            <div style={{ marginBottom: '36px' }}>
                                <p style={{
                                    fontSize: '10px', fontWeight: 500,
                                    letterSpacing: '0.18em', textTransform: 'uppercase',
                                    color: T.inkLight, marginBottom: '12px',
                                }}>
                                    {t('description')}
                                </p>
                                <p style={{
                                    fontSize: '14px', color: T.inkMid,
                                    lineHeight: 2.0, fontWeight: 300,
                                    fontFamily: "serif",
                                    borderLeft: `2px solid ${T.parchment}`,
                                    paddingLeft: '20px',
                                }}>
                                    {getLocalizedText(book.description)}
                                </p>
                            </div>
                        )}

                        {/* Meta grid */}
                        <div className="meta-grid">
                            {[
                                book.author && { label: t('author'), value: getLocalizedText(book.author) },
                                book.publishinghouse && { label: t('publishingHouse'), value: getLocalizedText(book.publishinghouse) },
                                book.pages && { label: t('pages'), value: `${book.pages} pp.` },
                                book.language && { label: t('language'), value: getLocalizedText(book.language) },
                            ].filter(Boolean).map((meta: any, i, arr) => (
                                <div key={meta.label} className="meta-item" style={{
                                    borderRight: i % 2 === 0 ? `1px solid ${T.parchment}` : 'none',
                                    borderBottom: i < arr.length - 2 ? `1px solid ${T.parchment}` : 'none',
                                    backgroundColor: i % 2 === 0 ? T.white : T.cream,
                                }}>
                                    <p style={{
                                        fontSize: '10px', fontWeight: 500,
                                        letterSpacing: '0.16em', textTransform: 'uppercase',
                                        color: T.inkLight, marginBottom: '5px',
                                    }}>
                                        {meta.label}
                                    </p>
                                    <p style={{
                                        fontSize: '14px', color: T.ink,
                                        fontWeight: 400, fontFamily: "'Cormorant Garamond', serif",
                                    }}>
                                        {meta.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Quantity + Add to Cart */}
                        <div className="action-row">
                            {/* Qty stepper */}
                            <div className="qty-stepper" style={{
                                display: 'flex', alignItems: 'center',
                                border: `1px solid ${T.clay}`,
                                borderRadius: '2px', overflow: 'hidden',
                                flexShrink: 0,
                            }}>
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    style={{
                                        width: '42px', height: '52px',
                                        background: 'none', border: 'none',
                                        cursor: 'pointer', color: T.inkLight,
                                        fontSize: '18px', fontWeight: 300,
                                        borderRight: `1px solid ${T.parchment}`,
                                        transition: 'background-color 0.15s ease',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = T.parchment)}
                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                    −
                                </button>
                                <span style={{
                                    width: '48px', textAlign: 'center',
                                    fontSize: '15px', fontWeight: 500, color: T.ink,
                                    fontFamily: "'Cormorant Garamond', serif",
                                }}>
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    style={{
                                        width: '42px', height: '52px',
                                        background: 'none', border: 'none',
                                        cursor: 'pointer', color: T.inkLight,
                                        fontSize: '18px', fontWeight: 300,
                                        borderLeft: `1px solid ${T.parchment}`,
                                        transition: 'background-color 0.15s ease',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = T.parchment)}
                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                    +
                                </button>
                            </div>

                            {/* Add to Cart */}
                            <button
                                className="action-cart-btn"
                                onClick={handleAddToCart}
                                style={{
                                    height: '52px',
                                    backgroundColor: addedToCart ? '#3A6B4A' : T.terra,
                                    color: T.white,
                                    fontSize: '11px', fontWeight: 500,
                                    letterSpacing: '0.16em', textTransform: 'uppercase',
                                    border: 'none', borderRadius: '2px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s ease',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                }}
                                onMouseEnter={e => {
                                    if (!addedToCart) (e.currentTarget.style.backgroundColor = T.terraDark);
                                }}
                                onMouseLeave={e => {
                                    if (!addedToCart) (e.currentTarget.style.backgroundColor = T.terra);
                                }}
                            >
                                {addedToCart ? `✓ ${t('addedToCart')}` : `${t('addToCartButton')}${quantity > 1 ? ` (${quantity})` : ''}`}
                            </button>

                            {/* Back button */}
                            <button
                                onClick={() => router.back()}
                                style={{
                                    height: '52px', width: '52px', flexShrink: 0,
                                    border: `1px solid ${T.clay}`,
                                    backgroundColor: 'transparent',
                                    borderRadius: '2px', cursor: 'pointer',
                                    color: T.inkLight, fontSize: '18px',
                                    transition: 'all 0.2s ease',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                                title="Go back"
                                onMouseEnter={e => {
                                    (e.currentTarget.style.backgroundColor = T.parchment);
                                    (e.currentTarget.style.color = T.ink);
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget.style.backgroundColor = 'transparent');
                                    (e.currentTarget.style.color = T.inkLight);
                                }}
                            >
                                ←
                            </button>
                        </div>

                        {/* Success toast */}
                        <div style={{
                            overflow: 'hidden',
                            maxHeight: addedToCart ? '80px' : '0',
                            transition: 'max-height 0.4s ease',
                        }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '14px 20px',
                                backgroundColor: '#EEF6F1',
                                border: '1px solid #B8DEC9',
                                borderRadius: '2px',
                                borderLeft: '3px solid #3A6B4A',
                            }}>
                                <span style={{ fontSize: '16px', color: '#3A6B4A' }}>✓</span>
                                <p style={{
                                    fontSize: '13px', color: '#2A5438',
                                    fontWeight: 400,
                                }}>
                                    {quantity === 0 ? 'Added' : `${quantity > 1 ? `${quantity} copies` : 'Copy'}`} of{' '}
                                    <em style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '15px' }}>
                                        {getLocalizedText(book.name)}
                                    </em>{' '}
                                    added to your cart.
                                </p>
                            </div>
                        </div>

                        {/* Trust signals */}
                        <div style={{
                            display: 'flex', gap: '24px', flexWrap: 'wrap',
                            marginTop: '28px', paddingTop: '28px',
                            borderTop: `1px solid ${T.parchment}`,
                        }}>
                            {[
                                ['→', 'Free shipping over $40'],
                                ['↺', '30-day returns'],
                                ['◎', 'Packed with care'],
                            ].map(([icon, label]) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: T.terra, fontSize: '14px' }}>{icon}</span>
                                    <span style={{ fontSize: '12px', color: T.inkLight, fontWeight: 300 }}>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Random */}
                <section className="max-w-7xl mx-auto py-12">
                    <h1 className="text-3xl text-gray-900 mb-6 font-light tracking-tight font-serif">{t.explore}</h1>

                    {!randomBooks || randomBooks.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                            <p className="text-gray-500 font-medium text-lg">{t.emptyNew}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                            {randomBooks.map((book: any) => (
                                <BookCard key={book._id} book={book} lang={currentLang} />
                            ))}
                        </div>
                    )}
                </section>

                {/* ── BOTTOM TAGLINE ── */}
                <div style={{
                    padding: '40px 0 60px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '16px',
                }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: T.parchment }} />
                    <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '16px', fontStyle: 'italic',
                        color: T.clay, whiteSpace: 'nowrap',
                    }}>
                        Every book leaves with a note.
                    </p>
                    <div style={{ flex: 1, height: '1px', backgroundColor: T.parchment }} />
                </div>

            </div>
        </div>
    );
}