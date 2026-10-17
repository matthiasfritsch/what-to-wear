import { CalendarDays, Shirt, TicketCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";

/**
 * "Heute": Startscreen mit den Outfit-Vorschlägen.
 * Stand Schritt 1: Layout-Gerüst nach Referenz. Die Zeilen sind noch ohne Funktion,
 * die Karten noch leer. Collage kommt in Schritt 3, echte Vorschläge in Schritt 4.
 */
export default function TodayPage() {
  return (
    <>
      <PageHeader title="Outfit-Vorschläge" />

      <section className="py-2">
        <ListRow icon={CalendarDays} label="Datum" value="Heute" />
        <ListRow icon={TicketCheck} label="Anlass" value="👔 Arbeit" />
        <ListRow icon={Shirt} label="Teile einschließen" value="Hinzufügen" valueTone="placeholder" />
      </section>

      <section className="grid grid-cols-2 gap-3 px-gutter pb-section" aria-label="Vorschläge">
        {[1, 2, 3, 4].map((n) => (
          <Card key={n} className="flex aspect-collage items-center justify-center">
            <span className="text-footnote text-tertiary">Vorschlag {n}</span>
          </Card>
        ))}
      </section>
    </>
  );
}
