'use client';

/**
 * Admin page component for content management.
 * Provides interfaces for adding URLs and uploading documents,
 * as well as viewing and managing saved content items.
 * 
 * @module AdminPage
 */

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Globe } from 'lucide-react';
import { UrlForm } from '@/components/admin/UrlForm';
import { DocumentForm } from '@/components/admin/DocumentForm';
import { ErrorAlert } from '@/components/admin/ErrorAlert';
import { ContentList } from '@/components/admin/ContentList';
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
                    <ErrorAlert error={error} onDismiss={() => setError(null)} />
                    
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
                            <UrlForm
                                loading={loading}
                                onSubmit={handleSubmit}
                                state={state}
                                dispatch={dispatch}
                            />
                        </TabsContent>

                        <TabsContent value="documents">
                            <DocumentForm
                                loading={loading}
                                fileInputKey={fileInputKey}
                                onSubmit={handleDocumentUpload}
                                state={state}
                                dispatch={dispatch}
                                onFileChange={handleFileChange}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column - Content List */}
                <div className="lg:col-span-7">
                    <ContentList
                        items={savedItems}
                        isLoading={isLoading}
                        showDeleteConfirm={showDeleteConfirm}
                        onRefresh={fetchItems}
                        onDelete={handleDelete}
                    />
                </div>
            </div>
        </div>
    );
}
