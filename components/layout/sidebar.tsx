"use client"

import { useState, useEffect } from "react"
import { useModulos } from "@/lib/modulos-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  Truck,
  Package,
  Users,
  Settings,
  Printer,
  Building2,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { modulos, loading } = useModulos()
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      visible: true,
    },
    {
      id: "pdv",
      label: "PDV",
      icon: ShoppingCart,
      visible: modulos?.pdv ?? true,
    },
    {
      id: "mesas",
      label: "Mesas",
      icon: UtensilsCrossed,
      visible: modulos?.restaurante || modulos?.controle_mesas,
    },
    {
      id: "delivery",
      label: "Delivery",
      icon: Truck,
      visible: modulos?.delivery,
    },
    {
      id: "produtos",
      label: "Produtos",
      icon: Package,
      visible: true,
    },
    {
      id: "categorias",
      label: "Categorias",
      icon: Boxes,
      visible: true,
    },
    {
      id: "clientes",
      label: "Clientes",
      icon: Users,
      visible: true,
    },
    {
      id: "emitente",
      label: "Emitente Fiscal",
      icon: Building2,
      visible: true,
    },
    {
      id: "impressoras",
      label: "Impressoras",
      icon: Printer,
      visible: true,
    },
    {
      id: "modulos",
      label: "Módulos",
      icon: Settings,
      visible: true,
    },
  ]

  const visibleItems = menuItems.filter((item) => item.visible)

  if (loading) {
    return (
      <div className={cn(
        "h-screen bg-card border-r flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}>
        <div className="p-4 border-b">
          <div className="h-8 bg-muted animate-pulse rounded" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "h-screen bg-card border-r flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 border-b flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-xl font-bold text-primary">GestorX</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 p-2">
        <nav className="space-y-1">
          {visibleItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                collapsed && "justify-center px-2"
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <item.icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t">
        {!collapsed && (
          <p className="text-xs text-muted-foreground text-center">
            GestorX v1.0
          </p>
        )}
      </div>
    </div>
  )
}
