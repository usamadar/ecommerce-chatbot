/**
 * Represents a saved content item in the system.
 * Can be either a URL or a document with associated metadata.
 */
export interface SavedItem {
    id: string;
    url?: string;
    content?: string;
    description: string;
    createdAt: Date;
    type: 'url' | 'document';
    filename?: string;
}

/**
 * Metadata associated with a vector in the vector database.
 * Contains information about the content source and type.
 */
export interface VectorMetadata {
    url?: string;
    description: string;
    timestamp: string;
    filename?: string;
    type?: 'url' | 'document';
    isUrl?: boolean;
}

/**
 * Represents a vector entry in the vector database.
 * Contains an ID and associated metadata.
 */
export interface Vector {
    id: string;
    metadata: VectorMetadata;
}

/**
 * Represents the state of the content submission form.
 * Handles both URL submissions and document file uploads.
 */
export interface FormState {
    url: {
        value: string;
        description: string;
    };
    document: {
        file: File | null;
        description: string;
    };
}

/**
 * Union type representing all possible actions that can be performed on the form state.
 * Used in conjunction with the form reducer to manage state updates.
 */
export type FormAction = 
    | { type: 'SET_URL'; payload: string }
    | { type: 'SET_URL_DESCRIPTION'; payload: string }
    | { type: 'SET_FILE'; payload: File | null }
    | { type: 'SET_DOCUMENT_DESCRIPTION'; payload: string }
    | { type: 'RESET_URL_FORM' }
    | { type: 'RESET_DOCUMENT_FORM' };
