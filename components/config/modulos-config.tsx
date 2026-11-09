"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useModulos } from "@/lib/modulos-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  ShoppingCart,
  UtensilsCrossed,
  Truck,
  FileText,
  ClipboardList,
  MessageCircle,
  Calendar,
  Wallet,
  Package,
  Building2,
  Users,
  BarChart3,
  FileSpreadsheet,
  Grid3X3,
  Printer,
  Database,
  CreditCard,
  UserCog,
} from "lucide-react"

interface ModuloItemProps {
  id: string
  label: string
  description: string
  icon: React.ElementType
  enabled: boolean
  onToggle: (enabled: boolean) => void
  badge?: string
}

function ModuloItem({ id, label, description, icon: Icon, enabled, onToggle, badge }: ModuloItemProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Label htmlFor={id} className="font-medium cursor-pointer">
              {label}
            </Label>
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch
        id={id}
        checked={enabled}
        onCheckedChange={onToggle}
      />
    </div>
  )
}

export function ModulosConfig() {
  const { modulos, updateModulos, loading } = useModulos()
  const [saving, setSaving] = useState(false)

  const handleToggle = async (key: string, value: boolean) => {
    setSaving(true)
    try {
      await updateModulos({ [key]: value })
      toast.success(`Módulo ${value ? "ativado" : "desativado"} com sucesso`)
    } catch (error) {
      toast.error("Erro ao atualizar módulo")
    } finally {
      setSaving(false)
    }
  }

  if (loading || !modulos) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const modulosBasicos = [
    {
      id: "pdv",
      label: "PDV - Ponto de Venda",
      description: "Sistema de caixa para vendas diretas e supermercados",
      icon: ShoppingCart,
      enabled: modulos.pdv,
    },
    {
      id: "estoque",
      label: "Controle de Estoque",
      description: "Gerenciamento de inventário e movimentações",
      icon: Package,
      enabled: modulos.estoque,
    },
    {
      id: "financeiro",
      label: "Financeiro",
      description: "Controle de contas a pagar e receber",
      icon: Wallet,
      enabled: modulos.financeiro,
    },
    {
      id: "faturamento",
      label: "Faturamento",
      description: "Emissão de notas fiscais e faturas",
      icon: FileText,
      enabled: modulos.faturamento,
    },
  ]

  const modulosRestaurante = [
    {
      id: "restaurante",
      label: "Restaurante",
      description: "Módulo completo para gestão de restaurantes com mesas",
      icon: UtensilsCrossed,
      enabled: modulos.restaurante,
      badge: "Avançado",
    },
    {
      id: "controle_mesas",
      label: "Controle de Mesas",
      description: "Visualização e gestão de mesas do estabelecimento",
      icon: Grid3X3,
      enabled: modulos.controle_mesas,
    },
    {
      id: "comandas",
      label: "Comandas",
      description: "Sistema de comandas para pedidos",
      icon: ClipboardList,
      enabled: modulos.comandas,
    },
    {
      id: "delivery",
      label: "Delivery",
      description: "Gestão de pedidos para entrega",
      icon: Truck,
      enabled: modulos.delivery,
      badge: "Avançado",
    },
  ]

  const modulosAvancados = [
    {
      id: "multiempresa",
      label: "Multi-empresa",
      description: "Gerenciar múltiplas empresas no mesmo sistema",
      icon: Building2,
      enabled: modulos.multiempresa,
      badge: "Premium",
    },
    {
      id: "multiusuario",
      label: "Multi-usuário",
      description: "Múltiplos usuários com permissões",
      icon: Users,
      enabled: modulos.multiusuario,
      badge: "Premium",
    },
    {
      id: "dashboard_avancado",
      label: "Dashboard Avançado",
      description: "Relatórios e gráficos detalhados",
      icon: BarChart3,
      enabled: modulos.dashboard_avancado,
    },
    {
      id: "relatorios_premium",
      label: "Relatórios Premium",
      description: "Relatórios avançados e exportação",
      icon: FileSpreadsheet,
      enabled: modulos.relatorios_premium,
      badge: "Premium",
    },
  ]

  const modulosIntegracoes = [
    {
      id: "nfce_fatura",
      label: "NFC-e / Fatura Eletrônica",
      description: "Emissão de documentos fiscais eletrônicos",
      icon: FileText,
      enabled: modulos.nfce_fatura,
    },
    {
      id: "impressao_termica",
      label: "Impressão Térmica",
      description: "Suporte a impressoras térmicas",
      icon: Printer,
      enabled: modulos.impressao_termica,
    },
    {
      id: "backup_automatico",
      label: "Backup Automático",
      description: "Backup automático dos dados",
      icon: Database,
      enabled: modulos.backup_automatico,
    },
    {
      id: "integracao_bancaria",
      label: "Integração Bancária",
      description: "Conexão com bancos e pagamentos",
      icon: CreditCard,
      enabled: modulos.integracao_bancaria,
      badge: "Premium",
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      description: "Integração com WhatsApp Business",
      icon: MessageCircle,
      enabled: modulos.whatsapp,
      badge: "Premium",
    },
    {
      id: "agendamentos",
      label: "Agendamentos",
      description: "Sistema de agendamento de serviços",
      icon: Calendar,
      enabled: modulos.agendamentos,
    },
    {
      id: "gestao_funcionarios",
      label: "Gestão de Funcionários",
      description: "Controle de funcionários e comissões",
      icon: UserCog,
      enabled: modulos.gestao_funcionarios,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Configuração de Módulos</h2>
        <p className="text-muted-foreground">
          Ative ou desative os módulos do sistema conforme sua necessidade
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Módulos Básicos</CardTitle>
            <CardDescription>Funcionalidades essenciais do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {modulosBasicos.map((modulo) => (
              <ModuloItem
                key={modulo.id}
                {...modulo}
                onToggle={(value) => handleToggle(modulo.id, value)}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Módulos para Restaurante</CardTitle>
            <CardDescription>Funcionalidades específicas para restaurantes e bares</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {modulosRestaurante.map((modulo) => (
              <ModuloItem
                key={modulo.id}
                {...modulo}
                onToggle={(value) => handleToggle(modulo.id, value)}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Módulos Avançados</CardTitle>
            <CardDescription>Funcionalidades avançadas para maior controle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {modulosAvancados.map((modulo) => (
              <ModuloItem
                key={modulo.id}
                {...modulo}
                onToggle={(value) => handleToggle(modulo.id, value)}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrações</CardTitle>
            <CardDescription>Conecte com serviços externos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {modulosIntegracoes.map((modulo) => (
              <ModuloItem
                key={modulo.id}
                {...modulo}
                onToggle={(value) => handleToggle(modulo.id, value)}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
