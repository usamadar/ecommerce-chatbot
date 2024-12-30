'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ChatInputProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function ChatInput({ input, handleInputChange, handleSubmit }: ChatInputProps) {
  return (
    <div className="border-t bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message here..."
          className="flex-grow rounded-full border-gray-200 focus:ring-blue-500 focus:border-blue-500"
        />
        <Button
          type="submit"
          className="rounded-full px-6 bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Send
        </Button>
      </form>
    </div>
  )
}
