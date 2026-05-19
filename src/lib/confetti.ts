import confetti from "canvas-confetti";

export function burst() {
  confetti({
    particleCount: 90,
    spread: 75,
    origin: { y: 0.7 },
    colors: ["#1d3a73", "#3b82f6", "#fbbf24", "#ef4444", "#fb923c"],
  });
}

export function bigBurst() {
  const end = Date.now() + 800;
  const colors = ["#1d3a73", "#3b82f6", "#fbbf24", "#ef4444", "#fb923c"];
  (function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}