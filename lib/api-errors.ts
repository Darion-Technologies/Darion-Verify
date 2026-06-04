export function getProductionApiError(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("schema cache") ||
    normalized.includes("could not find") ||
    normalized.includes("column") ||
    normalized.includes("relation")
  ) {
    return `${message} Run the latest SQL migration and reload the API schema cache.`;
  }

  return message;
}
