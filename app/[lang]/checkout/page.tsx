'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

/* ── Field ── */
function Field({ label, name, type = 'text', value, onChange, error, placeholder = '', optional = false, inputMode, pattern, maxLength }: {
    label: string; name: string; type?: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string; placeholder?: string; optional?: boolean;
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
    pattern?: string; maxLength?: number;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <label style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: error ? '#DC2626' : focused ? TERRA : INK_LIGHT, fontFamily: "'Outfit', sans-serif", transition: 'color 0.2s' }}>
                {label}{optional && <span style={{ color: CLAY, fontWeight: 300 }}> (optional)</span>}
            </label>
            <input
                type={type} name={name} value={value} onChange={onChange}
                placeholder={placeholder} maxLength={maxLength}
                inputMode={inputMode} pattern={pattern}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                style={{ width: '100%', padding: '12px 14px', boxSizing: 'border-box', border: `1px solid ${error ? '#DC2626' : focused ? TERRA : CLAY}`, borderRadius: '2px', outline: 'none', backgroundColor: WHITE, color: INK, fontSize: '14px', fontWeight: 300, fontFamily: "'Outfit', sans-serif", transition: 'border-color 0.2s' }}
            />
            {error && <p style={{ fontSize: '11px', color: '#DC2626' }}>⚠ {error}</p>}
        </div>
    );
}

/* ── SelectField ── */
function SelectField({ label, name, value, onChange, error, children }: {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    error?: string; children: React.ReactNode;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <label style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: error ? '#DC2626' : focused ? TERRA : INK_LIGHT, fontFamily: "'Outfit', sans-serif", transition: 'color 0.2s' }}>
                {label}
            </label>
            <div style={{ position: 'relative' }}>
                <select name={name} value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ width: '100%', padding: '12px 14px', appearance: 'none', border: `1px solid ${error ? '#DC2626' : focused ? TERRA : CLAY}`, borderRadius: '2px', outline: 'none', backgroundColor: WHITE, color: value ? INK : CLAY, fontSize: '14px', fontWeight: 300, fontFamily: "'Outfit', sans-serif", transition: 'border-color 0.2s', cursor: 'pointer' }}>
                    {children}
                </select>
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: CLAY, pointerEvents: 'none' }}>▾</span>
            </div>
            {error && <p style={{ fontSize: '11px', color: '#DC2626' }}>⚠ {error}</p>}
        </div>
    );
}

