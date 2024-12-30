'use client'

import { useRef, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from './ChatMessage'
import { ToolInvocationRenderer } from './ToolInvocationRenderer'
import { RatingComponent } from '../rating'
import { OrderLookupForm } from '../order-lookup-form'
import { TransferToAgentForm } from '../transfer-to-agent-form'
import { ChatInput } from './ChatInput'
import type { Message } from 'ai/react'

interface ChatContainerProps {
  messages: Message[]
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  showOrderForm: boolean
  showTransferForm: boolean
  chatEnded: boolean
  ratingSubmitted: boolean
  handleOrderLookup: (orderId: string, email: string) => void
  handleTransferRequest: (email: string, reason: string) => void
  handleRatingSubmit: (rating: number) => void
}

export function ChatContainer({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  showOrderForm,
  showTransferForm,
  chatEnded,
  ratingSubmitted,
  handleOrderLookup,
  handleTransferRequest,
  handleRatingSubmit
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <ScrollArea className="flex-grow h-[600px]">
        <div className="p-6">
          {messages.map((message) => (
            <div key={message.id}>
              <ChatMessage message={message} />
              <ToolInvocationRenderer toolInvocations={message.toolInvocations} />
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {chatEnded && !ratingSubmitted && (
        <div className="p-6 border-t">
          <RatingComponent onRate={handleRatingSubmit} />
        </div>
      )}

      {showOrderForm && (
        <div className="px-6">
          <OrderLookupForm onSubmit={handleOrderLookup} />
        </div>
      )}

      {showTransferForm && (
        <div className="px-6">
          <TransferToAgentForm onSubmit={handleTransferRequest} />
        </div>
      )}

      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
      />
    </div>
  )
}
