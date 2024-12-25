/**
 * AdminPage Component
 * 
 * This component serves as the administrative interface for managing URLs and documents.
 * It allows users to add, delete, and upload content, while displaying a list of saved items.
 * 
 * Functionality:
 * - Fetches and displays saved URLs and documents from the server.
 * - Provides forms for adding new URLs and uploading documents.
 * - Handles file selection with validation for supported types and size limits.
 * - Allows users to delete saved URLs and refresh the content list.
 * 
 * State Management:
 * - `savedItems`: Array of saved items fetched from the server.
 * - `newUrl`: State for the new URL input field.
 * - `loading`: Boolean state to indicate loading status for submissions.
 * - `error`: State for handling error messages.
 * - `isLoading`: Boolean state to indicate loading status for fetching items.
 * - `documentCount`: Number of documents currently saved.
 * - `selectedFile`: State for the currently selected file for upload.
 * - `urlDescription`: State for the description of the new URL.
 * - `documentDescription`: State for the description of the document being uploaded.
 */

'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SUPPORTED_TYPES, MAX_FILE_SIZE } from '@/utils/document-processor';
import { Globe, FileText, Loader2 } from 'lucide-react';

interface SavedItem {
    id: string;
    url?: string;
    content?: string;
    description: string;
    createdAt: Date;
    type: 'url' | 'document';
    filename?: string;
}

interface VectorMetadata {
    url?: string;
    description: string;
    timestamp: string;
    filename?: string;
    type?: 'url' | 'document';
}

interface Vector {
    id: string;
    metadata: VectorMetadata;
}

export default function AdminPage() {
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    const [newUrl, setNewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [documentCount, setDocumentCount] = useState<number>(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [urlDescription, setUrlDescription] = useState('');
    const [documentDescription, setDocumentDescription] = useState('');

    useEffect(() => {
        fetchUrls();
    }, []);

    const fetchUrls = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/urls');
            if (!response.ok) {
                throw new Error('Failed to fetch items');
            }
            const data = await response.json();
            
            // Group chunks by document ID prefix
            const documents = new Map();
            data.vectors.forEach((item: Vector) => {
                // Handle documents
                if (item.metadata?.type?.toLowerCase() === 'document') {
                    const docId = item.id.split('_chunk')[0];
                    if (!documents.has(docId)) {
                        documents.set(docId, {
                            id: docId,
                            type: 'document',
                            description: item.metadata.description,
                            filename: item.metadata.filename,
                            createdAt: new Date(item.metadata.timestamp)
                        });
                    }
                } 
                // Handle URLs
                else if (item.metadata?.isUrl) {
                    documents.set(item.id, {
                        id: item.id,
                        type: 'url',
                        url: item.metadata.url,
                        description: item.metadata.description,
                        createdAt: new Date(item.metadata.timestamp)
                    });
                }
            });

            setSavedItems(Array.from(documents.values()));
            setDocumentCount(documents.size);
        } catch (error) {
            setError('Failed to fetch items');
            console.error('Error fetching items:', error);
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
                body: JSON.stringify({ 
                    url: newUrl, 
                    description: urlDescription 
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to add URL');
            }

            setNewUrl('');
            setUrlDescription('');
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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!SUPPORTED_TYPES.includes(file.type as any)) {
            setError('Unsupported file type');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError('File too large (max 10MB)');
            return;
        }

        setSelectedFile(file);
        setError(null);
    };

    const handleDocumentUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !documentDescription) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('description', documentDescription);

        try {
            const response = await fetch('/api/documents', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload document');
            }

            await fetchUrls();
            setSelectedFile(null);
            setDocumentDescription('');
        } catch (error) {
            setError('Failed to upload document');
            console.error('Error uploading document:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-[1400px]">
            <h1 className="text-3xl font-bold mb-8">Content Management</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column - Forms */}
                <div className="lg:col-span-5 space-y-6">
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                            {error}
                        </div>
                    )}
                    
                    <Tabs defaultValue="urls" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="urls" className="space-x-2">
                                <Globe className="w-4 h-4" />
                                <span>Add URL</span>
                            </TabsTrigger>
                            <TabsTrigger value="documents" className="space-x-2">
                                <FileText className="w-4 h-4" />
                                <span>Upload Document</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="urls">
                            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">URL</label>
                                    <Input
                                        type="url"
                                        value={newUrl}
                                        onChange={(e) => setNewUrl(e.target.value)}
                                        placeholder="https://example.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Input
                                        type="text"
                                        value={urlDescription}
                                        onChange={(e) => setUrlDescription(e.target.value)}
                                        placeholder="Enter description"
                                        required
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Add URL'
                                    )}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="documents">
                            <form onSubmit={handleDocumentUpload} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Document</label>
                                    <Input
                                        type="file"
                                        accept=".txt"
                                        onChange={handleFileSelect}
                                        className="cursor-pointer"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Supported format: TXT (max 10MB)
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Input
                                        type="text"
                                        value={documentDescription}
                                        onChange={(e) => setDocumentDescription(e.target.value)}
                                        placeholder="Document description"
                                        required
                                    />
                                </div>
                                <Button 
                                    type="submit"
                                    disabled={loading || !selectedFile || !documentDescription}
                                    className="w-full"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        'Upload Document'
                                    )}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column - Content List */}
                <div className="lg:col-span-7">
                    <div className="bg-white rounded-lg shadow-sm border h-[calc(100vh-8rem)]">
                        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
                            <div>
                                <h2 className="text-xl font-semibold">Saved Content</h2>
                                <p className="text-sm text-gray-500">
                                    {documentCount} item{documentCount !== 1 ? 's' : ''} in index
                                </p>
                            </div>
                            <Button 
                                variant="outline"
                                onClick={() => fetchUrls()}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <svg
                                            className="w-4 h-4"
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
                                    </span>
                                )}
                            </Button>
                        </div>
                        <ScrollArea className="h-[calc(100vh-12rem)]">
                            <div className="p-4 space-y-4">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center h-32 space-y-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                        <p className="text-gray-500">Loading saved items...</p>
                                    </div>
                                ) : savedItems.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No items added yet</p>
                                ) : (
                                    savedItems.map((item) => (
                                        <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="min-w-0">
                                                    {item.type === 'url' ? (
                                                        <>
                                                            <a 
                                                                href={item.url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline font-medium break-all"
                                                            >
                                                                {item.url}
                                                            </a>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Globe className="w-4 h-4 text-gray-400" />
                                                                <span className="text-sm text-gray-600">URL</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="font-medium text-gray-900">
                                                                {item.filename}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <FileText className="w-4 h-4 text-gray-400" />
                                                                <span className="text-sm text-gray-600">Document</span>
                                                            </div>
                                                        </>
                                                    )}
                                                    <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Added: {item.createdAt.toLocaleString()}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </div>
    );
} 