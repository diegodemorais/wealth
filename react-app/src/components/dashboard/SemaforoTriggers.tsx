"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { StatusDot } from "./StatusDot"

interface Trigger {
  id: string
  label: string
  category: "taxa" | "posicao" | "crypto"
  status: "verde" | "amarelo" | "vermelho"
  valor: number
  unidade: string
  piso?: number
  gap: number
  posicao_r: number
  acao: string
  detalhe: string
}

interface SemaforoTriggersProps {
  triggers: Trigger[]
}

const categoryBadgeVariants = {
  taxa: "taxa",
  posicao: "posicao",
  crypto: "crypto",
} as const

export function SemaforoTriggers({ triggers }: SemaforoTriggersProps) {
  const [isOpen, setIsOpen] = useState(true)

  // Count status for summary
  const verdeCount = triggers.filter((t) => t.status === "verde").length
  const amareloCount = triggers.filter((t) => t.status === "amarelo").length
  const vermelhoCount = triggers.filter((t) => t.status === "vermelho").length

  const summaryBadge =
    vermelhoCount > 0 ? "vermelho" : amareloCount > 0 ? "amarelo" : "verde"

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="border-l-4 border-yellow-500 rounded-lg bg-card p-6">
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 hover:opacity-80">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Semáforos de Gatilhos</h2>
            <ChevronDown
              className={cn(
                "h-5 w-5 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </CollapsibleTrigger>

        <div className="mt-3 flex items-center gap-2">
          <StatusDot status={summaryBadge} size="sm" />
          <span className="text-xs text-muted-foreground">
            {triggers.length} gatilhos monitorados · {vermelhoCount} vermelho ·{" "}
            {amareloCount} amarelo · {verdeCount} verde
          </span>
        </div>

        <CollapsibleContent className="mt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Gatilho</TableHead>
                  <TableHead className="text-xs w-20">Status</TableHead>
                  <TableHead className="text-xs text-right w-32">
                    Valor
                  </TableHead>
                  <TableHead className="text-xs">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {triggers.map((trigger) => (
                  <TableRow
                    key={trigger.id}
                    className={cn(
                      "transition-colors",
                      trigger.status === "vermelho" &&
                        "hover:bg-red-500/5 bg-red-500/2",
                      trigger.status === "amarelo" &&
                        "hover:bg-yellow-500/5 bg-yellow-500/2",
                      trigger.status === "verde" &&
                        "hover:bg-green-500/5 bg-green-500/2"
                    )}
                  >
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {trigger.label}
                          </span>
                          <Badge variant={categoryBadgeVariants[trigger.category]}>
                            {trigger.category}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {trigger.detalhe}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusDot status={trigger.status} size="sm" />
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {trigger.valor.toFixed(2)}
                      {trigger.unidade}
                      {trigger.piso !== undefined && (
                        <div className="text-xs text-muted-foreground">
                          piso {trigger.piso.toFixed(1)}%
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{trigger.acao}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
