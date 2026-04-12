"use client";

import { useState, useEffect, useMemo } from "react";
import BookCard from "../../../components/ui/homepage/BookCard";

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

/* ─────────────── HELPERS (unchanged) ─────────────── */
const getFieldValue = (field: any) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field.az || field.en || field.ru || '';
};

const matchesSearch = (field: any, query: string) => {
    if (!field) return false;
    if (typeof field === 'string') return field.toLowerCase().includes(query);
    return Object.values(field).some(
        (val: any) => typeof val === 'string' && val.toLowerCase().includes(query)
    );
};

/* ─────────────── SIDEBAR SECTION ─────────────── */
function FilterSection({
    title, children, defaultOpen = true,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div style={{ borderTop: `1px solid ${T.parchment}`, paddingTop: '20px' }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', background: 'none', border: 'none',
                    cursor: 'pointer', padding: '0 0 14px',
                    fontFamily: "'Outfit', sans-serif",
                }}
            >
                <span style={{
                    fontSize: '10px', fontWeight: 500,
                    letterSpacing: '0.18em', textTransform: 'uppercase', color: T.inkLight,
                }}>
                    {title}
                </span>
                <span style={{
                    fontSize: '14px', color: T.clay,
                    transform: open ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.25s ease', display: 'inline-block',
                }}>
                    ▾
                </span>
            </button>
            <div style={{
                overflow: 'hidden',
                maxHeight: open ? '320px' : '0',
                transition: 'max-height 0.35s ease',
            }}>
                {children}
            </div>
        </div>
    );
}

/* ─────────────── CHECKBOX ROW ─────────────── */
function CheckRow({
    label, checked, onChange,
}: { label: string; checked: boolean; onChange: () => void }) {
    const [hovered, setHovered] = useState(false);
    return (
        <label
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '7px 0', cursor: 'pointer',
            }}
        >
            {/* Custom checkbox */}
            <div style={{
                width: '16px', height: '16px', flexShrink: 0,
                border: `1px solid ${checked ? T.terra : T.clay}`,
                borderRadius: '2px',
                backgroundColor: checked ? T.terra : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.18s ease',
            }}>
                {checked && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </div>
            <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
            <span style={{
                fontSize: '13px', fontWeight: checked ? 500 : 300,
                color: checked ? T.ink : (hovered ? T.inkMid : T.inkLight),
                transition: 'color 0.15s ease',
                fontFamily: "'Outfit', sans-serif",
            }}>
                {label}
            </span>
        </label>
    );
}

