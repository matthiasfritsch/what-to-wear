"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shirt, Sparkles, UserRound } from "lucide-react";

// Navigation unten: mit dem Daumen erreichbar, auch mit einer Hand.
const TABS = [
  { href: "/", label: "Heute", icon: Sparkles },
  { href: "/schrank", label: "Schrank", icon: Shirt },
  { href: "/profil", label: "Profil", icon: UserRound },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-app border-t border-subtle bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      aria-label="Hauptnavigation"
    >
      <ul className="flex h-tabbar">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-caption font-medium transition-colors duration-150 ${
                  active ? "text-primary" : "text-tertiary"
                }`}
              >
                <Icon size={24} strokeWidth={active ? 2 : 1.5} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
