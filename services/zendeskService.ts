/**
 * This file contains the ZendeskService class, which provides methods to interact with the Zendesk API.
 * It includes functionality to create support tickets in Zendesk using provided credentials.
 */

import axios from 'axios';

interface ZendeskTicketResponse {
  ticket: {
    id: number;
    url: string;
  };
}

/**
 * Service class to interact with Zendesk API.
 */
export class ZendeskService {
  private baseUrl: string;
  private auth: {
    username: string;
    password: string;
  };

  /**
   * Initializes the ZendeskService with necessary credentials.
   * @throws Will throw an error if any required environment variable is missing.
   */
  constructor() {
    const subdomain = process.env.ZENDESK_SUBDOMAIN;
    if (!subdomain) throw new Error('ZENDESK_SUBDOMAIN is required');

    const email = process.env.ZENDESK_EMAIL;
    if (!email) throw new Error('ZENDESK_EMAIL is required');

    const token = process.env.ZENDESK_API_TOKEN;
    if (!token) throw new Error('ZENDESK_API_TOKEN is required');

    this.baseUrl = `https://${subdomain}.zendesk.com/api/v2`;
    this.auth = {
      username: `${email}/token`,
      password: token
    };
  }

  /**
   * Creates a new support ticket in Zendesk.
   * @param {string} description - The description of the issue or reason for the ticket.
   * @param {string} [customerEmail] - The email address of the customer (optional).
   * @returns {Promise<{success: boolean, ticketId?: number, url?: string, error?: string}>} An object containing the success status, ticket ID, and URL if successful.
   */
  async createTicket(description: string, customerEmail?: string) {
    try {
      const ticketData: any = {
        ticket: {
          subject: 'Chat Transfer Request',
          comment: {
            body: description,
            public: false
          },
          priority: 'normal',
          type: 'question'
        }
      };

      // If customerEmail is provided, set them as the requester
      if (customerEmail) {
        ticketData.ticket.requester = {
          email: customerEmail,
          name: customerEmail  // Just use email as name
        };
      }

      const response = await axios.post<ZendeskTicketResponse>(
        `${this.baseUrl}/tickets`,
        ticketData,
        {
          auth: this.auth,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        ticketId: response.data.ticket.id,
        url: `https://${process.env.ZENDESK_SUBDOMAIN}.zendesk.com/agent/tickets/${response.data.ticket.id}`
      };
    } catch (error) {
      console.error('Failed to create Zendesk ticket:', error);
      return {
        success: false,
        error: 'Failed to create support ticket'
      };
    }
  }
}

/**
 * An instance of the ZendeskService.
 * @type {ZendeskService}
 */
export const zendeskService = new ZendeskService();
