import type {
  GiveawayEntry,
  GiveawayStatus,
  Participant,
  Referral,
  Winner,
} from "@/types/event";
import { formatTicketNumber, parseTicketSequence } from "@/utils/ticket";
import { normalizePhone } from "@/utils/phone";

const K = {
  participants: "caley_event_participants",
  referrals: "caley_event_referrals",
  entries: "caley_event_entries",
  winners: "caley_event_winners",
};

function readJSON<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}
function writeJSON<T>(key: string, val: T[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(val));
}
function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  );
}

export const localEventAdapter = {
  async createParticipant(
    input: Omit<Participant, "id" | "createdAt" | "giveawayOptedIn">,
  ): Promise<Participant> {
    const list = readJSON<Participant>(K.participants);
    const p: Participant = {
      ...input,
      id: uid(),
      giveawayOptedIn: false,
      createdAt: new Date().toISOString(),
    };
    list.push(p);
    writeJSON(K.participants, list);
    return p;
  },

  async getParticipantById(id: string): Promise<Participant | null> {
    return readJSON<Participant>(K.participants).find((p) => p.id === id) ?? null;
  },

  async findParticipantByPhoneOrEmail(
    phone: string,
    email: string,
  ): Promise<Participant | null> {
    const np = normalizePhone(phone);
    const em = email.trim().toLowerCase();
    return (
      readJSON<Participant>(K.participants).find(
        (p) => normalizePhone(p.phone) === np || p.email.toLowerCase() === em,
      ) ?? null
    );
  },

  async getParticipants(): Promise<Participant[]> {
    return readJSON<Participant>(K.participants).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },

  async getReferrals(): Promise<Referral[]> {
    return readJSON<Referral>(K.referrals).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },

  async getReferralsByParticipant(participantId: string): Promise<Referral[]> {
    return readJSON<Referral>(K.referrals).filter(
      (r) => r.participantId === participantId,
    );
  },

  async getGiveawayEntries(): Promise<GiveawayEntry[]> {
    return readJSON<GiveawayEntry>(K.entries).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },

  async createReferralsAndTicket(
    participantId: string,
    referrals: Array<{ name: string; phone: string }>,
  ): Promise<{ ticketNumber: string; entry: GiveawayEntry; referrals: Referral[] }> {
    const participants = readJSON<Participant>(K.participants);
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) throw new Error("Participant not found");

    // Idempotent: if already opted in, return existing ticket
    if (participant.giveawayOptedIn && participant.ticketNumber) {
      const entries = readJSON<GiveawayEntry>(K.entries);
      const existing = entries.find((e) => e.ticketNumber === participant.ticketNumber);
      const refs = readJSON<Referral>(K.referrals).filter(
        (r) => r.participantId === participantId,
      );
      if (existing) return { ticketNumber: existing.ticketNumber, entry: existing, referrals: refs };
    }

    const allRefs = readJSON<Referral>(K.referrals);
    const now = new Date().toISOString();
    const created: Referral[] = referrals.map((r) => ({
      id: uid(),
      participantId,
      referralName: r.name,
      referralPhone: r.phone,
      createdAt: now,
    }));
    writeJSON(K.referrals, [...allRefs, ...created]);

    const entries = readJSON<GiveawayEntry>(K.entries);
    const maxSeq = entries.reduce(
      (m, e) => Math.max(m, parseTicketSequence(e.ticketNumber)),
      0,
    );
    const ticketNumber = formatTicketNumber(maxSeq + 1);
    const entry: GiveawayEntry = {
      id: uid(),
      participantId,
      ticketNumber,
      status: "active",
      createdAt: now,
    };
    writeJSON(K.entries, [...entries, entry]);

    const updated = participants.map((p) =>
      p.id === participantId
        ? { ...p, giveawayOptedIn: true, ticketNumber }
        : p,
    );
    writeJSON(K.participants, updated);

    return { ticketNumber, entry, referrals: created };
  },

  async getTicketByNumber(ticketNumber: string) {
    const entries = readJSON<GiveawayEntry>(K.entries);
    const entry = entries.find((e) => e.ticketNumber === ticketNumber);
    if (!entry) return null;
    const participant = readJSON<Participant>(K.participants).find(
      (p) => p.id === entry.participantId,
    );
    if (!participant) return null;
    return { ticketNumber, entry, participant };
  },

  async recordWinner(input: {
    entryId: string;
    ticketNumber: string;
    winnerName: string;
    winnerPhone: string;
    prizeLabel: string;
  }): Promise<Winner> {
    const winners = readJSON<Winner>(K.winners);
    const winner: Winner = {
      id: uid(),
      entryId: input.entryId,
      ticketNumber: input.ticketNumber,
      winnerName: input.winnerName,
      winnerPhone: input.winnerPhone,
      prizeLabel: input.prizeLabel,
      drawnAt: new Date().toISOString(),
      drawOrder: winners.length + 1,
    };
    writeJSON(K.winners, [...winners, winner]);

    const entries = readJSON<GiveawayEntry>(K.entries).map((e) =>
      e.id === input.entryId ? { ...e, status: "winner" as const } : e,
    );
    writeJSON(K.entries, entries);
    return winner;
  },

  async getWinners(): Promise<Winner[]> {
    return readJSON<Winner>(K.winners).sort((a, b) => a.drawOrder - b.drawOrder);
  },

  async getGiveawayStatus(ticketNumber: string): Promise<GiveawayStatus> {
    const winners = readJSON<Winner>(K.winners).sort(
      (a, b) => a.drawOrder - b.drawOrder,
    );
    const mine = winners.find((w) => w.ticketNumber === ticketNumber);
    const latest = winners[winners.length - 1];
    return {
      youWon: Boolean(mine),
      yourPrize: mine?.prizeLabel || undefined,
      latestTicket: latest?.ticketNumber,
      latestName: latest ? latest.winnerName.split(" ")[0] : undefined,
      latestPrize: latest?.prizeLabel || undefined,
      latestAt: latest?.drawnAt,
      totalWinners: winners.length,
    };
  },

  async seedDemo(): Promise<void> {
    if (readJSON<Participant>(K.participants).length > 0) return;
    const demo = [
      { fullName: "María Rivera", phone: "7871234501", email: "maria@example.com", interests: ["Carro", "Casa"] },
      { fullName: "Luis González", phone: "7871234502", email: "luis@example.com", interests: ["Health"] },
      { fullName: "Ana Torres", phone: "7871234503", email: "ana@example.com", interests: ["Comercial", "Carro"] },
    ] as const;
    for (const d of demo) {
      const p = await this.createParticipant({
        fullName: d.fullName,
        phone: d.phone,
        email: d.email,
        interests: [...d.interests],
        consentContact: true,
      });
      await this.createReferralsAndTicket(p.id, [
        { name: "Referido 1", phone: "7879990001" },
        { name: "Referido 2", phone: "7879990002" },
        { name: "Referido 3", phone: "7879990003" },
      ]);
    }
  },

  async resetAll(): Promise<void> {
    if (typeof window === "undefined") return;
    Object.values(K).forEach((k) => window.localStorage.removeItem(k));
  },
};