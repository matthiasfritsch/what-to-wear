import { PageHeader } from "@/components/layout/PageHeader";
import { getDb, schema } from "@/db";

// Immer frisch aus der Datenbank lesen, nicht beim Build einfrieren.
export const dynamic = "force-dynamic";

export default function ProfilePage() {
  const members = getDb().select().from(schema.members).all();

  return (
    <>
      <PageHeader title="Profil" />
      <section className="px-gutter py-section">
        <h2 className="pb-2 text-footnote font-medium text-secondary">Haushalt</h2>
        <ul className="divide-y divide-subtle overflow-hidden rounded-card bg-surface-sunken">
          {members.map((m) => (
            <li key={m.id} className="flex min-h-14 items-center px-4 text-body">
              {m.name}
            </li>
          ))}
        </ul>
        <p className="pt-3 text-footnote text-tertiary">Login pro Person und Style-Profil folgen in den nächsten Schritten.</p>
      </section>
    </>
  );
}
