import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { scrapeUrl } from '@/utils/scraper';
import { OpenAIEmbeddings } from '@langchain/openai';

// Initialize Pinecone client
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!
});

const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY
});

let urls: { id: string; url: string; description: string; createdAt: Date }[] = [];

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
           // console.log('Fetching vector ID:', vector.id);
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

export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json();
        console.log('Deleting document with ID:', id);
        // Delete from Pinecone
        const index = pinecone.index(process.env.PINECONE_INDEX!);
        await index.deleteOne(id);
        
        // Remove from local storage
        urls = urls.filter(url => url.id !== id);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete URL' },
            { status: 500 }
        );
    }
} 