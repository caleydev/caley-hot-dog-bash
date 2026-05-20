const flowTokenKey = (participantId: string) =>
  `caley_flow_token_${participantId}`;
const ticketTokenKey = (ticketNumber: string) =>
  `caley_ticket_token_${ticketNumber}`;

export function storePublicFlowToken(
  participantId: string,
  publicFlowToken: string,
): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(flowTokenKey(participantId), publicFlowToken);
}

export function getPublicFlowToken(participantId: string): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(flowTokenKey(participantId));
}

export function clearPublicFlowToken(participantId: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(flowTokenKey(participantId));
}

export function storePublicTicketToken(
  ticketNumber: string,
  publicTicketToken: string,
): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ticketTokenKey(ticketNumber), publicTicketToken);
}

export function getPublicTicketToken(ticketNumber: string): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(ticketTokenKey(ticketNumber));
}