/* ── SectionHead ── */
function SectionHead({ number, title }: { number: string; title: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${PARCHMENT}` }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 300, color: CLAY, lineHeight: 1 }}>{number}</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 500, color: INK, lineHeight: 1 }}>{title}</h2>
        </div>
    );
}

export default function CheckoutPage() {
    const router = useRouter();
    const params = useParams();
    const lang = (params.lang as string) || 'en';
    const { user } = useAuth();

    const [cartItems, setCartItems] = useState<any[]>([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [step, setStep] = useState<'personal' | 'address' | 'payment'>('personal');

    const [formData, setFormData] = useState({
        name: user?.name || '', email: user?.email || '',
        phone: '', recipientName: '', recipientPhone: '',
        street: '', city: '', postalCode: '', country: '',
        latitude: 0, longitude: 0,
        cardNumber: '', cardHolder: '', expiryMonth: '', expiryYear: '', cvv: '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!user) { router.push(`/${lang}/login`); return; }
        const cart = localStorage.getItem('cart');
        if (cart) {
            const parsed = JSON.parse(cart);
            setCartItems(parsed);
            setTotalPrice(parsed.reduce((s: number, i: any) => s + i.price * i.quantity, 0));
        }
    }, [user, router, lang]);

    const validateForm = () => {
        const e: Record<string, string> = {};
        if (!formData.name) e.name = 'Name is required';
        if (!formData.email) e.email = 'Email is required';
        if (!formData.phone) e.phone = 'Phone is required';
        if (!formData.street) e.street = 'Street address is required';
        if (!formData.city) e.city = 'City is required';
        if (!formData.postalCode) e.postalCode = 'Postal code is required';
        if (!formData.country) e.country = 'Country is required';
        if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length !== 16)
            e.cardNumber = 'Valid 16-digit card number is required';
        if (!formData.cardHolder) e.cardHolder = 'Cardholder name is required';
        if (!formData.expiryMonth || !formData.expiryYear) e.expiry = 'Expiry date is required';
        if (!formData.cvv || formData.cvv.length !== 3) e.cvv = 'Valid 3-digit CVV is required';
        setFormErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    };

    /* ── Number-only helpers ── */
    const onlyDigits = (e: React.ChangeEvent<HTMLInputElement>, maxLen?: number) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, maxLen);
        handleInputChange({ ...e, target: { ...e.target, value: val, name: e.target.name } } as any);
    };

    const formatPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow + at start, then only digits and spaces
        let val = e.target.value.replace(/[^\d+\s\-()]/g, '').slice(0, 20);
        handleInputChange({ ...e, target: { ...e.target, value: val, name: e.target.name } } as any);
    };

    const formatCard = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '').slice(0, 16);
        val = val.replace(/(\d{4})/g, '$1 ').trim();
        handleInputChange({ ...e, target: { ...e.target, value: val, name: 'cardNumber' } } as any);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setShowConfirmation(true);
    };

    const handleConfirmOrder = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const orderData = {
                userId: user._id,
                books: cartItems.map(item => ({ bookId: item._id || item.id, name: item.name, price: item.price, quantity: item.quantity, image: item.image })),
                totalPrice,
                customerInfo: { name: formData.name, email: formData.email, phone: formData.phone, recipientName: formData.recipientName || formData.name, recipientPhone: formData.recipientPhone || formData.phone },
                deliveryAddress: { street: formData.street, city: formData.city, postalCode: formData.postalCode, country: formData.country, latitude: formData.latitude, longitude: formData.longitude },
                paymentInfo: { method: 'card', lastFourDigits: formData.cardNumber.slice(-4) },
            };
            const res = await fetch('http://localhost:5000/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) });
            if (res.ok) {
                const order = await res.json();
                localStorage.removeItem('cart');
                router.push(`/${lang}/orders?success=true&orderId=${order._id}`);
            } else {
                const err = await res.json();
                alert(`Failed to create order: ${err.message || 'Please try again.'}`);
                setShowConfirmation(false);
            }
        } catch (error) {
            alert('Error creating order: ' + (error instanceof Error ? error.message : 'Unknown error'));
            setShowConfirmation(false);
        } finally { setLoading(false); }
    };

    if (!user) return (
        <div style={{ minHeight: '100vh', backgroundColor: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif" }}>
            <p style={{ color: INK_LIGHT, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", fontSize: '18px' }}>Redirecting…</p>
        </div>
    );

    if (cartItems.length === 0) return (
        <div style={{ minHeight: '100vh', backgroundColor: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Outfit:wght@300;400;500&display=swap');`}</style>
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '60px', color: PARCHMENT, lineHeight: 1, marginBottom: '20px' }}>◎</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 400, color: INK, marginBottom: '12px' }}>Your cart is empty.</h2>
                <Link href={`/${lang}/shop`} style={{ fontSize: '11px', color: TERRA, textDecoration: 'underline', textUnderlineOffset: '3px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>← Back to Shop</Link>
            </div>
        </div>
    );

    const steps = [
        { key: 'personal', label: 'Personal', num: '01' },
        { key: 'address', label: 'Address', num: '02' },
        { key: 'payment', label: 'Payment', num: '03' },
    ];

    return (
        <div style={{ fontFamily: "'Outfit', sans-serif", backgroundColor: WHITE, minHeight: '100vh', color: INK }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Outfit:wght@300;400;500&display=swap');
        ::selection { background:${TERRA}; color:${WHITE}; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        input::placeholder { color:${CLAY}; }
        select option { color:${INK}; }

        /* ── Responsive ── */
        .co-grid   { display:grid; grid-template-columns:1fr 360px; gap:48px; }
        .co-hdr    { display:flex; align-items:flex-end; justify-content:space-between; }
        .co-steps  { display:flex; align-items:center; padding:24px 0; border-bottom:1px solid ${PARCHMENT}; gap:0; }
        .co-2col   { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .co-3col   { display:grid; grid-template-columns:1fr 1fr 100px; gap:16px; align-items:end; }
        .co-card   { border-radius:4px; padding:28px 32px; background:linear-gradient(135deg,${INK} 0%,${INK_MID} 100%); margin-bottom:28px; position:relative; overflow:hidden; min-height:120px; }

        @media (max-width: 900px) {
          .co-grid { grid-template-columns:1fr; gap:32px; }
          .co-sidebar { position:static !important; }
        }
        @media (max-width: 640px) {
          .co-wrap   { padding:0 16px !important; }
          .co-hdr    { flex-direction:column; align-items:flex-start; gap:12px; }
          .co-steps  { gap:0; }
          .co-step-label { display:none; }
          .co-2col   { grid-template-columns:1fr; }
          .co-3col   { grid-template-columns:1fr 1fr; gap:12px; }
          .co-cvv    { grid-column:1/-1; }
          .co-card   { padding:20px 22px; }
        }
        @media (max-width: 400px) {
          .co-3col { grid-template-columns:1fr; }
          .co-cvv  { grid-column:auto; }
        }
      `}</style>

            {/* Accent bar */}
            <div style={{ height: '3px', background: 'linear-gradient(to right, #B5623E, #D4C4B0, transparent)' }} />

            <div className="co-wrap" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 40px' }}>

                {/* HEADER */}
                <div className="co-hdr" style={{ padding: '40px 0 32px', borderBottom: `1px solid ${PARCHMENT}` }}>
                    <div>
                        <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: TERRA, marginBottom: '8px' }}>Secure Checkout</p>
                        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 400, lineHeight: 1.0, color: INK }}>Complete Your Order</h1>
                    </div>
                    <Link href={`/${lang}/cart`} style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: INK_LIGHT, textDecoration: 'none', paddingBottom: '4px', borderBottom: `1px solid ${CLAY}`, transition: 'color 0.2s', whiteSpace: 'nowrap' }}
                        onMouseEnter={e => (e.currentTarget.style.color = TERRA)}
                        onMouseLeave={e => (e.currentTarget.style.color = INK_LIGHT)}
                    >← Back to Cart</Link>
                </div>

                {/* STEPS */}
                <div className="co-steps">
                    {steps.map((s, i) => (
                        <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <button onClick={() => setStep(s.key as any)} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", padding: '8px 0' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: `1px solid ${step === s.key ? TERRA : CLAY}`, backgroundColor: step === s.key ? TERRA : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}>
                                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '12px', color: step === s.key ? WHITE : CLAY }}>{s.num}</span>
                                </div>
                                <span className="co-step-label" style={{ fontSize: '11px', fontWeight: step === s.key ? 500 : 300, letterSpacing: '0.1em', textTransform: 'uppercase', color: step === s.key ? INK : INK_LIGHT, transition: 'color 0.2s' }}>
                                    {s.label}
                                </span>
                            </button>
                            {i < steps.length - 1 && <div style={{ flex: 1, height: '1px', backgroundColor: PARCHMENT, margin: '0 12px' }} />}
                        </div>
                    ))}
                </div>

                {/* MAIN GRID */}
                <div className="co-grid" style={{ padding: '40px 0 80px', alignItems: 'start' }}>

                    {/* FORM */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '44px' }}>

                        {/* ── 01 Personal ── */}
                        <div style={{ animation: 'fadeUp 0.5s ease both' }}>
                            <SectionHead number="01" title="Personal Information" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                <div className="co-2col">
                                    <Field label="Full Name" name="name" value={formData.name} onChange={handleInputChange} error={formErrors.name} placeholder="Jane Smith" />
                                    <Field label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} error={formErrors.email} placeholder="jane@example.com" inputMode="email" />
                                </div>
                                {/* Phone — numbers, +, spaces, dashes only */}
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: formErrors.phone ? '#DC2626' : INK_LIGHT, fontFamily: "'Outfit', sans-serif", display: 'block', marginBottom: '7px' }}>Phone Number</label>
                                    <input name="phone" type="tel" value={formData.phone} onChange={formatPhone} placeholder="+994 50 000 00 00" inputMode="tel" maxLength={20}
                                        style={{ width: '100%', padding: '12px 14px', boxSizing: 'border-box', border: `1px solid ${formErrors.phone ? '#DC2626' : CLAY}`, borderRadius: '2px', outline: 'none', backgroundColor: WHITE, color: INK, fontSize: '14px', fontWeight: 300, fontFamily: "'Outfit', sans-serif", transition: 'border-color 0.2s' }}
                                        onFocus={e => (e.target.style.borderColor = TERRA)} onBlur={e => (e.target.style.borderColor = formErrors.phone ? '#DC2626' : CLAY)}
                                    />
                                    {formErrors.phone && <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '6px' }}>⚠ {formErrors.phone}</p>}
                                </div>

                                <div style={{ borderTop: `1px solid ${PARCHMENT}`, paddingTop: '18px' }}>
                                    <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK_LIGHT, marginBottom: '14px' }}>Recipient (if different from above)</p>
                                    <div className="co-2col">
                                        <Field label="Recipient Name" name="recipientName" value={formData.recipientName} onChange={handleInputChange} placeholder="Optional" optional />
                                        {/* Recipient phone — tel only */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                                            <label style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK_LIGHT, fontFamily: "'Outfit', sans-serif" }}>
                                                Recipient Phone <span style={{ color: CLAY, fontWeight: 300 }}>(optional)</span>
                                            </label>
                                            <input name="recipientPhone" type="tel" value={formData.recipientPhone} onChange={formatPhone} placeholder="+994 50 000 00 00" inputMode="tel" maxLength={20}
                                                style={{ width: '100%', padding: '12px 14px', boxSizing: 'border-box', border: `1px solid ${CLAY}`, borderRadius: '2px', outline: 'none', backgroundColor: WHITE, color: INK, fontSize: '14px', fontWeight: 300, fontFamily: "'Outfit', sans-serif", transition: 'border-color 0.2s' }}
                                                onFocus={e => (e.target.style.borderColor = TERRA)} onBlur={e => (e.target.style.borderColor = CLAY)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── 02 Address ── */}
                        <div style={{ animation: 'fadeUp 0.5s ease 0.08s both' }}>
                            <SectionHead number="02" title="Delivery Address" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                <Field label="Street Address" name="street" value={formData.street} onChange={handleInputChange} error={formErrors.street} placeholder="123 Main Street" />
                                <div className="co-2col">
                                    <Field label="City" name="city" value={formData.city} onChange={handleInputChange} error={formErrors.city} placeholder="Baku" />
                                    {/* Postal code — alphanumeric but primarily digits */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                                        <label style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: formErrors.postalCode ? '#DC2626' : INK_LIGHT, fontFamily: "'Outfit', sans-serif" }}>Postal Code</label>
                                        <input name="postalCode" type="text" value={formData.postalCode} onChange={e => {
                                            const val = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 10);
                                            handleInputChange({ ...e, target: { ...e.target, value: val, name: 'postalCode' } } as any);
                                        }} placeholder="AZ 1000" inputMode="text" maxLength={10}
                                            style={{ width: '100%', padding: '12px 14px', boxSizing: 'border-box', border: `1px solid ${formErrors.postalCode ? '#DC2626' : CLAY}`, borderRadius: '2px', outline: 'none', backgroundColor: WHITE, color: INK, fontSize: '14px', fontWeight: 300, fontFamily: "'Outfit', sans-serif", transition: 'border-color 0.2s', textTransform: 'uppercase' }}
                                            onFocus={e => (e.target.style.borderColor = TERRA)} onBlur={e => (e.target.style.borderColor = formErrors.postalCode ? '#DC2626' : CLAY)}
                                        />
                                        {formErrors.postalCode && <p style={{ fontSize: '11px', color: '#DC2626' }}>⚠ {formErrors.postalCode}</p>}
                                    </div>
                                </div>
                                <Field label="Country" name="country" value={formData.country} onChange={handleInputChange} error={formErrors.country} placeholder="Azerbaijan" />
                            </div>
                        </div>

                        {/* ── 03 Payment ── */}
                        <div style={{ animation: 'fadeUp 0.5s ease 0.16s both' }}>
                            <SectionHead number="03" title="Payment Details" />

                            {/* Live card visual */}
                            <div className="co-card">
                                <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '140px', height: '140px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />
                                <div style={{ position: 'absolute', right: '30px', bottom: '-30px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />
                                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(16px, 3vw, 22px)', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.25em', marginBottom: '16px', position: 'relative' }}>
                                    {formData.cardNumber || '•••• •••• •••• ••••'}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', flexWrap: 'wrap', gap: '8px' }}>
                                    <div>
                                        <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '3px' }}>Card Holder</p>
                                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{formData.cardHolder || 'YOUR NAME'}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '3px' }}>Expires</p>
                                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                                            {formData.expiryMonth && formData.expiryYear ? `${formData.expiryMonth}/${formData.expiryYear}` : 'MM/YY'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                {/* Cardholder — text only, no digits */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                                    <label style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: formErrors.cardHolder ? '#DC2626' : INK_LIGHT, fontFamily: "'Outfit', sans-serif" }}>Cardholder Name</label>
                                    <input name="cardHolder" type="text" value={formData.cardHolder} onChange={e => {
                                        const val = e.target.value.replace(/[^a-zA-Z\s'-]/g, '').slice(0, 40);
                                        handleInputChange({ ...e, target: { ...e.target, value: val, name: 'cardHolder' } } as any);
                                    }} placeholder="Jane Smith" autoComplete="cc-name"
                                        style={{ width: '100%', padding: '12px 14px', boxSizing: 'border-box', border: `1px solid ${formErrors.cardHolder ? '#DC2626' : CLAY}`, borderRadius: '2px', outline: 'none', backgroundColor: WHITE, color: INK, fontSize: '14px', fontWeight: 300, fontFamily: "'Outfit', sans-serif", transition: 'border-color 0.2s', textTransform: 'uppercase' }}
                                        onFocus={e => (e.target.style.borderColor = TERRA)} onBlur={e => (e.target.style.borderColor = formErrors.cardHolder ? '#DC2626' : CLAY)}
                                    />
                                    {formErrors.cardHolder && <p style={{ fontSize: '11px', color: '#DC2626' }}>⚠ {formErrors.cardHolder}</p>}
                                </div>

                                {/* Card number — digits only */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                                    <label style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: formErrors.cardNumber ? '#DC2626' : INK_LIGHT, fontFamily: "'Outfit', sans-serif" }}>Card Number</label>
                                    <input name="cardNumber" type="text" value={formData.cardNumber} onChange={formatCard} placeholder="1234 5678 9012 3456" inputMode="numeric" maxLength={19} autoComplete="cc-number"
                                        style={{ width: '100%', padding: '12px 14px', boxSizing: 'border-box', border: `1px solid ${formErrors.cardNumber ? '#DC2626' : CLAY}`, borderRadius: '2px', outline: 'none', backgroundColor: WHITE, color: INK, fontSize: '14px', fontWeight: 300, fontFamily: "'Outfit', sans-serif", transition: 'border-color 0.2s', letterSpacing: '0.08em' }}
                                        onFocus={e => (e.target.style.borderColor = TERRA)} onBlur={e => (e.target.style.borderColor = formErrors.cardNumber ? '#DC2626' : CLAY)}
                                    />
                                    {formErrors.cardNumber && <p style={{ fontSize: '11px', color: '#DC2626' }}>⚠ {formErrors.cardNumber}</p>}
                                </div>

                                {/* Expiry + CVV */}
                                <div className="co-3col">
                                    <SelectField label="Month" name="expiryMonth" value={formData.expiryMonth} onChange={handleInputChange} error={formErrors.expiry}>
                                        <option value="">MM</option>
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{String(i + 1).padStart(2, '0')}</option>
                                        ))}
                                    </SelectField>
                                    <SelectField label="Year" name="expiryYear" value={formData.expiryYear} onChange={handleInputChange}>
                                        <option value="">YY</option>
                                        {Array.from({ length: 10 }, (_, i) => {
                                            const y = new Date().getFullYear() + i;
                                            return <option key={y} value={String(y).slice(-2)}>{String(y).slice(-2)}</option>;
                                        })}
                                    </SelectField>
                                    {/* CVV — 3 digits only */}
                                    <div className="co-cvv" style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                                        <label style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: formErrors.cvv ? '#DC2626' : INK_LIGHT, fontFamily: "'Outfit', sans-serif" }}>CVV</label>
                                        <input name="cvv" type="password" value={formData.cvv} onChange={e => onlyDigits(e, 3)} placeholder="•••" inputMode="numeric" maxLength={3} autoComplete="cc-csc"
                                            style={{ width: '100%', padding: '12px 14px', boxSizing: 'border-box', border: `1px solid ${formErrors.cvv ? '#DC2626' : CLAY}`, borderRadius: '2px', outline: 'none', backgroundColor: WHITE, color: INK, fontSize: '14px', fontFamily: "'Outfit', sans-serif", transition: 'border-color 0.2s' }}
                                            onFocus={e => (e.target.style.borderColor = TERRA)} onBlur={e => (e.target.style.borderColor = formErrors.cvv ? '#DC2626' : CLAY)}
                                        />
                                        {formErrors.cvv && <p style={{ fontSize: '11px', color: '#DC2626' }}>⚠ {formErrors.cvv}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Security note */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '18px', padding: '13px 16px', backgroundColor: CREAM, border: `1px solid ${PARCHMENT}`, borderRadius: '2px' }}>
                                <span style={{ color: TERRA, fontSize: '14px', flexShrink: 0 }}>◎</span>
                                <p style={{ fontSize: '12px', color: INK_LIGHT, fontWeight: 300, lineHeight: 1.5 }}>
                                    Your payment details are encrypted and never stored on our servers.
                                </p>
                            </div>
                        </div>

                        {/* SUBMIT */}
                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', backgroundColor: loading ? CLAY : TERRA, color: WHITE, fontSize: '11px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', border: 'none', borderRadius: '2px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            onMouseEnter={e => { if (!loading) (e.currentTarget.style.backgroundColor = TERRA_DARK); }}
                            onMouseLeave={e => { if (!loading) (e.currentTarget.style.backgroundColor = TERRA); }}
                        >
                            {loading ? (
                                <><span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Processing…</>
                            ) : 'Review & Place Order →'}
                        </button>
                    </form>

                    {/* ORDER SUMMARY */}
                    <aside className="co-sidebar" style={{ position: 'sticky', top: '120px' }}>
                        <div style={{ border: `1px solid ${PARCHMENT}`, borderRadius: '4px', overflow: 'hidden' }}>
                            {/* Header */}
                            <div style={{ padding: '22px 26px', backgroundColor: CREAM, borderBottom: `1px solid ${PARCHMENT}` }}>
                                <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: TERRA, marginBottom: '5px' }}>Order Summary</p>
                                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontStyle: 'italic', color: INK }}>
                                    {cartItems.length} {cartItems.length === 1 ? 'book' : 'books'}
                                </p>
                            </div>
                            {/* Items */}
                            <div style={{ padding: '18px 26px', display: 'flex', flexDirection: 'column', gap: '14px', borderBottom: `1px solid ${PARCHMENT}` }}>
                                {cartItems.map((item: any, i: number) => (
                                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        {item.image && (
                                            <div style={{ width: '40px', height: '54px', flexShrink: 0, borderRadius: '2px', overflow: 'hidden', backgroundColor: PARCHMENT, boxShadow: '0 2px 8px rgba(28,24,20,0.1)' }}>
                                                <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        )}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '15px', fontWeight: 500, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                                                {typeof item.name === 'object' ? item.name.en : item.name}
                                            </p>
                                            <p style={{ fontSize: '11px', color: INK_LIGHT, fontWeight: 300 }}>Qty: {item.quantity}</p>
                                        </div>
                                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: 500, color: INK, flexShrink: 0 }}>
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            {/* Totals */}
                            <div style={{ padding: '18px 26px', display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: `1px solid ${PARCHMENT}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '13px', color: INK_LIGHT, fontWeight: 300 }}>Subtotal</span>
                                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', color: INK }}>${totalPrice.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '13px', color: INK_LIGHT, fontWeight: 300 }}>Shipping</span>
                                    <span style={{ fontSize: '12px', color: totalPrice >= 40 ? '#3A6B4A' : INK_LIGHT, fontWeight: totalPrice >= 40 ? 500 : 300 }}>
                                        {totalPrice >= 40 ? 'Free ✓' : 'Calculated at next step'}
                                    </span>
                                </div>
                                {totalPrice < 40 && (
                                    <p style={{ fontSize: '11px', color: CLAY, fontWeight: 300, fontStyle: 'italic' }}>
                                        Add ${(40 - totalPrice).toFixed(2)} more for free shipping
                                    </p>
                                )}
                            </div>
                            {/* Total */}
                            <div style={{ padding: '18px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1px solid ${PARCHMENT}` }}>
                                <span style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK }}>Total</span>
                                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 500, color: INK }}>${totalPrice.toFixed(2)}</span>
                            </div>
                            {/* Trust */}
                            <div style={{ padding: '14px 26px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
                                {[['◎', 'Packed with care'], ['↺', '30-day returns'], ['→', 'Encrypted payment']].map(([icon, label]) => (
                                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '12px', color: TERRA }}>{icon}</span>
                                        <span style={{ fontSize: '11px', color: CLAY, fontWeight: 300 }}>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* CONFIRMATION MODAL */}
            {showConfirmation && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(28,24,20,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '20px' }}>
                    <div style={{ backgroundColor: WHITE, borderRadius: '4px', maxWidth: '480px', width: '100%', overflow: 'hidden', boxShadow: '0 32px 80px rgba(28,24,20,0.3)', animation: 'fadeUp 0.35s ease both' }}>
                        <div style={{ padding: '28px 36px', backgroundColor: CREAM, borderBottom: `1px solid ${PARCHMENT}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ width: '24px', height: '2px', backgroundColor: TERRA }} />
                                <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: TERRA }}>Almost there</p>
                            </div>
                            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 400, color: INK, lineHeight: 1.1 }}>Confirm Your Order</h2>
                        </div>
                        <div style={{ padding: '24px 36px' }}>
                            <p style={{ fontSize: '14px', color: INK_LIGHT, lineHeight: 1.8, fontWeight: 300, marginBottom: '20px' }}>
                                Placing an order for{' '}
                                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 500, color: INK }}>${totalPrice.toFixed(2)}</span>.
                                {' '}Card ending in <strong>•••• {formData.cardNumber.slice(-4)}</strong> will be charged.
                            </p>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                <button onClick={() => setShowConfirmation(false)} disabled={loading} style={{ padding: '12px 22px', border: `1px solid ${CLAY}`, color: INK_LIGHT, fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: '2px', background: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'all 0.2s' }}
                                    onMouseEnter={e => { (e.currentTarget.style.borderColor = INK); (e.currentTarget.style.color = INK); }}
                                    onMouseLeave={e => { (e.currentTarget.style.borderColor = CLAY); (e.currentTarget.style.color = INK_LIGHT); }}
                                >Go Back</button>
                                <button onClick={handleConfirmOrder} disabled={loading} style={{ padding: '12px 26px', backgroundColor: loading ? CLAY : TERRA, color: WHITE, fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', border: 'none', borderRadius: '2px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    onMouseEnter={e => { if (!loading) (e.currentTarget.style.backgroundColor = TERRA_DARK); }}
                                    onMouseLeave={e => { if (!loading) (e.currentTarget.style.backgroundColor = TERRA); }}
                                >
                                    {loading ? (
                                        <><span style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Processing…</>
                                    ) : 'Yes, Place Order →'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}