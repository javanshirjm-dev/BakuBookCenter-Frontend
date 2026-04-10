// components/ui/homepage/Banner.tsx
'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const IMAGE_URL = 'https://learnodo-newtonic.com/wp-content/uploads/2021/01/Famous-Russian-Novelists-Featured-Image.jpg.webp';

export default function Banner() {
    const params = useParams();
    const lang = (params?.lang as string) || 'en';

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 md:py-0">

            {/* PREMIUM ANIMATION KEYFRAMES 
        Using a luxurious cubic-bezier(0.22, 1, 0.36, 1) for that buttery smooth glide.
      */}
            <style>{`
        @keyframes imageReveal {
          0% { opacity: 0; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes cardReveal {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes textStagger {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-image { animation: imageReveal 2s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .animate-card { animation: cardReveal 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards; }
        
        .animate-stagger-1 { animation: textStagger 1s cubic-bezier(0.22, 1, 0.36, 1) 0.5s forwards; }
        .animate-stagger-2 { animation: textStagger 1s cubic-bezier(0.22, 1, 0.36, 1) 0.65s forwards; }
        .animate-stagger-3 { animation: textStagger 1s cubic-bezier(0.22, 1, 0.36, 1) 0.8s forwards; }
        .animate-stagger-4 { animation: textStagger 1s cubic-bezier(0.22, 1, 0.36, 1) 0.95s forwards; }
      `}</style>

            {/* SHARP, CINEMATIC CONTAINER */}
            <div className="relative w-full aspect-auto md:aspect-[21/9] min-h-[420px] md:min-h-[380px] overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-1000 group">

                {/* --- BACKGROUND IMAGE (SCALE REVEAL) --- */}
                <div className="absolute inset-0 w-full h-full bg-[#1C1814]">
                    <img
                        src={IMAGE_URL}
                        alt="Minimalist Reading"
                        className="w-full h-full object-cover object-center opacity-0 animate-image group-hover:scale-[1.03] transition-transform duration-[3000ms] ease-out"
                    />
                    {/* Subtle overlay */}
                    <div className="absolute inset-0 bg-black/10" />
                </div>

                {/* --- FROSTED GLASS CONTENT CARD (SHARP) --- */}
                <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-auto md:max-w-md lg:max-w-lg bg-[#FDFCFA]/85 backdrop-blur-2xl p-8 md:p-10 border border-white/40 shadow-2xl opacity-0 animate-card md:group-hover:-translate-y-1 transition-transform duration-700">

                    {/* 1. Label */}
                    <div className="flex items-center gap-3 mb-4 opacity-0 animate-stagger-1">
                        <div className="w-6 h-[1.5px] bg-[#B5623E]" />
                        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#B5623E]">
                            Baku Book Center
                        </p>
                    </div>

                    {/* 2. Headline */}
                    <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-[#1C1814] leading-[1.05] mb-4 tracking-tight opacity-0 animate-stagger-2">
                        <span>Stories That Shape Us<em className="text-[#B5623E] not-italic">.</em></span>
                    </h1>

                    {/* 3. Subheadline */}
                    <p className="font-sans text-sm md:text-base text-[#8C7B6E] font-light leading-relaxed mb-8 opacity-0 animate-stagger-3">
                        A curated collection for thoughtful readers, delivering the world's finest books straight to Baku.
                    </p>

                    {/* 4. SHARP CTA Button */}
                    <div className="opacity-0 animate-stagger-4">
                        <Link
                            href={`/${lang}/shop`}
                            className="inline-flex items-center justify-center gap-2 font-sans text-xs font-medium tracking-[0.1em] uppercase text-white bg-[#1C1814] px-8 py-3.5 transition-all duration-500 ease-out hover:bg-[#B5623E] hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Explore Arrivals
                        </Link>
                    </div>
                </div>

            </div>
        </section>
    );
}