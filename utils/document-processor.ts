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