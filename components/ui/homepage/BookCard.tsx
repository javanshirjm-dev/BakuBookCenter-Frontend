"use client";

import { useCart } from "../../../context/CartContext";
import { useLanguage } from "../../../context/LanguageContext"; // 1. Import your custom context
import Link from "next/link";
import { Language } from "@/locales/translations";
import { useState } from "react";

// Add to your globals.css or layout:
// @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
const getLocalizedText = (field: any, lang: 'az' | 'en' | 'ru' = 'az') => {
    if (!field) return '';
    if (typeof field === 'string') return field; // Fallback for old books
    return field[lang] || field.en || field.az || field.ru || ''; // Tries requested lang, then fallbacks
};

export default function BookCard({ book, lang }: { book: any, lang: Language }) {
    const { language } = useLanguage(); // 2. Grab the current language ('az', 'en', 'ru')
    const { addToCart } = useCart();
    const [addedToCart, setAddedToCart] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleAddToCart = () => {
        addToCart(book);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const discountPercent = book.hasDiscount && book.discountedPrice
        ? ((1 - book.discountedPrice / book.price) * 100).toFixed(0)
        : null;

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                fontFamily: "'DM Sans', sans-serif",
                backgroundColor: '#FAFAF8',
                border: '1px solid #E8E4DC',
                borderRadius: '2px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                boxShadow: isHovered
                    ? '0 12px 40px rgba(0,0,0,0.10)'
                    : '0 2px 8px rgba(0,0,0,0.04)',
                borderColor: isHovered ? '#C8C0B0' : '#E8E4DC',
            }}
        >
            {/* Book Cover */}
            {/* THE FIX: Injected ${language} into the href right here 👇 */}
            <Link href={`/${language}/book/${book._id}`} style={{ display: 'block', position: 'relative' }}>
                <div style={{
                    height: '310px',
                    overflow: 'hidden',
                    paddingTop: '14px',
                    paddingLeft: '14px',
                    paddingRight: '14px',

                    position: 'relative',
                }}>
                    {book.image ? (
                        <img
                            src={book.image}
                            alt={`Cover of ${getLocalizedText(book.name, language)}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transform: isHovered ? 'scale(0.96)' : 'scale(1)',
                                transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: "'DM Serif Display', serif",
                            fontSize: '13px',
                            letterSpacing: '0.15em',
                            color: '#A89F94',
                            textTransform: 'uppercase',
                        }}>
                            No Cover
                        </div>
                    )}

                    {/* Discount Badge */}
                    {discountPercent && (
                        <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            backgroundColor: 'red',
                            color: '#FAFAF8',
                            fontSize: '10px',
                            fontWeight: '700',
                            letterSpacing: '0.1em',
                            padding: '4px 8px',
                            borderRadius: '2px',
                        }}>
                            −{discountPercent}%
                        </div>
                    )}

                    {/* Bestseller Badge */}
                    {book.bestseller && (
                        <div style={{
                            position: 'absolute',
                            top: discountPercent ? '32px' : '10px',
                            right: '10px',
                            backgroundColor: '#FFB800',
                            color: '#1A1A1A',
                            fontSize: '10px',
                            fontWeight: '700',
                            letterSpacing: '0.1em',
                            padding: '4px 8px',
                            borderRadius: '2px',
                        }}>
                            BESTSELLER
                        </div>
                    )}
                </div>
            </Link>

            {/* Content */}
            <div style={{
                paddingTop: '14px',
                paddingBottom: '16px',
                paddingLeft: '16px',
                paddingRight: '16px',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,

            }}>

                {/* Title */}
                {/* THE FIX: Injected ${language} into the href right here 👇 */}
                <Link href={`/${language}/book/${book._id}`} style={{ textDecoration: 'none' }}>
                    <h2 style={{
                        fontFamily: "'DM Serif Display', serif",
                        fontSize: '19px',
                        fontWeight: '400',
                        lineHeight: '1.3',
                        color: '#1A1A1A',
                        marginBottom: '6px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        transition: 'color 0.2s ease',
                    }}>
                        {getLocalizedText(book.name, language)}
                    </h2>
                </Link>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Price */}
                <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px',
                    marginBottom: '10px',
                    paddingTop: '8px',
                    borderTop: '1px solid #ECEAE4',
                }}>
                    {book.hasDiscount && book.discountedPrice ? (
                        <>
                            <span style={{
                                fontSize: '22px',
                                fontWeight: '500',
                                color: '#1A1A1A',
                                fontFamily: "'DM Serif Display', serif",
                            }}>
                                ${book.discountedPrice.toFixed(2)}
                            </span>
                            <span style={{
                                fontSize: '14px',
                                textDecoration: 'line-through',
                                color: '#C0BAB0',
                                fontWeight: '300',
                            }}>
                                ${book.price.toFixed(2)}
                            </span>
                        </>
                    ) : (
                        <span style={{
                            fontSize: '22px',
                            fontWeight: '500',
                            color: '#1A1A1A',
                            fontFamily: "'DM Serif Display', serif",
                        }}>
                            ${book.price?.toFixed(2) || '0.00'}
                        </span>
                    )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleAddToCart}
                        style={{
                            flex: 2,
                            padding: '9px 0',
                            backgroundColor: addedToCart ? '#3A6B4A' : '#1A1A1A',
                            color: '#FAFAF8',
                            fontSize: '12px',
                            fontWeight: '500',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            border: '1px solid transparent',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease',
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                    >
                        {addedToCart ? '✓ Added' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
}