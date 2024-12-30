'use client';

import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  error: string | null;
  onDismiss: () => void;
}

export function ErrorAlert({ error, onDismiss }: ErrorAlertProps) {
  if (!error) return null;

  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded flex justify-between items-start">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <p>{error}</p>
      </div>
      <button 
        onClick={onDismiss}
        className="text-red-500 hover:text-red-700"
        title="Dismiss error"
        aria-label="Dismiss error"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
