"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { ModulosConfig } from "@/lib/database.types"

interface ModulosContextType {
  modulos: ModulosConfig | null
  loading: boolean
  updateModulos: (updates: Partial<ModulosConfig>) => Promise<void>
  refreshModulos: () => Promise<void>
  isModuloAtivo: (modulo: keyof ModulosConfig) => boolean
}

const ModulosContext = createContext<ModulosContextType | undefined>(undefined)

export function ModulosProvider({ children }: { children: ReactNode }) {
  const [modulos, setModulos] = useState<ModulosConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchModulos = async () => {
    try {
      const { data, error } = await supabase
        .from("modulos_config")
        .select("*")
        .single()

      if (error) throw error
      setModulos(data)
    } catch (error) {
      console.error("Erro ao carregar módulos:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateModulos = async (updates: Partial<ModulosConfig>) => {
    if (!modulos) return

    try {
      const { error } = await supabase
        .from("modulos_config")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", modulos.id)

      if (error) throw error
      
      setModulos({ ...modulos, ...updates })
    } catch (error) {
      console.error("Erro ao atualizar módulos:", error)
      throw error
    }
  }

  const isModuloAtivo = (modulo: keyof ModulosConfig): boolean => {
    if (!modulos) return false
    const value = modulos[modulo]
    return typeof value === "boolean" ? value : false
  }

  useEffect(() => {
    fetchModulos()
  }, [])

  return (
    <ModulosContext.Provider
      value={{
        modulos,
        loading,
        updateModulos,
        refreshModulos: fetchModulos,
        isModuloAtivo,
      }}
    >
      {children}
    </ModulosContext.Provider>
  )
}

export function useModulos() {
  const context = useContext(ModulosContext)
  if (context === undefined) {
    throw new Error("useModulos must be used within a ModulosProvider")
  }
  return context
}
