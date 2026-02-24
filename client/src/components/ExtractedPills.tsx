import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ExtractedPills({
  label,
  items,
  emptyText,
  className,
}: {
  label: string;
  items: string[];
  emptyText?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-xs font-semibold tracking-tight text-muted-foreground">{label}</div>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground">{emptyText || "None detected"}</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((x, idx) => (
            <Badge key={`${label}-${idx}`} variant="secondary">
              {x}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
