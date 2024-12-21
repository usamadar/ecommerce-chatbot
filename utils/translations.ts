const errorTranslations: Record<string, { en: string; de: string }> = {
  "Order not found": {
    en: "I couldn't find an order with that number. Please check the order number and try again.",
    de: "Ich konnte keine Bestellung mit dieser Nummer finden. Bitte überprüfen Sie die Bestellnummer und versuchen Sie es erneut."
  },
  "Failed to fetch URLs": {
    en: "Failed to fetch URLs",
    de: "URLs konnten nicht abgerufen werden"
  },
  // Add more translations as needed
};

export function translateErrorMessage(message: string): string {
  const translation = errorTranslations[message];
  return translation?.de || "Ein Fehler ist aufgetreten."; // Default German error message
} 