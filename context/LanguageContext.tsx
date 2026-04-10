'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '../locales/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 1. ADDED: Tell TypeScript we are expecting initialLang from the Layout!
interface LanguageProviderProps {
    children: ReactNode;
    initialLang?: string;
}

// 2. ACCEPT initialLang in the component
export const LanguageProvider = ({ children, initialLang }: LanguageProviderProps) => {

    // Safety check: Make sure initialLang is actually 'az', 'en', or 'ru'. If not, default to 'en'
    const startingLang = (initialLang && ['en', 'az', 'ru'].includes(initialLang))
        ? (initialLang as Language)
        : 'en';

    // 3. START WITH THE URL LANGUAGE! (No more flashing text)
    const [language, setLanguage] = useState<Language>(startingLang);

    // 4. THE BOSS MOVE: Instead of letting localStorage override the URL, 
    // we force localStorage to sync up WITH the URL the moment the app loads.
    useEffect(() => {
        localStorage.setItem('language', startingLang);
    }, [startingLang]);

    // Save language on change (when they click your Dropdown)
    const changeLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    // The translation function
    const t = (key: keyof typeof translations['en']) => {
        // Added optional chaining (?.) just to be extra safe
        return translations[language]?.[key] || translations['en'][key] || key;
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