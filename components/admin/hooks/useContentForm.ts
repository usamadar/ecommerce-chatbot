/**
 * Custom React hook for managing form state related to content submission.
 * Handles both URL and document file uploads with their respective descriptions.
 * 
 * @module useContentForm
 */

import { useReducer } from 'react';
import { SUPPORTED_TYPES, MAX_FILE_SIZE, SupportedFileType } from '@/utils/document-processor';

/**
 * Interface representing the state structure for the content form.
 * Contains two main sections: URL and document upload.
 */
interface FormState {
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
 * Each action is typed to ensure type safety when updating the form state.
 */
type FormAction = 
    | { type: 'SET_URL'; payload: string }
    | { type: 'SET_URL_DESCRIPTION'; payload: string }
    | { type: 'SET_FILE'; payload: File | null }
    | { type: 'SET_DOCUMENT_DESCRIPTION'; payload: string }
    | { type: 'RESET_URL_FORM' }
    | { type: 'RESET_DOCUMENT_FORM' };

/**
 * Initial state for the form containing empty values for both URL and document sections.
 */
const initialState: FormState = {
    url: {
        value: '',
        description: '',
    },
    document: {
        file: null,
        description: '',
    },
};

/**
 * Reducer function to handle form state updates.
 * Processes different action types to update the form state immutably.
 * 
 * @param {FormState} state - Current form state
 * @param {FormAction} action - Action to update the form state
 * @returns {FormState} Updated form state
 */
function formReducer(state: FormState, action: FormAction): FormState {
    switch (action.type) {
        case 'SET_URL':
            return {
                ...state,
                url: { ...state.url, value: action.payload },
            };
        case 'SET_URL_DESCRIPTION':
            return {
                ...state,
                url: { ...state.url, description: action.payload },
            };
        case 'SET_FILE':
            return {
                ...state,
                document: { ...state.document, file: action.payload },
            };
        case 'SET_DOCUMENT_DESCRIPTION':
            return {
                ...state,
                document: { ...state.document, description: action.payload },
            };
        case 'RESET_URL_FORM':
            return {
                ...state,
                url: initialState.url,
            };
        case 'RESET_DOCUMENT_FORM':
            return {
                ...state,
                document: initialState.document,
            };
        default:
            return state;
    }
}

/**
 * Custom hook for managing content form state and file validation.
 * 
 * @returns {Object} Object containing:
 *   - state: Current form state
 *   - dispatch: Function to update form state
 *   - handleFileSelect: Function to handle and validate file selection
 */
export function useContentForm() {
    const [state, dispatch] = useReducer(formReducer, initialState);

    /**
     * Validates a file against supported types and size constraints.
     * 
     * @param {File} file - File to validate
     * @returns {string|null} Error message if validation fails, null if successful
     */
    const validateFile = (file: File): string | null => {
        if (!SUPPORTED_TYPES.includes(file.type as SupportedFileType)) {
            return 'Unsupported file type';
        }

        if (file.size > MAX_FILE_SIZE) {
            return 'File too large (max 10MB)';
        }

        return null;
    };

    /**
     * Handles file selection, performs validation, and updates form state.
     * 
     * @param {File|null} file - Selected file or null if selection was cleared
     * @returns {string|null} Error message if validation fails, null if successful
     */
    const handleFileSelect = (file: File | null) => {
        if (!file) {
            dispatch({ type: 'SET_FILE', payload: null });
            return null;
        }

        const error = validateFile(file);
        if (error) {
            dispatch({ type: 'SET_FILE', payload: null });
            return error;
        }

        dispatch({ type: 'SET_FILE', payload: file });
        return null;
    };

    return {
        state,
        dispatch,
        handleFileSelect,
    };
}
