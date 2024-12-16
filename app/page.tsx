'use client'

import { useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { OrderCard } from '@/components/order-card'
import { ProductCard } from '@/components/product-card'
import { ReturnPolicyCard } from '@/components/return-policy-card'
import { useEffect, useRef } from 'react';

export default function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'greeting',
        role: 'assistant',
        content: "👋 Hi! I'm Delia, your Westwing customer service assistant. How can I help you today? I can help you track orders, answer questions about our products, or assist with any other concerns you might have.",
      },
    ],
  })

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
                  <span
                    className={`inline-block p-4 rounded-2xl max-w-[85%] ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {message.content.split('\n').map((line, i) => {
                      // Check if line contains a URL in markdown format: [text](url)
                      const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
                      if (linkMatch) {
                        const [fullMatch, text, url] = linkMatch;
                        const beforeLink = line.split(fullMatch)[0];
                        const afterLink = line.split(fullMatch)[1];
                        return (
                          <p key={i} className={`${line.startsWith('**') ? 'font-semibold my-1' : 'my-0.5'}`}>
                            {beforeLink}
                            <a 
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              {text}
                            </a>
                            {afterLink}
                          </p>
                        );
                      }
                      
                      return (
                        <p key={i} className={`${line.startsWith('**') ? 'font-semibold my-1' : 'my-0.5'}`}>
                          {line.replace(/\*\*/g, '')}
                        </p>
                      );
                    })}
                  </span>

                  {/* Tool invocations with improved spacing */}
                  <div className="mt-4 space-y-4">
                    {message.toolInvocations?.map((toolInvocation) => {
                      const { toolName, toolCallId, state, result } = toolInvocation;

                      if (state === 'result') {
                        if (toolName === 'lookupOrder' && !result.error) {
                          return (
                            <div key={toolCallId} className="mt-2 max-w-md ml-auto">
                              <OrderCard {...result} />
                            </div>
                          );
                        }
                        if (toolName === 'getProductInfo' && result?.component === 'ProductCard') {
                          return (
                            <div key={toolCallId} className="mt-2 max-w-md">
                              <ProductCard {...result} />
                            </div>
                          );
                        }
                        if (toolName === 'getReturnPolicy' && result?.component === 'ReturnPolicyCard') {
                          return (
                            <div key={toolCallId} className="mt-2 max-w-md">
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
  )
}

