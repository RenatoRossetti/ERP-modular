"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Mesa, Produto, MesaItemWithProduto, Categoria } from "@/lib/database.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  Receipt, 
  DollarSign,
  ShoppingCart,
  Check,
  X
} from "lucide-react"

interface MesaDetailProps {
  mesa: Mesa
  itens: MesaItemWithProduto[]
  onClose: () => void
  onUpdate: () => void
}

export function MesaDetail({ mesa, itens, onClose, onUpdate }: MesaDetailProps) {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [localItens, setLocalItens] = useState<MesaItemWithProduto[]>(itens)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null)
  const [cobrarDialogOpen, setCobrarDialogOpen] = useState(false)
  const [selectedItemsToPay, setSelectedItemsToPay] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchProdutos()
    setLocalItens(itens)
  }, [itens])

  const fetchProdutos = async () => {
    try {
      const [produtosRes, categoriasRes] = await Promise.all([
        supabase.from("produtos").select("*").eq("ativo", true).order("nome"),
        supabase.from("categorias").select("*").eq("ativo", true).order("nome"),
      ])

      if (produtosRes.error) throw produtosRes.error
      if (categoriasRes.error) throw categoriasRes.error

      setProdutos(produtosRes.data || [])
      setCategorias(categoriasRes.data || [])
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
    }
  }

  const addItem = async (produto: Produto) => {
    try {
      // Atualizar status da mesa para ocupada se estiver livre
      if (mesa.status === "livre") {
        await supabase
          .from("mesas")
          .update({ status: "ocupada", updated_at: new Date().toISOString() })
          .eq("id", mesa.id)
      }

      // Verificar se já existe o item na mesa
      const existingItem = localItens.find(
        (item) => item.produto_id === produto.id && item.status === "pendente"
      )

      if (existingItem) {
        // Incrementar quantidade
        const { error } = await supabase
          .from("mesa_itens")
          .update({ 
            quantidade: existingItem.quantidade + 1,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingItem.id)

        if (error) throw error
      } else {
        // Adicionar novo item
        const { error } = await supabase
          .from("mesa_itens")
          .insert({
            mesa_id: mesa.id,
            produto_id: produto.id,
            quantidade: 1,
            preco_unitario: produto.preco_venda,
            desconto: 0,
            status: "pendente",
            impresso: false,
          })

        if (error) throw error
      }

      toast.success(`${produto.nome} adicionado`)
      onUpdate()
    } catch (error) {
      console.error("Erro ao adicionar item:", error)
      toast.error("Erro ao adicionar item")
    }
  }

  const updateQuantidade = async (itemId: string, delta: number) => {
    const item = localItens.find((i) => i.id === itemId)
    if (!item) return

    const newQuantidade = item.quantidade + delta

    try {
      if (newQuantidade <= 0) {
        await supabase.from("mesa_itens").delete().eq("id", itemId)
        toast.success("Item removido")
      } else {
        await supabase
          .from("mesa_itens")
          .update({ quantidade: newQuantidade, updated_at: new Date().toISOString() })
          .eq("id", itemId)
      }
      onUpdate()
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error)
      toast.error("Erro ao atualizar quantidade")
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      await supabase.from("mesa_itens").delete().eq("id", itemId)
      toast.success("Item removido")
      onUpdate()
    } catch (error) {
      console.error("Erro ao remover item:", error)
      toast.error("Erro ao remover item")
    }
  }

  const handleCobrar = () => {
    setSelectedItemsToPay(localItens.map((item) => item.id))
    setCobrarDialogOpen(true)
  }

  const toggleItemToPay = (itemId: string) => {
    setSelectedItemsToPay((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    )
  }

  const selectAllItems = () => {
    setSelectedItemsToPay(localItens.map((item) => item.id))
  }

  const deselectAllItems = () => {
    setSelectedItemsToPay([])
  }

  const getSelectedTotal = () => {
    return localItens
      .filter((item) => selectedItemsToPay.includes(item.id))
      .reduce((total, item) => total + item.quantidade * item.preco_unitario - item.desconto, 0)
  }

  const enviarParaPDV = async () => {
    if (selectedItemsToPay.length === 0) {
      toast.error("Selecione pelo menos um item para cobrar")
      return
    }

    setLoading(true)
    try {
      // Criar venda
      const selectedItens = localItens.filter((item) => selectedItemsToPay.includes(item.id))
      const subtotal = getSelectedTotal()
      
      // Calcular IVA
      let iva5 = 0
      let iva10 = 0
      selectedItens.forEach((item) => {
        const itemTotal = item.quantidade * item.preco_unitario - item.desconto
        const produto = item.produtos
        if (produto.iva === 5) {
          iva5 += itemTotal * 0.05 / 1.05
        } else {
          iva10 += itemTotal * 0.10 / 1.10
        }
      })

      const { data: venda, error: vendaError } = await supabase
        .from("vendas")
        .insert({
          tipo: "mesa",
          mesa_id: mesa.id,
          subtotal,
          total: subtotal,
          iva_5: iva5,
          iva_10: iva10,
          tipo_documento: "ticket",
          status: "pendente",
        })
        .select()
        .single()

      if (vendaError) throw vendaError

      // Criar itens da venda
      const vendaItens = selectedItens.map((item) => ({
        venda_id: venda.id,
        produto_id: item.produto_id,
        produto_nome: item.produtos.nome,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        desconto: item.desconto,
        total: item.quantidade * item.preco_unitario - item.desconto,
        iva: item.produtos.iva,
      }))

      const { error: itensError } = await supabase
        .from("venda_itens")
        .insert(vendaItens)

      if (itensError) throw itensError

      // Marcar itens como pagos
      await supabase
        .from("mesa_itens")
        .update({ status: "pago", updated_at: new Date().toISOString() })
        .in("id", selectedItemsToPay)

      // Verificar se todos os itens foram pagos
      const remainingItens = localItens.filter(
        (item) => !selectedItemsToPay.includes(item.id)
      )

      if (remainingItens.length === 0) {
        // Liberar mesa
        await supabase
          .from("mesas")
          .update({ status: "livre", updated_at: new Date().toISOString() })
          .eq("id", mesa.id)
      }

      toast.success("Pedido enviado para o PDV")
      setCobrarDialogOpen(false)
      
      // Redirecionar para PDV com a venda
      window.location.href = `/?section=pdv&venda=${venda.id}`
    } catch (error) {
      console.error("Erro ao enviar para PDV:", error)
      toast.error("Erro ao enviar para PDV")
    } finally {
      setLoading(false)
    }
  }

  const total = localItens.reduce(
    (sum, item) => sum + item.quantidade * item.preco_unitario - item.desconto,
    0
  )

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const filteredProdutos = produtos.filter((p) => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo_interno?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategoria = !selectedCategoria || p.categoria_id === selectedCategoria
    return matchesSearch && matchesCategoria
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Mesa {mesa.numero}</h2>
            <p className="text-muted-foreground">{mesa.capacidade} lugares</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={mesa.status === "ocupada" ? "default" : "secondary"}>
            {mesa.status === "ocupada" ? "Ocupada" : "Livre"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos */}
        <Card className="h-[calc(100vh-200px)]">
          <CardHeader className="pb-3">
            <CardTitle>Adicionar Itens</CardTitle>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-2 pb-2">
                  <Button
                    variant={selectedCategoria === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategoria(null)}
                  >
                    Todos
                  </Button>
                  {categorias.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={selectedCategoria === cat.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategoria(cat.id)}
                    >
                      {cat.nome}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="grid grid-cols-2 gap-2">
                {filteredProdutos.map((produto) => (
                  <Card
                    key={produto.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => addItem(produto)}
                  >
                    <CardContent className="p-3">
                      <p className="font-medium text-sm truncate">{produto.nome}</p>
                      <p className="text-primary font-semibold">
                        {formatPrice(produto.preco_venda)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Comanda */}
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Comanda da Mesa
            </CardTitle>
            <CardDescription>{localItens.length} itens</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1">
              {localItens.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum item adicionado
                </div>
              ) : (
                <div className="space-y-2">
                  {localItens.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.produtos.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.preco_unitario)} x {item.quantidade}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantidade(item.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantidade}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantidade(item.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="w-24 text-right font-semibold">
                          {formatPrice(item.quantidade * item.preco_unitario)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={localItens.length === 0}
                onClick={handleCobrar}
              >
                <DollarSign className="h-5 w-5 mr-2" />
                Cobrar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Cobrança */}
      <Dialog open={cobrarDialogOpen} onOpenChange={setCobrarDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Selecionar Itens para Cobrar</DialogTitle>
            <DialogDescription>
              Escolha quais itens o cliente deseja pagar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={selectAllItems}>
                <Check className="h-4 w-4 mr-2" />
                Selecionar Todos
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAllItems}>
                <X className="h-4 w-4 mr-2" />
                Desmarcar Todos
              </Button>
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-2">
                {localItens.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedItemsToPay.includes(item.id)
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => toggleItemToPay(item.id)}
                  >
                    <Checkbox
                      checked={selectedItemsToPay.includes(item.id)}
                      onCheckedChange={() => toggleItemToPay(item.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.produtos.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantidade}x {formatPrice(item.preco_unitario)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatPrice(item.quantidade * item.preco_unitario - item.desconto)}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total a Pagar</span>
              <span className="text-primary">{formatPrice(getSelectedTotal())}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCobrarDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={enviarParaPDV} disabled={loading || selectedItemsToPay.length === 0}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              {loading ? "Enviando..." : "Enviar para PDV"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
