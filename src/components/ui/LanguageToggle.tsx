import { Languages } from "lucide-react";
import { useLanguage, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const OPTIONS: Lang[] = ["es", "en"];

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("lang.label")}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-white/20 bg-white/10 p-0.5 backdrop-blur-md",
        className,
      )}
    >
      <Languages aria-hidden className="ml-1 mr-0.5 h-3.5 w-3.5 text-white/70" />
      {OPTIONS.map((option) => {
        const active = lang === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLang(option)}
            aria-pressed={active}
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider transition-colors",
              active
                ? "bg-white text-caley-navy"
                : "text-white/70 hover:text-white",
            )}
          >
            {t(option === "es" ? "lang.es" : "lang.en")}
          </button>
        );
      })}
    </div>
  );
}
