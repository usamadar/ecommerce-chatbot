'use client';

/**
 * Admin page component for content management.
 * Provides interfaces for adding URLs and uploading documents,
 * as well as viewing and managing saved content items.
 * 
 * @module AdminPage
 */

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, FileText, Loader2, AlertCircle, X } from 'lucide-react';
import { useContentForm } from '@/components/admin/hooks/useContentForm';
import { fetchContent, addUrl, uploadDocument, deleteItem } from '@/components/admin/services/content';

/**
 * Interface representing a saved content item.
 * Can be either a URL or a document with associated metadata.
 */
interface SavedItem {
    id: string;
    url?: string;
    content?: string;
    description: string;
    createdAt: Date;
    type: 'url' | 'document';
    filename?: string;
}

/**
 * Admin page component for managing content.
 * Provides a tabbed interface for adding URLs and uploading documents,
 * along with a list view of all saved content items.
 * 
 * Features:
 * - URL submission with description
 * - Document upload with description
 * - List view of saved content
 * - Delete functionality with confirmation
 * - Error handling and loading states
 * 
 * @returns {JSX.Element} The rendered admin page component
 */
export default function AdminPage() {
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [fileInputKey, setFileInputKey] = useState<number>(0);
    const { state, dispatch, handleFileSelect } = useContentForm();

    /**
     * Fetches saved content items from the API.
     * Updates the savedItems state and handles loading/error states.
     */
    const fetchItems = useCallback(async () => {
        try {
            setIsLoading(true);
            const items = await fetchContent();
            setSavedItems(items);
        } catch (error) {
            setError('Failed to fetch items');
            console.error('Error fetching items:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    /**
     * Handles URL form submission.
     * Adds the URL and its description to the system.
     * 
     * @param {React.FormEvent} e - Form submission event
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await addUrl(state.url.value, state.url.description);
            dispatch({ type: 'RESET_URL_FORM' });
            await fetchItems();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to add URL');
            console.error('Error adding URL:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles item deletion with confirmation.
     * Requires two clicks to confirm deletion.
     * 
     * @param {string} id - ID of the item to delete
     */
    const handleDelete = async (id: string) => {
        if (showDeleteConfirm !== id) {
            setShowDeleteConfirm(id);
            return;
        }

        try {
            await deleteItem(id);
            setShowDeleteConfirm(null);
            await fetchItems();
        } catch (error) {
            setError('Failed to delete item');
            console.error('Error deleting item:', error);
        }
    };

    /**
     * Handles file input change events.
     * Validates the selected file and updates form state.
     * 
     * @param {React.ChangeEvent<HTMLInputElement>} e - File input change event
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const error = handleFileSelect(file || null);
        if (error) {
            setError(error);
        } else {
            setError(null);
        }
    };

    /**
     * Handles document upload form submission.
     * Uploads the selected file with its description.
     * 
     * @param {React.FormEvent} e - Form submission event
     */
    const handleDocumentUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!state.document.file || !state.document.description) return;

        setLoading(true);
        setError(null);

        try {
            await uploadDocument(state.document.file, state.document.description);
            dispatch({ type: 'RESET_DOCUMENT_FORM' });
            setFileInputKey(prev => prev + 1); // Force file input to reset
            await fetchItems();
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
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                <p>{error}</p>
                            </div>
                            <button 
                                onClick={() => setError(null)}
                                className="text-red-500 hover:text-red-700"
                                title="Dismiss error"
                                aria-label="Dismiss error"
                            >
                                <X className="w-4 h-4" />
                            </button>
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
                                        value={state.url.value}
                                        onChange={(e) => dispatch({ type: 'SET_URL', payload: e.target.value })}
                                        placeholder="https://example.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Input
                                        type="text"
                                        value={state.url.description}
                                        onChange={(e) => dispatch({ type: 'SET_URL_DESCRIPTION', payload: e.target.value })}
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
                                        key={fileInputKey}
                                        type="file"
                                        accept=".txt"
                                        onChange={handleFileChange}
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
                                        value={state.document.description}
                                        onChange={(e) => dispatch({ type: 'SET_DOCUMENT_DESCRIPTION', payload: e.target.value })}
                                        placeholder="Document description"
                                        required
                                    />
                                </div>
                                <Button 
                                    type="submit"
                                    disabled={loading || !state.document.file || !state.document.description}
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
                                    {savedItems.length} item{savedItems.length !== 1 ? 's' : ''} in index
                                </p>
                            </div>
                            <Button 
                                variant="outline"
                                onClick={() => fetchItems()}
                                disabled={isLoading}
                                title="Refresh content list"
                                aria-label="Refresh content list"
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
                                            aria-hidden="true"
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
                                                    className={`${
                                                        showDeleteConfirm === item.id
                                                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                            : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                                    }`}
                                                    title={showDeleteConfirm === item.id ? 'Confirm delete' : 'Delete item'}
                                                    aria-label={showDeleteConfirm === item.id ? 'Confirm delete' : 'Delete item'}
                                                >
                                                    {showDeleteConfirm === item.id ? 'Click to confirm' : 'Delete'}
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
