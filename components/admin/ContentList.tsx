'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Globe, FileText, Loader2 } from 'lucide-react';
import { SavedItem } from '@/types/admin';

interface ContentListProps {
  items: SavedItem[];
  isLoading: boolean;
  showDeleteConfirm: string | null;
  onRefresh: () => void;
  onDelete: (id: string) => void;
}

export function ContentList({
  items,
  isLoading,
  showDeleteConfirm,
  onRefresh,
  onDelete
}: ContentListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border h-[calc(100vh-8rem)]">
      <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
        <div>
          <h2 className="text-xl font-semibold">Saved Content</h2>
          <p className="text-sm text-gray-500">
            {items.length} item{items.length !== 1 ? 's' : ''} in index
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh content list"
          aria-label="Refresh content list"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </span>
          )}
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-32 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-gray-500">Loading saved items...</p>
            </div>
          ) : items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No items added yet</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    {item.type === 'url' ? (
                      <>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium break-all"
                        >
                          {item.url}
                        </a>
                        <div className="flex items-center gap-2 mt-1">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">URL</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-medium text-gray-900">
                          {item.filename}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Document</span>
                        </div>
                      </>
                    )}
                    <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Added: {item.createdAt.toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item.id)}
                    className={`${
                      showDeleteConfirm === item.id
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                    }`}
                    title={showDeleteConfirm === item.id ? 'Confirm delete' : 'Delete item'}
                    aria-label={showDeleteConfirm === item.id ? 'Confirm delete' : 'Delete item'}
                  >
                    {showDeleteConfirm === item.id ? 'Click to confirm' : 'Delete'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
