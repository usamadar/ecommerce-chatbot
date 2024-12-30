'use client'

import ReactMarkdown from 'react-markdown'
import type { Message } from 'ai/react'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
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
    </div>
  )
}
