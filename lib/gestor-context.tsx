"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { 
  Emitente, 
  ModulosConfig, 
  Impressora, 
  AreaPreparo, 
  Categoria, 
  Produto, 
  Cliente,
  Mesa,
  MesaItem,
  Venda,
  VendaItem
} from '@/lib/database.types'

interface GestorContextType {
  // Loading state
  loading: boolean
  
  // Módulos
  modulos: ModulosConfig | null
  updateModulos: (updates: Partial<ModulosConfig>) => Promise<void>
  isModuloAtivo: (modulo: keyof ModulosConfig) => boolean
  moduloRestauranteAtivo: boolean

  // Emitente
  emitente: Emitente | null
  updateEmitente: (data: Partial<Emitente>) => Promise<void>

  // Impressoras
  impressoras: Impressora[]
  addImpressora: (data: Omit<Impressora, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateImpressora: (id: string, data: Partial<Impressora>) => Promise<void>
  removeImpressora: (id: string) => Promise<void>

  // Áreas de Preparo
  areasPreparo: AreaPreparo[]
  addAreaPreparo: (data: Omit<AreaPreparo, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateAreaPreparo: (id: string, data: Partial<AreaPreparo>) => Promise<void>
  removeAreaPreparo: (id: string) => Promise<void>

  // Categorias
  categorias: Categoria[]
  addCategoria: (data: Omit<Categoria, 'id' | 'created_at'>) => Promise<void>
  updateCategoria: (id: string, data: Partial<Categoria>) => Promise<void>
  removeCategoria: (id: string) => Promise<void>

  // Produtos
  produtos: Produto[]
  addProduto: (data: Omit<Produto, 'id' | 'created_at' | 'updated_at'>) => Promise<Produto>
  updateProduto: (id: string, data: Partial<Produto>) => Promise<void>
  removeProduto: (id: string) => Promise<void>
  buscarProdutoPorCodigo: (codigo: string) => Produto | undefined
  buscarProdutoPorCodigoBarras: (codigoBarras: string) => Produto | undefined
  buscarProdutosPorNome: (nome: string) => Produto[]

  // Clientes
  clientes: Cliente[]
  addCliente: (data: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => Promise<Cliente>
  updateCliente: (id: string, data: Partial<Cliente>) => Promise<void>
  buscarClientePorRuc: (ruc: string) => Cliente | undefined

  // Mesas
  mesas: Mesa[]
  addMesa: (data: Omit<Mesa, 'id' | 'created_at' | 'updated_at'>) => Promise<Mesa>
  updateMesaStatus: (id: string, status: Mesa['status']) => Promise<void>

  // Mesa Itens
  mesaItens: Record<string, MesaItem[]>
  addMesaItem: (mesaId: string, data: Omit<MesaItem, 'id' | 'created_at' | 'updated_at' | 'mesa_id'>) => Promise<void>
  removeMesaItem: (itemId: string, mesaId: string) => Promise<void>
  loadMesaItens: (mesaId: string) => Promise<MesaItem[]>

  // Vendas
  criarVenda: (data: {
    tipo: 'pdv' | 'mesa' | 'delivery'
    mesaId?: string
    clienteId?: string
    clienteNome?: string
    clienteRuc?: string
    itens: Array<{
      produtoId: string
      produtoNome: string
      quantidade: number
      precoUnitario: number
      desconto: number
      iva: number
    }>
    desconto: number
    formaPagamento: string
    valorRecebido: number
    tipoDocumento: 'ticket' | 'fatura'
    cotacaoBrl?: number
    cotacaoUsd?: number
  }) => Promise<Venda>
  
  // Refresh
  refresh: () => Promise<void>
}

const GestorContext = createContext<GestorContextType | undefined>(undefined)

export function GestorProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [modulos, setModulos] = useState<ModulosConfig | null>(null)
  const [emitente, setEmitente] = useState<Emitente | null>(null)
  const [impressoras, setImpressoras] = useState<Impressora[]>([])
  const [areasPreparo, setAreasPreparo] = useState<AreaPreparo[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [mesaItens, setMesaItens] = useState<Record<string, MesaItem[]>>({})
  
  const supabase = createClient()

  const loadAllData = useCallback(async () => {
    setLoading(true)
    try {
      const [
        modulosRes,
        emitenteRes,
        impressorasRes,
        areasRes,
        categoriasRes,
        produtosRes,
        clientesRes,
        mesasRes
      ] = await Promise.all([
        supabase.from('modulos_config').select('*').single(),
        supabase.from('emitente').select('*').single(),
        supabase.from('impressoras').select('*').order('nome'),
        supabase.from('areas_preparo').select('*').order('nome'),
        supabase.from('categorias').select('*').order('nome'),
        supabase.from('produtos').select('*').order('nome'),
        supabase.from('clientes').select('*').order('nome'),
        supabase.from('mesas').select('*').order('numero')
      ])

      if (modulosRes.data) setModulos(modulosRes.data)
      if (emitenteRes.data) setEmitente(emitenteRes.data)
      if (impressorasRes.data) setImpressoras(impressorasRes.data)
      if (areasRes.data) setAreasPreparo(areasRes.data)
      if (categoriasRes.data) setCategorias(categoriasRes.data)
      if (produtosRes.data) setProdutos(produtosRes.data)
      if (clientesRes.data) setClientes(clientesRes.data)
      if (mesasRes.data) setMesas(mesasRes.data)
    } catch (error) {
      console.error('[v0] Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  // Módulos
  const updateModulos = async (updates: Partial<ModulosConfig>) => {
    if (!modulos) return
    const { error } = await supabase
      .from('modulos_config')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', modulos.id)
    if (error) throw error
    setModulos({ ...modulos, ...updates })
  }

  const isModuloAtivo = (modulo: keyof ModulosConfig): boolean => {
    if (!modulos) return false
    const value = modulos[modulo]
    return typeof value === 'boolean' ? value : false
  }

  const moduloRestauranteAtivo = modulos?.restaurante || modulos?.delivery || modulos?.comandas || modulos?.controle_mesas || false

  // Emitente
  const updateEmitente = async (data: Partial<Emitente>) => {
    if (!emitente) return
    const { error } = await supabase
      .from('emitente')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', emitente.id)
    if (error) throw error
    setEmitente({ ...emitente, ...data })
  }

  // Impressoras
  const addImpressora = async (data: Omit<Impressora, 'id' | 'created_at' | 'updated_at'>) => {
    const { data: newData, error } = await supabase
      .from('impressoras')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    setImpressoras([...impressoras, newData])
  }

  const updateImpressora = async (id: string, data: Partial<Impressora>) => {
    const { error } = await supabase
      .from('impressoras')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    setImpressoras(impressoras.map(i => i.id === id ? { ...i, ...data } : i))
  }

  const removeImpressora = async (id: string) => {
    const { error } = await supabase.from('impressoras').delete().eq('id', id)
    if (error) throw error
    setImpressoras(impressoras.filter(i => i.id !== id))
  }

  // Áreas de Preparo
  const addAreaPreparo = async (data: Omit<AreaPreparo, 'id' | 'created_at' | 'updated_at'>) => {
    const { data: newData, error } = await supabase
      .from('areas_preparo')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    setAreasPreparo([...areasPreparo, newData])
  }

  const updateAreaPreparo = async (id: string, data: Partial<AreaPreparo>) => {
    const { error } = await supabase
      .from('areas_preparo')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    setAreasPreparo(areasPreparo.map(a => a.id === id ? { ...a, ...data } : a))
  }

  const removeAreaPreparo = async (id: string) => {
    const { error } = await supabase.from('areas_preparo').delete().eq('id', id)
    if (error) throw error
    setAreasPreparo(areasPreparo.filter(a => a.id !== id))
  }

  // Categorias
  const addCategoria = async (data: Omit<Categoria, 'id' | 'created_at'>) => {
    const { data: newData, error } = await supabase
      .from('categorias')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    setCategorias([...categorias, newData])
  }

  const updateCategoria = async (id: string, data: Partial<Categoria>) => {
    const { error } = await supabase
      .from('categorias')
      .update(data)
      .eq('id', id)
    if (error) throw error
    setCategorias(categorias.map(c => c.id === id ? { ...c, ...data } : c))
  }

  const removeCategoria = async (id: string) => {
    const { error } = await supabase.from('categorias').delete().eq('id', id)
    if (error) throw error
    setCategorias(categorias.filter(c => c.id !== id))
  }

  // Produtos
  const addProduto = async (data: Omit<Produto, 'id' | 'created_at' | 'updated_at'>) => {
    const { data: newData, error } = await supabase
      .from('produtos')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    setProdutos([...produtos, newData])
    return newData
  }

  const updateProduto = async (id: string, data: Partial<Produto>) => {
    const { error } = await supabase
      .from('produtos')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    setProdutos(produtos.map(p => p.id === id ? { ...p, ...data } : p))
  }

  const removeProduto = async (id: string) => {
    const { error } = await supabase.from('produtos').delete().eq('id', id)
    if (error) throw error
    setProdutos(produtos.filter(p => p.id !== id))
  }

  const buscarProdutoPorCodigo = (codigo: string) => {
    return produtos.find(p => p.codigo_interno?.toLowerCase() === codigo.toLowerCase())
  }

  const buscarProdutoPorCodigoBarras = (codigoBarras: string) => {
    return produtos.find(p => p.codigo_barras === codigoBarras)
  }

  const buscarProdutosPorNome = (nome: string) => {
    const search = nome.toLowerCase()
    return produtos.filter(p => p.nome.toLowerCase().includes(search))
  }

  // Clientes
  const addCliente = async (data: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
    const { data: newData, error } = await supabase
      .from('clientes')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    setClientes([...clientes, newData])
    return newData
  }

  const updateCliente = async (id: string, data: Partial<Cliente>) => {
    const { error } = await supabase
      .from('clientes')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    setClientes(clientes.map(c => c.id === id ? { ...c, ...data } : c))
  }

  const buscarClientePorRuc = (ruc: string) => {
    return clientes.find(c => c.ruc === ruc)
  }

  // Mesas
  const addMesa = async (data: Omit<Mesa, 'id' | 'created_at' | 'updated_at'>) => {
    const { data: newData, error } = await supabase
      .from('mesas')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    setMesas([...mesas, newData].sort((a, b) => a.numero - b.numero))
    return newData
  }

  const updateMesaStatus = async (id: string, status: Mesa['status']) => {
    const { error } = await supabase
      .from('mesas')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    setMesas(mesas.map(m => m.id === id ? { ...m, status } : m))
  }

  // Mesa Itens
  const loadMesaItens = async (mesaId: string) => {
    const { data, error } = await supabase
      .from('mesa_itens')
      .select('*, produtos(*)')
      .eq('mesa_id', mesaId)
      .neq('status', 'pago')
      .order('created_at')
    if (error) throw error
    setMesaItens(prev => ({ ...prev, [mesaId]: data || [] }))
    return data || []
  }

  const addMesaItem = async (mesaId: string, data: Omit<MesaItem, 'id' | 'created_at' | 'updated_at' | 'mesa_id'>) => {
    const { data: newData, error } = await supabase
      .from('mesa_itens')
      .insert({ ...data, mesa_id: mesaId })
      .select('*, produtos(*)')
      .single()
    if (error) throw error
    
    setMesaItens(prev => ({
      ...prev,
      [mesaId]: [...(prev[mesaId] || []), newData]
    }))

    // Update mesa status to ocupada
    await updateMesaStatus(mesaId, 'ocupada')
  }

  const removeMesaItem = async (itemId: string, mesaId: string) => {
    const { error } = await supabase.from('mesa_itens').delete().eq('id', itemId)
    if (error) throw error
    
    setMesaItens(prev => ({
      ...prev,
      [mesaId]: (prev[mesaId] || []).filter(i => i.id !== itemId)
    }))
  }

  // Vendas
  const criarVenda = async (data: {
    tipo: 'pdv' | 'mesa' | 'delivery'
    mesaId?: string
    clienteId?: string
    clienteNome?: string
    clienteRuc?: string
    itens: Array<{
      produtoId: string
      produtoNome: string
      quantidade: number
      precoUnitario: number
      desconto: number
      iva: number
    }>
    desconto: number
    formaPagamento: string
    valorRecebido: number
    tipoDocumento: 'ticket' | 'fatura'
    cotacaoBrl?: number
    cotacaoUsd?: number
  }) => {
    // Calculate totals
    let subtotal = 0
    let iva5 = 0
    let iva10 = 0

    data.itens.forEach(item => {
      const itemTotal = (item.quantidade * item.precoUnitario) - item.desconto
      subtotal += itemTotal
      
      if (item.iva === 5) {
        iva5 += itemTotal * 0.05 / 1.05
      } else {
        iva10 += itemTotal * 0.10 / 1.10
      }
    })

    const total = subtotal - data.desconto
    const troco = data.valorRecebido - total

    // Create venda
    const { data: venda, error: vendaError } = await supabase
      .from('vendas')
      .insert({
        tipo: data.tipo,
        mesa_id: data.mesaId || null,
        cliente_id: data.clienteId || null,
        cliente_nome: data.clienteNome || 'Consumidor Final',
        cliente_ruc: data.clienteRuc || '00000000-0',
        subtotal,
        desconto: data.desconto,
        total,
        iva_5: iva5,
        iva_10: iva10,
        forma_pagamento: data.formaPagamento,
        valor_recebido: data.valorRecebido,
        troco: troco > 0 ? troco : 0,
        tipo_documento: data.tipoDocumento,
        status: 'finalizada',
        cotacao_brl: data.cotacaoBrl || null,
        cotacao_usd: data.cotacaoUsd || null
      })
      .select()
      .single()

    if (vendaError) throw vendaError

    // Create venda itens
    const itensToInsert = data.itens.map(item => ({
      venda_id: venda.id,
      produto_id: item.produtoId,
      produto_nome: item.produtoNome,
      quantidade: item.quantidade,
      preco_unitario: item.precoUnitario,
      desconto: item.desconto,
      total: (item.quantidade * item.precoUnitario) - item.desconto,
      iva: item.iva
    }))

    const { error: itensError } = await supabase
      .from('venda_itens')
      .insert(itensToInsert)

    if (itensError) throw itensError

    // If mesa, update status and mark items as paid
    if (data.mesaId) {
      await supabase
        .from('mesa_itens')
        .update({ status: 'pago' })
        .eq('mesa_id', data.mesaId)
        .neq('status', 'pago')

      // Check if there are remaining items
      const { data: remainingItems } = await supabase
        .from('mesa_itens')
        .select('id')
        .eq('mesa_id', data.mesaId)
        .neq('status', 'pago')

      if (!remainingItems || remainingItems.length === 0) {
        await updateMesaStatus(data.mesaId, 'livre')
      }

      // Clear local mesa items
      setMesaItens(prev => ({ ...prev, [data.mesaId!]: [] }))
    }

    return venda
  }

  return (
    <GestorContext.Provider
      value={{
        loading,
        modulos,
        updateModulos,
        isModuloAtivo,
        moduloRestauranteAtivo,
        emitente,
        updateEmitente,
        impressoras,
        addImpressora,
        updateImpressora,
        removeImpressora,
        areasPreparo,
        addAreaPreparo,
        updateAreaPreparo,
        removeAreaPreparo,
        categorias,
        addCategoria,
        updateCategoria,
        removeCategoria,
        produtos,
        addProduto,
        updateProduto,
        removeProduto,
        buscarProdutoPorCodigo,
        buscarProdutoPorCodigoBarras,
        buscarProdutosPorNome,
        clientes,
        addCliente,
        updateCliente,
        buscarClientePorRuc,
        mesas,
        addMesa,
        updateMesaStatus,
        mesaItens,
        addMesaItem,
        removeMesaItem,
        loadMesaItens,
        criarVenda,
        refresh: loadAllData
      }}
    >
      {children}
    </GestorContext.Provider>
  )
}

export function useGestor() {
  const context = useContext(GestorContext)
  if (!context) {
    throw new Error('useGestor must be used within a GestorProvider')
  }
  return context
}
