"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ShoppingCart, 
  DollarSign, 
  Package, 
  Users, 
  TrendingUp, 
  Calendar,
  UtensilsCrossed,
  Truck
} from "lucide-react"

interface DashboardStats {
  vendasHoje: number
  totalHoje: number
  produtosAtivos: number
  clientesTotal: number
  mesasOcupadas: number
  pedidosPendentes: number
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    vendasHoje: 0,
    totalHoje: 0,
    produtosAtivos: 0,
    clientesTotal: 0,
    mesasOcupadas: 0,
    pedidosPendentes: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)

      const [vendasRes, produtosRes, clientesRes, mesasRes] = await Promise.all([
        supabase
          .from("vendas")
          .select("total")
          .gte("created_at", hoje.toISOString())
          .eq("status", "finalizada"),
        supabase
          .from("produtos")
          .select("id", { count: "exact" })
          .eq("ativo", true),
        supabase
          .from("clientes")
          .select("id", { count: "exact" }),
        supabase
          .from("mesas")
          .select("status"),
      ])

      const vendasHoje = vendasRes.data?.length || 0
      const totalHoje = vendasRes.data?.reduce((sum, v) => sum + v.total, 0) || 0
      const mesasOcupadas = mesasRes.data?.filter(m => m.status === "ocupada").length || 0

      setStats({
        vendasHoje,
        totalHoje,
        produtosAtivos: produtosRes.count || 0,
        clientesTotal: clientesRes.count || 0,
        mesasOcupadas,
        pedidosPendentes: 0,
      })
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral do seu negócio
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vendasHoje}</div>
            <p className="text-xs text-muted-foreground">vendas realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatPrice(stats.totalHoje)}
            </div>
            <p className="text-xs text-muted-foreground">em vendas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.produtosAtivos}</div>
            <p className="text-xs text-muted-foreground">produtos ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clientesTotal}</div>
            <p className="text-xs text-muted-foreground">cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mesas Ocupadas</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mesasOcupadas}</div>
            <p className="text-xs text-muted-foreground">em atendimento</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atalhos Rápidos</CardTitle>
            <CardDescription>Acesse as funções mais utilizadas</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <a href="/?section=pdv" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <span className="font-medium">Abrir PDV</span>
            </a>
            <a href="/?section=mesas" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              <span className="font-medium">Ver Mesas</span>
            </a>
            <a href="/?section=produtos" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors">
              <Package className="h-5 w-5 text-primary" />
              <span className="font-medium">Produtos</span>
            </a>
            <a href="/?section=modulos" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-medium">Configurar</span>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
            <CardDescription>Dados do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Data</span>
              <span className="font-medium">
                {new Date().toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Hora</span>
              <span className="font-medium">
                {new Date().toLocaleTimeString("pt-BR")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Versão</span>
              <span className="font-medium">GestorX v1.0</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
