/**
 * This module handles URL management functionality for the application.
 * It allows users to add, retrieve, and delete URLs along with their descriptions.
 * The URLs are stored in a Pinecone database, and embeddings are generated for the content scraped from the URLs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { scrapeUrl } from '@/utils/scraper';
import { OpenAIEmbeddings } from '@langchain/openai';

// Initialize Pinecone client
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!
});

// Initialize OpenAI embeddings client
const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY
});

// Local storage for URLs
let urls: { id: string; url: string; description: string; createdAt: Date }[] = [];

/**
 * Handles GET requests to retrieve all stored URLs with their metadata.
 * It fetches all IDs from the Pinecone index and retrieves their corresponding metadata.
 * 
 * @returns {NextResponse} - A JSON response containing an array of URLs and their metadata.
 */
export async function GET() {
    try {
        const index = pinecone.index(process.env.PINECONE_INDEX!);
        
        // Step 1: Get all IDs with pagination
        const allVectors = [];
        let paginationToken = undefined;
        
        do {
            const response = await index.listPaginated({
                limit: 100,
                paginationToken
            });
            
            if (response.vectors) {
                allVectors.push(...response.vectors);
            }
            paginationToken = response.pagination?.next;
        } while (paginationToken);

        // Step 2: Fetch metadata for each ID
        const vectorPromises = allVectors.map(vector => {
            return index.fetch([vector.id!]); // Add non-null assertion since we know id exists
        });
        
        const vectorResponses = await Promise.all(vectorPromises);
        const records = vectorResponses
            .flatMap(res => Object.values(res.records))
            .filter(record => record.metadata); // Filter out records without metadata

        return NextResponse.json({ 
            vectors: records.map(record => ({
                id: record.id,
                metadata: record.metadata
            }))
        });
    } catch (error) {
        console.error('Error fetching items:', error);
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
    }
}

/**
 * Handles POST requests to add a new URL along with its description.
 * It scrapes the content from the provided URL, generates an embedding for it,
 * and stores the URL and its metadata in the Pinecone index.
 * 
 * @param {NextRequest} req - The incoming request object containing the URL and description.
 * @returns {NextResponse} - A JSON response containing the newly added URL object.
 */
export async function POST(req: NextRequest) {
    try {
        const { url, description } = await req.json();
        
        if (!url || !description) {
            return NextResponse.json(
                { error: 'URL and description are required' },
                { status: 400 }
            );
        }

        // Scrape the URL
        const scrapedContent = await scrapeUrl(url);

        // Generate embedding for the content
        const vectorEmbedding = await embeddings.embedQuery(scrapedContent);

        // Get Pinecone index
        const index = pinecone.index(process.env.PINECONE_INDEX!);

        // Store in Pinecone
        const id = Date.now().toString();
        await index.upsert([{
            id,
            values: vectorEmbedding,
            metadata: {
                url,
                description,
                content: scrapedContent,
                timestamp: new Date().toISOString(),
                isUrl: true
            }
        }]);

        // Add to URLs list
        const newUrl = {
            id,
            url,
            description,
            createdAt: new Date()
        };
        
        urls.push(newUrl);

        return NextResponse.json(newUrl);
    } catch (error) {
        console.error('Error adding URL:', error);
        return NextResponse.json(
            { error: 'Failed to add URL' },
            { status: 500 }
        );
    }
}

/**
 * Handles DELETE requests to remove a URL by its ID.
 * It deletes the corresponding entry from the Pinecone index and local storage.
 * 
 * @param {NextRequest} req - The incoming request object containing the ID of the URL to delete.
 * @returns {NextResponse} - A JSON response indicating the success of the deletion.
 */
export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json();
        console.log('Deleting item with ID:', id);
        const index = pinecone.index(process.env.PINECONE_INDEX!);

        // Check if this is a document (IDs start with "doc_")
        if (id.startsWith('doc_')) {
            // Get the base document ID (everything before "_chunk")
            const baseId = id.split('_chunk')[0];
            console.log('Deleting document chunks with base ID:', baseId);

            // Find all chunks for this document
            const allChunks = [];
            let paginationToken = undefined;
            
            do {
                const response = await index.listPaginated({
                    limit: 100,
                    paginationToken,
                    prefix: baseId // Use prefix parameter instead of filter for ID matching
                });
                
                if (response.vectors) {
                    allChunks.push(...response.vectors);
                }
                paginationToken = response.pagination?.next;
            } while (paginationToken);

            // Delete all chunks
            if (allChunks.length > 0) {
                const chunkIds = allChunks.map(chunk => chunk.id!);
                console.log(`Deleting ${chunkIds.length} chunks for document`);
                await index.deleteMany(chunkIds);
            }
        } else {
            // For URLs, just delete the single record
            await index.deleteOne(id);
        }
        
        // Remove from local storage if it's a URL
        urls = urls.filter(url => url.id !== id);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting item:', error);
        return NextResponse.json(
            { error: 'Failed to delete item' },
            { status: 500 }
        );
    }
}
