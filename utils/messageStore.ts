/**
 * This module provides a simple store to collect chat messages during user interactions.
 * These messages can then be used when creating support tickets or for other purposes.
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

class MessageStore {
  private messages: ChatMessage[] = [];

  /**
   * Add a new message to the store
   */
  addMessage(message: ChatMessage) {
    this.messages.push(message);
    console.log('Added message:', message);
    console.log('Current messages:', this.messages);
  }

  /**
   * Get all stored messages
   */
  getMessages(): ChatMessage[] {
    return this.messages;
  }

  /**
   * Clear all stored messages
   */
  clearMessages() {
    this.messages = [];
  }

  /**
   * Get messages formatted as a string
   */
  getFormattedHistory(): string {
    console.log('Getting formatted history from messages:', this.messages);
    
    if (this.messages.length === 0) {
      console.log('No messages available');
      return "No chat history available.";
    }

    const formattedHistory = this.messages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => `${msg.role}: ${msg.content}`)
      .join("\n");
    
    console.log('Formatted history:', formattedHistory);
    return formattedHistory;
  }
}

// Export a singleton instance
export const messageStore = new MessageStore();
