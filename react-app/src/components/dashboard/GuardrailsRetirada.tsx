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

interface Guardrail {
  id: string
  guardrail: string
  condicao: string
  acao: string
  prioridade: "EXPANSIVO" | "MANTÉM" | "DEFESA"
}

interface GuardrailsRetiradaProps {
  guardrails: Guardrail[]
}

const priorityVariants = {
  EXPANSIVO: "bg-green-500/20 text-green-400 border-green-500/30",
  MANTÉM: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  DEFESA: "bg-red-500/20 text-red-400 border-red-500/30",
} as const

const rowBackgroundVariants = {
  EXPANSIVO: "bg-green-500/5 hover:bg-green-500/10",
  MANTÉM: "bg-blue-500/5 hover:bg-blue-500/10",
  DEFESA: "bg-red-500/5 hover:bg-red-500/10",
} as const

export function GuardrailsRetirada({ guardrails }: GuardrailsRetiradaProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="border-l-4 border-blue-500 rounded-lg bg-card p-6">
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 hover:opacity-80">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Guardrails de Retirada</h2>
            <ChevronDown
              className={cn(
                "h-5 w-5 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </CollapsibleTrigger>

        <p className="mt-2 text-xs text-muted-foreground">
          Regras de decisão: ajuste spending baseado em P(FIRE) e volatilidade
        </p>

        <CollapsibleContent className="mt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Guardrail</TableHead>
                  <TableHead className="text-xs">Condição</TableHead>
                  <TableHead className="text-xs">Ação</TableHead>
                  <TableHead className="text-xs text-right w-24">Prioridade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guardrails.map((guardrail) => (
                  <TableRow
                    key={guardrail.id}
                    className={cn(
                      "transition-colors",
                      rowBackgroundVariants[guardrail.prioridade]
                    )}
                  >
                    <TableCell>
                      <span className="font-medium text-sm">{guardrail.guardrail}</span>
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {guardrail.condicao}
                    </TableCell>
                    <TableCell className="text-sm">{guardrail.acao}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-mono text-xs",
                          priorityVariants[guardrail.prioridade]
                        )}
                      >
                        {guardrail.prioridade}
                      </Badge>
                    </TableCell>
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
