import { motion } from "framer-motion";

export function AnimatedTicket({
  ticketNumber,
  name,
}: {
  ticketNumber: string;
  name?: string;
}) {
  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0, rotate: -3 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 16 }}
      className="ticket-shine relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl gradient-brand p-1 shadow-glow"
    >
      <div className="rounded-[1.4rem] bg-white p-6 text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-caley-blue">
          Caley Hot Dog Giveaway
        </div>
        <div className="my-3 border-y border-dashed border-border py-4">
          <div className="text-xs text-muted-foreground">Ticket Number</div>
          <div className="mt-1 text-4xl font-black tracking-tight text-gradient-brand">
            {ticketNumber}
          </div>
        </div>
        {name && (
          <div className="text-sm text-foreground">
            <span className="text-muted-foreground">Participante:</span>{" "}
            <strong>{name}</strong>
          </div>
        )}
        <div className="mt-4 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>🌭 Event Day</span>
          <span>Caley Insurance</span>
        </div>
      </div>
    </motion.div>
  );
}