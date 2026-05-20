"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Mesa, MesaItem, Produto, MesaItemWithProduto } from "@/lib/database.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Users, Clock, DollarSign, UtensilsCrossed } from "lucide-react"
import { MesaDetail } from "./mesa-detail"

export function MesasGrid() {
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [mesasItens, setMesasItens] = useState<Record<string, MesaItemWithProduto[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchMesas()

    // Real-time subscription
    const channel = supabase
      .channel("mesas-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mesas" },
        () => fetchMesas()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mesa_itens" },
        () => fetchMesas()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchMesas = async () => {
    try {
      const { data: mesasData, error: mesasError } = await supabase
        .from("mesas")
        .select("*")
        .order("numero")

      if (mesasError) throw mesasError

      // Buscar itens de todas as mesas ocupadas
      const { data: itensData, error: itensError } = await supabase
        .from("mesa_itens")
        .select("*, produtos(*)")
        .neq("status", "pago")

      if (itensError) throw itensError

      // Organizar itens por mesa
      const itensPorMesa: Record<string, MesaItemWithProduto[]> = {}
      itensData?.forEach((item) => {
        if (!itensPorMesa[item.mesa_id]) {
          itensPorMesa[item.mesa_id] = []
        }
        itensPorMesa[item.mesa_id].push(item as MesaItemWithProduto)
      })

      setMesas(mesasData || [])
      setMesasItens(itensPorMesa)
    } catch (error) {
      console.error("Erro ao carregar mesas:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalMesa = (mesaId: string) => {
    const itens = mesasItens[mesaId] || []
    return itens.reduce((total, item) => {
      return total + (item.quantidade * item.preco_unitario - item.desconto)
    }, 0)
  }

  const getItensCount = (mesaId: string) => {
    return (mesasItens[mesaId] || []).length
  }

  const getStatusColor = (status: Mesa["status"]) => {
    switch (status) {
      case "livre":
        return "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20"
      case "ocupada":
        return "bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20"
      case "reservada":
        return "bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20"
      case "conta":
        return "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20"
      default:
        return ""
    }
  }

  const getStatusLabel = (status: Mesa["status"]) => {
    switch (status) {
      case "livre":
        return "Livre"
      case "ocupada":
        return "Ocupada"
      case "reservada":
        return "Reservada"
      case "conta":
        return "Aguardando Conta"
      default:
        return status
    }
  }

  const getStatusBadgeVariant = (status: Mesa["status"]) => {
    switch (status) {
      case "livre":
        return "default"
      case "ocupada":
        return "secondary"
      case "reservada":
        return "outline"
      case "conta":
        return "destructive"
      default:
        return "default"
    }
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (selectedMesa) {
    return (
      <MesaDetail
        mesa={selectedMesa}
        itens={mesasItens[selectedMesa.id] || []}
        onClose={() => {
          setSelectedMesa(null)
          fetchMesas()
        }}
        onUpdate={fetchMesas}
      />
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Controle de Mesas</h2>
          <p className="text-muted-foreground">
            Clique em uma mesa para gerenciar os pedidos
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm">Livre</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-sm">Ocupada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm">Reservada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-sm">Conta</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {mesas.map((mesa) => {
          const total = getTotalMesa(mesa.id)
          const itensCount = getItensCount(mesa.id)

          return (
            <Card
              key={mesa.id}
              className={cn(
                "cursor-pointer transition-all border-2",
                getStatusColor(mesa.status)
              )}
              onClick={() => setSelectedMesa(mesa)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5" />
                    <span className="font-bold text-lg">Mesa {mesa.numero}</span>
                  </div>
                  <Badge variant={getStatusBadgeVariant(mesa.status)}>
                    {getStatusLabel(mesa.status)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{mesa.capacidade} lugares</span>
                  </div>

                  {mesa.status === "ocupada" && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{itensCount} itens</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-primary">{formatPrice(total)}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
