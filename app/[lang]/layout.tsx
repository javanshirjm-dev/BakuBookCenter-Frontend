import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "../../context/CartContext"; // <-- Import the Provider
import { AuthProvider } from '@/context/AuthContext'; // Check this path!
import ConditionalHeader from '@/components/layout/ConditionalHeader';
import ConditionalFooter from '@/components/layout/ConditionalFooter';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Baku Book Center +",
  description: "Your one-stop online bookstore for a vast collection of books, seamless shopping experience, and exceptional customer service. Explore our extensive catalog and find your next great read today!",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  return (
    <html lang={lang || "en"}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <LanguageProvider initialLang={lang}>

          <AuthProvider>
            <CartProvider>
              <ConditionalHeader />
              <main className="flex-grow">
                {children}
              </main>

              <ConditionalFooter />
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}