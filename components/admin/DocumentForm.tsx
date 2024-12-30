'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useContentForm } from '@/components/admin/hooks/useContentForm';

interface DocumentFormProps {
  loading: boolean;
  fileInputKey: number;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  state: ReturnType<typeof useContentForm>['state'];
  dispatch: ReturnType<typeof useContentForm>['dispatch'];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DocumentForm({
  loading,
  fileInputKey,
  onSubmit,
  state,
  dispatch,
  onFileChange
}: DocumentFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
      <div className="space-y-2">
        <label className="text-sm font-medium">Document</label>
        <Input
          key={fileInputKey}
          type="file"
          accept=".txt"
          onChange={onFileChange}
          className="cursor-pointer"
        />
        <p className="text-xs text-gray-500">
          Supported format: TXT (max 10MB)
        </p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Input
          type="text"
          value={state.document.description}
          onChange={(e) => dispatch({ type: 'SET_DOCUMENT_DESCRIPTION', payload: e.target.value })}
          placeholder="Document description"
          required
        />
      </div>
      <Button 
        type="submit"
        disabled={loading || !state.document.file || !state.document.description}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          'Upload Document'
        )}
      </Button>
    </form>
  );
}
