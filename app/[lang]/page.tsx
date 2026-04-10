// frontend/app/[lang]/page.tsx
import Banner from '@/components/ui/homepage/Banner';
import BookCard from '../../components/ui/homepage/BookCard';
import { translations, Language } from '../../locales/translations';

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params;
  const currentLang = (resolvedParams?.lang as Language) || 'en';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Grab the correct language object from your dictionary
  const t = translations[currentLang] || translations['en'];

  // Fetch discounted books
  let discountBooks: any[] = [];
  try {
    const discountRes = await fetch(`${apiUrl}/books/discount`, { cache: 'no-store' });
    const discountData = await discountRes.json();
    discountBooks = Array.isArray(discountData) ? discountData : discountData.books || [];
  } catch (error) {
    console.error('Error fetching discount books:', error);
  }

  // Fetch latest books
  let latestBooks: any[] = [];
  try {
    const latestRes = await fetch(`${apiUrl}/books/latest`, { cache: 'no-store' });
    const latestData = await latestRes.json();
    latestBooks = Array.isArray(latestData) ? latestData : latestData.books || [];
  } catch (error) {
    console.error('Error fetching latest books:', error);
  }

  // Fetch bestseller books
  let bestsellerBooks: any[] = [];
  try {
    const bestsellerRes = await fetch(`${apiUrl}/books/bestseller`, { cache: 'no-store' });
    const bestsellerData = await bestsellerRes.json();
    bestsellerBooks = Array.isArray(bestsellerData) ? bestsellerData : bestsellerData.books || [];
  } catch (error) {
    console.error('Error fetching bestseller books:', error);
  }

  // Fetch random books
  let randomBooks: any[] = [];
  try {
    const randomRes = await fetch(`${apiUrl}/books/random`, { cache: 'no-store' });
    const randomData = await randomRes.json();
    randomBooks = Array.isArray(randomData) ? randomData : randomData.books || [];
  } catch (error) {
    console.error('Error fetching random books:', error);
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">

      <Banner />

      {/* Discount */}
      <section className="max-w-7xl mx-auto px-15 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl text-gray-900 mb-6 font-light tracking-tight font-serif">{t.onSale}</h1>

        {!discountBooks || discountBooks.length === 0 ? (
          <div className="text-center py-16 md:py-20 bg-white rounded-2xl border border-dashed border-gray-300 mx-2">
            <p className="text-gray-500 font-medium text-base md:text-lg">{t.emptySale}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
            {discountBooks.map((book: any) => (
              <BookCard key={book._id} book={book} lang={currentLang} />
            ))}
          </div>
        )}
      </section>

      {/* Latest */}
      <section className="max-w-7xl mx-auto px-15 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl text-gray-900 mb-6 font-light tracking-tight font-serif">{t.newArrivals}</h1>

        {!latestBooks || latestBooks.length === 0 ? (
          <div className="text-center py-16 md:py-20 bg-white rounded-2xl border border-dashed border-gray-300 mx-2">
            <p className="text-gray-500 font-medium text-base md:text-lg">{t.emptyNew}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
            {latestBooks.map((book: any) => (
              <BookCard key={book._id} book={book} lang={currentLang} />
            ))}
          </div>
        )}
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-15 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl text-gray-900 mb-6 font-light tracking-tight font-serif">{t.bestsellers}</h1>

        {!bestsellerBooks || bestsellerBooks.length === 0 ? (
          <div className="text-center py-16 md:py-20 bg-white rounded-2xl border border-dashed border-gray-300 mx-2">
            <p className="text-gray-500 font-medium text-base md:text-lg">{t.emptyNew}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
            {bestsellerBooks.map((book: any) => (
              <BookCard key={book._id} book={book} lang={currentLang} />
            ))}
          </div>
        )}
      </section>

      {/* Random */}
      <section className="max-w-7xl mx-auto px-15 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl text-gray-900 mb-6 font-light tracking-tight font-serif">{t.explore}</h1>

        {!randomBooks || randomBooks.length === 0 ? (
          <div className="text-center py-16 md:py-20 bg-white rounded-2xl border border-dashed border-gray-300 mx-2">
            <p className="text-gray-500 font-medium text-base md:text-lg">{t.emptyNew}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
            {randomBooks.map((book: any) => (
              <BookCard key={book._id} book={book} lang={currentLang} />
            ))}
          </div>
        )}
      </section>

    </main>
  );
}