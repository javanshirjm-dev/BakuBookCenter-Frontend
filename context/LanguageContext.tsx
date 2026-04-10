'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '../locales/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
    initialLang?: string;
}

export const LanguageProvider = ({ children, initialLang }: LanguageProviderProps) => {

    const startingLang = (initialLang && ['en', 'az', 'ru'].includes(initialLang))
        ? (initialLang as Language)
        : 'en';

    const [language, setLanguage] = useState<Language>(startingLang);

    useEffect(() => {
        localStorage.setItem('language', startingLang);
    }, [startingLang]);

    const changeLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: keyof typeof translations['en']): string => {
        return (translations[language]?.[key] || translations['en'][key] || key) as string;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};