import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-gutter py-16 text-center">
      <Icon size={40} strokeWidth={1.25} className="text-tertiary" aria-hidden />
      <p className="text-headline">{title}</p>
      <p className="max-w-72 text-footnote text-secondary">{text}</p>
    </div>
  );
}
