import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Users,
  UserPlus,
  Ticket,
  Trophy,
  Download,
  Search,
  Sparkles,
  Database,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KpiCard } from "@/components/admin/KpiCard";
import { WinnerWheel } from "@/components/admin/WinnerWheel";
import { eventService } from "@/services/eventService";
import { isAdmin } from "@/lib/adminAuth";
import { localEventAdapter } from "@/services/adapters/localEventAdapter";
import type {
  GiveawayEntry,
  Participant,
  Referral,
  Winner,
  Interest,
} from "@/types/event";
import { INTEREST_OPTIONS } from "@/types/event";
import { downloadCsv, toCsv } from "@/utils/export";
import { formatPhone } from "@/utils/phone";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [entries, setEntries] = useState<GiveawayEntry[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);

  const refresh = useCallback(async () => {
    const [p, r, e, w] = await Promise.all([
      eventService.getParticipants(),
      eventService.getReferrals(),
      eventService.getGiveawayEntries(),
      eventService.getWinners(),
    ]);
    setParticipants(p);
    setReferrals(r);
    setEntries(e);
    setWinners(w);
  }, []);

  useEffect(() => {
    if (!isAdmin()) {
      navigate({ to: "/admin" });
      return;
    }
    refresh();
  }, [navigate, refresh]);

  // KPIs
  const interestCounts = useMemo(() => {
    const counts = new Map<Interest, number>();
    INTEREST_OPTIONS.forEach((i) => counts.set(i, 0));
    participants.forEach((p) =>
      p.interests.forEach((i) => counts.set(i as Interest, (counts.get(i as Interest) ?? 0) + 1)),
    );
    return counts;
  }, [participants]);

  const topInterest = useMemo(() => {
    let best: { label: string; count: number } = { label: "—", count: 0 };
    interestCounts.forEach((c, k) => {
      if (c > best.count) best = { label: k, count: c };
    });
    return best;
  }, [interestCounts]);

  return (
    <AdminLayout>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full overflow-x-auto justify-start sm:justify-center flex-nowrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="wheel">Giveaway Wheel</TabsTrigger>
          <TabsTrigger value="winners">Winners</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <KpiCard label="Participants" value={participants.length} icon={Users} tint="blue" />
            <KpiCard label="Referrals" value={referrals.length} icon={UserPlus} tint="orange" />
            <KpiCard label="Giveaway entries" value={entries.length} icon={Sparkles} tint="yellow" />
            <KpiCard label="Tickets generated" value={entries.length} icon={Ticket} tint="red" />
            <KpiCard label="Winners" value={winners.length} icon={Trophy} tint="green" />
            <KpiCard label={`Top: ${topInterest.label}`} value={topInterest.count} icon={Sparkles} tint="blue" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {INTEREST_OPTIONS.map((i) => (
              <KpiCard key={i} label={i} value={interestCounts.get(i) ?? 0} icon={Users} tint="blue" />
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <RecentList title="Recent registrations" items={participants.slice(0, 5).map((p) => ({
              primary: p.fullName,
              secondary: `${formatPhone(p.phone)} · ${p.interests.join(", ")}`,
              time: p.createdAt,
            }))} empty="No participants yet. Once people scan the QR, they will appear here." />
            <RecentList title="Recent giveaway entries" items={entries.slice(0, 5).map((e) => {
              const p = participants.find((x) => x.id === e.participantId);
              return {
                primary: e.ticketNumber,
                secondary: p?.fullName ?? "—",
                time: e.createdAt,
              };
            })} empty="No giveaway entries yet." />
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="outline" onClick={async () => { await localEventAdapter.seedDemo(); await refresh(); toast.success("Demo data seeded"); }}>
              <Database className="h-4 w-4" /> Seed demo data
            </Button>
          </div>
        </TabsContent>

        {/* PARTICIPANTS */}
        <TabsContent value="participants">
          <ParticipantsView participants={participants} referrals={referrals} />
        </TabsContent>

        {/* REFERRALS */}
        <TabsContent value="referrals">
          <ReferralsView referrals={referrals} participants={participants} />
        </TabsContent>

        {/* WHEEL */}
        <TabsContent value="wheel">
          <WinnerWheel
            entries={entries}
            participants={participants}
            winners={winners}
            onWinnerRecorded={refresh}
          />
        </TabsContent>

        {/* WINNERS */}
        <TabsContent value="winners">
          <WinnersView winners={winners} />
        </TabsContent>

        {/* EXPORT */}
        <TabsContent value="export">
          <ExportView
            participants={participants}
            referrals={referrals}
            entries={entries}
            winners={winners}
          />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

function RecentList({
  title,
  items,
  empty,
}: {
  title: string;
  items: { primary: string; secondary: string; time: string }[];
  empty: string;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="font-semibold mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={i} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0">
              <div>
                <div className="font-medium">{it.primary}</div>
                <div className="text-xs text-muted-foreground">{it.secondary}</div>
              </div>
              <div className="text-xs text-muted-foreground">{new Date(it.time).toLocaleTimeString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ParticipantsView({ participants, referrals }: { participants: Participant[]; referrals: Referral[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Interest | "all">("all");
  const [giveawayFilter, setGiveawayFilter] = useState<"all" | "yes" | "no">("all");
  const [selected, setSelected] = useState<Participant | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return participants.filter((p) => {
      if (q && !`${p.fullName} ${p.phone} ${p.email}`.toLowerCase().includes(q)) return false;
      if (filter !== "all" && !p.interests.includes(filter)) return false;
      if (giveawayFilter === "yes" && !p.giveawayOptedIn) return false;
      if (giveawayFilter === "no" && p.giveawayOptedIn) return false;
      return true;
    });
  }, [participants, query, filter, giveawayFilter]);

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, phone or email" className="pl-9" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as Interest | "all")} className="h-9 rounded-md border bg-white px-2 text-sm">
          <option value="all">All interests</option>
          {INTEREST_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <select value={giveawayFilter} onChange={(e) => setGiveawayFilter(e.target.value as "all"|"yes"|"no")} className="h-9 rounded-md border bg-white px-2 text-sm">
          <option value="all">All giveaway status</option>
          <option value="yes">Entered giveaway</option>
          <option value="no">Lead only</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-muted-foreground">No participants match.</div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid gap-3 sm:hidden">
            {filtered.map((p) => (
              <button key={p.id} onClick={() => setSelected(p)} className="glass rounded-2xl p-4 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{p.fullName}</div>
                    <div className="text-xs text-muted-foreground">{formatPhone(p.phone)} · {p.email}</div>
                  </div>
                  {p.ticketNumber && <Badge className="bg-warm-orange text-white">{p.ticketNumber}</Badge>}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.interests.map((i) => <Badge key={i} variant="secondary">{i}</Badge>)}
                </div>
              </button>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block glass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/50 text-left">
                <tr>
                  <th className="p-3 font-semibold">Name</th>
                  <th className="p-3 font-semibold">Phone</th>
                  <th className="p-3 font-semibold">Email</th>
                  <th className="p-3 font-semibold">Interests</th>
                  <th className="p-3 font-semibold">Ticket</th>
                  <th className="p-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} onClick={() => setSelected(p)} className="border-t border-border/50 cursor-pointer hover:bg-white/40">
                    <td className="p-3 font-medium">{p.fullName}</td>
                    <td className="p-3">{formatPhone(p.phone)}</td>
                    <td className="p-3">{p.email}</td>
                    <td className="p-3"><div className="flex flex-wrap gap-1">{p.interests.map((i) => <Badge key={i} variant="secondary">{i}</Badge>)}</div></td>
                    <td className="p-3">{p.ticketNumber ? <Badge className="bg-warm-orange text-white">{p.ticketNumber}</Badge> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="p-3 text-muted-foreground text-xs">{new Date(p.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selected?.fullName}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <DetailRow label="Phone" value={formatPhone(selected.phone)} />
              <DetailRow label="Email" value={selected.email} />
              <DetailRow label="Interests" value={selected.interests.join(", ")} />
              <DetailRow label="Consent" value={selected.consentContact ? "Accepted" : "—"} />
              <DetailRow label="Ticket" value={selected.ticketNumber ?? "—"} />
              <DetailRow label="Registered" value={new Date(selected.createdAt).toLocaleString()} />
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mt-2">Referrals submitted</div>
                <ul className="mt-1 space-y-1">
                  {referrals.filter((r) => r.participantId === selected.id).map((r) => (
                    <li key={r.id} className="flex justify-between border-b border-border/50 py-1">
                      <span>{r.referralName}</span>
                      <span className="text-muted-foreground">{formatPhone(r.referralPhone)}</span>
                    </li>
                  ))}
                  {referrals.filter((r) => r.participantId === selected.id).length === 0 && (
                    <li className="text-muted-foreground">No referrals submitted.</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function ReferralsView({ referrals, participants }: { referrals: Referral[]; participants: Participant[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return referrals.filter((r) => `${r.referralName} ${r.referralPhone}`.toLowerCase().includes(q));
  }, [referrals, query]);

  if (referrals.length === 0) {
    return <div className="glass rounded-2xl p-10 text-center text-muted-foreground">No referrals yet.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search referrals" className="pl-9" />
        </div>
      </div>
      <div className="grid sm:hidden gap-3">
        {filtered.map((r) => {
          const ref = participants.find((p) => p.id === r.participantId);
          return (
            <div key={r.id} className="glass rounded-2xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{r.referralName}</div>
                  <div className="text-xs text-muted-foreground">{formatPhone(r.referralPhone)}</div>
                </div>
                <Badge className="bg-warm-orange text-white">Referral Lead</Badge>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Referred by {ref?.fullName ?? "—"} ({ref?.ticketNumber ?? "no ticket"})</div>
            </div>
          );
        })}
      </div>
      <div className="hidden sm:block glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/50 text-left">
            <tr>
              <th className="p-3 font-semibold">Referral</th>
              <th className="p-3 font-semibold">Phone</th>
              <th className="p-3 font-semibold">Referred by</th>
              <th className="p-3 font-semibold">Referrer phone</th>
              <th className="p-3 font-semibold">Ticket</th>
              <th className="p-3 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const ref = participants.find((p) => p.id === r.participantId);
              return (
                <tr key={r.id} className="border-t border-border/50">
                  <td className="p-3 font-medium">{r.referralName} <Badge className="ml-1 bg-warm-orange/15 text-warm-orange">Referral</Badge></td>
                  <td className="p-3">{formatPhone(r.referralPhone)}</td>
                  <td className="p-3">{ref?.fullName ?? "—"}</td>
                  <td className="p-3">{ref ? formatPhone(ref.phone) : "—"}</td>
                  <td className="p-3">{ref?.ticketNumber ?? "—"}</td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WinnersView({ winners }: { winners: Winner[] }) {
  if (winners.length === 0) {
    return <div className="glass rounded-2xl p-10 text-center text-muted-foreground">No winners drawn yet.</div>;
  }
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-white/50 text-left">
          <tr>
            <th className="p-3 font-semibold">#</th>
            <th className="p-3 font-semibold">Ticket</th>
            <th className="p-3 font-semibold">Winner</th>
            <th className="p-3 font-semibold">Phone</th>
            <th className="p-3 font-semibold">Prize</th>
            <th className="p-3 font-semibold">Drawn</th>
          </tr>
        </thead>
        <tbody>
          {winners.map((w) => (
            <tr key={w.id} className="border-t border-border/50">
              <td className="p-3 font-bold">{w.drawOrder}</td>
              <td className="p-3"><Badge className="bg-warm-orange text-white">{w.ticketNumber}</Badge></td>
              <td className="p-3">{w.winnerName}</td>
              <td className="p-3">{formatPhone(w.winnerPhone)}</td>
              <td className="p-3">{w.prizeLabel}</td>
              <td className="p-3 text-xs text-muted-foreground">{new Date(w.drawnAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExportView({
  participants,
  referrals,
  entries,
  winners,
}: {
  participants: Participant[];
  referrals: Referral[];
  entries: GiveawayEntry[];
  winners: Winner[];
}) {
  const exportParticipants = () => {
    if (participants.length === 0) return toast.error("No participants to export.");
    const rows = participants.map((p) => ({
      participant_id: p.id,
      full_name: p.fullName,
      phone: p.phone,
      email: p.email,
      interests: p.interests,
      consent_contact: p.consentContact,
      giveaway_opted_in: p.giveawayOptedIn,
      ticket_number: p.ticketNumber ?? "",
      created_at: p.createdAt,
    }));
    downloadCsv("caley-participants.csv", toCsv(rows));
  };
  const exportReferrals = () => {
    if (referrals.length === 0) return toast.error("No referrals to export.");
    const rows = referrals.map((r) => {
      const ref = participants.find((p) => p.id === r.participantId);
      return {
        referral_id: r.id,
        participant_id: r.participantId,
        referral_name: r.referralName,
        referral_phone: r.referralPhone,
        referred_by_name: ref?.fullName ?? "",
        referred_by_phone: ref?.phone ?? "",
        referred_by_ticket_number: ref?.ticketNumber ?? "",
        created_at: r.createdAt,
      };
    });
    downloadCsv("caley-referrals.csv", toCsv(rows));
  };
  const exportEntries = () => {
    if (entries.length === 0) return toast.error("No giveaway entries to export.");
    const rows = entries.map((e) => ({
      entry_id: e.id,
      participant_id: e.participantId,
      ticket_number: e.ticketNumber,
      status: e.status,
      created_at: e.createdAt,
    }));
    downloadCsv("caley-giveaway-entries.csv", toCsv(rows));
  };
  const exportWinners = () => {
    if (winners.length === 0) return toast.error("No winners to export.");
    const rows = winners.map((w) => ({
      winner_id: w.id,
      draw_order: w.drawOrder,
      ticket_number: w.ticketNumber,
      winner_name: w.winnerName,
      winner_phone: w.winnerPhone,
      prize_label: w.prizeLabel,
      drawn_at: w.drawnAt,
    }));
    downloadCsv("caley-winners.csv", toCsv(rows));
  };
  const exportAll = () => {
    exportParticipants(); exportReferrals(); exportEntries(); exportWinners();
  };

  const buttons = [
    { label: "Download Participants CSV", count: participants.length, fn: exportParticipants },
    { label: "Download Referrals CSV", count: referrals.length, fn: exportReferrals },
    { label: "Download Giveaway Entries CSV", count: entries.length, fn: exportEntries },
    { label: "Download Winners CSV", count: winners.length, fn: exportWinners },
    { label: "Download All Event Data CSV", count: participants.length + referrals.length + entries.length + winners.length, fn: exportAll },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {buttons.map((b) => (
        <div key={b.label} className="glass rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="font-semibold text-sm">{b.label}</div>
            <div className="text-xs text-muted-foreground">{b.count} records</div>
          </div>
          <Button onClick={b.fn} disabled={b.count === 0} variant="outline">
            <Download className="h-4 w-4" /> CSV
          </Button>
        </div>
      ))}
      <p className="sm:col-span-2 text-xs text-muted-foreground">
        Excel (.xlsx) export can be added by plugging in a library like <code>xlsx</code>; the export helpers are structured to make that swap easy.
      </p>
    </div>
  );
}