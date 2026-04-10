'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer'; // Adjust this import path if needed

export default function ConditionalFooter() {
    const pathname = usePathname();

    // If the URL starts with /admin, don't show the footer
    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return <Footer />;
}