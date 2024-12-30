/**
 * ChatInterface Component
 *
 * This component serves as the main interface for the Westwing customer support chat.
 * It allows users to interact with a virtual assistant named Delia, who can help with
 * order tracking, product inquiries, and other customer service-related questions.
 *
 * Functionality:
 * - Displays a chat interface with messages exchanged between the user and the assistant.
 * - Supports tool invocations to fetch and display order details, product information,
 *   and return policies using respective card components.
 * - Includes an input field for users to type their messages and submit them to the assistant.
 * - Automatically scrolls to the bottom of the chat when new messages are added.
 *
 * Usage:
 * <ChatInterface />
 */

'use client'

import { useChat } from 'ai/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { OrderCard } from '@/components/order-card'
import { ProductCard } from '@/components/product-card'
import { ReturnPolicyCard } from '@/components/return-policy-card'
import { OrderLookupForm } from '@/components/order-lookup-form'
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown'
import { RatingComponent } from '../components/rating'

export default function ChatInterface() {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const handleRatingSubmit = async (rating: number) => {
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });
      
      if (response.ok) {
        setRatingSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const { messages, input, handleInputChange, handleSubmit, setInput } = useChat({
    api: '/api/chat',
    initialMessages: [{
      id: 'greeting',
      role: 'assistant',
      content: "👋 Hi! I'm Ava, your Westwing customer service assistant. How can I help you today? I can help you track orders, answer questions about our products, or assist with any other concerns you might have.",
    }],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    
    // Check last assistant message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      // Check for order lookup request
      const isAskingForOrder = lastMessage.content.toLowerCase().includes('order') && 
        (lastMessage.content.toLowerCase().includes('email') || 
         lastMessage.content.toLowerCase().includes('order id') ||
         lastMessage.content.toLowerCase().includes('order number'));
      
      setShowOrderForm(isAskingForOrder);

      // Check if chat has ended
      const chatEndedPhrases = [
        'goodbye',
        'thank you',
        'have a great day',
        'end of conversation'
      ];
      const hasEnded = chatEndedPhrases.some(phrase => 
        lastMessage.content.toLowerCase().includes(phrase)
      );
      setChatEnded(hasEnded);
    }
  }, [messages]);

  const handleOrderLookup = async (orderId: string, email: string) => {
    setShowOrderForm(false);
    setInput(`Order ID: ${orderId}, Email: ${email}`);
    // Need to wait for next tick to ensure input is set
    await new Promise(resolve => setTimeout(resolve, 0));
    // Find and submit the chat form
    const chatForm = document.querySelector('form') as HTMLFormElement;
    if (chatForm) {
      chatForm.requestSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Westwing Customer Support
          </h1>
          <p className="text-gray-600">
            Get help with orders, products, and more
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <ScrollArea className="flex-grow h-[600px]">
            <div className="p-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-6 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  {message.content && (message.role === 'user' || !message.toolInvocations?.some(t =>
                    t.state === 'result' && (
                      t.result?.component ||
                      t.result?.responseControl?.suppressMessage
                    )
                  )) && (
                    <span
                      className={`chat-message ${
                        message.role === 'user'
                          ? 'chat-message-user'
                          : 'chat-message-assistant'
                      }`}
                    >
                      <ReactMarkdown
                        className={`markdown-content ${
                          message.role === 'user'
                            ? 'markdown-content-user'
                            : 'markdown-content-assistant'
                        }`}
                        components={{
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {children}
                            </a>
                          )
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </span>
                  )}

                  {/* Tool invocations */}
                  <div className="mt-4 space-y-4">
                    {message.toolInvocations?.map((toolInvocation) => {
                     // @ts-expect-error - ToolInvocation type doesn't include result property
                      const { toolName, toolCallId, state, result } = toolInvocation;
                      const cardClasses = "mt-2 max-w-md";
                      
                      if (state === 'result' && result) {
                        if (toolName === 'lookupOrder' && !('error' in result)) {
                          return (
                            <div key={toolCallId} className={cardClasses}>
                              <OrderCard {...result} />
                            </div>
                          );
                        }
                        if (toolName === 'getProductInfo' && result?.component === 'ProductCard') {
                          return (
                            <div key={toolCallId} className={cardClasses}>
                              <ProductCard {...result} />
                            </div>
                          );
                        }
                        if (toolName === 'getReturnPolicy' && result?.component === 'ReturnPolicyCard') {
                          return (
                            <div key={toolCallId} className={cardClasses}>
                              <ReturnPolicyCard {...result} />
                            </div>
                          );
                        }
                      }
                      return null;
                    })}
                  </div>
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

          {/* Order Lookup Form */}
          {showOrderForm && (
            <div className="px-6">
              <OrderLookupForm onSubmit={handleOrderLookup} />
            </div>
          )}

          {/* Input Form */}
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
        </div>
      </div>
    </div>
  );
}
