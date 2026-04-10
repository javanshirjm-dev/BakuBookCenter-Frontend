'use client';

import { useState, useEffect } from 'react';

// Helper to handle old string data vs new object data safely
const parseMultiLang = (value: any) => {
    if (!value) return { az: '', en: '', ru: '' };
    if (typeof value === 'string') return { az: value, en: value, ru: value };
    return { az: value.az || '', en: value.en || '', ru: value.ru || '' };
};

const initialFormState = {
    name: { az: '', en: '', ru: '' },
    description: { az: '', en: '', ru: '' },
    category: { az: '', en: '', ru: '' },
    author: { az: '', en: '', ru: '' },
    publishinghouse: '',
    language: { az: '', en: '', ru: '' },
    imageUrl: '', pages: '', price: '', hasDiscount: false, discountedPrice: '', bestseller: false
};

type LanguageTab = 'az' | 'en' | 'ru';

export default function AdminPage() {
    const [books, setBooks] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [status, setStatus] = useState('');
    const [activeTab, setActiveTab] = useState<LanguageTab>('en'); // Language Tab State

    const [formData, setFormData] = useState(initialFormState);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const fetchBooks = async () => {
        const res = await fetch('http://localhost:5000/api/books');
        const data = await res.json();
        setBooks(data);
    };

    useEffect(() => { fetchBooks(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('Saving...');

        const submitData = new FormData();

        // Append data to FormData
        Object.keys(formData).forEach(key => {
            const val = formData[key as keyof typeof formData];
            // If the value is an object (our language fields), stringify it for the backend
            if (typeof val === 'object' && val !== null) {
                submitData.append(key, JSON.stringify(val));
            } else {
                submitData.append(key, String(val));
            }
        });

        if (imageFile) submitData.append('imageFile', imageFile);

        try {
            const url = editingId ? `http://localhost:5000/api/books/${editingId}` : 'http://localhost:5000/api/books';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, { method, body: submitData });

            if (res.ok) {
                setStatus('✅ Saved successfully!');
                setFormData(initialFormState);
                setImageFile(null);
                setEditingId(null);
                setActiveTab('en');
                fetchBooks();
                setTimeout(() => setStatus(''), 3000);
            } else {
                setStatus('❌ Failed to save.');
            }
        } catch (error) {
            setStatus('❌ Server error.');
        }
    };

    const handleEdit = (book: any) => {
        setEditingId(book._id);
        setFormData({
            name: parseMultiLang(book.name),
            description: parseMultiLang(book.description),
            category: parseMultiLang(book.category),
            author: parseMultiLang(book.author),
            publishinghouse: book.publishinghouse || '',
            language: parseMultiLang(book.language),
            imageUrl: book.image || '',
            pages: book.pages || '',
            price: book.price || '',
            hasDiscount: book.hasDiscount || false,
            discountedPrice: book.discountedPrice || '',
            bestseller: book.bestseller || false
        });
        setActiveTab('en'); // Reset to EN tab when editing
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this book?")) return;
        await fetch(`http://localhost:5000/api/books/${id}`, { method: 'DELETE' });
        fetchBooks();
    };

    const inputClass = "w-full border border-gray-300 px-4 py-2 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-black text-sm";
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

    // Helper to easily update language-specific fields
    const handleLangChange = (field: string, value: string) => {
        setFormData({
            ...formData,
            [field]: { ...(formData as any)[field], [activeTab]: value }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <main className="px-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* THE FORM */}
                <div className="lg:col-span-5">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-10">
                        <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                            {editingId ? '✏️ Edit Book Details' : '➕ Add New Book'}
                        </h2>

                        {/* LANGUAGE TABS */}
                        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                            {(['az', 'en', 'ru'] as LanguageTab[]).map((lang) => (
                                <button
                                    key={lang}
                                    type="button"
                                    onClick={() => setActiveTab(lang)}
                                    className={`flex-1 py-1.5 text-sm font-bold uppercase rounded-md transition-all ${activeTab === lang ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            {/* Multilingual Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Book Title ({activeTab.toUpperCase()}) *</label>
                                    <input type="text" required value={formData.name[activeTab]} onChange={(e) => handleLangChange('name', e.target.value)} className={inputClass} placeholder={`Title in ${activeTab.toUpperCase()}`} />
                                </div>
                                <div>
                                    <label className={labelClass}>Author ({activeTab.toUpperCase()}) *</label>
                                    <input type="text" required value={formData.author[activeTab]} onChange={(e) => handleLangChange('author', e.target.value)} className={inputClass} placeholder={`Author in ${activeTab.toUpperCase()}`} />
                                </div>
                                <div>
                                    <label className={labelClass}>Description ({activeTab.toUpperCase()})</label>
                                    <textarea value={formData.description[activeTab]} onChange={(e) => handleLangChange('description', e.target.value)} className={`${inputClass} h-28 resize-y`} placeholder={`Description in ${activeTab.toUpperCase()}`} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Category ({activeTab.toUpperCase()})</label>
                                        <input type="text" value={formData.category[activeTab]} onChange={(e) => handleLangChange('category', e.target.value)} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Publisher</label>
                                        <input type="text" value={formData.publishinghouse} onChange={(e) => setFormData({ ...formData, publishinghouse: e.target.value })} className={inputClass} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Book Language ({activeTab.toUpperCase()})</label>
                                        <input type="text" value={formData.language[activeTab]} onChange={(e) => handleLangChange('language', e.target.value)} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Page Count</label>
                                        <input type="number" value={formData.pages} onChange={(e) => setFormData({ ...formData, pages: e.target.value })} className={inputClass} />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Price & Discounts (These don't need translation) */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Price *</label>
                                        <input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className={inputClass} step="0.01" min="0" />
                                    </div>
                                    <div className="flex items-end">
                                        <label className="flex items-center gap-3 cursor-pointer pb-2">
                                            <input type="checkbox" checked={formData.hasDiscount} onChange={(e) => setFormData({ ...formData, hasDiscount: e.target.checked })} className="w-5 h-5 text-blue-600 rounded" />
                                            <span className="text-sm font-semibold text-gray-700">Has Discount</span>
                                        </label>
                                    </div>
                                </div>

                                {formData.hasDiscount && (
                                    <div>
                                        <label className={labelClass}>Discounted Price *</label>
                                        <input type="number" required={formData.hasDiscount} value={formData.discountedPrice} onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })} className={inputClass} step="0.01" min="0" />
                                    </div>
                                )}

                                <div className="flex items-center">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={formData.bestseller} onChange={(e) => setFormData({ ...formData, bestseller: e.target.checked })} className="w-5 h-5 text-green-600 rounded" />
                                        <span className="text-sm font-semibold text-gray-700">⭐ Bestseller</span>
                                    </label>
                                </div>
                            </div>

                            {/* Cover Image Group */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-2">
                                <label className="block text-sm font-bold text-gray-800 mb-3">Book Cover</label>
                                <div className="mb-4">
                                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer" />
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    <hr className="flex-1 border-gray-300" /><span className="text-xs text-gray-400 font-medium">OR</span><hr className="flex-1 border-gray-300" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Paste URL</p>
                                    <input type="text" placeholder="https://example.com/image.jpg" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className={inputClass} />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg hover:bg-black transition-all">
                                    {editingId ? 'Update Book Details' : 'Save to Database'}
                                </button>
                                {editingId && (
                                    <button type="button" onClick={() => { setEditingId(null); setFormData(initialFormState); }} className="bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50">
                                        Cancel
                                    </button>
                                )}
                            </div>

                            {status && (
                                <div className={`p-3 rounded-lg text-center font-medium text-sm ${status.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {status}
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* BOOK LIST */}
                <div className="lg:col-span-7">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">📚 Inventory Manager</h2>
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">{books.length} Books</span>
                    </div>

                    <div className="flex flex-col gap-4 max-h-[85vh] overflow-y-auto pr-2 pb-10 custom-scrollbar">
                        {books.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                                <p className="text-gray-500 font-medium">No books in inventory yet.</p>
                            </div>
                        ) : (
                            books.map((book: any) => {
                                // Fallback for list display: Try AZ, then EN, then RU, then old string format
                                const displayName = book.name?.az || book.name?.en || book.name?.ru || book.name || 'Unnamed Book';
                                const displayAuthor = book.author?.az || book.author?.en || book.author?.ru || book.author || 'Unknown Author';

                                return (
                                    <div key={book._id} className="bg-white p-5 rounded-2xl flex justify-between items-center shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                                        <div className="flex gap-5 items-center">
                                            <div className="shrink-0 w-16 h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                                {book.image ? <img src={book.image} alt="cover" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs p-2 text-center">No Cover</div>}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{displayName}</h3>
                                                <p className="text-sm font-medium text-gray-600 mb-1">{displayAuthor}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-gray-900">${book.price?.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 shrink-0">
                                            <button onClick={() => handleEdit(book)} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-sm font-semibold border border-blue-100">Edit</button>
                                            <button onClick={() => handleDelete(book._id)} className="bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-colors text-sm font-semibold border border-red-100">Delete</button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}