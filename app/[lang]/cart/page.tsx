"use client";

import { useCart } from "../../../context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

/* ─────────────── DESIGN TOKENS ─────────────── */
const T = {
    cream: "#F8F4EE",
    parchment: "#d4c9b8",
    clay: "#D4C4B0",
    terra: "#B5623E",
    terraDark: "#8C4530",
    ink: "#1C1814",
    inkMid: "#4A3F35",
    inkLight: "#8C7B6E",
    white: "#FDFCFA",
};

type LocalizedField = string | { [key: string]: string };

/* ─────────────── RESPONSIVE STYLES ─────────────── */
const responsiveStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Outfit:wght@300;400;500&display=swap');
  ::selection { background: ${T.terra}; color: ${T.white}; }

  /* Base Layout */
  .cart-wrapper { max-width: 1280px; margin: 0 auto; padding: 0 40px; }
  .cart-header { padding: 64px 0 48px; border-bottom: 1px solid ${T.clay}; display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; }
  .cart-main { display: grid; grid-template-columns: 1fr 360px; gap: 48px; padding: 48px 0 100px; align-items: start; }
  .summary-box { position: sticky; top: 24px; }

  /* Cart Item */
  .cart-item { display: grid; grid-template-columns: 72px 1fr auto; gap: 20px; align-items: center; padding: 24px 28px; border-radius: 4px; }
  .item-image-wrapper { width: 77px; height: 119px; flex-shrink: 0; }
  .price-wrapper { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }

  /* Responsive Breakpoints */
  @media (max-width: 960px) {
    .cart-wrapper { padding: 0 24px; }
    .cart-main { grid-template-columns: 1fr; gap: 40px; padding: 32px 0 80px; }
    .summary-box { position: relative; top: 0; }
  }

  @media (max-width: 600px) {
    .cart-wrapper { padding: 0 16px; }
    .cart-header { flex-direction: column; align-items: flex-start; padding: 40px 0 24px; gap: 16px; }
    
    /* Stack price/remove button below product details on mobile */
    .cart-item { grid-template-columns: 64px 1fr; padding: 20px 16px; gap: 16px; }
    .item-image-wrapper { width: 64px; height: 98px; }
    .price-wrapper {
      grid-column: 1 / -1;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px dashed ${T.parchment};
      margin-top: 4px;
    }
    .price-wrapper > div { display: flex; align-items: baseline; gap: 10px; }
    .price-wrapper p { margin-top: 0 !important; }
  }
`;

/* ─────────────── FADE-IN HOOK ─────────────── */
function useFadeIn() {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.08 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return { ref, visible };
}

function Reveal({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
    const { ref, visible } = useFadeIn();
    return (
        <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`, ...style }}>
            {children}
        </div>
    );
}

