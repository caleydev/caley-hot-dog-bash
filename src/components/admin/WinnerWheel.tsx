import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { eventService } from "@/services/eventService";
import type { GiveawayEntry, Participant, Winner } from "@/types/event";
import { bigBurst } from "@/lib/confetti";
import { toast } from "sonner";

const COLORS = ["#1d3a73", "#3b82f6", "#fbbf24", "#ef4444", "#fb923c", "#22c55e"];

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
  const [prize, setPrize] = useState("Hoodie");
  const [open, setOpen] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const wonTickets = useMemo(() => new Set(winners.map((w) => w.ticketNumber)), [winners]);
  const active = useMemo(
    () => entries.filter((e) => allowRepeat || !wonTickets.has(e.ticketNumber)),
    [entries, wonTickets, allowRepeat],
  );

  const segmentsShown = active.slice(0, 12);
  const segCount = Math.max(segmentsShown.length, 1);
  const segAngle = 360 / segCount;

  const onSpin = () => {
    if (active.length === 0 || spinning) return;
    setSpinning(true);
    const winnerIdx = Math.floor(Math.random() * active.length);
    const visibleIdx = winnerIdx < segmentsShown.length ? winnerIdx : Math.floor(Math.random() * segmentsShown.length);
    const turns = 6;
    const target = 360 * turns + (360 - (visibleIdx * segAngle + segAngle / 2));
    setRotation((prev) => prev + target);
    setTimeout(() => {
      setPickedEntry(active[winnerIdx]);
      setOpen(true);
      setSpinning(false);
      bigBurst();
    }, 4200);
  };

  const pickedParticipant = pickedEntry
    ? participants.find((p) => p.id === pickedEntry.participantId)
    : null;

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
    onWinnerRecorded();
  };

  if (entries.length === 0) {
    return (
      <div className="glass rounded-3xl p-10 text-center text-muted-foreground">
        No giveaway tickets yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-warm-orange" />
          <div>
            <div className="font-semibold">Active tickets: {active.length}</div>
            <div className="text-xs text-muted-foreground">{winners.length} winners recorded so far</div>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={allowRepeat} onCheckedChange={setAllowRepeat} />
          Allow previous winners
        </label>
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-md">
        {/* Pointer */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-1 z-10">
          <div className="h-0 w-0 border-l-[14px] border-r-[14px] border-t-[22px] border-l-transparent border-r-transparent border-t-hotdog-red drop-shadow" />
        </div>
        <motion.div
          ref={wheelRef}
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.17, 0.67, 0.16, 0.99] }}
          className="absolute inset-0 rounded-full shadow-glow"
          style={{
            background: `conic-gradient(${segmentsShown
              .map((_, i) => `${COLORS[i % COLORS.length]} ${i * segAngle}deg ${(i + 1) * segAngle}deg`)
              .join(",")})`,
          }}
        >
          {segmentsShown.map((e, i) => {
            const angle = i * segAngle + segAngle / 2;
            return (
              <div
                key={e.id}
                className="absolute left-1/2 top-1/2 origin-bottom -translate-x-1/2 text-[10px] font-bold text-white"
                style={{
                  transform: `rotate(${angle}deg) translateY(-42%)`,
                  height: "50%",
                  textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                }}
              >
                {e.ticketNumber}
              </div>
            );
          })}
        </motion.div>
        <button
          onClick={onSpin}
          disabled={spinning || active.length === 0}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-24 w-24 rounded-full gradient-brand text-white font-bold shadow-glow disabled:opacity-60"
        >
          {spinning ? "..." : "SPIN"}
        </button>
      </div>

      {entries.length > segmentsShown.length && (
        <p className="text-center text-xs text-muted-foreground">
          Wheel shows a sample of {segmentsShown.length} tickets — winner is randomly drawn from all {active.length} active tickets.
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
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