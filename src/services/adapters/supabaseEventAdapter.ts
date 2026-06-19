import {
  getPublicFlowToken,
  getPublicTicketToken,
  storePublicFlowToken,
  storePublicTicketToken,
} from "@/lib/publicFlowToken";
import { supabase } from "@/lib/supabaseClient";
import { localEventAdapter } from "./localEventAdapter";
import type {
  GiveawayEntry,
  GiveawayStatus,
  Interest,
  Participant,
  Referral,
  Winner,
} from "@/types/event";

type SubmitParticipantRow = {
  participant_id: string;
  public_flow_token: string;
  already_exists: boolean;
  ticket_number: string | null;
};

type ParticipantFlowStateRow = {
  participant_id: string;
  full_name: string;
  interests: string[];
  giveaway_opted_in: boolean;
  ticket_number: string | null;
  public_ticket_token: string | null;
  created_at: string;
};

type SubmitReferralsAndCreateTicketRow = {
  participant_id: string;
  ticket_number: string;
  public_ticket_token: string;
  already_had_ticket: boolean;
};

type PublicTicketRow = {
  ticket_number: string;
  public_ticket_token: string | null;
  ticket_status: GiveawayEntry["status"];
  display_name: string | null;
  created_at: string;
};

type EventParticipantRow = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  interests: string[];
  consent_contact: boolean;
  giveaway_opted_in: boolean;
  ticket_number: string | null;
  public_flow_token: string;
  created_at: string;
};

type EventReferralRow = {
  id: string;
  participant_id: string;
  referral_name: string;
  referral_phone: string;
  created_at: string;
};

type GiveawayEntryRow = {
  id: string;
  participant_id: string;
  ticket_number: string;
  public_ticket_token: string;
  status: GiveawayEntry["status"];
  created_at: string;
};

type GiveawayWinnerRow = {
  id: string;
  entry_id: string;
  participant_id: string;
  ticket_number: string;
  winner_name: string;
  winner_phone: string;
  prize_label: string | null;
  draw_order: number;
  drawn_by: string | null;
  drawn_at: string;
};

type GiveawayStatusRow = {
  you_won: boolean;
  your_prize: string | null;
  latest_ticket: string | null;
  latest_name: string | null;
  latest_prize: string | null;
  latest_at: string | null;
  total_winners: number | null;
};

type RecordGiveawayWinnerRow = {
  winner_id: string;
  entry_id: string;
  participant_id: string;
  ticket_number: string;
  winner_name: string;
  winner_phone: string;
  prize_label: string | null;
  draw_order: number;
  drawn_at: string;
};

function toRpcInterests(interests: string[]): string[] {
  return interests.map((interest) => interest.trim().toLowerCase());
}

function toParticipantInterests(interests: string[] | null | undefined): Interest[] {
  return (interests ?? []).map((interest) => {
    const normalized = interest.trim().toLowerCase();
    switch (normalized) {
      case "carro":
        return "Carro";
      case "casa":
        return "Casa";
      case "comercial":
        return "Comercial";
      case "health":
        return "Health";
      case "boat":
        return "Boat";
      default:
        return interest as Interest;
    }
  });
}

function mapParticipantRow(row: EventParticipantRow): Participant {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    interests: toParticipantInterests(row.interests),
    consentContact: row.consent_contact,
    giveawayOptedIn: row.giveaway_opted_in,
    ticketNumber: row.ticket_number ?? undefined,
    publicFlowToken: row.public_flow_token,
    createdAt: row.created_at,
  };
}