/* ─────────────── CART ITEM ─────────────── */
function CartItem({ item, language, getLocalizedText, onRemove, index, t }: {
    item: any; language: string; getLocalizedText: (f: any) => string; onRemove: () => void; index: number; t: (key: string) => string;
}) {
    const [removing, setRemoving] = useState(false);
    const [hovered, setHovered] = useState(false);

    const handleRemove = () => {
        setRemoving(true);
        setTimeout(onRemove, 320);
    };

    const lineTotal = (item.price * item.quantity).toFixed(2);
    const originalTotal = item.originalPrice ? (item.originalPrice * item.quantity).toFixed(2) : null;

    return (
        <Reveal delay={index * 60}>
            <div
                className="cart-item"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    backgroundColor: hovered ? T.cream : T.white,
                    border: `1px solid ${hovered ? T.clay : T.parchment}`,
                    transition: 'all 0.25s ease',
                    opacity: removing ? 0 : 1,
                    transform: removing ? 'translateX(20px)' : 'translateX(0)',
                }}
            >
                {/* Cover */}
                <div className="item-image-wrapper" style={{
                    borderRadius: '2px', overflow: 'hidden', backgroundColor: T.parchment,
                    boxShadow: '0 4px 16px rgba(28,24,20,0.12)',
                }}>
                    {item.image
                        ? <img src={item.image} alt={getLocalizedText(item.name)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: T.clay, fontStyle: 'italic' }}>?</div>
                    }
                </div>

                {/* Info */}
                <div>
                    <h3 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '20px', fontWeight: 500,
                        color: T.ink, marginBottom: '4px', lineHeight: 1.2,
                    }}>
                        {getLocalizedText(item.name)}
                    </h3>
                    {item.author && (
                        <p style={{ fontSize: '13px', color: T.inkLight, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", marginBottom: '8px' }}>
                            {getLocalizedText(item.author)}
                        </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <span style={{
                            fontSize: '11px', fontWeight: 500,
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                            color: T.inkLight,
                        }}>
                            {t('qty')}: {item.quantity}
                        </span>
                        {item.hasDiscount && (
                            <span style={{
                                fontSize: '9px', fontWeight: 500, letterSpacing: '0.12em',
                                textTransform: 'uppercase', color: T.terra,
                                border: `1px solid ${T.terra}`, padding: '2px 7px', borderRadius: '2px',
                            }}>
                                {t('discounted')}
                            </span>
                        )}
                    </div>
                </div>

                {/* Price + Remove */}
                <div className="price-wrapper">
                    <div>
                        <p style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '24px', fontWeight: 500, color: T.ink, lineHeight: 1,
                        }}>
                            ${lineTotal}
                        </p>
                        {item.hasDiscount && originalTotal && (
                            <p style={{ fontSize: '12px', color: T.clay, textDecoration: 'line-through', fontWeight: 300, marginTop: '2px' }}>
                                ${originalTotal}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleRemove}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em',
                            textTransform: 'uppercase', color: T.clay,
                            fontFamily: "'Outfit', sans-serif",
                            transition: 'color 0.2s ease',
                            padding: 0,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = T.terra)}
                        onMouseLeave={e => (e.currentTarget.style.color = T.clay)}
                    >
                        {t('remove')} ×
                    </button>
                </div>
            </div>
        </Reveal>
    );
}

