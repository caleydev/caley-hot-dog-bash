export function EventBadge({
  children,
  tone = "navy",
  icon,
}: {
  children: React.ReactNode;
  tone?: "navy" | "warm";
  icon?: React.ReactNode;
}) {
  const dotClass = tone === "warm" ? "bg-hotdog-red" : "bg-caley-blue";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full glass-strong px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-caley-navy">
      {icon ?? <span className={`h-1.5 w-1.5 rounded-full ${dotClass} animate-pulse`} />}
      {children}
    </span>
  );
}