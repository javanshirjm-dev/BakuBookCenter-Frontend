'use client';

import { usePathname } from 'next/navigation';
import Header from './Header'; // Adjust this import path if needed

export default function ConditionalHeader() {
    const pathname = usePathname();

    // If the URL starts with /admin, don't show the header
    if (pathname?.startsWith('/admin')) {
        return null;
    }

    // Otherwise, show the normal header
    return <Header />;
}