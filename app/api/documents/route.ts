/**
 * This module handles the document processing and storage functionality for the application.
 * It allows users to upload documents, processes them into chunks, generates embeddings,
 * and stores the resulting data in a Pinecone index.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { processDocument, MAX_FILE_SIZE, SUPPORTED_TYPES } from '@/utils/document-processor';

// Initialize Pinecone client with the API key from environment variables
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!
});

// Initialize OpenAI embeddings client with the API key from environment variables
const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY
});

/**
 * Handles the POST request for document upload and processing.
 * 
 * @param {NextRequest} req - The incoming request object containing the file and description.
 * @returns {Promise<NextResponse>} - A promise that resolves to a NextResponse object indicating success or failure.
 */
export async function POST(req: NextRequest) {
    try {
        // Parse the form data from the request
        const formData = await req.formData();
        const file = formData.get('file') as File; // Retrieve the uploaded file
        const description = formData.get('description') as string; // Retrieve the description

        // Check if a file was provided
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Check if the file type is supported
        if (!SUPPORTED_TYPES.includes(file.type as any)) {
            return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
        }

        // Check if the file size exceeds the maximum limit
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
        }

        // Process the document into chunks
        const { chunks } = await processDocument(file);
        const index = pinecone.index(process.env.PINECONE_INDEX!); // Get the Pinecone index

        // Generate embeddings for each chunk and store them in Pinecone
        const baseId = `doc_${Date.now()}`; // Create a base ID for the document
        const upsertPromises = chunks.map(async (chunk, i) => {
            const vectorEmbedding = await embeddings.embedQuery(chunk.content); // Generate embedding for the chunk
            return index.upsert([{
                id: `${baseId}_chunk${i}`, // Unique ID for each chunk
                values: vectorEmbedding, // Embedding values
                metadata: {
                    ...chunk.metadata, // Include existing metadata
                    description, // Add description
                    type: 'document', // Specify the type
                    content: chunk.content // Include the chunk content
                }
            }]);
        });

        // Wait for all upsert operations to complete
        await Promise.all(upsertPromises);

        // Return a success response with document details
        return NextResponse.json({
            success: true,
            id: baseId,
            filename: file.name,
            description,
            chunks: chunks.length
        });

    } catch (error) {
        console.error('Error processing document:', error);
        return NextResponse.json(
            { error: 'Failed to process document' },
            { status: 500 }
        );
    }
} 