/* ─────────────── PAGE ─────────────── */
export default function CartPage() {
    const params = useParams();
    const lang = (params?.lang as string) || 'en';

    const { cart, removeFromCart } = useCart();
    const { language, t } = useLanguage();

    const getLocalizedText = (field: LocalizedField | undefined): string => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        return field[language] || field.en || field[Object.keys(field)[0]];
    };

    const cartTotal = cart.reduce((total: number, item: any) => total + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((total: number, item: any) => total + item.quantity, 0);

    /* ── EMPTY STATE ── */
    if (cart.length === 0) return (
        <div style={{
            fontFamily: "'Outfit', sans-serif",
            backgroundColor: T.white,
            minHeight: '70vh',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <style>{responsiveStyles}</style>
            <div style={{ textAlign: 'center', maxWidth: '440px', padding: '0 24px' }}>
                <div style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '72px', color: T.parchment,
                    lineHeight: 1, marginBottom: '24px', userSelect: 'none',
                }}>
                    ◎
                </div>
                <h1 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 'clamp(32px, 8vw, 40px)', fontWeight: 400,
                    color: T.ink, marginBottom: '12px', lineHeight: 1.1,
                }}>
                    {t('cartEmpty')}
                </h1>
                <p style={{
                    fontSize: '14px', color: T.inkLight,
                    fontWeight: 300, lineHeight: 1.8,
                    marginBottom: '36px', fontStyle: 'italic',
                    fontFamily: "'Cormorant Garamond', serif",
                }}>
                    {t('cartEmptyDesc')}
                </p>
                <Link href="/shop" style={{
                    display: 'inline-block', padding: '14px 36px',
                    backgroundColor: T.terra, color: T.white,
                    fontSize: '10px', fontWeight: 500,
                    letterSpacing: '0.18em', textTransform: 'uppercase',
                    borderRadius: '2px', textDecoration: 'none',
                    fontFamily: "'Outfit', sans-serif",
                    transition: 'background-color 0.2s ease',
                }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = T.terraDark)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = T.terra)}
                >
                    {t('continueShopping')}
                </Link>
            </div>
        </div>
    );

    /* ── FULL CART ── */
    return (
        <div style={{
            fontFamily: "'Outfit', sans-serif", backgroundColor: T.white,
            minHeight: '100vh', color: T.ink,
        }}>
            <style>{responsiveStyles}</style>

            <div className="cart-wrapper">
                {/* ── PAGE HEADER ── */}
                <div className="cart-header">
                    <div>
                        <Reveal>
                            <p style={{
                                fontSize: '10px', fontWeight: 500, letterSpacing: '0.22em',
                                textTransform: 'uppercase', color: T.terra, marginBottom: '12px',
                            }}>
                                {itemCount} {itemCount === 1 ? t('item') : t('items')}
                            </p>
                            <h1 style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: 'clamp(36px, 5vw, 60px)',
                                fontWeight: 400, lineHeight: 1.0, color: T.ink,
                            }}>
                                {t('shoppingCart')}
                            </h1>
                        </Reveal>
                    </div>
                    <Reveal delay={100}>
                        <Link href="/shop" style={{
                            fontSize: '11px', fontWeight: 500,
                            letterSpacing: '0.12em', textTransform: 'uppercase',
                            color: T.inkLight, textDecoration: 'none',
                            paddingBottom: '8px', borderBottom: `1px solid ${T.clay}`,
                            transition: 'color 0.2s ease, border-color 0.2s ease',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.color = T.terra; e.currentTarget.style.borderColor = T.terra; }}
                            onMouseLeave={e => { e.currentTarget.style.color = T.inkLight; e.currentTarget.style.borderColor = T.clay; }}
                        >
                            ← {t('continueShopping')}
                        </Link>
                    </Reveal>
                </div>

                {/* ── BODY ── */}
                <div className="cart-main">

                    {/* ── CART ITEMS ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {cart.map((item: any, i: number) => (
                            <CartItem
                                key={item._id}
                                item={item}
                                index={i}
                                language={language}
                                getLocalizedText={getLocalizedText}
                                onRemove={() => removeFromCart(item._id)}
                                t={t as (key: string) => string}
                            />
                        ))}

                        {/* Promo code strip */}
                        <Reveal delay={cart.length * 60 + 80} style={{ marginTop: '8px' }}>
                            <PromoStrip t={t as (key: string) => string} />
                        </Reveal>
                    </div>

                    {/* ── ORDER SUMMARY ── */}
                    <div className="summary-box">
                        <Reveal delay={120}>
                            <div style={{
                                border: `1px solid ${T.parchment}`, borderRadius: '4px',
                                overflow: 'hidden', backgroundColor: T.cream,
                            }}>
                                {/* Header */}
                                <div style={{
                                    padding: '24px 28px', borderBottom: `1px solid ${T.parchment}`, backgroundColor: T.white,
                                }}>
                                    <p style={{
                                        fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em',
                                        textTransform: 'uppercase', color: T.terra, marginBottom: '6px',
                                    }}>
                                        {t('orderSummary')}
                                    </p>
                                    <p style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontSize: '26px', fontWeight: 400, color: T.ink, fontStyle: 'italic',
                                    }}>
                                        {itemCount} {itemCount !== 1 ? t('books') : t('book')}
                                    </p>
                                </div>

                                {/* Line items */}
                                <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '13px', color: T.inkLight, fontWeight: 300 }}>
                                            {t('subtotal')}
                                        </span>
                                        <span style={{
                                            fontFamily: "'Cormorant Garamond', serif",
                                            fontSize: '18px', fontWeight: 500, color: T.ink,
                                        }}>
                                            ${cartTotal.toFixed(2)}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '13px', color: T.inkLight, fontWeight: 300 }}>
                                            {t('shipping')}
                                        </span>
                                        <span style={{
                                            fontSize: '12px', color: cartTotal >= 40 ? '#3A6B4A' : T.inkLight,
                                            fontWeight: cartTotal >= 40 ? 500 : 300,
                                        }}>
                                            {cartTotal >= 40 ? t('shippingFree') : t('calculatedAtCheckout')}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '13px', color: T.inkLight, fontWeight: 300 }}>
                                            {t('taxes')}
                                        </span>
                                        <span style={{ fontSize: '12px', color: T.inkLight, fontWeight: 300 }}>
                                            {t('calculatedAtCheckout')}
                                        </span>
                                    </div>

                                    {/* Free shipping nudge */}
                                    {cartTotal < 40 && (
                                        <div style={{
                                            padding: '10px 14px', backgroundColor: '#EEF6F1',
                                            border: '1px solid #B8DEC9', borderRadius: '2px', borderLeft: '3px solid #3A6B4A',
                                        }}>
                                            <p style={{ fontSize: '12px', color: '#2A5438', fontWeight: 400, lineHeight: 1.5 }}
                                                dangerouslySetInnerHTML={{
                                                    __html: t('freeShippingNudge').replace(
                                                        '${amount}',
                                                        `<strong>$${(40 - cartTotal).toFixed(2)}</strong>`
                                                    )
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Total */}
                                <div style={{
                                    padding: '20px 28px', borderTop: `1px solid ${T.parchment}`, borderBottom: `1px solid ${T.parchment}`,
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                                }}>
                                    <span style={{
                                        fontSize: '10px', fontWeight: 500,
                                        letterSpacing: '0.18em', textTransform: 'uppercase', color: T.ink,
                                    }}>
                                        {t('total')}
                                    </span>
                                    <span style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontSize: '36px', fontWeight: 500, color: T.ink,
                                    }}>
                                        ${cartTotal.toFixed(2)}
                                    </span>
                                </div>

                                {/* CTA */}
                                <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <Link href={`/${lang}/checkout`}
                                        style={{
                                            width: '100%', padding: '16px',
                                            backgroundColor: T.terra, color: T.white,
                                            fontSize: '11px', fontWeight: 500,
                                            letterSpacing: '0.16em', textTransform: 'uppercase',
                                            border: 'none', borderRadius: '2px', cursor: 'pointer',
                                            fontFamily: "'Outfit', sans-serif", transition: 'background-color 0.2s ease',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = T.terraDark)}
                                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = T.terra)}
                                    >
                                        {t('proceedToCheckout')}
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                            <line x1="2" y1="6" x2="10" y2="6" /><polyline points="7,3 10,6 7,9" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─────────────── PROMO STRIP ─────────────── */
function PromoStrip({ t }: { t: (key: string) => string }) {
    const [code, setCode] = useState('');
    const [applied, setApplied] = useState(false);
    const [open, setOpen] = useState(false);
    const [focused, setFocused] = useState(false);

    const handleApply = () => {
        if (code.trim()) setApplied(true);
    };

    return (
        <div style={{
            border: `1px solid ${T.parchment}`, borderRadius: '4px', overflow: 'hidden',
        }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: "'Outfit', sans-serif", backgroundColor: open ? T.cream : T.white,
                    transition: 'background-color 0.2s ease',
                }}
            >
                <span style={{ fontSize: '12px', fontWeight: 500, color: T.inkLight, letterSpacing: '0.08em' }}>
                    {t('promoQuestion')}
                </span>
                <span style={{ fontSize: '14px', color: T.clay, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', display: 'inline-block' }}>
                    ▾
                </span>
            </button>

            <div style={{
                maxHeight: open ? '80px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease',
            }}>
                <div style={{ padding: '18px 24px 20px', display: 'flex', gap: '8px' }}>
                    {applied ? (
                        <p style={{
                            fontSize: '13px', color: '#3A6B4A',
                            fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", padding: '10px 0',
                        }}>
                            {t('promoApplied')}
                        </p>
                    ) : (
                        <>
                            <input
                                type="text" value={code}
                                onChange={e => setCode(e.target.value)}
                                onFocus={() => setFocused(true)}
                                onBlur={() => setFocused(false)}
                                placeholder={t('promoPlaceholder')}
                                style={{
                                    flex: 1, padding: '10px 14px',
                                    border: `1px solid ${focused ? T.terra : T.clay}`, borderRadius: '2px', outline: 'none',
                                    fontSize: '13px', color: T.ink, fontFamily: "'Outfit', sans-serif",
                                    backgroundColor: T.white, transition: 'border-color 0.2s ease',
                                }}
                            />
                            <button
                                onClick={handleApply}
                                style={{
                                    padding: '10px 20px', backgroundColor: T.ink, color: T.white,
                                    fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase',
                                    border: 'none', borderRadius: '2px', cursor: 'pointer',
                                    fontFamily: "'Outfit', sans-serif",
                                }}
                            >
                                {t('promoApply')}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}