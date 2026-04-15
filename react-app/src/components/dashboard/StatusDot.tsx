import { cn } from "@/lib/utils"

interface StatusDotProps {
  status: "verde" | "amarelo" | "vermelho"
  size?: "sm" | "md"
  className?: string
}

const statusColors = {
  verde: "bg-green-500",
  amarelo: "bg-yellow-500",
  vermelho: "bg-red-500",
}

const statusLabels = {
  verde: "Verde",
  amarelo: "Amarelo",
  vermelho: "Vermelho",
}

const sizes = {
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
}

export function StatusDot({ status, size = "sm", className }: StatusDotProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "rounded-full",
          statusColors[status],
          sizes[size],
          className
        )}
      />
      <span className="text-xs">{statusLabels[status]}</span>
    </div>
  )
}
