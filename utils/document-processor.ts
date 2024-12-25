/**
 * This module provides functionality for processing documents uploaded by users.
 * It includes methods for validating file types, loading text content, and splitting
 * the content into manageable chunks for further processing.
 * 
 * Constants:
 * - MAX_FILE_SIZE: The maximum allowed file size for uploads, set to 10MB.
 * - CHUNK_SIZE: The size of each chunk when splitting the document.
 * - CHUNK_OVERLAP: The number of overlapping characters between chunks.
 * 
 * Types:
 * - SupportedFileType: A type representing the supported file types, currently only 'text/plain'.
 * 
 * Functions:
 * 
 * - loadTextContent(buffer: ArrayBuffer): 
 *   Loads and decodes the content of a text file from an ArrayBuffer.
 * 
 * - getContent(type: SupportedFileType, buffer: ArrayBuffer): 
 *   Retrieves the content of the file based on its type. Currently supports 'text/plain'.
 * 
 * - processDocument(file: File): 
 *   Validates the file type and size, reads the file content, splits it into chunks,
 *   and returns the chunks along with metadata including the filename, file type, and timestamp.
 */

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

// 10MB limit
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

export type SupportedFileType = 'text/plain';

export const SUPPORTED_TYPES: SupportedFileType[] = [
    'text/plain'
];

async function loadTextContent(buffer: ArrayBuffer): Promise<string> {
    return new TextDecoder().decode(buffer);
}

async function getContent(type: SupportedFileType, buffer: ArrayBuffer): Promise<string> {
    switch (type) {
        case 'text/plain':
            return await loadTextContent(buffer);
        default:
            throw new Error('Unsupported file type');
    }
}

export async function processDocument(file: File) {
    if (!SUPPORTED_TYPES.includes(file.type as SupportedFileType)) {
        throw new Error('Unsupported file type');
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error('File too large (max 10MB)');
    }

    const buffer = await file.arrayBuffer();
    const text = await getContent(file.type as SupportedFileType, buffer);

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: CHUNK_SIZE,
        chunkOverlap: CHUNK_OVERLAP,
    });

    const chunks = await splitter.createDocuments([text]);
    
    return {
        chunks: chunks.map(chunk => ({
            content: chunk.pageContent,
            metadata: {
                filename: file.name,
                fileType: file.type,
                timestamp: new Date().toISOString()
            }
        }))
    };
} 