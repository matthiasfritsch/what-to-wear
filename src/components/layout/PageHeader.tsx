// Seitentitel oben, zentriert wie in der Referenz ("Outfit suggestions").
export function PageHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-subtle bg-surface/90 pt-[env(safe-area-inset-top)] backdrop-blur">
      <h1 className="flex h-touch items-center justify-center px-gutter text-headline">{title}</h1>
    </header>
  );
}
