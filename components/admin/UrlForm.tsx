'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useContentForm } from '@/components/admin/hooks/useContentForm';

interface UrlFormProps {
  loading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  state: ReturnType<typeof useContentForm>['state'];
  dispatch: ReturnType<typeof useContentForm>['dispatch'];
}

export function UrlForm({ loading, onSubmit, state, dispatch }: UrlFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
      <div className="space-y-2">
        <label className="text-sm font-medium">URL</label>
        <Input
          type="url"
          value={state.url.value}
          onChange={(e) => dispatch({ type: 'SET_URL', payload: e.target.value })}
          placeholder="https://example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Input
          type="text"
          value={state.url.description}
          onChange={(e) => dispatch({ type: 'SET_URL_DESCRIPTION', payload: e.target.value })}
          placeholder="Enter description"
          required
        />
      </div>
      <Button 
        type="submit" 
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Add URL'
        )}
      </Button>
    </form>
  );
}
