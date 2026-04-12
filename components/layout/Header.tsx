"use client";

import Link from "next/link";
import { useParams } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { translations } from "@/locales/translations";
import { useState, useEffect, useRef } from "react";

/* ─────────────── DESIGN TOKENS ─────────────── */
const T = {
    topBar: "black",
    navBar: "#450A0A",
    accent: "#EF4444",
    accentLight: "#FCA5A5",
    ink: "#1C1814",
    inkMid: "#4A3F35",
    inkLight: "#8C7B6E",
    terra: "#BFA580",
    parchment: "#EFE9DF",
    clay: "#D4C4B0",
    cream: "#F8F4EE",
    white: "#FDFCFA",
    border: "rgba(255,255,255,0.12)",
    borderHov: "rgba(255,255,255,0.28)",
};

interface Book { _id: string; name: any; author: any; image: string; }

const matchesSearch = (field: any, query: string) => {
    if (!field) return false;
    if (typeof field === 'string') return field.toLowerCase().includes(query);
    return Object.values(field).some((val: any) => typeof val === 'string' && val.toLowerCase().includes(query));
};

const getLocalizedText = (field: any, currentLang: string) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[currentLang] || field.en || field.az || field.ru || '';
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    const [hovered, setHovered] = useState(false);
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: isActive ? T.accentLight : (hovered ? T.white : 'rgba(255,255,255,0.6)'),
                textDecoration: 'none',
                paddingBottom: '2px',
                borderBottom: `1px solid ${isActive ? T.accentLight : 'transparent'}`,
                transition: 'color 0.2s ease, border-color 0.2s ease',
                fontFamily: "'Outfit', sans-serif",
            }}
        >
            {children}
        </Link>
    );
}

