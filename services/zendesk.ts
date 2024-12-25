import axios from 'axios';

interface ZendeskTicketResponse {
  ticket: {
    id: number;
    url: string;
  };
}

export class ZendeskService {
  private baseUrl: string;
  private auth: {
    username: string;
    password: string;
  };

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

  async createTicket(description: string, customerEmail?: string) {
    try {
      const response = await axios.post<ZendeskTicketResponse>(
        `${this.baseUrl}/tickets`,
        {
          ticket: {
            subject: 'Chat Transfer Request',
            comment: {
              body: description,
              public: false
            },
            priority: 'normal',
            type: 'question',
            requester_email: customerEmail
          }
        },
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

export const zendeskService = new ZendeskService();
