/**
 * This module provides a tool for transferring conversations to a human support agent
 * using the Zendesk service. It defines the `handoffToAgent` object which includes
 * the description, parameters, and execution logic for creating a support ticket
 * and notifying the customer about the handoff.
 */

import { z } from "zod";
import { zendeskService } from "@/services/zendeskService";

import { messageStore } from '../messageStore';

/**
 * @typedef {Object} HandoffParameters
 * @property {string} [customerEmail] - Customer email address for follow-up
 * @property {string} [reason] - Reason for requesting human agent
 */

/**
 * Transfers the conversation to a human support agent.
 * 
 * @type {Object}
 * @property {string} description - Description of the action
 * @property {boolean} hasCard - Indicates if the action has a card
 * @property {string[]} topics - Topics related to the action
 * @property {z.ZodObject} parameters - Parameters for the action
 * @property {Function} execute - Function to execute the action
 */
export const handoffToAgent = {
  description: "Transfer the conversation to a human support agent",
  hasCard: false,
  topics: ["support", "help", "agent", "human"],
  parameters: z.object({
    customerEmail: z.string().email().optional().describe("Customer email address for follow-up"),
    reason: z.string().optional().describe("Reason for requesting human agent")
  }),
  /**
   * Executes the handoff to a human agent.
   * 
   * @param {HandoffParameters} params - Parameters for the handoff
   * @returns {Promise<Object>} Result of the handoff action
   */
  execute: async ({ customerEmail, reason }: { customerEmail?: string, reason?: string }) => {
    try {
      // Get formatted chat history from the message store
      const chatHistoryText = messageStore.getFormattedHistory();

      const result = await zendeskService.createTicket(
        `Reason for transfer: ${reason || "Not specified"}\n\nChat History:\n${chatHistoryText}`,
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