export const supabaseEventAdapter = {
  ...localEventAdapter,

  async getParticipants(): Promise<Participant[]> {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data, error } = await supabase
      .from("event_participants")
      .select(
        "id, full_name, phone, email, interests, consent_contact, giveaway_opted_in, ticket_number, public_flow_token, created_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message || "Unable to load participants.");
    }

    return ((data ?? []) as EventParticipantRow[]).map(mapParticipantRow);
  },

  async getReferrals(): Promise<Referral[]> {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data, error } = await supabase
      .from("event_referrals")
      .select("id, participant_id, referral_name, referral_phone, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message || "Unable to load referrals.");
    }

    return ((data ?? []) as EventReferralRow[]).map((row) => ({
      id: row.id,
      participantId: row.participant_id,
      referralName: row.referral_name,
      referralPhone: row.referral_phone,
      createdAt: row.created_at,
    }));
  },

  async getGiveawayEntries(): Promise<GiveawayEntry[]> {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data, error } = await supabase
      .from("giveaway_entries")
      .select("id, participant_id, ticket_number, public_ticket_token, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message || "Unable to load giveaway entries.");
    }

    return ((data ?? []) as GiveawayEntryRow[]).map((row) => ({
      id: row.id,
      participantId: row.participant_id,
      ticketNumber: row.ticket_number,
      publicTicketToken: row.public_ticket_token,
      status: row.status,
      createdAt: row.created_at,
    }));
  },

  async getWinners(): Promise<Winner[]> {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data, error } = await supabase
      .from("giveaway_winners")
      .select(
        "id, entry_id, participant_id, ticket_number, winner_name, winner_phone, prize_label, draw_order, drawn_by, drawn_at",
      )
      .order("draw_order", { ascending: true });

    if (error) {
      throw new Error(error.message || "Unable to load winners.");
    }

    return ((data ?? []) as GiveawayWinnerRow[]).map((row) => ({
      id: row.id,
      entryId: row.entry_id,
      participantId: row.participant_id,
      ticketNumber: row.ticket_number,
      winnerName: row.winner_name,
      winnerPhone: row.winner_phone,
      prizeLabel: row.prize_label ?? "",
      drawnAt: row.drawn_at,
      drawOrder: row.draw_order,
      drawnBy: row.drawn_by ?? undefined,
    }));
  },

  async getTicketByNumber(ticketNumber: string) {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const storedToken = getPublicTicketToken(ticketNumber);
    const { data, error } = await supabase.rpc("get_public_ticket", {
      p_ticket_number: storedToken ? null : ticketNumber,
      p_public_ticket_token: storedToken,
    });

    if (error) {
      throw new Error(error.message || "Unable to load ticket.");
    }

    const row = (Array.isArray(data) ? data[0] : data) as PublicTicketRow | null;
    if (!row) {
      return null;
    }

    if (row.public_ticket_token) {
      storePublicTicketToken(row.ticket_number, row.public_ticket_token);
    }

    return {
      ticketNumber: row.ticket_number,
      entry: {
        id: `supabase-${row.ticket_number}`,
        participantId: "",
        ticketNumber: row.ticket_number,
        publicTicketToken: row.public_ticket_token ?? storedToken ?? undefined,
        status: row.ticket_status,
        createdAt: row.created_at,
      },
      participant: {
        id: "",
        fullName: row.display_name ?? "",
        interests: [],
        consentContact: true,
        giveawayOptedIn: row.ticket_status !== "disqualified",
        ticketNumber: row.ticket_number,
        publicTicketToken: row.public_ticket_token ?? storedToken ?? undefined,
        createdAt: row.created_at,
      },
    };
  },

  async getGiveawayStatus(ticketNumber: string): Promise<GiveawayStatus> {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data, error } = await supabase.rpc("get_giveaway_status", {
      p_ticket_number: ticketNumber,
    });

    if (error) {
      throw new Error(error.message || "Unable to load giveaway status.");
    }

    const row = (Array.isArray(data) ? data[0] : data) as
      | GiveawayStatusRow
      | null;
    if (!row) {
      return { youWon: false, totalWinners: 0 };
    }

    return {
      youWon: Boolean(row.you_won),
      yourPrize: row.your_prize ?? undefined,
      latestTicket: row.latest_ticket ?? undefined,
      latestName: row.latest_name ?? undefined,
      latestPrize: row.latest_prize ?? undefined,
      latestAt: row.latest_at ?? undefined,
      totalWinners: row.total_winners ?? 0,
    };
  },

  async getParticipantById(id: string): Promise<Participant | null> {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const token = getPublicFlowToken(id);
    if (!token) {
      throw new Error("Invalid or expired participant session.");
    }

    const { data, error } = await supabase.rpc("get_participant_flow_state", {
      p_participant_id: id,
      p_public_flow_token: token,
    });

    if (error) {
      throw new Error(error.message || "Invalid or expired participant session.");
    }

    const row = (Array.isArray(data) ? data[0] : data) as
      | ParticipantFlowStateRow
      | null;
    if (!row) {
      return null;
    }

    return {
      ...mapParticipantRow({
        id: row.participant_id,
        full_name: row.full_name,
        phone: "",
        email: "",
        interests: row.interests,
        consent_contact: true,
        giveaway_opted_in: row.giveaway_opted_in,
        ticket_number: row.ticket_number,
        public_flow_token: token,
        created_at: row.created_at,
      }),
      phone: undefined,
      email: undefined,
      publicTicketToken: row.public_ticket_token ?? undefined,
    };
  },

  async createParticipant(
    input: Omit<Participant, "id" | "createdAt" | "giveawayOptedIn">,
  ): Promise<Participant> {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data, error } = await supabase.rpc("submit_participant", {
      p_full_name: input.fullName,
      p_phone: input.phone,
      p_email: input.email,
      p_interests: toRpcInterests(input.interests),
      p_consent_contact: input.consentContact,
    });

    if (error) {
      throw new Error(error.message || "Unable to submit participant.");
    }

    const row = (Array.isArray(data) ? data[0] : data) as
      | SubmitParticipantRow
      | null;
    if (!row) {
      throw new Error("Unable to submit participant.");
    }

    const participant: Participant = {
      id: row.participant_id,
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
      interests: input.interests,
      consentContact: input.consentContact,
      giveawayOptedIn: Boolean(row.ticket_number),
      ticketNumber: row.ticket_number ?? undefined,
      publicFlowToken: row.public_flow_token,
      publicTicketToken: undefined,
      alreadyExists: row.already_exists,
      createdAt: new Date().toISOString(),
    };

    storePublicFlowToken(participant.id, row.public_flow_token);

    return participant;
  },

  async createReferralsAndTicket(
    participantId: string,
    referrals: Array<{ name: string; phone: string }>,
  ): Promise<{ ticketNumber: string; entry: GiveawayEntry; referrals: Referral[] }> {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const token = getPublicFlowToken(participantId);
    if (!token) {
      throw new Error("Invalid or expired participant session.");
    }

    const referralsPayload = referrals.map((referral) => ({
      referral_name: referral.name,
      referral_phone: referral.phone,
    }));

    const { data, error } = await supabase.rpc(
      "submit_referrals_and_create_ticket",
      {
        p_participant_id: participantId,
        p_public_flow_token: token,
        p_referrals: referralsPayload,
      },
    );

    if (error) {
      throw new Error(error.message || "Unable to generate ticket.");
    }

    const row = (Array.isArray(data) ? data[0] : data) as
      | SubmitReferralsAndCreateTicketRow
      | null;
    if (!row) {
      throw new Error("Unable to generate ticket.");
    }

    storePublicTicketToken(row.ticket_number, row.public_ticket_token);

    const createdAt = new Date().toISOString();
    const entry: GiveawayEntry = {
      id: `supabase-${row.ticket_number}`,
      participantId: row.participant_id,
      ticketNumber: row.ticket_number,
      publicTicketToken: row.public_ticket_token,
      alreadyHadTicket: row.already_had_ticket,
      status: "active",
      createdAt,
    };

    return {
      ticketNumber: row.ticket_number,
      entry,
      referrals: row.already_had_ticket
        ? []
        : referrals.map((referral, index) => ({
            id: `supabase-${row.ticket_number}-${index + 1}`,
            participantId: row.participant_id,
            referralName: referral.name,
            referralPhone: referral.phone,
            createdAt,
      })),
    };
  },

  async recordWinner(input: {
    entryId: string;
    ticketNumber: string;
    winnerName: string;
    winnerPhone: string;
    prizeLabel: string;
  }): Promise<Winner> {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data, error } = await supabase.rpc("record_giveaway_winner", {
      p_entry_id: input.entryId,
      p_prize_label: input.prizeLabel.trim() || null,
    });

    if (error) {
      throw new Error(error.message || "Unable to record winner.");
    }

    const row = (Array.isArray(data) ? data[0] : data) as
      | RecordGiveawayWinnerRow
      | null;
    if (!row) {
      throw new Error("Unable to record winner.");
    }

    return {
      id: row.winner_id,
      entryId: row.entry_id,
      participantId: row.participant_id,
      ticketNumber: row.ticket_number,
      winnerName: row.winner_name,
      winnerPhone: row.winner_phone,
      prizeLabel: row.prize_label ?? "",
      drawnAt: row.drawn_at,
      drawOrder: row.draw_order,
    };
  },
};
