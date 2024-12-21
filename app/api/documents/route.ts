import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { processDocument, MAX_FILE_SIZE, SUPPORTED_TYPES } from '@/utils/document-processor';

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!
});

const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const description = formData.get('description') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!SUPPORTED_TYPES.includes(file.type as any)) {
            return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
        }

        // Process document into chunks
        const { chunks } = await processDocument(file);
        const index = pinecone.index(process.env.PINECONE_INDEX!);

        // Generate embeddings and store chunks
        const baseId = `doc_${Date.now()}`;
        const upsertPromises = chunks.map(async (chunk, i) => {
            const vectorEmbedding = await embeddings.embedQuery(chunk.content);
            return index.upsert([{
                id: `${baseId}_chunk${i}`,
                values: vectorEmbedding,
                metadata: {
                    ...chunk.metadata,
                    description,
                    type: 'document',
                    content: chunk.content
                }
            }]);
        });

        await Promise.all(upsertPromises);

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