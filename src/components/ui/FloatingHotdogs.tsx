import { motion } from "framer-motion";

/**
 * Custom vector hotdog — a clean flat illustration used as a drifting brand
 * motif in the hero background. Pure decoration (aria-hidden upstream).
 */
function Hotdog({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 120" className={className} fill="none">
      {/* bottom bun */}
      <rect x="8" y="54" width="224" height="50" rx="25" fill="#E7A75A" />
      {/* sausage — slightly longer so the ends peek past the bun */}
      <rect x="14" y="36" width="212" height="40" rx="20" fill="#C24A2C" />
      {/* sausage sheen */}
      <rect x="30" y="43" width="150" height="7" rx="3.5" fill="#FFFFFF" opacity="0.18" />
      {/* mustard zigzag */}
      <path
        d="M34 56 L58 44 L82 56 L106 44 L130 56 L154 44 L178 56 L202 46"
        stroke="#F5C636"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* top bun edge */}
      <rect x="8" y="54" width="224" height="14" rx="7" fill="#D9954A" opacity="0.55" />
    </svg>
  );
}

export function FloatingHotdogs() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* large, soft — drifts slowly across the upper right */}
      <motion.div
        className="absolute right-[2%] top-[8%] w-64 opacity-[0.10] blur-[2px] drop-shadow-[0_30px_60px_rgba(0,0,0,0.4)] sm:w-80 lg:w-[26rem]"
        animate={{ x: [0, -90, -40, 30, 0], y: [0, 50, 120, 60, 0], rotate: [-12, -4, -9, -2, -12] }}
        transition={{ duration: 42, repeat: Infinity, ease: "easeInOut" }}
      >
        <Hotdog />
      </motion.div>

      {/* medium, crisp — roams the lower left */}
      <motion.div
        className="absolute left-[2%] bottom-[12%] w-44 opacity-[0.14] sm:w-56 lg:w-72"
        animate={{ x: [0, 120, 60, 150, 0], y: [0, -70, -130, -50, 0], rotate: [10, 3, 8, 2, 10] }}
        transition={{ duration: 50, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      >
        <Hotdog />
      </motion.div>

      {/* small accent — wanders the upper left (desktop) */}
      <motion.div
        className="absolute left-[12%] top-[16%] hidden w-28 opacity-[0.12] lg:block"
        animate={{ x: [0, 70, 130, 40, 0], y: [0, 90, 40, 130, 0], rotate: [-4, 5, -2, 6, -4] }}
        transition={{ duration: 38, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      >
        <Hotdog />
      </motion.div>
    </div>
  );
}
