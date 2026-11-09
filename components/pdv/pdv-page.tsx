"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Produto, Cliente, Venda, VendaItem, Emitente } from "@/lib/database.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import {
  Search,
  Barcode,
  Camera,
  Hash,
  Type,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  Receipt,
  FileText,
  User,
  X,
  Printer,
} from "lucide-react"

interface CarrinhoItem {
  id: string
  produto_id: string
  nome: string
  quantidade: number
  preco_unitario: number
  desconto: number
  iva: number
}

export function PDVPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([])
  const [emitente, setEmitente] = useState<Emitente | null>(null)
  const [searchBarcode, setSearchBarcode] = useState("")
  const [searchCodigo, setSearchCodigo] = useState("")
  const [searchNome, setSearchNome] = useState("")
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [clienteDialogOpen, setClienteDialogOpen] = useState(false)
  const [clienteRuc, setClienteRuc] = useState("")
  const [clienteNome, setClienteNome] = useState("")
  const [finalizarDialogOpen, setFinalizarDialogOpen] = useState(false)
  const [tipoDocumento, setTipoDocumento] = useState<"ticket" | "fatura">("ticket")
  const [formaPagamento, setFormaPagamento] = useState("dinheiro")
  const [valorRecebido, setValorRecebido] = useState("")
  const [faturaDialogOpen, setFaturaDialogOpen] = useState(false)
  const [vendaFinalizada, setVendaFinalizada] = useState<Venda | null>(null)
  const [vendaItens, setVendaItens] = useState<VendaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const supabase = createClient()

  // Cotações de câmbio (exemplo fixo - idealmente viria de uma API)
  const cotacaoBRL = 1350 // 1 BRL = 1350 PYG
  const cotacaoUSD = 7500 // 1 USD = 7500 PYG

  useEffect(() => {
    fetchProdutos()
    fetchEmitente()

    // Verificar se há uma venda pendente da mesa
    const params = new URLSearchParams(window.location.search)
    const vendaId = params.get("venda")
    if (vendaId) {
      loadVendaPendente(vendaId)
    }
  }, [])

  const fetchProdutos = async () => {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("ativo", true)
      .order("nome")

    if (!error && data) {
      setProdutos(data)
    }
  }

  const fetchEmitente = async () => {
    const { data, error } = await supabase
      .from("emitente")
      .select("*")
      .single()

    if (!error && data) {
      setEmitente(data)
    }
  }

  const loadVendaPendente = async (vendaId: string) => {
    try {
      const { data: venda, error: vendaError } = await supabase
        .from("vendas")
        .select("*")
        .eq("id", vendaId)
        .single()

      if (vendaError) throw vendaError

      const { data: itens, error: itensError } = await supabase
        .from("venda_itens")
        .select("*")
        .eq("venda_id", vendaId)

      if (itensError) throw itensError

      // Converter itens da venda para carrinho
      const carrinhoItens: CarrinhoItem[] = itens.map((item) => ({
        id: item.id,
        produto_id: item.produto_id,
        nome: item.produto_nome,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        desconto: item.desconto,
        iva: item.iva,
      }))

      setCarrinho(carrinhoItens)
      setVendaFinalizada(venda)
      toast.success("Venda da mesa carregada")
    } catch (error) {
      console.error("Erro ao carregar venda:", error)
    }
  }

  // Busca por código de barras
  const handleBarcodeSearch = useCallback((barcode: string) => {
    if (!barcode.trim()) return

    const produto = produtos.find(
      (p) => p.codigo_barras === barcode.trim()
    )

    if (produto) {
      addToCarrinho(produto)
      setSearchBarcode("")
    } else {
      toast.error("Produto não encontrado")
    }
  }, [produtos])

  // Busca por código interno
  const handleCodigoSearch = () => {
    if (!searchCodigo.trim()) return

    const produto = produtos.find(
      (p) => p.codigo_interno?.toLowerCase() === searchCodigo.toLowerCase().trim()
    )

    if (produto) {
      addToCarrinho(produto)
      setSearchCodigo("")
    } else {
      toast.error("Produto não encontrado")
    }
  }

  // Busca por nome
  const handleNomeSearch = () => {
    if (!searchNome.trim()) return

    const produto = produtos.find(
      (p) => p.nome.toLowerCase().includes(searchNome.toLowerCase().trim())
    )

    if (produto) {
      addToCarrinho(produto)
      setSearchNome("")
    } else {
      toast.error("Produto não encontrado")
    }
  }

  const addToCarrinho = (produto: Produto) => {
    const existingIndex = carrinho.findIndex((item) => item.produto_id === produto.id)

    if (existingIndex >= 0) {
      const updated = [...carrinho]
      updated[existingIndex].quantidade += 1
      setCarrinho(updated)
    } else {
      setCarrinho([
        ...carrinho,
        {
          id: `temp-${Date.now()}`,
          produto_id: produto.id,
          nome: produto.nome,
          quantidade: 1,
          preco_unitario: produto.preco_venda,
          desconto: 0,
          iva: produto.iva,
        },
      ])
    }
    toast.success(`${produto.nome} adicionado`)
  }

  const updateQuantidade = (index: number, delta: number) => {
    const updated = [...carrinho]
    updated[index].quantidade += delta

    if (updated[index].quantidade <= 0) {
      updated.splice(index, 1)
    }

    setCarrinho(updated)
  }

  const removeItem = (index: number) => {
    const updated = [...carrinho]
    updated.splice(index, 1)
    setCarrinho(updated)
  }

  const clearCarrinho = () => {
    setCarrinho([])
    setCliente(null)
  }

  // Cálculos
  const subtotal = carrinho.reduce(
    (sum, item) => sum + item.quantidade * item.preco_unitario,
    0
  )

  const totalDesconto = carrinho.reduce(
    (sum, item) => sum + item.desconto,
    0
  )

  const total = subtotal - totalDesconto

  const iva5 = carrinho
    .filter((item) => item.iva === 5)
    .reduce((sum, item) => {
      const itemTotal = item.quantidade * item.preco_unitario - item.desconto
      return sum + (itemTotal * 0.05) / 1.05
    }, 0)

  const iva10 = carrinho
    .filter((item) => item.iva === 10)
    .reduce((sum, item) => {
      const itemTotal = item.quantidade * item.preco_unitario - item.desconto
      return sum + (itemTotal * 0.10) / 1.10
    }, 0)

  const troco = valorRecebido ? parseFloat(valorRecebido) - total : 0

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Buscar cliente por RUC
  const buscarCliente = async () => {
    if (!clienteRuc.trim()) {
      toast.error("Digite o RUC do cliente")
      return
    }

    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("ruc", clienteRuc.trim())
        .single()

      if (data) {
        setCliente(data)
        setClienteNome(data.nome)
        toast.success("Cliente encontrado")
      } else {
        // Cliente não existe, permitir cadastro
        setClienteNome("")
        toast.info("Cliente não encontrado. Preencha o nome para cadastrar.")
      }
    } catch (error) {
      setClienteNome("")
      toast.info("Cliente não encontrado. Preencha o nome para cadastrar.")
    }
  }

  const salvarCliente = async () => {
    if (!clienteRuc.trim() || !clienteNome.trim()) {
      toast.error("RUC e Nome são obrigatórios")
      return
    }

    try {
      const { data, error } = await supabase
        .from("clientes")
        .upsert({
          ruc: clienteRuc.trim(),
          nome: clienteNome.trim(),
        }, { onConflict: "ruc" })
        .select()
        .single()

      if (error) throw error

      setCliente(data)
      setClienteDialogOpen(false)
      toast.success("Cliente salvo")
    } catch (error) {
      console.error("Erro ao salvar cliente:", error)
      toast.error("Erro ao salvar cliente")
    }
  }

  // Finalizar venda
  const finalizarVenda = async () => {
    if (carrinho.length === 0) {
      toast.error("Adicione itens ao carrinho")
      return
    }

    if (tipoDocumento === "fatura" && !cliente) {
      toast.error("Para fatura, é necessário informar o cliente")
      return
    }

    setLoading(true)
    try {
      // Criar ou atualizar venda
      const vendaData = {
        tipo: "pdv" as const,
        cliente_id: cliente?.id || null,
        cliente_nome: cliente?.nome || "Consumidor Final",
        cliente_ruc: cliente?.ruc || "00000000-0",
        subtotal,
        desconto: totalDesconto,
        total,
        iva_5: iva5,
        iva_10: iva10,
        forma_pagamento: formaPagamento,
        valor_recebido: parseFloat(valorRecebido) || total,
        troco: troco > 0 ? troco : 0,
        tipo_documento: tipoDocumento,
        status: "finalizada" as const,
        cotacao_brl: cotacaoBRL,
        cotacao_usd: cotacaoUSD,
        updated_at: new Date().toISOString(),
      }

      let venda: Venda

      if (vendaFinalizada) {
        // Atualizar venda existente (da mesa)
        const { data, error } = await supabase
          .from("vendas")
          .update(vendaData)
          .eq("id", vendaFinalizada.id)
          .select()
          .single()

        if (error) throw error
        venda = data
      } else {
        // Criar nova venda
        const { data, error } = await supabase
          .from("vendas")
          .insert(vendaData)
          .select()
          .single()

        if (error) throw error
        venda = data

        // Criar itens da venda
        const itens = carrinho.map((item) => ({
          venda_id: venda.id,
          produto_id: item.produto_id,
          produto_nome: item.nome,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          desconto: item.desconto,
          total: item.quantidade * item.preco_unitario - item.desconto,
          iva: item.iva,
        }))

        const { error: itensError } = await supabase
          .from("venda_itens")
          .insert(itens)

        if (itensError) throw itensError
      }

      // Buscar itens para exibir na fatura
      const { data: itens } = await supabase
        .from("venda_itens")
        .select("*")
        .eq("venda_id", venda.id)

      setVendaFinalizada(venda)
      setVendaItens(itens || [])
      setFinalizarDialogOpen(false)
      setFaturaDialogOpen(true)
      
      toast.success("Venda finalizada com sucesso!")
    } catch (error) {
      console.error("Erro ao finalizar venda:", error)
      toast.error("Erro ao finalizar venda")
    } finally {
      setLoading(false)
    }
  }

  const novaVenda = () => {
    setCarrinho([])
    setCliente(null)
    setClienteRuc("")
    setClienteNome("")
    setTipoDocumento("ticket")
    setFormaPagamento("dinheiro")
    setValorRecebido("")
    setVendaFinalizada(null)
    setVendaItens([])
    setFaturaDialogOpen(false)
    // Limpar URL params
    window.history.replaceState({}, "", window.location.pathname)
  }

  // Camera para código de barras
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (error) {
      console.error("Erro ao acessar câmera:", error)
      toast.error("Não foi possível acessar a câmera")
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      setCameraActive(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">PDV - Ponto de Venda</h2>
          <p className="text-muted-foreground">Caixa de vendas diretas</p>
        </div>
        <Button variant="outline" onClick={clearCarrinho}>
          <X className="h-4 w-4 mr-2" />
          Limpar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Área de Busca */}
        <div className="lg:col-span-2 space-y-4">
          {/* Busca por Código de Barras */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Barcode className="h-5 w-5" />
                Código de Barras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Leia ou digite o código de barras"
                    value={searchBarcode}
                    onChange={(e) => setSearchBarcode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleBarcodeSearch(searchBarcode)
                    }}
                    autoFocus
                  />
                </div>
                <Button onClick={() => handleBarcodeSearch(searchBarcode)}>
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={cameraActive ? stopCamera : startCamera}>
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              {cameraActive && (
                <div className="mt-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full max-w-sm rounded-lg"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Aponte a câmera para o código de barras
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Busca por Código Interno */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Hash className="h-5 w-5" />
                Código Interno
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o código interno do produto"
                  value={searchCodigo}
                  onChange={(e) => setSearchCodigo(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCodigoSearch()
                  }}
                />
                <Button onClick={handleCodigoSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Busca por Nome */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Type className="h-5 w-5" />
                Nome do Produto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o nome do produto"
                  value={searchNome}
                  onChange={(e) => setSearchNome(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNomeSearch()
                  }}
                />
                <Button onClick={handleNomeSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              {searchNome && (
                <div className="mt-2 max-h-40 overflow-y-auto">
                  {produtos
                    .filter((p) =>
                      p.nome.toLowerCase().includes(searchNome.toLowerCase())
                    )
                    .slice(0, 5)
                    .map((produto) => (
                      <div
                        key={produto.id}
                        className="p-2 hover:bg-accent rounded cursor-pointer"
                        onClick={() => {
                          addToCarrinho(produto)
                          setSearchNome("")
                        }}
                      >
                        <p className="font-medium">{produto.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(produto.preco_venda)}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Carrinho */}
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Carrinho
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setClienteDialogOpen(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {cliente ? cliente.nome : "Cliente"}
              </Button>
            </div>
            {cliente && (
              <p className="text-sm text-muted-foreground">
                RUC: {cliente.ruc}
              </p>
            )}
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1">
              {carrinho.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carrinho vazio
                </div>
              ) : (
                <div className="space-y-2">
                  {carrinho.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-lg border"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.preco_unitario)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantidade(index, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm">
                          {item.quantidade}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantidade(index, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {totalDesconto > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto</span>
                  <span>-{formatPrice(totalDesconto)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Button
                className="w-full"
                size="lg"
                disabled={carrinho.length === 0}
                onClick={() => setFinalizarDialogOpen(true)}
              >
                <DollarSign className="h-5 w-5 mr-2" />
                Finalizar Venda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Cliente */}
      <Dialog open={clienteDialogOpen} onOpenChange={setClienteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dados do Cliente</DialogTitle>
            <DialogDescription>
              Informe os dados do cliente para a venda
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>RUC</Label>
              <div className="flex gap-2">
                <Input
                  value={clienteRuc}
                  onChange={(e) => setClienteRuc(e.target.value)}
                  placeholder="00000000-0"
                />
                <Button onClick={buscarCliente}>Buscar</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                placeholder="Nome do cliente"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClienteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarCliente}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Finalizar */}
      <Dialog open={finalizarDialogOpen} onOpenChange={setFinalizarDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Venda</DialogTitle>
            <DialogDescription>
              Escolha o tipo de documento e forma de pagamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Tipo de Documento */}
            <div className="space-y-3">
              <Label>Tipo de Documento</Label>
              <RadioGroup
                value={tipoDocumento}
                onValueChange={(value) => setTipoDocumento(value as "ticket" | "fatura")}
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="ticket" id="ticket" />
                  <Label htmlFor="ticket" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      <span className="font-medium">Ticket Comum</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Comprovante simples sem valor fiscal
                    </p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="fatura" id="fatura" />
                  <Label htmlFor="fatura" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">Faturar Legal</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Documento fiscal com dados do cliente
                    </p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {tipoDocumento === "fatura" && !cliente && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  Para emitir fatura, é necessário informar os dados do cliente
                </p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-amber-800"
                  onClick={() => {
                    setFinalizarDialogOpen(false)
                    setClienteDialogOpen(true)
                  }}
                >
                  Adicionar cliente
                </Button>
              </div>
            )}

            {/* Forma de Pagamento */}
            <div className="space-y-3">
              <Label>Forma de Pagamento</Label>
              <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao_debito">Cartão Débito</SelectItem>
                  <SelectItem value="cartao_credito">Cartão Crédito</SelectItem>
                  <SelectItem value="pix">PIX / Transferência</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Valor Recebido */}
            {formaPagamento === "dinheiro" && (
              <div className="space-y-3">
                <Label>Valor Recebido</Label>
                <Input
                  type="number"
                  value={valorRecebido}
                  onChange={(e) => setValorRecebido(e.target.value)}
                  placeholder={total.toString()}
                />
                {troco > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      Troco: <span className="font-bold">{formatPrice(troco)}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Resumo */}
            <div className="p-3 bg-muted rounded-lg space-y-1">
              <div className="flex justify-between text-sm">
                <span>Total</span>
                <span className="font-bold">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>IVA 5%</span>
                <span>{formatPrice(iva5)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>IVA 10%</span>
                <span>{formatPrice(iva10)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFinalizarDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={finalizarVenda} disabled={loading}>
              {loading ? "Processando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Fatura/Comprovante */}
      <Dialog open={faturaDialogOpen} onOpenChange={setFaturaDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {vendaFinalizada?.tipo_documento === "fatura" ? "FATURA" : "TICKET DE VENDA"}
            </DialogTitle>
          </DialogHeader>
          
          {vendaFinalizada && emitente && (
            <div className="space-y-4 text-sm">
              {/* Dados Emitente */}
              <div className="text-center border-b pb-3">
                {emitente.logo && (
                  <img
                    src={emitente.logo}
                    alt="Logo"
                    className="h-12 mx-auto mb-2"
                  />
                )}
                <p className="font-bold">{emitente.razao_social}</p>
                <p className="text-muted-foreground">RUC: {emitente.ruc}</p>
                {emitente.endereco_rua && (
                  <p className="text-muted-foreground">
                    {emitente.endereco_rua}, {emitente.endereco_numero}
                  </p>
                )}
                {emitente.telefone && (
                  <p className="text-muted-foreground">Tel: {emitente.telefone}</p>
                )}
              </div>

              {/* Dados Cliente */}
              {vendaFinalizada.tipo_documento === "fatura" && (
                <div className="border-b pb-3">
                  <p><strong>Cliente:</strong> {vendaFinalizada.cliente_nome}</p>
                  <p><strong>RUC:</strong> {vendaFinalizada.cliente_ruc}</p>
                </div>
              )}

              {/* Número e Data */}
              <div className="border-b pb-3">
                <p><strong>Venda Nº:</strong> {vendaFinalizada.numero_venda}</p>
                <p><strong>Data:</strong> {new Date(vendaFinalizada.created_at).toLocaleString("es-PY")}</p>
              </div>

              {/* Itens */}
              <div className="border-b pb-3 space-y-1">
                <p className="font-bold">ITENS:</p>
                {vendaItens.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.quantidade}x {item.produto_nome}
                    </span>
                    <span>{formatPrice(item.total)}</span>
                  </div>
                ))}
              </div>

              {/* Totais */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(vendaFinalizada.subtotal)}</span>
                </div>
                {vendaFinalizada.desconto > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto:</span>
                    <span>-{formatPrice(vendaFinalizada.desconto)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>TOTAL:</span>
                  <span>{formatPrice(vendaFinalizada.total)}</span>
                </div>
                
                {/* IVA */}
                <div className="text-muted-foreground text-xs">
                  <p>IVA 5%: {formatPrice(vendaFinalizada.iva_5)}</p>
                  <p>IVA 10%: {formatPrice(vendaFinalizada.iva_10)}</p>
                </div>
              </div>

              {/* Pagamento */}
              <div className="border-t pt-3">
                <p><strong>Pagamento:</strong> {vendaFinalizada.forma_pagamento}</p>
                {vendaFinalizada.troco > 0 && (
                  <>
                    <p>Recebido: {formatPrice(vendaFinalizada.valor_recebido)}</p>
                    <p>Troco: {formatPrice(vendaFinalizada.troco)}</p>
                  </>
                )}
              </div>

              {/* Câmbio */}
              <div className="border-t pt-3 text-xs text-muted-foreground">
                <p className="font-bold">Valores de Referência:</p>
                <p>Total em BRL: R$ {(vendaFinalizada.total / cotacaoBRL).toFixed(2)}</p>
                <p>Total em USD: US$ {(vendaFinalizada.total / cotacaoUSD).toFixed(2)}</p>
                <p className="mt-1">Cotação BRL: {formatPrice(cotacaoBRL)}</p>
                <p>Cotação USD: {formatPrice(cotacaoUSD)}</p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col gap-2">
            <Button className="w-full" variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button className="w-full" onClick={novaVenda}>
              Nova Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
