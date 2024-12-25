import { z } from "zod";
import { zendeskService } from "@/services/zendesk";

export const handoffToAgent = {
  description: "Transfer the conversation to a human support agent",
  hasCard: false,
  topics: ["support", "help", "agent", "human"],
  parameters: z.object({
    customerEmail: z.string().email().optional().describe("Customer email address for follow-up"),
    reason: z.string().optional().describe("Reason for requesting human agent")
  }),
  execute: async ({ customerEmail, reason }: { customerEmail?: string, reason?: string }) => {
    try {
      const result = await zendeskService.createTicket(
        `Reason for transfer: ${reason || "Not specified"}`,
        customerEmail
      );

      if (result.success) {
        return {
          found: true,
          responseControl: {
            type: "handoff",
            forcedResponse: {
              en: "I'll transfer you to a human agent who can help you further. A support ticket has been created and an agent will review your conversation and get back to you shortly.",
              de: "Ich werde Sie an einen menschlichen Mitarbeiter weiterleiten, der Ihnen weiterhelfen kann. Ein Support-Ticket wurde erstellt und ein Mitarbeiter wird sich in Kürze mit Ihnen in Verbindung setzen."
            },
            data: {
              ticketUrl: result.url,
              ticketId: result.ticketId
            }
          }
        };
      } else {
        return {
          found: false,
          message: {
            en: "I'm sorry, but I wasn't able to create a support ticket at this time. Please try again later.",
            de: "Es tut mir leid, aber ich konnte zu diesem Zeitpunkt kein Support-Ticket erstellen. Bitte versuchen Sie es später erneut."
          }
        };
      }
    } catch (error) {
      console.error("Error in handoffToAgent:", error);
      return {
        found: false,
        message: {
          en: "Sorry, I encountered an error while trying to transfer you to an agent.",
          de: "Entschuldigung, bei der Weiterleitung an einen Mitarbeiter ist ein Fehler aufgetreten."
        }
      };
    }
  }
};
