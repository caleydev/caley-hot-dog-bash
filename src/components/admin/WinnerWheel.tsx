import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Sparkles, Ticket as TicketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { eventService } from "@/services/eventService";
import type { GiveawayEntry, Participant, Winner } from "@/types/event";
import { bigBurst } from "@/lib/confetti";
import { toast } from "sonner";

// Caley premium palette — alternated thoughtfully across segments
const PALETTE: { bg: string; text: "white" | "navy" }[] = [
  { bg: "#0B2A4A", text: "white" },  // navy
  { bg: "#F6B739", text: "navy" },   // mustard
  { bg: "#0A6FB8", text: "white" },  // caley blue
  { bg: "#F45B3F", text: "white" },  // coral
  { bg: "#4FC3F7", text: "navy" },   // sky
  { bg: "#2BA39B", text: "white" },  // teal
  { bg: "#103B68", text: "white" },  // deep navy
  { bg: "#FFF6DC", text: "navy" },   // cream
];

function firstName(full?: string) {
  if (!full) return "";
  return full.trim().split(/\s+/)[0] ?? "";
}

export function WinnerWheel({
  entries,
  participants,
  winners,
  onWinnerRecorded,
}: {
  entries: GiveawayEntry[];
  participants: Participant[];
  winners: Winner[];
  onWinnerRecorded: () => void;
}) {
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [pickedEntry, setPickedEntry] = useState<GiveawayEntry | null>(null);
  const [winningIdx, setWinningIdx] = useState<number | null>(null);
  const [prize, setPrize] = useState("Hoodie");
  const [open, setOpen] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const wonTickets = useMemo(() => new Set(winners.map((w) => w.ticketNumber)), [winners]);
  const active = useMemo(
    () => entries.filter((e) => allowRepeat || !wonTickets.has(e.ticketNumber)),
    [entries, wonTickets, allowRepeat],
  );

  // Cap visible segments so labels stay readable. Winner is still drawn from ALL active.
  const MAX_SEGMENTS = 16;
  const segmentsShown = active.slice(0, MAX_SEGMENTS);
  const segCount = Math.max(segmentsShown.length, 1);
  const segAngle = 360 / segCount;
  const showNames = segCount <= 12;

  const onSpin = () => {
    if (active.length === 0 || spinning) return;
    setSpinning(true);
    setWinningIdx(null);
    const winnerIdx = Math.floor(Math.random() * active.length);
    const visibleIdx = winnerIdx < segmentsShown.length ? winnerIdx : Math.floor(Math.random() * segmentsShown.length);
    const turns = 6;
    const target = 360 * turns + (360 - (visibleIdx * segAngle + segAngle / 2));
    setRotation((prev) => prev + target);
    setTimeout(() => {
      setPickedEntry(active[winnerIdx]);
      setWinningIdx(visibleIdx);
      setOpen(true);
      setSpinning(false);
      bigBurst();
    }, 4200);
  };

  const pickedParticipant = pickedEntry
    ? participants.find((p) => p.id === pickedEntry.participantId)
    : null;
  const lastWinner = winners[winners.length - 1];

  const record = async () => {
    if (!pickedEntry || !pickedParticipant) return;
    await eventService.recordWinner({
      entryId: pickedEntry.id,
      ticketNumber: pickedEntry.ticketNumber,
      winnerName: pickedParticipant.fullName,
      winnerPhone: pickedParticipant.phone,
      prizeLabel: prize.trim() || "Prize",
    });
    toast.success(`Winner recorded: ${pickedEntry.ticketNumber}`);
    setOpen(false);
    setPickedEntry(null);
    setWinningIdx(null);
    onWinnerRecorded();
  };

  if (entries.length === 0) {
    return (
      <div className="glass rounded-3xl p-10 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-mustard mb-2" />
        <div className="font-semibold text-caley-navy">No giveaway tickets yet</div>
        <p className="text-sm text-muted-foreground mt-1">Once participants complete 3 referrals, their tickets show up here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top summary bar */}
      <div className="grid gap-3 sm:grid-cols-3 glass rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-caley-blue/10 text-caley-blue">
            <TicketIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Active tickets</div>
            <div className="text-2xl font-black text-caley-navy tabular-nums">{active.length}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-mustard/20 text-caley-navy">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Winners selected</div>
            <div className="text-2xl font-black text-caley-navy tabular-nums">{winners.length}</div>
          </div>
        </div>
        <label className="flex items-center justify-between sm:justify-end gap-3 text-sm">
          <span className="text-caley-navy font-medium">Allow previous winners</span>
          <Switch checked={allowRepeat} onCheckedChange={setAllowRepeat} />
        </label>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
        <div>
          <div className="relative mx-auto aspect-square w-full max-w-[440px]">
            {/* Pointer */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-2 z-20">
              <div className="h-0 w-0 border-l-[14px] border-r-[14px] border-t-[22px] border-l-transparent border-r-transparent border-t-hotdog-red drop-shadow-md" />
            </div>

            {/* Outer ring frame */}
            <div className="absolute inset-0 rounded-full p-[6px] bg-gradient-to-br from-caley-navy to-caley-blue shadow-[0_30px_60px_-20px_rgba(11,42,74,0.45)]">
              <motion.div
                ref={wheelRef}
                animate={{ rotate: rotation }}
                transition={{ duration: 4, ease: [0.17, 0.67, 0.16, 0.99] }}
                className="relative h-full w-full rounded-full overflow-hidden"
                style={{
                  background: `conic-gradient(${segmentsShown
                    .map((_, i) => `${PALETTE[i % PALETTE.length].bg} ${i * segAngle}deg ${(i + 1) * segAngle}deg`)
                    .join(",")})`,
                }}
              >
                {/* Thin separator lines between segments */}
                {segmentsShown.map((_, i) => (
                  <div
                    key={`sep-${i}`}
                    className="absolute left-1/2 top-0 h-1/2 w-px bg-white/40 origin-bottom"
                    style={{ transform: `translateX(-0.5px) rotate(${i * segAngle}deg)` }}
                  />
                ))}

                {/* Radial labels (ticket # + first name) */}
                {segmentsShown.map((e, i) => {
                  const angle = i * segAngle + segAngle / 2;
                  const palette = PALETTE[i % PALETTE.length];
                  const p = participants.find((pp) => pp.id === e.participantId);
                  const name = firstName(p?.fullName);
                  return (
                    <div
                      key={e.id}
                      className="absolute left-1/2 top-1/2"
                      style={{
                        transform: `translate(-50%, -100%) rotate(${angle}deg)`,
                        transformOrigin: "50% 100%",
                        height: "50%",
                        width: "1px",
                      }}
                    >
                      <div
                        className="absolute left-1/2 -translate-x-1/2"
                        style={{
                          top: "10%",
                          color: palette.text === "white" ? "#fff" : "#0B2A4A",
                          textShadow: palette.text === "white" ? "0 1px 2px rgba(0,0,0,0.35)" : "none",
                          textAlign: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <div
                          className="font-black tabular-nums leading-none"
                          style={{ fontSize: segCount <= 8 ? 13 : segCount <= 12 ? 11 : 10 }}
                        >
                          {e.ticketNumber}
                        </div>
                        {showNames && name && (
                          <div
                            className="font-semibold opacity-90 leading-none mt-1"
                            style={{ fontSize: segCount <= 8 ? 11 : 9 }}
                          >
                            {name.length > 10 ? name.slice(0, 9) + "…" : name}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Winning segment glow overlay */}
                {winningIdx !== null && !spinning && (
                  <div
                    aria-hidden
                    className="absolute left-1/2 top-1/2 h-1/2 origin-bottom pointer-events-none animate-pulse"
                    style={{
                      width: `${Math.tan((segAngle / 2) * Math.PI / 180) * 100}%`,
                      transform: `translate(-50%, -100%) rotate(${winningIdx * segAngle + segAngle / 2}deg)`,
                      background: "linear-gradient(to top, transparent, color-mix(in oklab, white 75%, transparent))",
                      mixBlendMode: "overlay",
                    }}
                  />
                )}
              </motion.div>
            </div>

            {/* Center hub + Spin button */}
            <button
              onClick={onSpin}
              disabled={spinning || active.length === 0}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-24 w-24 rounded-full gradient-brand text-white font-black text-lg shadow-glow disabled:opacity-60 border-4 border-white transition-transform active:scale-95"
            >
              {spinning ? "…" : "SPIN"}
            </button>
          </div>

          {entries.length > segmentsShown.length && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Wheel shows {segmentsShown.length} of {active.length} active tickets — winner is drawn randomly from all active tickets.
            </p>
          )}
        </div>

        {/* Side panel (desktop) */}
        <aside className="space-y-3">
          <div className="glass rounded-2xl p-4">
            <div className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Last winner</div>
            {lastWinner ? (
              <div className="mt-2 space-y-1">
                <Badge className="bg-warm-orange text-white">{lastWinner.ticketNumber}</Badge>
                <div className="font-semibold text-caley-navy">{lastWinner.winnerName}</div>
                <div className="text-xs text-muted-foreground">{lastWinner.prizeLabel}</div>
              </div>
            ) : (
              <div className="mt-2 text-sm text-muted-foreground">No winners yet. Spin the wheel to draw one.</div>
            )}
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-2">How it works</div>
            <ol className="text-xs text-caley-navy/80 space-y-1 list-decimal list-inside">
              <li>Press SPIN to randomly draw an active ticket.</li>
              <li>Confirm the prize, then record the winner.</li>
              <li>Toggle “Allow previous winners” to include them again.</li>
            </ol>
          </div>
        </aside>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <Trophy className="h-5 w-5 text-mustard" /> We have a winner!
            </DialogTitle>
          </DialogHeader>
          {pickedEntry && (
            <div className="space-y-4 text-center">
              <div className="text-3xl font-black text-gradient-warm">{pickedEntry.ticketNumber}</div>
              <div className="text-sm">
                <div className="font-semibold">{pickedParticipant?.fullName ?? "—"}</div>
                <div className="text-muted-foreground">{pickedParticipant?.phone}</div>
              </div>
              <div className="text-left">
                <Label htmlFor="prize">Prize</Label>
                <Input id="prize" value={prize} onChange={(e) => setPrize(e.target.value)} className="mt-1" />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["Hoodie", "Cash Prize", "Other"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPrize(p)}
                      className="text-xs rounded-full bg-muted px-3 py-1 hover:bg-secondary"
                    >{p}</button>
                  ))}
                </div>
              </div>
              <Button onClick={record} className="w-full gradient-brand text-white">Record Winner</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}