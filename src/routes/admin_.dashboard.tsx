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
import { isSupabaseConfigured } from "@/lib/supabaseClient";
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

export const Route = createFileRoute("/admin_/dashboard")({
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
    isAdmin().then((allowed) => {
      if (!allowed) {
        navigate({ to: "/admin" });
        return;
      }
      refresh();
    });
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
        <div className="-mx-3 sm:mx-0 overflow-x-auto scrollbar-none">
          <TabsList className="mx-3 sm:mx-0 w-max sm:w-full sm:justify-center flex-nowrap gap-1 bg-muted border border-border">
            <TabsTrigger value="overview" className="data-[state=active]:bg-caley-navy data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="participants" className="data-[state=active]:bg-caley-navy data-[state=active]:text-white">Participants</TabsTrigger>
            <TabsTrigger value="referrals" className="data-[state=active]:bg-caley-navy data-[state=active]:text-white">Referrals</TabsTrigger>
            <TabsTrigger value="wheel" className="data-[state=active]:bg-caley-navy data-[state=active]:text-white">Giveaway Wheel</TabsTrigger>
            <TabsTrigger value="winners" className="data-[state=active]:bg-caley-navy data-[state=active]:text-white">Winners</TabsTrigger>
            <TabsTrigger value="export" className="data-[state=active]:bg-caley-navy data-[state=active]:text-white">Export</TabsTrigger>
          </TabsList>
        </div>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          <section className="space-y-3">
            <SectionHeading title="Event Overview" subtitle="Live counts across the Caley Hot Dog Event" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <KpiCard label="Participants" value={participants.length} icon={Users} tint="blue" />
              <KpiCard label="Referrals" value={referrals.length} icon={UserPlus} tint="orange" />
              <KpiCard label="Giveaway entries" value={entries.length} icon={Sparkles} tint="yellow" />
              <KpiCard label="Tickets generated" value={entries.length} icon={Ticket} tint="red" />
              <KpiCard label="Winners" value={winners.length} icon={Trophy} tint="green" />
              <KpiCard label={`Top: ${topInterest.label}`} value={topInterest.count} icon={Sparkles} tint="blue" />
            </div>
          </section>

          <section className="space-y-3">
            <SectionHeading title="Lead Interest Breakdown" subtitle="Distribution across lines of business" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {INTEREST_OPTIONS.map((i) => (
                <InterestStatCard key={i} label={i} value={interestCounts.get(i) ?? 0} total={participants.length} />
              ))}
            </div>
          </section>

          <section className="grid lg:grid-cols-2 gap-4">
            <RecentList title="Recent registrations" items={participants.slice(0, 5).map((p) => ({
              primary: p.fullName,
              secondary: `${formatPhone(p.phone)} · ${p.interests.join(", ")}`,
              time: p.createdAt,
              badge: p.ticketNumber,
            }))} empty="No participants yet. Once people scan the QR, they will appear here." emptyIcon={Users} />
            <RecentList title="Recent giveaway entries" items={entries.slice(0, 5).map((e) => {
              const p = participants.find((x) => x.id === e.participantId);
              return {
                primary: e.ticketNumber,
                secondary: p?.fullName ?? "—",
                time: e.createdAt,
                badge: "Ticket",
              };
            })} empty="No giveaway entries yet." emptyIcon={Ticket} />
          </section>

          {!isSupabaseConfigured && (
            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant="outline" onClick={async () => { await localEventAdapter.seedDemo(); await refresh(); toast.success("Demo data seeded"); }}>
                <Database className="h-4 w-4" /> Seed demo data
              </Button>
            </div>
          )}
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

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-end justify-between gap-2">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-caley-navy leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function InterestStatCard({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="surface rounded-xl p-3.5">
      <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline justify-between">
        <div className="font-display text-2xl font-bold text-caley-navy tabular-nums">{value}</div>
        <div className="text-[11px] font-medium text-muted-foreground tabular-nums">{pct}%</div>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-caley-navy/8">
        <div className="h-full rounded-full bg-caley-blue transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function RecentList({
  title,
  items,
  empty,
  emptyIcon: EmptyIcon,
}: {
  title: string;
  items: { primary: string; secondary: string; time: string; badge?: string }[];
  empty: string;
  emptyIcon?: typeof Users;
}) {
  return (
    <div className="surface rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold text-caley-navy">{title}</h3>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Last {items.length || 5}</span>
      </div>
      {items.length === 0 ? (
        <div className="py-8 text-center">
          {EmptyIcon && <EmptyIcon className="mx-auto h-8 w-8 text-caley-blue/40 mb-2" />}
          <p className="text-sm text-muted-foreground">{empty}</p>
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {items.map((it, i) => (
            <li key={i} className="flex justify-between items-center gap-3 text-sm py-2.5 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-caley-navy truncate">{it.primary}</div>
                <div className="text-xs text-muted-foreground truncate">{it.secondary}</div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {it.badge && <Badge variant="secondary" className="text-[10px]">{it.badge}</Badge>}
                <div className="text-[11px] text-muted-foreground tabular-nums">{new Date(it.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
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
      <div className="surface rounded-xl p-3 flex flex-wrap items-center gap-2">
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
        <div className="surface rounded-xl p-10 text-center text-muted-foreground">No participants match.</div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid gap-3 sm:hidden">
            {filtered.map((p) => (
              <button key={p.id} onClick={() => setSelected(p)} className="surface surface-hover rounded-xl p-4 text-left">
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
          <div className="hidden sm:block surface rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <caption className="sr-only">Registered participants with contact details, interests, and ticket numbers</caption>
              <thead className="bg-muted text-left">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Name</th>
                  <th scope="col" className="p-3 font-semibold">Phone</th>
                  <th scope="col" className="p-3 font-semibold">Email</th>
                  <th scope="col" className="p-3 font-semibold">Interests</th>
                  <th scope="col" className="p-3 font-semibold">Ticket</th>
                  <th scope="col" className="p-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} onClick={() => setSelected(p)} className="border-t border-border/50 cursor-pointer hover:bg-muted/60">
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
    return <div className="surface rounded-xl p-10 text-center text-muted-foreground">No referrals yet.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="surface rounded-xl p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search referrals" className="pl-9" />
        </div>
      </div>
      <div className="grid sm:hidden gap-3">
        {filtered.map((r) => {
          const ref = participants.find((p) => p.id === r.participantId);
          return (
            <div key={r.id} className="surface rounded-xl p-4">
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
      <div className="hidden sm:block surface rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <caption className="sr-only">Referred contacts linked to the participant who referred them</caption>
          <thead className="bg-muted text-left">
            <tr>
              <th scope="col" className="p-3 font-semibold">Referral</th>
              <th scope="col" className="p-3 font-semibold">Phone</th>
              <th scope="col" className="p-3 font-semibold">Referred by</th>
              <th scope="col" className="p-3 font-semibold">Referrer phone</th>
              <th scope="col" className="p-3 font-semibold">Ticket</th>
              <th scope="col" className="p-3 font-semibold">Created</th>
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
    return (
      <div className="surface rounded-xl p-10 text-center">
        <Trophy className="mx-auto h-8 w-8 text-mustard mb-2" />
        <div className="font-semibold text-caley-navy">No winners drawn yet</div>
        <p className="text-sm text-muted-foreground mt-1">Head to the Giveaway Wheel to draw your first winner.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {/* Mobile cards */}
      <div className="grid gap-3 sm:hidden">
        {winners.map((w) => (
          <div key={w.id} className="surface rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Draw #{w.drawOrder}</div>
                <div className="font-bold text-caley-navy">{w.winnerName}</div>
                <div className="text-xs text-muted-foreground">{formatPhone(w.winnerPhone)}</div>
              </div>
              <Badge className="bg-warm-orange text-white">{w.ticketNumber}</Badge>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-caley-navy">{w.prizeLabel}</span>
              <span className="text-muted-foreground">{new Date(w.drawnAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Desktop table */}
      <div className="hidden sm:block surface rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <caption className="sr-only">Winners drawn from the giveaway, in draw order, with prize and timestamp</caption>
        <thead className="bg-muted text-left">
          <tr>
            <th scope="col" className="p-3 font-semibold">#</th>
            <th scope="col" className="p-3 font-semibold">Ticket</th>
            <th scope="col" className="p-3 font-semibold">Winner</th>
            <th scope="col" className="p-3 font-semibold">Phone</th>
            <th scope="col" className="p-3 font-semibold">Prize</th>
            <th scope="col" className="p-3 font-semibold">Drawn</th>
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
    { label: "Participants", desc: "Full lead registry with interests and consent.", count: participants.length, fn: exportParticipants },
    { label: "Referrals", desc: "Referred contacts tied back to each participant.", count: referrals.length, fn: exportReferrals },
    { label: "Giveaway Entries", desc: "All tickets generated through the referral flow.", count: entries.length, fn: exportEntries },
    { label: "Winners", desc: "Drawn winners with prize and timestamps.", count: winners.length, fn: exportWinners },
    { label: "All Event Data", desc: "Downloads every dataset above as separate CSVs.", count: participants.length + referrals.length + entries.length + winners.length, fn: exportAll },
  ];

  return (
    <div className="space-y-3">
      <SectionHeading title="Export Center" subtitle="Download event data as CSV for follow-up and reporting" />
      <div className="grid gap-3 sm:grid-cols-2">
        {buttons.map((b) => (
          <div key={b.label} className="surface rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-bold text-caley-navy">{b.label}</div>
                <p className="text-xs text-muted-foreground mt-0.5">{b.desc}</p>
              </div>
              <Badge variant="secondary" className="flex-shrink-0">{b.count} rows</Badge>
            </div>
            <Button onClick={b.fn} disabled={b.count === 0} variant="outline" className="w-full sm:w-auto sm:self-start">
              <Download className="h-4 w-4" /> Download CSV
            </Button>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Excel (.xlsx) export can be added by plugging in a library like <code>xlsx</code>; the export helpers are structured to make that swap easy.
      </p>
    </div>
  );
}
