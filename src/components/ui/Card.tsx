// Helle, abgerundete Fläche. Basis für die Collage-Karten im 2×2-Grid.
export function Card({ className = "", children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`overflow-hidden rounded-card bg-surface-sunken ${className}`} {...rest}>
      {children}
    </div>
  );
}
