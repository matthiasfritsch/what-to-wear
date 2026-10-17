import type { Metadata, Viewport } from "next";
import { TabBar } from "@/components/layout/TabBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "What to wear",
  description: "Outfit-Vorschläge aus dem eigenen Kleiderschrank",
  appleWebApp: { capable: true, title: "What to wear", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // "cover": Inhalt darf bis unter Notch und Home-Indicator laufen,
  // die Abstände regeln wir selbst über env(safe-area-inset-*).
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        {/* Auf großen Screens bleibt die App handybreit und mittig. */}
        <div className="mx-auto flex min-h-dvh max-w-app flex-col">
          <main className="flex-1 pb-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom))]">{children}</main>
          <TabBar />
        </div>
      </body>
    </html>
  );
}
