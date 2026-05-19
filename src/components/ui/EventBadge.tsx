export function EventBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs font-semibold text-caley-navy">
      <span className="h-1.5 w-1.5 rounded-full bg-warm-orange animate-pulse" />
      {children}
    </span>
  );
}