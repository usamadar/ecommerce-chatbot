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

// In-memory storage for URLs (replace with database in production)
let urls: { id: string; url: string; description: string; createdAt: Date }[] = [];

export async function GET() {
    return NextResponse.json({ urls });
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
                timestamp: new Date().toISOString()
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