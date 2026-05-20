"use client"

import { useState } from 'react'
import { GestorXProvider, useGestorX } from '@/lib/context'
import { EmitenteConfigForm } from '@/components/configuracoes/emitente-config-form'
import { ImpressorasConfig } from '@/components/configuracoes/impressoras-config'
import { AreasPreparoConfig } from '@/components/configuracoes/areas-preparo-config'
import { ModulosConfig } from '@/components/configuracoes/modulos-config'
import { ProdutoCadastroForm } from '@/components/produtos/produto-cadastro-form'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Printer,
  ChefHat,
  Package,
  Settings,
  LayoutDashboard,
  Menu,
  X,
  Boxes
} from 'lucide-react'

type PageKey = 'dashboard' | 'emitente' | 'impressoras' | 'areas' | 'produtos' | 'modulos'

const MENU_ITEMS: { key: PageKey; label: string; icon: React.ElementType; description: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Visão geral do sistema' },
  { key: 'emitente', label: 'Emitente Fiscal', icon: Building2, description: 'Dados da empresa' },
  { key: 'impressoras', label: 'Impressoras', icon: Printer, description: 'Configurar impressoras' },
  { key: 'areas', label: 'Áreas de Preparo', icon: ChefHat, description: 'Áreas de produção' },
  { key: 'produtos', label: 'Produtos', icon: Package, description: 'Cadastro de produtos' },
  { key: 'modulos', label: 'Módulos', icon: Boxes, description: 'Ativar/desativar módulos' },
]

function DashboardContent() {
  const { emitente, impressoras, areasPreparo, produtos, modulos, moduloRestauranteAtivo } = useGestorX()

  const stats = [
    { label: 'Produtos', value: produtos.length, icon: Package },
    { label: 'Impressoras', value: impressoras.length, icon: Printer },
    { label: 'Áreas de Preparo', value: areasPreparo.length, icon: ChefHat },
    { label: 'Módulos Ativos', value: Object.values(modulos).filter(Boolean).length, icon: Boxes },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao GestorX - Sistema de Gestão Completo
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-lg border bg-card p-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <stat.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status da Empresa */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Status da Configuração</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Dados do Emitente</span>
            <Badge variant={emitente.ruc ? "default" : "secondary"}>
              {emitente.ruc ? 'Configurado' : 'Pendente'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Impressoras</span>
            <Badge variant={impressoras.length > 0 ? "default" : "secondary"}>
              {impressoras.length > 0 ? `${impressoras.length} configurada(s)` : 'Pendente'}
            </Badge>
          </div>
          {moduloRestauranteAtivo && (
            <div className="flex items-center justify-between">
              <span>Áreas de Preparo</span>
              <Badge variant={areasPreparo.length > 0 ? "default" : "secondary"}>
                {areasPreparo.length > 0 ? `${areasPreparo.length} configurada(s)` : 'Pendente'}
              </Badge>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>Produtos Cadastrados</span>
            <Badge variant={produtos.length > 0 ? "default" : "secondary"}>
              {produtos.length > 0 ? `${produtos.length} produto(s)` : 'Nenhum'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Atalhos Rápidos */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Configurações Rápidas</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Complete as configurações iniciais para começar a usar o sistema
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {!emitente.ruc && (
            <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <Building2 className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">Configure o Emitente</p>
                <p className="text-sm text-amber-700">Dados fiscais da empresa</p>
              </div>
            </div>
          )}
          {impressoras.length === 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <Printer className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">Adicione Impressoras</p>
                <p className="text-sm text-amber-700">Configure suas impressoras</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MainContent() {
  const [activePage, setActivePage] = useState<PageKey>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { moduloRestauranteAtivo, emitente } = useGestorX()

  const visibleMenuItems = MENU_ITEMS.filter(item => {
    if (item.key === 'areas') return moduloRestauranteAtivo
    return true
  })

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardContent />
      case 'emitente':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Emitente Fiscal</h1>
              <p className="text-muted-foreground">
                Configure os dados da empresa para emissão de documentos fiscais
              </p>
            </div>
            <EmitenteConfigForm />
          </div>
        )
      case 'impressoras':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Impressoras</h1>
              <p className="text-muted-foreground">
                Configure as impressoras para cada função do sistema
              </p>
            </div>
            <ImpressorasConfig />
          </div>
        )
      case 'areas':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Áreas de Preparo</h1>
              <p className="text-muted-foreground">
                Configure as áreas de preparo do seu estabelecimento
              </p>
            </div>
            <AreasPreparoConfig />
          </div>
        )
      case 'produtos':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Cadastro de Produtos</h1>
              <p className="text-muted-foreground">
                Gerencie os produtos do seu estabelecimento
              </p>
            </div>
            <ProdutoCadastroForm />
          </div>
        )
      case 'modulos':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Módulos do Sistema</h1>
              <p className="text-muted-foreground">
                Ative ou desative os módulos conforme sua necessidade
              </p>
            </div>
            <ModulosConfig />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0 md:w-16'} flex flex-col border-r bg-card transition-all duration-300`}>
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Settings className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">GestorX</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => setActivePage(item.key)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {sidebarOpen && (
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.label}</p>
                      <p className={`truncate text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {item.description}
                      </p>
                    </div>
                  )}
                </button>
              )
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        {sidebarOpen && emitente.nomeFantasia && (
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              {emitente.logo ? (
                <img src={emitente.logo} alt="Logo" className="h-10 w-10 rounded-lg object-contain" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{emitente.nomeFantasia}</p>
                <p className="truncate text-xs text-muted-foreground">{emitente.ruc}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container max-w-6xl py-8">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <GestorXProvider>
      <MainContent />
    </GestorXProvider>
  )
}
