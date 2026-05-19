export function formatTicketNumber(n: number): string {
  return `CALEY-${String(n).padStart(4, "0")}`;
}

export function parseTicketSequence(ticket: string): number {
  const m = /^CALEY-(\d+)$/.exec(ticket);
  return m ? parseInt(m[1], 10) : 0;
}