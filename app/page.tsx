'use client'

import { useChat } from 'ai/react'
import { useEffect, useState } from 'react'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { ChatContainer } from '@/components/chat/ChatContainer'
import type { Message } from 'ai/react'

export default function ChatInterface() {
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [showTransferForm, setShowTransferForm] = useState(false)
  const [chatEnded, setChatEnded] = useState(false)
  const [ratingSubmitted, setRatingSubmitted] = useState(false)

  const handleRatingSubmit = async (rating: number) => {
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      })
      
      if (response.ok) {
        setRatingSubmitted(true)
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
    }
  }

  const { messages, input, handleInputChange, handleSubmit, setInput } = useChat({
    api: '/api/chat',
    initialMessages: [{
      id: 'greeting',
      role: 'assistant',
      content: "👋 Hi! I'm Ava, your Westwing customer service assistant. How can I help you today? I can help you track orders, answer questions about our products, or assist with any other concerns you might have.",
    }],
  })

  useEffect(() => {
    const lastMessage: Message | undefined = messages[messages.length - 1]
    if (lastMessage) {
      // Handle order form visibility
      const isAskingForOrder = lastMessage.content.toLowerCase().includes('order') && 
        (lastMessage.content.toLowerCase().includes('email') || 
         lastMessage.content.toLowerCase().includes('order id') ||
         lastMessage.content.toLowerCase().includes('order number'))
      setShowOrderForm(isAskingForOrder)

      // Handle chat ended state
      const chatEndedPhrases = [
        'goodbye',
        'thank you',
        'have a great day',
        'end of conversation'
      ]
      const hasEnded = chatEndedPhrases.some(phrase => 
        lastMessage.content.toLowerCase().includes(phrase)
      )
      setChatEnded(hasEnded)

      // Handle transfer form visibility
      const transferKeywords = ['transfer', 'human', 'agent', 'representative', 'person', 'support']
      const isAskingForTransfer = transferKeywords.some(keyword => 
        lastMessage.content.toLowerCase().includes(keyword)
      )
      const isTransferResponse = lastMessage.content.toLowerCase().includes('support ticket has been created')
      
      setShowTransferForm(
        isAskingForTransfer &&
        !isTransferResponse &&
        !chatEnded &&
        !ratingSubmitted
      )
    }
  }, [messages, chatEnded, ratingSubmitted])

  const handleTransferRequest = async (email: string, reason: string) => {
    setShowTransferForm(false)
    setInput(`Transfer Request - Email: ${email}, Reason: ${reason}`)
    await new Promise(resolve => setTimeout(resolve, 0))
    const chatForm = document.querySelector('form') as HTMLFormElement
    if (chatForm) {
      chatForm.requestSubmit()
    }
  }

  const handleOrderLookup = async (orderId: string, email: string) => {
    setShowOrderForm(false)
    setInput(`Order ID: ${orderId}, Email: ${email}`)
    await new Promise(resolve => setTimeout(resolve, 0))
    const chatForm = document.querySelector('form') as HTMLFormElement
    if (chatForm) {
      chatForm.requestSubmit()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <ChatHeader />
        <ChatContainer
          messages={messages}
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          showOrderForm={showOrderForm}
          showTransferForm={showTransferForm}
          chatEnded={chatEnded}
          ratingSubmitted={ratingSubmitted}
          handleOrderLookup={handleOrderLookup}
          handleTransferRequest={handleTransferRequest}
          handleRatingSubmit={handleRatingSubmit}
        />
      </div>
    </div>
  );
}
