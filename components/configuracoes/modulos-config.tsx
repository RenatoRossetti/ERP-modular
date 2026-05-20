"use client"

import { useState } from 'react'
import { useGestorX } from '@/lib/context'
import { MODULOS_LABELS, ModulosAtivos } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart,
  UtensilsCrossed,
  Truck,
  ClipboardList,
  Calendar,
  MessageCircle,
  Wallet,
  Package,
  FileText,
  Building,
  Users,
  BarChart3,
  FileSpreadsheet,
  LayoutGrid,
  Printer,
  Cloud,
  Receipt,
  Landmark,
  UserCog
} from 'lucide-react'

const MODULOS_ICONS: Record<keyof ModulosAtivos, React.ElementType> = {
  pdv: ShoppingCart,
  restaurante: UtensilsCrossed,
  delivery: Truck,
  comandas: ClipboardList,
  agendamentos: Calendar,
  whatsapp: MessageCircle,
  financeiro: Wallet,
  estoque: Package,
  faturamento: FileText,
  multiempresa: Building,
  multiusuario: Users,
  dashboardAvancado: BarChart3,
  relatoriosPremium: FileSpreadsheet,
  controleMesas: LayoutGrid,
  impressaoTermica: Printer,
  backupAutomatico: Cloud,
  nfceFatura: Receipt,
  integracaoBancaria: Landmark,
  gestaoFuncionarios: UserCog,
}

const MODULOS_DESCRICAO: Record<keyof ModulosAtivos, string> = {
  pdv: 'Ponto de venda com vendas rápidas',
  restaurante: 'Gestão de mesas e pedidos',
  delivery: 'Controle de entregas',
  comandas: 'Comandas físicas e digitais',
  agendamentos: 'Agenda de serviços',
  whatsapp: 'Integração com WhatsApp',
  financeiro: 'Controle financeiro completo',
  estoque: 'Gestão de estoque',
  faturamento: 'Emissão de faturas fiscais',
  multiempresa: 'Múltiplas empresas',
  multiusuario: 'Múltiplos usuários',
  dashboardAvancado: 'Métricas avançadas',
  relatoriosPremium: 'Relatórios detalhados',
  controleMesas: 'Layout visual de mesas',
  impressaoTermica: 'Impressoras térmicas',
  backupAutomatico: 'Backup na nuvem',
  nfceFatura: 'Notas fiscais eletrônicas',
  integracaoBancaria: 'Conexão com bancos',
  gestaoFuncionarios: 'Controle de funcionários',
}

export function ModulosConfig() {
  const { modulos, toggleModulo } = useGestorX()

  const modulosEssenciais: (keyof ModulosAtivos)[] = ['pdv', 'financeiro', 'estoque', 'faturamento']
  const modulosRestaurante: (keyof ModulosAtivos)[] = ['restaurante', 'delivery', 'comandas', 'controleMesas']
  const modulosAvancados: (keyof ModulosAtivos)[] = [
    'agendamentos', 'whatsapp', 'multiempresa', 'multiusuario',
    'dashboardAvancado', 'relatoriosPremium', 'impressaoTermica',
    'backupAutomatico', 'nfceFatura', 'integracaoBancaria', 'gestaoFuncionarios'
  ]

  const renderModuloCard = (modulo: keyof ModulosAtivos) => {
    const Icon = MODULOS_ICONS[modulo]
    const isAtivo = modulos[modulo]

    return (
      <div
        key={modulo}
        className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
          isAtivo ? 'border-primary/50 bg-primary/5' : 'hover:bg-muted/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            isAtivo ? 'bg-primary/20' : 'bg-muted'
          }`}>
            <Icon className={`h-5 w-5 ${isAtivo ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <h4 className="font-medium">{MODULOS_LABELS[modulo]}</h4>
            <p className="text-sm text-muted-foreground">{MODULOS_DESCRICAO[modulo]}</p>
          </div>
        </div>
        <Switch
          checked={isAtivo}
          onCheckedChange={() => toggleModulo(modulo)}
        />
      </div>
    )
  }

  const modulosAtivosCount = Object.values(modulos).filter(Boolean).length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Módulos do Sistema</CardTitle>
              <CardDescription>
                Ative ou desative os módulos conforme sua necessidade
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg">
              {modulosAtivosCount} ativos
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Módulos Essenciais */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Módulos Essenciais
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {modulosEssenciais.map(renderModuloCard)}
            </div>
          </div>

          {/* Módulos Restaurante */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Restaurante e Delivery
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {modulosRestaurante.map(renderModuloCard)}
            </div>
          </div>

          {/* Módulos Avançados */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Módulos Avançados
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {modulosAvancados.map(renderModuloCard)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
