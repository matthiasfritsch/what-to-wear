import { Shirt } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function WardrobePage() {
  return (
    <>
      <PageHeader title="Schrank" />
      <EmptyState
        icon={Shirt}
        title="Noch keine Teile"
        text="In Schritt 2 kommt hier der Upload für freigestellte PNG- und WebP-Bilder dazu."
      />
    </>
  );
}