export default function Header() {
    const params = useParams();
    const lang = (params?.lang as string) || 'en';
    const { language, setLanguage } = useLanguage();
    const { cart } = useCart();
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // All header translations
    const h = translations[language as keyof typeof translations].header;

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Book[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showCatalog, setShowCatalog] = useState(false);
    const [catalogBooks, setCatalogBooks] = useState<Book[]>([]);
    const [catalogLoading, setCatalogLoading] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const mobileSearchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const catalogRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    const totalItems = cart.reduce((total: number, item: any) => total + item.quantity, 0);

    useEffect(() => {
        const checkSize = () => {
            setIsMobile(window.innerWidth < 768);
            setIsSmallScreen(window.innerWidth < 640);
        };
        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (lang && language !== lang) setLanguage(lang as 'az' | 'en' | 'ru');
    }, [lang, language, setLanguage]);

    useEffect(() => {
        if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
    }, [searchOpen]);

    const handleLanguageChange = (newLang: 'az' | 'en' | 'ru') => {
        setLanguage(newLang);
        if (!pathname) return;
        const segments = pathname.split('/');
        segments[1] = newLang;
        router.push(segments.join('/'));
    };

    useEffect(() => {
        const fetchBooks = async () => {
            if (searchQuery.trim() === "") {
                setSearchResults([]); setShowDropdown(false); return;
            }
            setSearchLoading(true);
            try {
                const response = await fetch("http://localhost:5000/api/books");
                const books = await response.json();
                const query = searchQuery.toLowerCase();
                const filtered = books.filter((book: Book) =>
                    matchesSearch(book.name, query) || matchesSearch(book.author, query)
                );
                setSearchResults(filtered.slice(0, 8));
                setShowDropdown(true);
            } catch (error) {
                console.error("Error fetching books:", error);
            } finally {
                setSearchLoading(false);
            }
        };
        const t = setTimeout(fetchBooks, 300);
        return () => clearTimeout(t);
    }, [searchQuery]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const inDesktopSearch = searchRef.current?.contains(e.target as Node);
            const inMobileSearch = mobileSearchRef.current?.contains(e.target as Node);
            if (!inDesktopSearch && !inMobileSearch) {
                setShowDropdown(false);
                setSearchOpen(false);
                setSearchQuery("");
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setShowUserMenu(false);
            }
            if (catalogRef.current && !catalogRef.current.contains(e.target as Node)) {
                setShowCatalog(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSelectBook = (e: React.MouseEvent, bookId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setSearchQuery("");
        setShowDropdown(false);
        setSearchOpen(false);
        setMobileMenuOpen(false);
        router.push(`/${lang}/book/${bookId}`);
    };

    const handleCatalogClick = async () => {
        if (!showCatalog) {
            setCatalogLoading(true);
            try {
                const response = await fetch("http://localhost:5000/api/books");
                const books = await response.json();
                setCatalogBooks(books);
            } catch (error) {
                console.error("Error fetching catalog:", error);
            } finally {
                setCatalogLoading(false);
            }
            setShowCatalog(true);
        } else {
            setShowCatalog(false);
        }
    };

    // Nav items built from translations
    const navItems = [
        { path: `/${lang}/shop`, label: h.navShop },
        { path: `/${lang}/about`, label: h.navAbout },
        { path: `/${lang}/contact`, label: h.navContact },
        { path: `/${lang}/faq`, label: h.navFaq },
        { path: `/${lang}/news`, label: h.navNews },
    ];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Outfit:wght@300;400;500&display=swap');
        @keyframes dropIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        
        @media (max-width: 768px) {
          body { overflow: ${mobileMenuOpen ? 'hidden' : 'auto'}; }
        }
      `}</style>

            <header style={{
                position: 'sticky', top: 0, zIndex: 50,
                backgroundColor: T.topBar,
                fontFamily: "'Outfit', sans-serif",
                boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.25)' : 'none',
                transition: 'box-shadow 0.3s ease',
                borderBottom: 'none',
            }}>

                <div style={{
                    maxWidth: '1280px', margin: '0 auto', padding: '0 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    height: isSmallScreen ? '64px' : '75px', gap: '12px',
                }}>

                    <Link href={`/${lang}`} style={{ flexShrink: 0, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                            src="https://bakubookcenter.az/media/img/bakubookcenter.png"
                            alt="BakuBookCenter"
                            style={{ height: '46px', width: 'auto', maxHeight: '100%' }}
                        />
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

                        {/* CATALOG - desktop only */}
                        <div ref={catalogRef} style={{ position: 'relative', display: isMobile ? 'none' : 'block' }}>
                            <button
                                onClick={handleCatalogClick}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    height: '40px', padding: '0 65px',
                                    border: `1px solid ${showCatalog ? T.accentLight : T.border}`,
                                    borderRadius: '2px', background: 'none', cursor: 'pointer',
                                    color: T.white, fontWeight: 500, fontSize: '12px',
                                    letterSpacing: '0.1em', textTransform: 'uppercase',
                                    fontFamily: "'Outfit', sans-serif",
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = T.borderHov)}
                                onMouseLeave={e => { if (!showCatalog) e.currentTarget.style.borderColor = T.border; }}
                            >
                                {h.catalog}
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                                    stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"
                                    style={{ transform: showCatalog ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
                                    <polyline points="2,3 5,7 8,3" />
                                </svg>
                            </button>

                            {showCatalog && (
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + 11px)', right: 0,
                                    width: '320px', backgroundColor: T.white,
                                    border: `1px solid ${T.parchment}`, borderRadius: '4px',
                                    boxShadow: '0 16px 48px rgba(28,24,20,0.12)',
                                    overflow: 'hidden', zIndex: 100, animation: 'dropIn 0.2s ease',
                                    maxHeight: '500px', overflowY: 'auto',
                                }}>
                                    {catalogLoading ? (
                                        <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                            <div style={{ width: '16px', height: '16px', border: `2px solid ${T.clay}`, borderTop: `2px solid ${T.terra}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                            <span style={{ fontSize: '14px', color: T.inkLight, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif" }}>{h.catalogLoading}</span>
                                        </div>
                                    ) : catalogBooks.length > 0 ? (
                                        <>
                                            <div style={{ padding: '10px 16px 8px', borderBottom: `1px solid ${T.parchment}` }}>
                                                <span style={{ fontSize: '14px', color: T.inkLight, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 500 }}>
                                                    {h.catalogBooks(catalogBooks.length)}
                                                </span>
                                            </div>
                                            {catalogBooks.map((book, i) => (
                                                <button key={book._id}
                                                    onClick={(e) => { handleSelectBook(e, book._id); setShowCatalog(false); }}
                                                    style={{
                                                        width: '100%', display: 'flex', alignItems: 'center',
                                                        gap: '14px', padding: '12px 16px',
                                                        background: 'none', border: 'none', cursor: 'pointer',
                                                        borderBottom: i < catalogBooks.length - 1 ? `1px solid ${T.parchment}` : 'none',
                                                        textAlign: 'left', transition: 'background-color 0.15s ease',
                                                    }}
                                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = T.cream)}
                                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                                >
                                                    {book.image ? (
                                                        <img src={book.image} alt="" style={{ width: '36px', height: '50px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }} />
                                                    ) : (
                                                        <div style={{ width: '36px', height: '50px', backgroundColor: T.parchment, borderRadius: '2px', flexShrink: 0 }} />
                                                    )}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <p style={{ fontSize: '14px', fontWeight: 500, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '3px' }}>
                                                            {getLocalizedText(book.name, lang)}
                                                        </p>
                                                        <p style={{ fontSize: '13px', color: T.inkLight, fontWeight: 300, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif" }}>
                                                            {getLocalizedText(book.author, lang)}
                                                        </p>
                                                    </div>
                                                    <span style={{ fontSize: '12px', color: T.clay, flexShrink: 0 }}>→</span>
                                                </button>
                                            ))}
                                        </>
                                    ) : (
                                        <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontStyle: 'italic', color: T.inkLight }}>{h.catalogEmpty}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* DESKTOP SEARCH */}
                        <div ref={searchRef} style={{
                            flex: 1, maxWidth: 'none', width: '640px',
                            position: 'relative', minWidth: 0,
                            display: isMobile ? 'none' : 'block',
                        }}>
                            <div style={{
                                display: 'flex', alignItems: 'center',
                                border: `1px solid ${T.border}`, borderRadius: '2px',
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                transition: 'border-color 0.2s ease, background-color 0.2s ease',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHov; e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.3)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.2)'; }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '14px', flexShrink: 0 }}>
                                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => { setSearchQuery(e.target.value); if (e.target.value.trim()) setShowDropdown(true); }}
                                    onFocus={() => searchQuery && setShowDropdown(true)}
                                    placeholder={h.searchPlaceholder}
                                    style={{
                                        flex: 1, padding: '0px 16px', height: '40px',
                                        border: 'none', outline: 'none', background: 'none',
                                        fontSize: '14px', fontWeight: 300, color: T.white,
                                        fontFamily: "'Outfit', sans-serif",
                                    }}
                                />
                                {searchQuery && (
                                    <button onClick={() => { setSearchQuery(""); setShowDropdown(false); }}
                                        style={{ padding: '0 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'rgba(255,255,255,0.5)', lineHeight: 1 }}>
                                        ×
                                    </button>
                                )}
                            </div>

                            {showDropdown && searchQuery.trim() && (
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                                    backgroundColor: T.white, border: `1px solid ${T.parchment}`,
                                    borderRadius: '4px', boxShadow: '0 16px 48px rgba(28,24,20,0.12)',
                                    overflow: 'hidden', maxHeight: '500px', overflowY: 'auto',
                                    zIndex: 100, animation: 'dropIn 0.2s ease',
                                }}>
                                    {searchLoading ? (
                                        <div style={{ padding: '20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                            <div style={{ width: '16px', height: '16px', border: `2px solid ${T.clay}`, borderTop: `2px solid ${T.terra}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                            <span style={{ fontSize: '14px', color: T.inkLight, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif" }}>{h.searching}</span>
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <>
                                            <div style={{ padding: '10px 16px 8px', borderBottom: `1px solid ${T.parchment}` }}>
                                                <span style={{ fontSize: '14px', color: T.inkLight, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 500 }}>
                                                    {h.searchResults(searchResults.length)}
                                                </span>
                                            </div>
                                            {searchResults.map((book, i) => (
                                                <button key={book._id} onClick={(e) => handleSelectBook(e, book._id)}
                                                    style={{
                                                        width: '100%', display: 'flex', alignItems: 'center',
                                                        gap: '10px', padding: '12px 16px',
                                                        background: 'none', border: 'none', cursor: 'pointer',
                                                        borderBottom: i < searchResults.length - 1 ? `1px solid ${T.parchment}` : 'none',
                                                        textAlign: 'left', transition: 'background-color 0.15s ease',
                                                    }}
                                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = T.cream)}
                                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                                >
                                                    {book.image ? (
                                                        <img src={book.image} alt="" style={{ width: '36px', height: '50px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }} />
                                                    ) : (
                                                        <div style={{ width: '36px', height: '50px', backgroundColor: T.parchment, borderRadius: '2px', flexShrink: 0 }} />
                                                    )}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <p style={{ fontSize: '14px', fontWeight: 500, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '3px' }}>
                                                            {getLocalizedText(book.name, lang)}
                                                        </p>
                                                        <p style={{ fontSize: '13px', color: T.inkLight, fontWeight: 300, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif" }}>
                                                            {getLocalizedText(book.author, lang)}
                                                        </p>
                                                    </div>
                                                    <span style={{ fontSize: '12px', color: T.clay, flexShrink: 0 }}>→</span>
                                                </button>
                                            ))}
                                        </>
                                    ) : (
                                        <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontStyle: 'italic', color: T.inkLight }}>
                                                {h.searchEmpty(searchQuery)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* USER MENU */}
                        <div ref={userMenuRef} style={{ position: 'relative' }}>
                            {user ? (
                                <>
                                    <button onClick={() => setShowUserMenu(v => !v)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            padding: '6px 14px',
                                            border: `1px solid ${showUserMenu ? T.accentLight : T.border}`,
                                            borderRadius: '2px', background: 'none', cursor: 'pointer',
                                            transition: 'all 0.2s ease', fontFamily: "'Outfit', sans-serif",
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.borderColor = T.borderHov)}
                                        onMouseLeave={e => { if (!showUserMenu) e.currentTarget.style.borderColor = T.border; }}
                                    >
                                        <div style={{
                                            width: '26px', height: '26px', borderRadius: '50%',
                                            backgroundColor: 'rgba(255,255,255,0.18)', color: T.white,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '11px', fontWeight: 500, flexShrink: 0,
                                            border: `1px solid rgba(255,255,255,0.3)`,
                                        }}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span style={{ fontSize: '14px', fontWeight: 500, color: T.white, display: isMobile ? 'none' : 'inline' }}>
                                            {user.name.split(' ')[0]}
                                        </span>
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                                            stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"
                                            style={{ transform: showUserMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
                                            <polyline points="2,3 5,7 8,3" />
                                        </svg>
                                    </button>

                                    {showUserMenu && (
                                        <div style={{
                                            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                                            width: '220px', backgroundColor: T.white,
                                            border: `1px solid ${T.parchment}`, borderRadius: '4px',
                                            boxShadow: '0 16px 48px rgba(28,24,20,0.12)',
                                            overflow: 'hidden', zIndex: 100, animation: 'dropIn 0.2s ease',
                                        }}>
                                            <div style={{ padding: '16px', borderBottom: `1px solid ${T.parchment}`, backgroundColor: T.cream }}>
                                                <p style={{ fontSize: '14px', fontWeight: 500, color: T.ink, marginBottom: '2px' }}>{user.name}</p>
                                                <p style={{ fontSize: '12px', color: T.inkLight, fontWeight: 300, marginBottom: '8px' }}>{user.email}</p>
                                                <span style={{
                                                    fontSize: '10px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase',
                                                    backgroundColor: T.terra, color: T.white, padding: '3px 8px', borderRadius: '2px',
                                                }}>{user.role}</span>
                                            </div>
                                            {['admin', 'manager', 'delivery'].includes(user.role) && (
                                                <Link href="/admin" onClick={() => setShowUserMenu(false)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        padding: '13px 16px', fontSize: '13px', fontWeight: 500, color: T.ink,
                                                        textDecoration: 'none', borderBottom: `1px solid ${T.parchment}`,
                                                        transition: 'background-color 0.15s ease',
                                                    }}
                                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = T.cream)}
                                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                                >
                                                    {h.adminDashboard}
                                                    <span style={{ fontSize: '12px', color: T.clay }}>→</span>
                                                </Link>
                                            )}
                                            <Link href={`/${lang}/orders`} onClick={() => setShowUserMenu(false)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '13px 16px', fontSize: '13px', fontWeight: 500, color: T.ink,
                                                    textDecoration: 'none', borderBottom: `1px solid ${T.parchment}`,
                                                    transition: 'background-color 0.15s ease',
                                                }}
                                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = T.cream)}
                                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                            >
                                                {h.myOrders}
                                                <span style={{ fontSize: '12px', color: T.clay }}>→</span>
                                            </Link>
                                            <button onClick={() => { logout(); setShowUserMenu(false); }}
                                                style={{
                                                    width: '100%', textAlign: 'left', padding: '13px 16px',
                                                    fontSize: '13px', fontWeight: 500, color: T.terra,
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    transition: 'background-color 0.15s ease', fontFamily: "'Outfit', sans-serif",
                                                }}
                                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = T.cream)}
                                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                            >
                                                {h.signOut}
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Link href={`/${lang}/login`} style={{
                                        padding: '8px 14px', fontSize: '13px', fontWeight: 500,
                                        letterSpacing: '0.08em', textTransform: 'uppercase',
                                        color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
                                        border: `1px solid transparent`, borderRadius: '2px',
                                        transition: 'color 0.2s ease, border-color 0.2s ease',
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.color = T.white; e.currentTarget.style.borderColor = T.border; }}
                                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'transparent'; }}
                                    >{h.login}</Link>
                                    <Link href={`/${lang}/register`} style={{
                                        display: isMobile ? 'none' : 'block',
                                        padding: '8px 16px', fontSize: '13px', fontWeight: 500,
                                        letterSpacing: '0.08em', textTransform: 'uppercase',
                                        color: T.topBar, textDecoration: 'none',
                                        backgroundColor: T.white, borderRadius: '2px',
                                        transition: 'background-color 0.2s ease',
                                    }}
                                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = T.accentLight)}
                                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = T.white)}
                                    >{h.register}</Link>
                                </div>
                            )}
                        </div>

                        {/* CART */}
                        <Link href={`/${lang}/cart`} style={{
                            position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '43px', height: '40px',
                            border: `1px solid ${T.border}`, borderRadius: '2px',
                            textDecoration: 'none', transition: 'border-color 0.2s ease, background-color 0.2s ease',
                            marginLeft: '4px',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHov; e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 01-8 0" />
                            </svg>
                            {totalItems > 0 && (
                                <span style={{
                                    position: 'absolute', top: '-6px', right: '-6px',
                                    backgroundColor: T.terra, color: T.white,
                                    width: '18px', height: '18px', borderRadius: '50%',
                                    fontSize: '10px', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: `2px solid ${T.white}`,
                                }}>{totalItems}</span>
                            )}
                        </Link>

                        {/* HAMBURGER */}
                        <button onClick={() => setMobileMenuOpen(v => !v)}
                            style={{
                                display: isMobile ? 'flex' : 'none',
                                alignItems: 'center', justifyContent: 'center',
                                width: '43px', height: '40px',
                                border: `1px solid ${mobileMenuOpen ? T.accentLight : T.border}`,
                                borderRadius: '2px', background: 'none', cursor: 'pointer',
                                transition: 'border-color 0.2s ease, background-color 0.2s ease',
                                marginLeft: '4px',
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                stroke="rgba(255,255,255,0.75)" strokeWidth="2" strokeLinecap="round">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* DESKTOP NAV BAR */}
                <div style={{ display: !isMobile ? 'block' : 'none', borderTop: `1px solid rgba(255,255,255,0.08)`, backgroundColor: T.navBar }}>
                    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '44px' }}>
                        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                            {navItems.map(item => (
                                <NavLink key={item.path} href={item.path}>{item.label}</NavLink>
                            ))}
                        </nav>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 300, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                9:00 – 21:00
                            </span>
                            <div style={{ width: '1px', height: '14px', backgroundColor: 'rgba(255,255,255,0.12)' }} />
                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 300, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.21 1.17 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.55-.55a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                                +994 12 404 04 04
                            </span>
                            <div style={{ width: '1px', height: '14px', backgroundColor: 'rgba(255,255,255,0.12)' }} />
                            <div style={{ display: 'flex', gap: '2px' }}>
                                {(['az', 'en', 'ru'] as const).map(l => (
                                    <button key={l} onClick={() => handleLanguageChange(l)} style={{
                                        padding: '3px 8px', fontSize: '12px', fontWeight: 500,
                                        letterSpacing: '0.1em', textTransform: 'uppercase',
                                        border: `1px solid ${language === l ? T.accentLight : T.border}`,
                                        borderRadius: '2px',
                                        backgroundColor: language === l ? 'rgba(255,255,255,0.15)' : 'transparent',
                                        color: language === l ? T.white : 'rgba(255,255,255,0.5)',
                                        cursor: 'pointer', transition: 'all 0.18s ease',
                                        fontFamily: "'Outfit', sans-serif",
                                    }}>{l}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* MOBILE SEARCH BAR */}
                {isMobile && (
                    <div ref={mobileSearchRef} style={{ backgroundColor: T.navBar, borderBottom: `1px solid rgba(255,255,255,0.08)`, padding: '12px 16px', position: 'relative', zIndex: 35 }}>
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            border: `1px solid ${T.border}`, borderRadius: '2px',
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            transition: 'border-color 0.2s ease, background-color 0.2s ease',
                            position: 'relative',
                        }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '10px', flexShrink: 0 }}>
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); if (e.target.value.trim()) setShowDropdown(true); }}
                                onFocus={() => searchQuery && setShowDropdown(true)}
                                placeholder={h.searchPlaceholder}
                                style={{
                                    flex: 1, padding: '0px 8px', height: '36px',
                                    border: 'none', outline: 'none', background: 'none',
                                    fontSize: '13px', fontWeight: 300, color: T.white,
                                    fontFamily: "'Outfit', sans-serif",
                                }}
                            />
                            {searchQuery && (
                                <button onClick={() => { setSearchQuery(""); setShowDropdown(false); }}
                                    style={{ padding: '0 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'rgba(255,255,255,0.5)', lineHeight: 1 }}>
                                    ×
                                </button>
                            )}

                            {/* MOBILE SEARCH DROPDOWN */}
                            {showDropdown && searchQuery.trim() && (
                                <div style={{
                                    position: 'absolute', top: '100%', left: 0, right: 0,
                                    backgroundColor: T.white, border: `1px solid ${T.parchment}`,
                                    borderRadius: '4px', boxShadow: '0 16px 48px rgba(28,24,20,0.12)',
                                    overflow: 'hidden', maxHeight: '280px', overflowY: 'auto',
                                    zIndex: 150, animation: 'dropIn 0.2s ease', marginTop: '4px',
                                }}>
                                    {searchLoading ? (
                                        <div style={{ padding: '16px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <div style={{ width: '14px', height: '14px', border: `2px solid ${T.clay}`, borderTop: `2px solid ${T.terra}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                            <span style={{ fontSize: '12px', color: T.inkLight, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif" }}>{h.searching}</span>
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <>
                                            <div style={{ padding: '8px 12px', borderBottom: `1px solid ${T.parchment}` }}>
                                                <span style={{ fontSize: '12px', color: T.inkLight, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 500 }}>
                                                    {h.searchResults(searchResults.length)}
                                                </span>
                                            </div>
                                            {searchResults.map((book, i) => (
                                                <button key={book._id}
                                                    onClick={(e) => handleSelectBook(e, book._id)}
                                                    style={{
                                                        width: '100%', display: 'flex', alignItems: 'center',
                                                        gap: '8px', padding: '8px 10px',
                                                        background: 'none', border: 'none', cursor: 'pointer',
                                                        borderBottom: i < searchResults.length - 1 ? `1px solid ${T.parchment}` : 'none',
                                                        textAlign: 'left', transition: 'background-color 0.15s ease',
                                                    }}
                                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = T.cream)}
                                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                                >
                                                    {book.image ? (
                                                        <img src={book.image} alt="" style={{ width: '26px', height: '36px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }} />
                                                    ) : (
                                                        <div style={{ width: '26px', height: '36px', backgroundColor: T.parchment, borderRadius: '2px', flexShrink: 0 }} />
                                                    )}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <p style={{ fontSize: '12px', fontWeight: 500, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>
                                                            {getLocalizedText(book.name, lang)}
                                                        </p>
                                                        <p style={{ fontSize: '11px', color: T.inkLight, fontWeight: 300, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif" }}>
                                                            {getLocalizedText(book.author, lang)}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </>
                                    ) : (
                                        <div style={{ padding: '16px 12px', textAlign: 'center' }}>
                                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '13px', fontStyle: 'italic', color: T.inkLight }}>{h.searchEmptyMobile}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* MOBILE OVERLAY */}
                {mobileMenuOpen && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 30, top: '144px' }}
                        onClick={() => setMobileMenuOpen(false)} />
                )}

                {/* MOBILE MENU */}
                {mobileMenuOpen && (
                    <div ref={mobileMenuRef} style={{
                        display: isMobile && mobileMenuOpen ? 'block' : 'none',
                        position: 'fixed', top: '123px', left: 0, right: 0,
                        backgroundColor: T.navBar, borderBottom: `1px solid rgba(255,255,255,0.08)`,
                        maxHeight: 'calc(100vh - 64px)', overflowY: 'auto',
                        zIndex: 40, animation: 'slideIn 0.3s ease',
                    }}>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {navItems.map(item => (
                                <button key={item.path}
                                    onClick={() => { router.push(item.path); setMobileMenuOpen(false); }}
                                    style={{
                                        width: '100%', padding: '16px 20px', textAlign: 'left',
                                        fontSize: '14px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
                                        color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none',
                                        borderBottom: `1px solid rgba(255,255,255,0.08)`,
                                        cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                                        transition: 'background-color 0.2s ease, color 0.2s ease',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.3)'; e.currentTarget.style.color = T.white; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                                >{item.label}</button>
                            ))}
                        </nav>
                        <div style={{ padding: '16px 20px', borderTop: `1px solid rgba(255,255,255,0.08)` }}>
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 300, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                9:00 – 21:00
                            </span>
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 300, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.21 1.17 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.55-.55a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                                +994 12 404 04 04
                            </span>
                            <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
                                {(['az', 'en', 'ru'] as const).map(l => (
                                    <button key={l} onClick={() => { handleLanguageChange(l); setMobileMenuOpen(false); }} style={{
                                        flex: 1, padding: '6px 4px', fontSize: '11px', fontWeight: 500,
                                        letterSpacing: '0.1em', textTransform: 'uppercase',
                                        border: `1px solid ${language === l ? T.accentLight : T.border}`,
                                        borderRadius: '2px',
                                        backgroundColor: language === l ? 'rgba(255,255,255,0.15)' : 'transparent',
                                        color: language === l ? T.white : 'rgba(255,255,255,0.5)',
                                        cursor: 'pointer', transition: 'all 0.18s ease',
                                        fontFamily: "'Outfit', sans-serif",
                                    }}>{l}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </header>
        </>
    );
}