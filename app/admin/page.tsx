'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Url {
    id: string;
    url: string;
    description: string;
    createdAt: Date;
}

export default function AdminPage() {
    const [urls, setUrls] = useState<Url[]>([]);
    const [newUrl, setNewUrl] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [documentCount, setDocumentCount] = useState<number>(0);

    useEffect(() => {
        fetchUrls();
    }, []);

    const fetchUrls = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/urls');
            if (!response.ok) {
                throw new Error('Failed to fetch URLs');
            }
            const data = await response.json();
            setUrls(data.urls);
            setDocumentCount(data.totalDocuments);
        } catch (error) {
            setError('Failed to fetch URLs');
            console.error('Error fetching URLs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/urls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: newUrl, description }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to add URL');
            }

            setNewUrl('');
            setDescription('');
            await fetchUrls();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to add URL');
            console.error('Error adding URL:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch('/api/urls', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete URL');
            }

            await fetchUrls();
        } catch (error) {
            setError('Failed to delete URL');
            console.error('Error deleting URL:', error);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6">URL Management</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="mb-8 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">URL</label>
                    <Input
                        type="url"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="https://example.com"
                        required
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter description"
                        required
                        className="w-full"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Add URL'}
                </button>
            </form>

            <div className="border rounded-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold">Saved URLs</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {documentCount} document{documentCount !== 1 ? 's' : ''} in index
                        </p>
                    </div>
                    <button
                        onClick={() => fetchUrls()}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                        <svg
                            className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        Refresh
                    </button>
                </div>
                <ScrollArea className="h-[400px] p-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-32 space-y-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <p className="text-gray-500">Loading saved URLs...</p>
                        </div>
                    ) : urls.length === 0 ? (
                        <p className="text-gray-500">No URLs added yet</p>
                    ) : (
                        <div className="space-y-4">
                            {urls.map((url) => (
                                <div key={url.id} className="border p-4 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <a href={url.url} target="_blank" rel="noopener noreferrer" 
                                               className="text-blue-500 hover:underline break-all">
                                                {url.url}
                                            </a>
                                            <p className="text-sm text-gray-600 mt-1">{url.description}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Added: {new Date(url.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(url.id)}
                                            className="text-red-500 hover:text-red-600 px-3 py-1"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
} 