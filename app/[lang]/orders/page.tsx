'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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

/* ── Status config ── */
interface StatusConfig { label: string; color: string; bg: string; dot: string; }
const STATUS: Record<string, StatusConfig> = {
    'pending': { label: 'Pending', color: '#92400E', bg: '#FEF3C7', dot: '#F59E0B' },
    'confirmed': { label: 'Confirmed', color: '#1E40AF', bg: '#DBEAFE', dot: '#3B82F6' },
    'processing': { label: 'Processing', color: '#5B21B6', bg: '#EDE9FE', dot: '#8B5CF6' },
    'shipped': { label: 'Shipped', color: '#065985', bg: '#CFFAFE', dot: '#06B6D4' },
    'on-the-road': { label: 'On the Way', color: '#064E3B', bg: '#D1FAE5', dot: '#10B981' },
    'delivered': { label: 'Delivered', color: '#064E3B', bg: '#D1FAE5', dot: '#059669' },
    'cancelled': { label: 'Cancelled', color: '#991B1B', bg: '#FEE2E2', dot: '#EF4444' },
};

const getStatus = (s: string): StatusConfig =>
    STATUS[s] || { label: s, color: INK_LIGHT, bg: PARCHMENT, dot: CLAY };

const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export default function OrdersPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const lang = (params.lang as string) || 'en';
    const { user } = useAuth();

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [successMessage, setSuccessMessage] = useState(false);

    useEffect(() => {
        if (!user) { router.push(`/${lang}/login`); return; }
        if (searchParams.get('success')) {
            setSuccessMessage(true);
            setTimeout(() => setSuccessMessage(false), 5000);
        }
        fetchUserOrders();
    }, [user, router, lang, searchParams]);

    const fetchUserOrders = async () => {
        if (!user) return;
        try {
            const res = await fetch(`http://localhost:5000/api/orders/user/${user._id}`);
            if (res.ok) setOrders(await res.json());
        } catch (e) { console.error('Error fetching orders:', e); }
        finally { setLoading(false); }
    };

    if (!user) return (
        <div style={{ minHeight: '100vh', backgroundColor: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'', sans-serif" }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontStyle: 'italic', color: INK_LIGHT }}>Redirecting…</p>
        </div>
    );

    return (
        <div style={{ fontFamily: "'', sans-serif", backgroundColor: WHITE, minHeight: '100vh', color: INK }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap');
        ::selection { background: ${TERRA}; color: ${WHITE}; }

        @keyframes slideDown  { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp    { from { opacity:0; transform:translateY(24px);  } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn     { from { opacity:0; }                            to { opacity:1; } }
        @keyframes successIn  { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin       { to { transform: rotate(360deg); } }

        .anim-down { animation: slideDown 0.65s cubic-bezier(0.4,0,0.2,1) both; }
        .anim-up   { animation: slideUp   0.65s cubic-bezier(0.4,0,0.2,1) both; }
        .anim-fade { animation: fadeIn    0.7s ease both; }

        .d-1{animation-delay:.08s} .d-2{animation-delay:.16s}
        .d-3{animation-delay:.24s} .d-4{animation-delay:.32s}

        .order-row {
          border: 1px solid brown; border-radius: 4px;
          overflow: hidden; transition: border-color 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }
        .order-row:hover { border-color: ${CLAY}; box-shadow: 0 6px 24px rgba(28,24,20,0.07); }
        .order-row-open  { border-color: ${CLAY} !important; }

        .shop-btn:hover { background-color: ${TERRA_DARK} !important; }
        .shop-link:hover { color: ${TERRA} !important; }

        /* --- RESPONSIVE LAYOUT CLASSES --- */
        .page-container { max-width: 1280px; margin: 0 auto; padding: 0 40px; }
        
        .grid-header-text { font-size: 10px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: ${INK_LIGHT}; }
        
        .order-grid-layout {
            display: grid;
            grid-template-columns: 160px 1fr 140px 140px 120px 40px;
            gap: 16px;
            align-items: center;
        }
        
        .row-padding { padding: 22px 28px; background-color: inherit; transition: background-color 0.2s ease; }
        .header-padding { padding: 0 28px 12px; border-bottom: 1px solid #EFE9DF; }

        .details-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0; }
        .details-col { padding: 28px; border-right: 1px solid #EFE9DF; }
        .details-col:last-child { border-right: none; }
        .books-section { padding: 28px; border-top: 1px solid #EFE9DF; }

        /* Tablet/Small Desktop Adjustments */
        @media (max-width: 1024px) {
            .order-grid-layout { grid-template-columns: 120px 1fr 110px 110px 110px 30px; gap: 12px; }
            .row-padding, .header-padding { padding-left: 20px; padding-right: 20px; }
            .details-col { padding: 20px; }
            .books-section { padding: 20px; }
        }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
            .page-container { padding: 0 20px; }
            .order-list-header { display: none !important; }
            
            /* Stack order items to behave like cards */
            .order-grid-layout {
                display: flex;
                flex-wrap: wrap;
                position: relative;
            }
            .row-padding { padding: 16px; }
            
            /* Column sizing for mobile */
            .col-id { width: 100%; margin-bottom: 4px; }
            .col-items { width: 100%; margin-bottom: 12px; font-size: 15px !important; }
            .col-date { width: 100%; margin-bottom: 16px; font-size: 13px !important; }
            .col-total { width: 50%; display: flex; align-items: center; }
            .col-status { width: 50%; display: flex; justify-content: flex-end; align-items: center; }
            .col-chevron { position: absolute; top: 16px; right: 16px; }

            /* Stack expanded details vertically */
            .details-grid { grid-template-columns: 1fr; }
            .details-col { border-right: none; border-bottom: 1px solid #EFE9DF; padding: 20px 16px; }
            .details-col:last-child { border-bottom: none; }
            
            .books-section { padding: 16px; }
            .book-row { padding: 16px 12px !important; }
            .total-row { padding: 16px 12px !important; }
        }
      `}</style>

            {/* Accent bar */}
            <div style={{ height: '3px', background: 'linear-gradient(to right, #B5623E, #D4C4B0, transparent)' }} />

            <div className="page-container">

                {/* ── HEADER ── */}
                <section style={{ padding: '64px 0 48px', borderBottom: '1px solid #D4C4B0', position: 'relative', overflow: 'hidden' }}>
                    {/* Ghost watermark */}
                    <div className="anim-fade" style={{
                        position: 'absolute', right: '-10px', bottom: '-20px',
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(120px, 18vw, 240px)',
                        fontWeight: 300, fontStyle: 'italic',
                        color: PARCHMENT, lineHeight: 1,
                        userSelect: 'none', pointerEvents: 'none', whiteSpace: 'nowrap',
                    }}>
                        Orders.
                    </div>

                    <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
                        <div>
                            <div className="anim-down d-1" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ width: '28px', height: '2px', backgroundColor: TERRA }} />
                                <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: TERRA }}>
                                    My Account
                                </p>
                            </div>
                            <h1 className="anim-up d-2" style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: 'clamp(40px, 5vw, 68px)',
                                fontWeight: 400, lineHeight: 1.0, color: INK,
                            }}>
                                Your Orders
                            </h1>
                        </div>

                        {!loading && orders.length > 0 && (
                            <div className="anim-fade d-3" style={{ display: 'flex', alignItems: 'baseline', gap: '6px', paddingBottom: '8px' }}>
                                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 400, color: INK }}>{orders.length}</span>
                                <span style={{ fontSize: '12px', color: INK_LIGHT, fontWeight: 300, letterSpacing: '0.04em' }}>
                                    {orders.length === 1 ? 'order placed' : 'orders placed'}
                                </span>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── SUCCESS BANNER ── */}
                {successMessage && (
                    <div style={{
                        margin: '24px 0 0',
                        padding: '16px 24px',
                        backgroundColor: '#EEF6F1',
                        border: '1px solid #B8DEC9',
                        borderLeft: '3px solid #3A6B4A',
                        borderRadius: '2px',
                        display: 'flex', alignItems: 'center', gap: '12px',
                        animation: 'successIn 0.45s ease both',
                    }}>
                        <span style={{ color: '#3A6B4A', fontSize: '16px' }}>✓</span>
                        <div>
                            <p style={{ fontSize: '13px', color: '#2A5438', fontWeight: 500 }}>Order placed successfully!</p>
                            <p style={{ fontSize: '12px', color: '#3A6B4A', fontWeight: 300 }}>A confirmation email has been sent to {user?.email}.</p>
                        </div>
                    </div>
                )}

                {/* ── BODY ── */}
                <div style={{ padding: '48px 0 96px' }}>

                    {/* LOADING */}
                    {loading && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px', gap: '20px' }}>
                            <div style={{ width: '36px', height: '36px', border: '2px solid #EFE9DF', borderTop: '2px solid #B5623E', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontStyle: 'italic', color: INK_LIGHT }}>
                                Fetching your orders…
                            </p>
                        </div>
                    )}

                    {/* EMPTY */}
                    {!loading && orders.length === 0 && (
                        <div className="anim-up" style={{ textAlign: 'center', padding: '100px 0' }}>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '64px', color: PARCHMENT, lineHeight: 1, marginBottom: '24px' }}>◎</p>
                            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 400, color: INK, marginBottom: '12px' }}>
                                No orders yet.
                            </h2>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontStyle: 'italic', color: INK_LIGHT, marginBottom: '36px' }}>
                                Your next favourite book is waiting for you.
                            </p>
                            <Link href={`/${lang}/shop`} className="shop-btn" style={{
                                display: 'inline-block', padding: '14px 36px',
                                backgroundColor: TERRA, color: WHITE,
                                fontSize: '11px', fontWeight: 500,
                                letterSpacing: '0.16em', textTransform: 'uppercase',
                                borderRadius: '2px', textDecoration: 'none',
                                transition: 'background-color 0.2s ease',
                            }}>
                                Browse the Shop
                            </Link>
                        </div>
                    )}

                    {/* ORDERS LIST */}
                    {!loading && orders.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                            {/* Column headers */}
                            <div className="order-list-header order-grid-layout header-padding">
                                {['Order', 'Items', 'Date', 'Total', 'Status', ''].map((h, i) => (
                                    <p key={i} className="grid-header-text">{h}</p>
                                ))}
                            </div>

                            {orders.map((order: any, idx: number) => {
                                const isOpen = selectedOrder?._id === order._id;
                                const status = getStatus(order.status);
                                const bookNames = order.books.slice(0, 2).map((b: any) =>
                                    typeof b.name === 'object' ? (b.name.en || b.name.az || b.name.ru || '') : b.name
                                ).join(', ') + (order.books.length > 2 ? ` +${order.books.length - 2} more` : '');

                                return (
                                    <div
                                        key={order._id}
                                        className={isOpen ? 'order-row order-row-open' : 'order-row'}
                                        style={{ animationDelay: `${idx * 0.05}s` }}
                                    >
                                        {/* ROW OVERVIEW */}
                                        <div
                                            className="order-grid-layout row-padding"
                                            onClick={() => setSelectedOrder(isOpen ? null : order)}
                                            style={{ backgroundColor: isOpen ? CREAM : WHITE }}
                                        >
                                            {/* Order ID */}
                                            <div className="col-id">
                                                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: 500, color: INK, letterSpacing: '0.05em' }}>
                                                    #{order._id.slice(-8).toUpperCase()}
                                                </p>
                                            </div>

                                            {/* Book names */}
                                            <p className="col-items" style={{
                                                fontSize: '16px', color: INK_LIGHT, fontWeight: 300,
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif",
                                            }}>
                                                {bookNames}
                                            </p>

                                            {/* Date */}
                                            <p className="col-date" style={{ fontSize: '12px', color: INK_LIGHT, fontWeight: 300 }}>
                                                {fmt(order.createdAt)}
                                            </p>

                                            {/* Total */}
                                            <p className="col-total" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 500, color: INK }}>
                                                ${order.totalPrice.toFixed(2)}
                                            </p>

                                            {/* Status */}
                                            <div className="col-status">
                                                <div style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                    padding: '5px 12px', backgroundColor: status.bg,
                                                    borderRadius: '2px', width: 'fit-content',
                                                }}>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: status.dot, flexShrink: 0 }} />
                                                    <span style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: status.color }}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Chevron */}
                                            <div className="col-chevron">
                                                <div style={{
                                                    width: '28px', height: '28px',
                                                    border: '1px solid #EFE9DF', borderRadius: '50%',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: INK_LIGHT, fontSize: '12px',
                                                    transform: isOpen ? 'rotate(180deg)' : 'none',
                                                    transition: 'transform 0.3s ease',
                                                }}>
                                                    ▾
                                                </div>
                                            </div>
                                        </div>

                                        {/* EXPANDED DETAILS */}
                                        {isOpen && (
                                            <div style={{
                                                borderTop: '1px solid #EFE9DF',
                                                animation: 'fadeIn 0.3s ease both',
                                            }}>
                                                <div className="details-grid">

                                                    {/* Address */}
                                                    <div className="details-col">
                                                        <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: TERRA, marginBottom: '12px' }}>
                                                            Delivery Address
                                                        </p>
                                                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', color: INK, lineHeight: 1.7 }}>
                                                            {order.deliveryAddress.street}<br />
                                                            {order.deliveryAddress.city}, {order.deliveryAddress.postalCode}<br />
                                                            {order.deliveryAddress.country}
                                                        </p>
                                                    </div>

                                                    {/* Recipient */}
                                                    <div className="details-col">
                                                        <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: TERRA, marginBottom: '12px' }}>
                                                            Recipient
                                                        </p>
                                                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 500, color: INK, marginBottom: '4px' }}>
                                                            {order.customerInfo.recipientName}
                                                        </p>
                                                        <p style={{ fontSize: '13px', color: INK_LIGHT, fontWeight: 300 }}>
                                                            {order.customerInfo.recipientPhone}
                                                        </p>
                                                        <p style={{ fontSize: '12px', color: INK_LIGHT, fontWeight: 300, marginTop: '4px' }}>
                                                            {order.customerInfo.email}
                                                        </p>
                                                    </div>

                                                    {/* Payment */}
                                                    <div className="details-col">
                                                        <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: TERRA, marginBottom: '12px' }}>
                                                            Payment
                                                        </p>
                                                        <p style={{ fontSize: '13px', color: INK_LIGHT, fontWeight: 300, marginBottom: '6px' }}>
                                                            Card ending in{' '}
                                                            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 500, color: INK }}>
                                                                •••• {order.paymentInfo?.lastFourDigits || '****'}
                                                            </span>
                                                        </p>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
                                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: status.dot }} />
                                                            <span style={{ fontSize: '11px', fontWeight: 500, color: status.color, letterSpacing: '0.08em' }}>
                                                                {status.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Books list */}
                                                <div className="books-section">
                                                    <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: TERRA, marginBottom: '16px' }}>
                                                        Items in this Order
                                                    </p>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: '1px solid #EFE9DF', borderRadius: '4px', overflow: 'hidden' }}>
                                                        {order.books.map((book: any, i: number) => {
                                                            const name = typeof book.name === 'object'
                                                                ? (book.name.en || book.name.az || book.name.ru || '')
                                                                : book.name;
                                                            return (
                                                                <div key={i} className="book-row" style={{
                                                                    display: 'flex', alignItems: 'center', gap: '16px',
                                                                    padding: '16px 20px',
                                                                    borderBottom: i < order.books.length - 1 ? '1px solid #EFE9DF' : 'none',
                                                                    backgroundColor: WHITE,
                                                                }}>
                                                                    {book.image && (
                                                                        <div style={{ width: '40px', height: '54px', flexShrink: 0, borderRadius: '2px', overflow: 'hidden', backgroundColor: PARCHMENT, boxShadow: '0 2px 8px rgba(28,24,20,0.08)' }}>
                                                                            <img src={book.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                        </div>
                                                                    )}
                                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: 500, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                            {name}
                                                                        </p>
                                                                        <p style={{ fontSize: '11px', color: INK_LIGHT, fontWeight: 300, letterSpacing: '0.04em' }}>
                                                                            Qty: {book.quantity}
                                                                        </p>
                                                                    </div>
                                                                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 500, color: INK, flexShrink: 0 }}>
                                                                        ${(book.price * book.quantity).toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            );
                                                        })}

                                                        {/* Order total row */}
                                                        <div className="total-row" style={{
                                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                            padding: '16px 20px', backgroundColor: CREAM,
                                                            borderTop: '1px solid #EFE9DF',
                                                        }}>
                                                            <span style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK_LIGHT }}>
                                                                Order Total
                                                            </span>
                                                            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 500, color: INK }}>
                                                                ${order.totalPrice.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Bottom CTA */}
                    {!loading && orders.length > 0 && (
                        <div style={{ marginTop: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: PARCHMENT }} />
                            <Link href={`/${lang}/shop`} className="shop-link" style={{
                                fontSize: '11px', fontWeight: 500,
                                letterSpacing: '0.12em', textTransform: 'uppercase',
                                color: INK_LIGHT, textDecoration: 'none',
                                transition: 'color 0.2s ease',
                            }}>
                                Continue Shopping →
                            </Link>
                            <div style={{ flex: 1, height: '1px', backgroundColor: PARCHMENT }} />
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}