/* ─────────────── PAGE ─────────────── */
export default function ShopPage() {
    /* ── STATE (all identical to original) ── */
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [storeMaxPrice, setStoreMaxPrice] = useState(100);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [minPrice, setMinPrice] = useState<number>(0);
    const [maxPrice, setMaxPrice] = useState<number>(100);
    const [minInput, setMinInput] = useState<string>("0");
    const [maxInput, setMaxInput] = useState<string>("100");
    const [sortOption, setSortOption] = useState("latest");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchFocused, setSearchFocused] = useState(false);

    /* ── FETCH (identical) ── */
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/books');
                if (res.ok) {
                    const data = await res.json();
                    setBooks(data);
                    if (data.length > 0) {
                        const highest = Math.max(...data.map((b: any) =>
                            b.hasDiscount && b.discountedPrice ? b.discountedPrice : b.price
                        ));
                        const roundedMax = Math.ceil(highest);
                        setStoreMaxPrice(roundedMax);
                        setMaxPrice(roundedMax);
                        setMaxInput(String(roundedMax));
                    }
                }
            } catch (error) {
                console.error("Error fetching books:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    /* ── DERIVED FILTER VALUES (identical) ── */
    const categories = useMemo(() => {
        const s = new Set(books.map(b => getFieldValue(b.category)).filter(Boolean));
        return Array.from(s).sort();
    }, [books]);

    const authors = useMemo(() => {
        const s = new Set(books.map(b => getFieldValue(b.author)).filter(Boolean));
        return Array.from(s).sort();
    }, [books]);

    const languages = useMemo(() => {
        const s = new Set(books.map(b => getFieldValue(b.language)).filter(Boolean));
        return Array.from(s).sort();
    }, [books]);

    const toggleSelection = (
        setter: React.Dispatch<React.SetStateAction<string[]>>, item: string
    ) => setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);

    /* ── FILTER + SORT (identical logic) ── */
    const filteredBooks = useMemo(() => {
        let result = [...books];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(b => matchesSearch(b.name, q) || matchesSearch(b.author, q));
        }
        if (selectedCategories.length > 0)
            result = result.filter(b => selectedCategories.includes(getFieldValue(b.category)));
        if (selectedAuthors.length > 0)
            result = result.filter(b => selectedAuthors.includes(getFieldValue(b.author)));
        if (selectedLanguages.length > 0)
            result = result.filter(b => selectedLanguages.includes(getFieldValue(b.language)));
        result = result.filter(b => {
            const p = b.hasDiscount && b.discountedPrice ? b.discountedPrice : b.price;
            return p >= minPrice && p <= maxPrice;
        });
        if (sortOption === "latest") {
            result.sort((a, b) => {
                if (a.createdAt && b.createdAt)
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                if (a._id && b._id) return b._id.toString().localeCompare(a._id.toString());
                return 0;
            });
        } else if (sortOption === "lowToHigh") {
            result.sort((a, b) => (a.discountedPrice || a.price) - (b.discountedPrice || b.price));
        } else if (sortOption === "highToLow") {
            result.sort((a, b) => (b.discountedPrice || b.price) - (a.discountedPrice || a.price));
        } else if (sortOption === "random") {
            result.sort(() => Math.random() - 0.5);
        }
        return result;
    }, [books, searchQuery, selectedCategories, selectedAuthors, selectedLanguages, minPrice, maxPrice, sortOption]);

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedCategories([]);
        setSelectedAuthors([]);
        setSelectedLanguages([]);
        setMinPrice(0);
        setMaxPrice(storeMaxPrice);
        setMinInput("0");
        setMaxInput(String(storeMaxPrice));
        setSortOption("latest");
    };

    const activeFilterCount =
        selectedCategories.length + selectedAuthors.length + selectedLanguages.length +
        (searchQuery ? 1 : 0) +
        (minPrice > 0 || maxPrice < storeMaxPrice ? 1 : 0);

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    /* ── RENDER ── */
    return (
        <div style={{
            fontFamily: "'Outfit', sans-serif",
            backgroundColor: T.white,
            color: T.ink,
            minHeight: '100vh',
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Outfit:wght@300;400;500&display=swap');
        ::selection { background: ${T.terra}; color: ${T.white}; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.clay}; border-radius: 2px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes drawerUp { from { transform:translateY(100%); } to { transform:translateY(0); } }

        /* ── Mobile drawer overlay ── */
        .shop-drawer-backdrop {
          position: fixed; inset: 0; background: rgba(28,24,20,0.45);
          z-index: 100; backdrop-filter: blur(2px);
        }
        .shop-drawer {
          position: fixed; left: 0; right: 0; bottom: 0;
          background: ${T.white}; border-radius: 12px 12px 0 0;
          z-index: 101; max-height: 85vh; overflow-y: auto;
          animation: drawerUp 0.32s cubic-bezier(0.4,0,0.2,1) both;
          box-shadow: 0 -8px 40px rgba(28,24,20,0.18);
        }
        .shop-drawer-handle {
          width: 36px; height: 4px; background: ${T.clay};
          border-radius: 2px; margin: 14px auto 0;
        }
      `}</style>

            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 16px' : '0 40px' }}>

                {/* ── PAGE HEADER ── */}
                <div style={{
                    padding: isMobile ? '36px 0 28px' : '72px 0 48px',
                    borderBottom: `1px solid ${T.clay}`,
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr auto',
                    alignItems: 'flex-end',
                    gap: '12px',
                }}>
                    <div>
                        <p style={{
                            fontSize: '10px', fontWeight: 500, letterSpacing: '0.22em',
                            textTransform: 'uppercase', color: T.terra, marginBottom: '14px',
                        }}>
                            The Collection
                        </p>
                        <h1 style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 'clamp(40px, 5vw, 68px)',
                            fontWeight: 400, lineHeight: 1.0, color: T.ink,
                        }}>
                            All Books
                        </h1>
                    </div>
                    <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '16px', fontStyle: 'italic',
                        color: T.clay, paddingBottom: '8px',
                    }}>
                        {loading ? 'Loading…' : `${books.length} titles, hand-picked`}
                    </p>
                </div>

                {/* ── TOOLBAR ── */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 0',
                    borderBottom: `1px solid ${T.parchment}`,
                    gap: '16px', flexWrap: 'wrap',
                }}>
                    {/* Left: toggle + result count */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            onClick={() => setSidebarOpen(o => !o)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '9px 16px',
                                border: `1px solid ${sidebarOpen ? T.terra : T.clay}`,
                                borderRadius: '2px', background: 'none',
                                cursor: 'pointer',
                                fontSize: '11px', fontWeight: 500,
                                letterSpacing: '0.1em', textTransform: 'uppercase',
                                color: sidebarOpen ? T.terra : T.inkLight,
                                transition: 'all 0.2s ease',
                                fontFamily: "'Outfit', sans-serif",
                            }}
                        >
                            <svg width="14" height="12" viewBox="0 0 14 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                <line x1="0" y1="2" x2="14" y2="2" />
                                <line x1="3" y1="6" x2="14" y2="6" />
                                <line x1="6" y1="10" x2="14" y2="10" />
                            </svg>
                            Filters
                            {activeFilterCount > 0 && (
                                <span style={{
                                    backgroundColor: T.terra, color: T.white,
                                    width: '18px', height: '18px', borderRadius: '50%',
                                    fontSize: '10px', fontWeight: 500,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                        {!loading && (
                            <p style={{ fontSize: '13px', color: T.inkLight, fontWeight: 300 }}>
                                <span style={{ fontWeight: 500, color: T.ink }}>{filteredBooks.length}</span> results
                                {activeFilterCount > 0 && (
                                    <button
                                        onClick={resetFilters}
                                        style={{
                                            marginLeft: '10px', fontSize: '11px', color: T.terra,
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            textDecoration: 'underline', textUnderlineOffset: '2px',
                                            fontFamily: "'Outfit', sans-serif",
                                        }}
                                    >
                                        Clear all
                                    </button>
                                )}
                            </p>
                        )}
                    </div>

                    {/* Right: sort */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '11px', color: T.inkLight, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
                            Sort
                        </span>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={sortOption}
                                onChange={e => setSortOption(e.target.value)}
                                style={{
                                    appearance: 'none',
                                    padding: '9px 36px 9px 14px',
                                    border: `1px solid ${T.clay}`,
                                    borderRadius: '2px',
                                    backgroundColor: T.white,
                                    fontSize: '12px', fontWeight: 400,
                                    color: T.ink, cursor: 'pointer',
                                    fontFamily: "'Outfit', sans-serif",
                                    outline: 'none',
                                    letterSpacing: '0.02em',
                                }}
                            >
                                <option value="latest">Latest</option>
                                <option value="random">Random</option>
                                <option value="lowToHigh">Price ↑</option>
                                <option value="highToLow">Price ↓</option>
                            </select>
                            <span style={{
                                position: 'absolute', right: '12px', top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none', fontSize: '10px', color: T.clay,
                            }}>
                                ▾
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── BODY: SIDEBAR + GRID ── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : (sidebarOpen ? '260px 1fr' : '0px 1fr'),
                    gap: isMobile ? '0' : (sidebarOpen ? '48px' : '0'),
                    transition: 'grid-template-columns 0.35s ease, gap 0.35s ease',
                    padding: isMobile ? '24px 0 60px' : '40px 0 80px',
                    alignItems: 'start',
                }}>

                    {/* ── SIDEBAR — desktop only ── */}
                    <aside style={{
                        overflow: 'hidden',
                        opacity: sidebarOpen ? 1 : 0,
                        transition: 'opacity 0.25s ease',
                        position: 'sticky',
                        display: isMobile ? 'none' : 'block',
                    }}>
                        <div style={{
                            border: `1px solid ${T.parchment}`,
                            borderRadius: '4px',
                            padding: '28px 24px',
                            backgroundColor: T.cream,
                            display: 'flex', flexDirection: 'column', gap: '0',
                        }}>
                            {/* Header */}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                paddingBottom: '20px',
                            }}>
                                <p style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: '20px', fontWeight: 400, color: T.ink,
                                }}>
                                    Refine
                                </p>
                                {activeFilterCount > 0 && (
                                    <button
                                        onClick={resetFilters}
                                        style={{
                                            fontSize: '10px', fontWeight: 500,
                                            letterSpacing: '0.1em', textTransform: 'uppercase',
                                            color: T.terra, background: 'none', border: 'none',
                                            cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                                        }}
                                    >
                                        Clear {activeFilterCount}
                                    </button>
                                )}
                            </div>

                            {/* Search */}
                            <div style={{ paddingBottom: '20px' }}>
                                <div style={{
                                    position: 'relative',
                                    border: `1px solid ${searchFocused ? T.terra : T.clay}`,
                                    borderRadius: '2px', transition: 'border-color 0.2s ease',
                                    backgroundColor: T.white,
                                }}>
                                    <span style={{
                                        position: 'absolute', left: '12px', top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontSize: '13px', color: T.clay, pointerEvents: 'none',
                                    }}>
                                        ⌕
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Title or author…"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        onFocus={() => setSearchFocused(true)}
                                        onBlur={() => setSearchFocused(false)}
                                        style={{
                                            width: '100%', padding: '11px 12px 11px 30px',
                                            background: 'none', border: 'none', outline: 'none',
                                            fontSize: '13px', fontWeight: 300, color: T.ink,
                                            fontFamily: "'Outfit', sans-serif",
                                        }}
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            style={{
                                                position: 'absolute', right: '10px', top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                fontSize: '14px', color: T.clay, lineHeight: 1,
                                            }}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Price Range */}
                            <FilterSection title="Price Range">
                                <div style={{ paddingBottom: '16px' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <p style={{
                                                fontSize: '10px', color: T.inkLight, fontWeight: 500,
                                                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px',
                                            }}>
                                                Min
                                            </p>
                                            <div style={{
                                                border: `1px solid ${T.clay}`, borderRadius: '2px',
                                                overflow: 'hidden', backgroundColor: T.white,
                                                display: 'flex', alignItems: 'center',
                                            }}>
                                                <span style={{ padding: '0 8px', fontSize: '12px', color: T.inkLight }}>$</span>
                                                <input
                                                    type="number" min={0} max={maxPrice} value={minInput}
                                                    onChange={e => {
                                                        setMinInput(e.target.value);
                                                        const val = Number(e.target.value);
                                                        if (e.target.value !== '' && !isNaN(val)) setMinPrice(val);
                                                    }}
                                                    onBlur={() => {
                                                        const val = Math.min(Math.max(0, Number(minInput) || 0), maxPrice);
                                                        setMinPrice(val);
                                                        setMinInput(String(val));
                                                    }}
                                                    style={{
                                                        flex: 1, padding: '10px 8px 10px 0',
                                                        border: 'none', outline: 'none', background: 'none',
                                                        fontSize: '13px', color: T.ink,
                                                        fontFamily: "'Outfit', sans-serif",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <span style={{ color: T.clay, fontSize: '12px', paddingTop: '20px' }}>—</span>
                                        <div style={{ flex: 1 }}>
                                            <p style={{
                                                fontSize: '10px', color: T.inkLight, fontWeight: 500,
                                                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px',
                                            }}>
                                                Max
                                            </p>
                                            <div style={{
                                                border: `1px solid ${T.clay}`, borderRadius: '2px',
                                                overflow: 'hidden', backgroundColor: T.white,
                                                display: 'flex', alignItems: 'center',
                                            }}>
                                                <span style={{ padding: '0 8px', fontSize: '12px', color: T.inkLight }}>$</span>
                                                <input
                                                    type="number" min={minPrice} max={storeMaxPrice} value={maxInput}
                                                    onChange={e => {
                                                        setMaxInput(e.target.value);
                                                        const val = Number(e.target.value);
                                                        if (e.target.value !== '' && !isNaN(val)) setMaxPrice(val);
                                                    }}
                                                    onBlur={() => {
                                                        const val = Math.max(Math.min(storeMaxPrice, Number(maxInput) || storeMaxPrice), minPrice);
                                                        setMaxPrice(val);
                                                        setMaxInput(String(val));
                                                    }}
                                                    style={{
                                                        flex: 1, padding: '10px 8px 10px 0',
                                                        border: 'none', outline: 'none', background: 'none',
                                                        fontSize: '13px', color: T.ink,
                                                        fontFamily: "'Outfit', sans-serif",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Price range bar */}
                                    <div style={{
                                        marginTop: '12px', height: '2px',
                                        backgroundColor: T.parchment, borderRadius: '2px', position: 'relative',
                                    }}>
                                        <div style={{
                                            position: 'absolute', height: '100%', borderRadius: '2px',
                                            backgroundColor: T.terra,
                                            left: `${(minPrice / storeMaxPrice) * 100}%`,
                                            right: `${100 - (maxPrice / storeMaxPrice) * 100}%`,
                                        }} />
                                    </div>
                                </div>
                            </FilterSection>

                            {/* Categories */}
                            {categories.length > 0 && (
                                <FilterSection title="Categories">
                                    <div style={{ maxHeight: '200px', overflowY: 'auto', paddingBottom: '16px' }}>
                                        {categories.map(cat => (
                                            <CheckRow
                                                key={cat as string}
                                                label={cat as string}
                                                checked={selectedCategories.includes(cat as string)}
                                                onChange={() => toggleSelection(setSelectedCategories, cat as string)}
                                            />
                                        ))}
                                    </div>
                                </FilterSection>
                            )}

                            {/* Authors */}
                            {authors.length > 0 && (
                                <FilterSection title="Authors">
                                    <div style={{ maxHeight: '200px', overflowY: 'auto', paddingBottom: '16px' }}>
                                        {authors.map(author => (
                                            <CheckRow
                                                key={author as string}
                                                label={author as string}
                                                checked={selectedAuthors.includes(author as string)}
                                                onChange={() => toggleSelection(setSelectedAuthors, author as string)}
                                            />
                                        ))}
                                    </div>
                                </FilterSection>
                            )}

                            {/* Languages */}
                            {languages.length > 0 && (
                                <FilterSection title="Language">
                                    <div style={{ maxHeight: '160px', overflowY: 'auto', paddingBottom: '16px' }}>
                                        {languages.map(lang => (
                                            <CheckRow
                                                key={lang as string}
                                                label={lang as string}
                                                checked={selectedLanguages.includes(lang as string)}
                                                onChange={() => toggleSelection(setSelectedLanguages, lang as string)}
                                            />
                                        ))}
                                    </div>
                                </FilterSection>
                            )}
                        </div>
                    </aside>

                    {/* ── BOOK GRID ── */}
                    <main>
                        {loading ? (
                            /* Loading state */
                            <div style={{
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                minHeight: '400px', gap: '20px',
                            }}>
                                <div style={{
                                    width: '40px', height: '40px',
                                    border: `2px solid ${T.clay}`,
                                    borderTop: `2px solid ${T.terra}`,
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite',
                                }} />
                                <p style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: '18px', fontStyle: 'italic', color: T.inkLight,
                                }}>
                                    Curating your collection…
                                </p>
                            </div>
                        ) : filteredBooks.length > 0 ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile
                                    ? 'repeat(2, 1fr)'
                                    : 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: isMobile ? '16px' : '24px',
                            }}>
                                {filteredBooks.map((book, i) => (
                                    <div
                                        key={book._id}
                                        style={{
                                            height: isMobile ? '320px' : '500px',
                                            animation: `fadeUp 0.5s ease ${Math.min(i * 40, 400)}ms both`,
                                        }}
                                    >
                                        <BookCard book={book} lang="en" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Empty state */
                            <div style={{
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                minHeight: '400px', gap: '12px',
                                border: `1px dashed ${T.clay}`,
                                borderRadius: '4px',
                                backgroundColor: T.cream,
                            }}>
                                <p style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: '28px', color: T.clay, lineHeight: 1,
                                }}>
                                    ◎
                                </p>
                                <h3 style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: '24px', fontWeight: 400,
                                    color: T.ink, marginBottom: '4px',
                                }}>
                                    No books match your filters
                                </h3>
                                <p style={{
                                    fontSize: '13px', color: T.inkLight,
                                    fontWeight: 300, marginBottom: '20px',
                                }}>
                                    Try adjusting your price range or removing some filters.
                                </p>
                                <button
                                    onClick={resetFilters}
                                    style={{
                                        padding: '12px 28px',
                                        backgroundColor: T.terra, color: T.white,
                                        fontSize: '11px', fontWeight: 500,
                                        letterSpacing: '0.14em', textTransform: 'uppercase',
                                        border: 'none', borderRadius: '2px', cursor: 'pointer',
                                        fontFamily: "'Outfit', sans-serif",
                                    }}
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </main>
                </div>

            </div>

            {/* ── MOBILE FILTER DRAWER ── */}
            {isMobile && sidebarOpen && (
                <>
                    <div className="shop-drawer-backdrop" onClick={() => setSidebarOpen(false)} />
                    <div className="shop-drawer">
                        <div className="shop-drawer-handle" />
                        <div style={{ padding: '20px 20px 48px' }}>
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${T.parchment}` }}>
                                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 400, color: T.ink }}>Refine</p>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    {activeFilterCount > 0 && (
                                        <button onClick={resetFilters} style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.terra, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>
                                            Clear {activeFilterCount}
                                        </button>
                                    )}
                                    <button onClick={() => setSidebarOpen(false)} style={{ width: '32px', height: '32px', border: `1px solid ${T.parchment}`, borderRadius: '2px', background: 'none', cursor: 'pointer', fontSize: '18px', color: T.inkLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                                </div>
                            </div>

                            {/* Search */}
                            <div style={{ position: 'relative', border: `1px solid ${T.clay}`, borderRadius: '2px', backgroundColor: T.white, marginBottom: '8px' }}>
                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: T.clay, pointerEvents: 'none' }}>⌕</span>
                                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search books, authors…"
                                    style={{ width: '100%', padding: '11px 12px 11px 34px', border: 'none', outline: 'none', background: 'none', fontSize: '13px', fontWeight: 300, color: T.ink, fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' }} />
                            </div>

                            {/* Price */}
                            <FilterSection title="Price Range">
                                <div style={{ paddingBottom: '12px' }}>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                                        {[{ label: 'Min', value: minInput, setter: setMinInput, numSetter: setMinPrice }, { label: 'Max', value: maxInput, setter: setMaxInput, numSetter: setMaxPrice }].map(({ label, value, setter, numSetter }) => (
                                            <div key={label} style={{ flex: 1 }}>
                                                <label style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.inkLight, display: 'block', marginBottom: '6px' }}>{label}</label>
                                                <div style={{ position: 'relative', border: `1px solid ${T.clay}`, borderRadius: '2px', backgroundColor: T.white }}>
                                                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: T.clay }}>$</span>
                                                    <input type="number" value={value}
                                                        onChange={e => { setter(e.target.value); const n = parseFloat(e.target.value); if (!isNaN(n)) numSetter(n); }}
                                                        onBlur={() => { const n = parseFloat(value); setter(isNaN(n) ? '0' : String(Math.max(0, Math.min(n, storeMaxPrice)))); }}
                                                        style={{ width: '100%', padding: '9px 10px 9px 24px', border: 'none', outline: 'none', background: 'none', fontSize: '13px', color: T.ink, fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </FilterSection>

                            {categories.length > 0 && (
                                <FilterSection title="Category">
                                    <div style={{ maxHeight: '160px', overflowY: 'auto', paddingBottom: '12px' }}>
                                        {categories.map(cat => <CheckRow key={cat as string} label={cat as string} checked={selectedCategories.includes(cat as string)} onChange={() => toggleSelection(setSelectedCategories, cat as string)} />)}
                                    </div>
                                </FilterSection>
                            )}

                            {authors.length > 0 && (
                                <FilterSection title="Authors">
                                    <div style={{ maxHeight: '160px', overflowY: 'auto', paddingBottom: '12px' }}>
                                        {authors.map(author => <CheckRow key={author as string} label={author as string} checked={selectedAuthors.includes(author as string)} onChange={() => toggleSelection(setSelectedAuthors, author as string)} />)}
                                    </div>
                                </FilterSection>
                            )}

                            {languages.length > 0 && (
                                <FilterSection title="Language">
                                    <div style={{ maxHeight: '140px', overflowY: 'auto', paddingBottom: '12px' }}>
                                        {languages.map(lang => <CheckRow key={lang as string} label={lang as string} checked={selectedLanguages.includes(lang as string)} onChange={() => toggleSelection(setSelectedLanguages, lang as string)} />)}
                                    </div>
                                </FilterSection>
                            )}

                            <button onClick={() => setSidebarOpen(false)} style={{ width: '100%', marginTop: '24px', padding: '14px', backgroundColor: T.terra, color: T.white, border: 'none', borderRadius: '2px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>
                                {filteredBooks.length === 0 ? 'No results' : `Show ${filteredBooks.length} book${filteredBooks.length !== 1 ? 's' : ''}`}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}