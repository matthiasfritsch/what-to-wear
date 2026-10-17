import { ChevronRight, type LucideIcon } from "lucide-react";

type ListRowProps = {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  /** "placeholder" zeigt den Wert grau, z. B. "Hinzufügen" solange nichts gewählt ist. */
  valueTone?: "default" | "placeholder";
  onClick?: () => void;
};

/**
 * Zeile mit Icon, Label, Wert und Chevron.
 * Referenz: "Date · Today ›", "Occasion · 👔 Work ›".
 */
export function ListRow({ icon: Icon, label, value, valueTone = "default", onClick }: ListRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 w-full items-center gap-3 px-gutter text-left transition-colors duration-150 active:bg-surface-pressed"
    >
      <Icon size={24} strokeWidth={1.5} className="shrink-0 text-primary" aria-hidden />
      <span className="flex-1 text-body">{label}</span>
      <span className={`text-body ${valueTone === "placeholder" ? "text-tertiary" : "font-semibold text-primary"}`}>
        {value}
      </span>
      <ChevronRight size={20} strokeWidth={1.5} className="shrink-0 text-tertiary" aria-hidden />
    </button>
  );
}
