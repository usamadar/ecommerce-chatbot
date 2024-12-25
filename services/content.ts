/**
 * Service module for managing content (URLs and documents) in the application.
 * Provides functions for fetching, adding, uploading, and deleting content items.
 * 
 * @module services/content
 */

import { SavedItem, Vector } from '../types/admin';

/**
 * Fetches all content items from the API.
 * Groups document chunks by their ID prefix and processes URLs.
 * 
 * @returns {Promise<SavedItem[]>} Array of saved content items
 * @throws {Error} If the API request fails
 */
export async function fetchContent(): Promise<SavedItem[]> {
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

    return Array.from(documents.values());
}

/**
 * Adds a new URL to the system with its description.
 * 
 * @param {string} url - The URL to add
 * @param {string} description - Description of the URL content
 * @throws {Error} If the API request fails or returns an error
 */
export async function addUrl(url: string, description: string): Promise<void> {
    const response = await fetch('/api/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, description }),
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add URL');
    }
}

/**
 * Uploads a document file with its description.
 * 
 * @param {File} file - The document file to upload
 * @param {string} description - Description of the document content
 * @throws {Error} If the upload fails
 */
export async function uploadDocument(file: File, description: string): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);

    const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('Failed to upload document');
    }
}

/**
 * Deletes a content item by its ID.
 * 
 * @param {string} id - ID of the item to delete
 * @throws {Error} If the deletion fails
 */
export async function deleteItem(id: string): Promise<void> {
    const response = await fetch('/api/urls', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });

    if (!response.ok) {
        throw new Error('Failed to delete item');
    }
}
