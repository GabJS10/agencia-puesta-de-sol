import { Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_META, isHolding, type RequestStatus } from "@/lib/request-status";
import { formatRemaining, hoursUntil } from "@/lib/format-dates";

export function StatusBadge({
  status,
  className,
}: {
  status: RequestStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-extrabold",
        meta.className,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}

/** "Aparta cupo · vence en 23 h" mientras la solicitud está apartando cupo. */
export function HoldBadge({
  status,
  holdExpiresAt,
}: {
  status: RequestStatus;
  holdExpiresAt: Date | null;
}) {
  if (!holdExpiresAt || !isHolding(status, holdExpiresAt)) return null;
  const soon = hoursUntil(holdExpiresAt) < 24;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold",
        soon ? "text-brasa" : "text-muted-foreground",
      )}
    >
      <Hourglass className="h-3 w-3" />
      Aparta cupo · vence en {formatRemaining(holdExpiresAt)}
    </span>
  );
}
