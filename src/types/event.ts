export type Interest = "Carro" | "Casa" | "Comercial" | "Health" | "Boat";

export interface Participant {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  interests: Interest[];
  consentContact: boolean;
  giveawayOptedIn: boolean;
  ticketNumber?: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  participantId: string;
  referralName: string;
  referralPhone: string;
  createdAt: string;
}

export interface GiveawayEntry {
  id: string;
  participantId: string;
  ticketNumber: string;
  status: "active" | "winner" | "disqualified";
  createdAt: string;
}

export interface Winner {
  id: string;
  entryId: string;
  ticketNumber: string;
  winnerName: string;
  winnerPhone: string;
  prizeLabel: string;
  drawnAt: string;
  drawOrder: number;
}

export interface TicketLookup {
  ticketNumber: string;
  participant: Participant;
  entry: GiveawayEntry;
}

export const INTEREST_OPTIONS: Interest[] = ["Carro", "Casa", "Comercial", "Health", "Boat"];