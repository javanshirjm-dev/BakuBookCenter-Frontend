'use client';

import { useState, useEffect } from 'react';

// Helper to handle old string data vs new object data safely
const parseMultiLang = (value: any) => {
    if (!value) return { az: '', en: '', ru: '' };
    if (typeof value === 'string') return { az: value, en: value, ru: value };
    return { az: value.az || '', en: value.en || '', ru: value.ru || '' };
};

const initialFormState = {
    title: { az: '', en: '', ru: '' },
    description: { az: '', en: '', ru: '' },
    imageUrls: '' as string,
    date: new Date().toISOString().split('T')[0],
};

type LanguageTab = 'az' | 'en' | 'ru';

export default function AdminNewsPage() {
    const [news, setNews] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [status, setStatus] = useState('');
    const [activeTab, setActiveTab] = useState<LanguageTab>('en');

    const [formData, setFormData] = useState(initialFormState);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const fetchNews = async () => {
        const res = await fetch('http://localhost:5000/api/news');
        const data = await res.json();
        setNews(data);
    };

    useEffect(() => { fetchNews(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('Saving...');

        const submitData = new FormData();

        Object.keys(formData).forEach(key => {
            const val = formData[key as keyof typeof formData];
            if (typeof val === 'object' && val !== null) {
                submitData.append(key, JSON.stringify(val));
            } else {
                submitData.append(key, String(val));
            }
        });

        // Add all image files
        imageFiles.forEach(file => {
            submitData.append('imageFiles', file);
        });

        try {
            const url = editingId ? `http://localhost:5000/api/news/${editingId}` : 'http://localhost:5000/api/news';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, { method, body: submitData });

            if (res.ok) {
                setStatus('✅ Saved successfully!');
                setFormData(initialFormState);
                setImageFiles([]);
                setPreviewUrls([]);
                setEditingId(null);
                setActiveTab('en');
                fetchNews();
                setTimeout(() => setStatus(''), 3000);
            } else {
                setStatus('❌ Failed to save.');
            }
        } catch (error) {
            setStatus('❌ Server error.');
        }
    };

    const handleEdit = (item: any) => {
        setEditingId(item._id);
        setFormData({
            title: parseMultiLang(item.title),
            description: parseMultiLang(item.description),
            imageUrls: item.images?.join(',') || '',
            date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
        });
        setImageFiles([]);
        setPreviewUrls(item.images || []);
        setActiveTab('en');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this news?')) {
            try {
                const res = await fetch(`http://localhost:5000/api/news/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setStatus('✅ Deleted successfully!');
                    fetchNews();
                    setTimeout(() => setStatus(''), 3000);
                } else {
                    setStatus('❌ Failed to delete.');
                }
            } catch (error) {
                setStatus('❌ Server error.');
            }
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData(initialFormState);
        setImageFiles([]);
        setPreviewUrls([]);
        setActiveTab('en');
    };

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setImageFiles([...imageFiles, ...files]);

        // Generate preview URLs for new files
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls([...previewUrls, ...newPreviews]);
    };

    const handleRemoveImage = (index: number) => {
        const newFiles = imageFiles.filter((_, i) => i !== index);
        const newPreviews = previewUrls.filter((_, i) => i !== index);
        setImageFiles(newFiles);
        setPreviewUrls(newPreviews);
    };

    return (
        <div className="p-8 bg-slate-50 rounded-lg">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Manage News</h1>

            {/* Status Message */}
            {status && (
                <div className={`p-4 rounded-lg mb-6 ${status.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {status}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    {editingId ? 'Edit News' : 'Add News'}
                </h2>

                {/* Language Tabs */}
                <div className="flex gap-2 mb-6 border-b border-slate-200">
                    {(['en', 'az', 'ru'] as LanguageTab[]).map((lang) => (
                        <button
                            key={lang}
                            type="button"
                            onClick={() => setActiveTab(lang)}
                            className={`px-4 py-2 font-medium transition ${activeTab === lang
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            {lang.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Title */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Title ({activeTab})</label>
                    <input
                        type="text"
                        value={formData.title[activeTab]}
                        onChange={(e) => setFormData({
                            ...formData,
                            title: { ...formData.title, [activeTab]: e.target.value }
                        })}
                        placeholder={`Enter title in ${activeTab}...`}
                        className="w-full px-4 py-2 border text-black border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                {/* Description */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description ({activeTab})</label>
                    <textarea
                        value={formData.description[activeTab]}
                        onChange={(e) => setFormData({
                            ...formData,
                            description: { ...formData.description, [activeTab]: e.target.value }
                        })}
                        placeholder={`Enter description in ${activeTab}...`}
                        rows={5}
                        className="w-full px-4 py-2 border border-slate-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                {/* Images */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-4">Images (First image will be used as cover)</label>

                    {/* Upload Multiple Files */}
                    <div className="mb-4 p-4 border-2 border-dashed border-slate-300 rounded-lg">
                        <label className="cursor-pointer">
                            <div className="text-center">
                                <p className="text-slate-600 mb-2">Click to upload images or add URLs below</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageFileChange}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        (e.currentTarget.previousElementSibling as HTMLInputElement)?.click();
                                    }}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    Select Images
                                </button>
                            </div>
                        </label>
                    </div>

                    {/* Image URLs Input */}
                    <div className="mb-4">
                        <label className="text-xs text-slate-600 block mb-2">Or paste image URLs (comma-separated)</label>
                        <textarea
                            value={formData.imageUrls}
                            onChange={(e) => setFormData({ ...formData, imageUrls: e.target.value })}
                            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                            rows={2}
                            className="w-full text-black px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* Preview Images */}
                    {previewUrls.length > 0 && (
                        <div className="grid grid-cols-4 gap-3">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="relative group">
                                    <img src={url} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                                    {index === 0 && (
                                        <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">Cover</span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Date */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                        {editingId ? 'Update News' : 'Add News'}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2 bg-slate-400 text-white font-medium rounded-lg hover:bg-slate-500 transition"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* News List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="px-6 py-3 text-left font-medium text-slate-900">Title (EN)</th>
                            <th className="px-6 py-3 text-left font-medium text-slate-900">Date</th>
                            <th className="px-6 py-3 text-left font-medium text-slate-900">Image</th>
                            <th className="px-6 py-3 text-left font-medium text-slate-900">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {news.map((item: any) => (
                            <tr key={item._id} className="border-t border-slate-200 hover:bg-slate-50">
                                <td className="px-6 py-4">{item.title?.en || 'N/A'}</td>
                                <td className="px-6 py-4">{new Date(item.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    {item.images?.[0] && <img src={item.images[0]} alt="" className="h-12 w-12 object-cover rounded" />}
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {news.length === 0 && (
                    <div className="text-center py-8 text-slate-600">No news yet. Create your first news!</div>
                )}
            </div>
        </div>
    );
}
