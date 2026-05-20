"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { 
  ModulosAtivos, 
  EmitenteConfig, 
  Impressora, 
  AreaPreparo,
  Produto
} from '@/lib/types'

interface GestorXContextType {
  // Módulos
  modulos: ModulosAtivos
  toggleModulo: (modulo: keyof ModulosAtivos) => void
  isModuloAtivo: (modulo: keyof ModulosAtivos) => boolean
  moduloRestauranteAtivo: boolean

  // Emitente
  emitente: EmitenteConfig
  setEmitente: (emitente: EmitenteConfig) => void

  // Impressoras
  impressoras: Impressora[]
  addImpressora: (impressora: Impressora) => void
  updateImpressora: (id: string, impressora: Partial<Impressora>) => void
  removeImpressora: (id: string) => void

  // Áreas de Preparo
  areasPreparo: AreaPreparo[]
  addAreaPreparo: (area: AreaPreparo) => void
  updateAreaPreparo: (id: string, area: Partial<AreaPreparo>) => void
  removeAreaPreparo: (id: string) => void

  // Produtos
  produtos: Produto[]
  addProduto: (produto: Produto) => void
  updateProduto: (id: string, produto: Partial<Produto>) => void
  removeProduto: (id: string) => void
}

const defaultModulos: ModulosAtivos = {
  pdv: true,
  restaurante: false,
  delivery: false,
  comandas: false,
  agendamentos: false,
  whatsapp: false,
  financeiro: true,
  estoque: true,
  faturamento: true,
  multiempresa: false,
  multiusuario: false,
  dashboardAvancado: false,
  relatoriosPremium: false,
  controleMesas: false,
  impressaoTermica: true,
  backupAutomatico: false,
  nfceFatura: true,
  integracaoBancaria: false,
  gestaoFuncionarios: false,
}

const defaultEmitente: EmitenteConfig = {
  ruc: '',
  razaoSocial: '',
  nomeFantasia: '',
  logo: null,
  endereco: {
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    departamento: '',
    pais: 'Paraguay',
    cep: '',
  },
  areaAtuacao: '',
  telefone: '',
  email: '',
}

const GestorXContext = createContext<GestorXContextType | undefined>(undefined)

export function GestorXProvider({ children }: { children: ReactNode }) {
  const [modulos, setModulos] = useState<ModulosAtivos>(defaultModulos)
  const [emitente, setEmitente] = useState<EmitenteConfig>(defaultEmitente)
  const [impressoras, setImpressoras] = useState<Impressora[]>([])
  const [areasPreparo, setAreasPreparo] = useState<AreaPreparo[]>([
    { id: '1', nome: 'Cozinha', descricao: 'Área de preparo de pratos quentes', impressoraId: null, ativo: true },
    { id: '2', nome: 'Bar', descricao: 'Área de preparo de bebidas', impressoraId: null, ativo: true },
    { id: '3', nome: 'Copa', descricao: 'Área de preparo de sobremesas', impressoraId: null, ativo: true },
  ])
  const [produtos, setProdutos] = useState<Produto[]>([])

  const toggleModulo = useCallback((modulo: keyof ModulosAtivos) => {
    setModulos(prev => ({ ...prev, [modulo]: !prev[modulo] }))
  }, [])

  const isModuloAtivo = useCallback((modulo: keyof ModulosAtivos) => {
    return modulos[modulo]
  }, [modulos])

  const moduloRestauranteAtivo = modulos.restaurante || modulos.delivery || modulos.comandas

  // Impressoras
  const addImpressora = useCallback((impressora: Impressora) => {
    setImpressoras(prev => [...prev, impressora])
  }, [])

  const updateImpressora = useCallback((id: string, data: Partial<Impressora>) => {
    setImpressoras(prev => prev.map(imp => imp.id === id ? { ...imp, ...data } : imp))
  }, [])

  const removeImpressora = useCallback((id: string) => {
    setImpressoras(prev => prev.filter(imp => imp.id !== id))
  }, [])

  // Áreas de Preparo
  const addAreaPreparo = useCallback((area: AreaPreparo) => {
    setAreasPreparo(prev => [...prev, area])
  }, [])

  const updateAreaPreparo = useCallback((id: string, data: Partial<AreaPreparo>) => {
    setAreasPreparo(prev => prev.map(area => area.id === id ? { ...area, ...data } : area))
  }, [])

  const removeAreaPreparo = useCallback((id: string) => {
    setAreasPreparo(prev => prev.filter(area => area.id !== id))
  }, [])

  // Produtos
  const addProduto = useCallback((produto: Produto) => {
    setProdutos(prev => [...prev, produto])
  }, [])

  const updateProduto = useCallback((id: string, data: Partial<Produto>) => {
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
  }, [])

  const removeProduto = useCallback((id: string) => {
    setProdutos(prev => prev.filter(p => p.id !== id))
  }, [])

  return (
    <GestorXContext.Provider
      value={{
        modulos,
        toggleModulo,
        isModuloAtivo,
        moduloRestauranteAtivo,
        emitente,
        setEmitente,
        impressoras,
        addImpressora,
        updateImpressora,
        removeImpressora,
        areasPreparo,
        addAreaPreparo,
        updateAreaPreparo,
        removeAreaPreparo,
        produtos,
        addProduto,
        updateProduto,
        removeProduto,
      }}
    >
      {children}
    </GestorXContext.Provider>
  )
}

export function useGestorX() {
  const context = useContext(GestorXContext)
  if (!context) {
    throw new Error('useGestorX must be used within a GestorXProvider')
  }
  return context
}
