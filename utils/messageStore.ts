/**
 * This module provides a simple store to collect chat messages during user interactions.
 * These messages can then be used when creating support tickets or for other purposes.
 */

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
  toolCalls?: any[];
  toolResults?: any[];
  metadata?: {
    usage?: {
      completionTokens?: number;
      promptTokens?: number;
      totalTokens?: number;
    };
    finishReason?: string;
  };
}

class MessageStore {
  private messages: ChatMessage[] = [];

  async saveChat({ text, toolCalls, toolResults, messages, usage, finishReason }: { 
    text: string;
    toolCalls?: any[];
    toolResults?: any[];
    messages: ChatMessage[];
    usage?: {
      completionTokens?: number;
      promptTokens?: number;
      totalTokens?: number;
    };
    finishReason?: string;
  }) {
    console.log('saveChat params:', {
      text,
      toolCalls,
      toolResults,
      messages,
      usage,
      finishReason
    });
    
    // Get the last user message (which triggered this response)
    const lastUserMessage = messages[messages.length - 1];
    
    // If this is our first save and messages array has content, store the initial greeting
    if (this.messages.length === 0 && messages.length > 0) {
      const initialGreeting = messages[0];
      if (initialGreeting.role === 'assistant') {
        this.messages.push({
          ...initialGreeting,
          createdAt: new Date(),
          id: crypto.randomUUID()
        });
      }
    }
    
    // Only store the latest exchange (last user message and new assistant response)
    if (lastUserMessage && lastUserMessage.role === 'user') {
      // Store the latest user message
      const userMessage: ChatMessage = {
        role: 'user',
        content: lastUserMessage.content,
        createdAt: new Date(),
        id: crypto.randomUUID()
      };
      this.messages.push(userMessage);

      // Store the new assistant response with metadata
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: text,
        toolCalls,
        toolResults,
        createdAt: new Date(),
        id: crypto.randomUUID(),
        metadata: {
          usage,
          finishReason
        }
      };
      this.messages.push(assistantMessage);
    }
  }

  getMessages(): ChatMessage[] {
    return this.messages;
  }

  clearMessages() {
    this.messages = [];
  }

  getFormattedHistory(): string {
    if (this.messages.length === 0) {
      return "No chat history available.";
    }

    const formattedHistory = this.messages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => `${msg.role}: ${msg.content}`)
      .join("\n");
    
    return formattedHistory;
  }
}

// Export a singleton instance
export const messageStore = new MessageStore();
