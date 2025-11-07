import { Badge } from "@/components/ui/badge"
import type { MeetingStatus } from "@/lib/types"

interface StatusBadgeProps {
  status: MeetingStatus | undefined | null
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // Debug logging to understand what status values are being received
  if (process.env.NODE_ENV === 'development' && !status) {
    console.warn('StatusBadge received undefined/null status:', status);
  }

  const variants: Record<MeetingStatus, { label: string; className: string }> = {
    awaiting_inputs: {
      label: "Awaiting Inputs",
      className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    },
    running: {
      label: "Running",
      className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    },
    paused: {
      label: "Paused",
      className: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
    },
    completed: {
      label: "Completed",
      className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    },
  }

  const variant = (status && variants[status]) || {
    label: status ? "Unknown" : "No Status",
    className: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  }

  return (
    <Badge variant="outline" className={variant.className}>
      {variant.label}
    </Badge>
  )
}
