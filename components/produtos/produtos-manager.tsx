"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useModulos } from "@/lib/modulos-context"
import type { Produto, Categoria, AreaPreparo } from "@/lib/database.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Plus, Package, Edit, Trash2, Search, ChefHat, DollarSign, Boxes } from "lucide-react"

export function ProdutosManager() {
  const { modulos, isModuloAtivo } = useModulos()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [areasPreparo, setAreasPreparo] = useState<AreaPreparo[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    codigo_interno: "",
    codigo_barras: "",
    nome: "",
    descricao: "",
    categoria_id: "",
    marca: "",
    unidade_medida: "un",
    preco_custo: "",
    preco_venda: "",
    iva: "10",
    moeda: "PYG" as Produto["moeda"],
    estoque_atual: "",
    estoque_minimo: "",
    localizacao_estoque: "",
    area_preparo_id: "",
    imprimir_na_producao: false,
    ativo: true,
  })
  const supabase = createClient()

  const showProducaoTab = isModuloAtivo("restaurante") || isModuloAtivo("delivery") || isModuloAtivo("comandas")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [produtosRes, categoriasRes, areasRes] = await Promise.all([
        supabase.from("produtos").select("*").order("nome"),
        supabase.from("categorias").select("*").eq("ativo", true).order("nome"),
        supabase.from("areas_preparo").select("*").eq("ativo", true).order("nome"),
      ])

      if (produtosRes.error) throw produtosRes.error
      if (categoriasRes.error) throw categoriasRes.error
      if (areasRes.error) throw areasRes.error

      setProdutos(produtosRes.data || [])
      setCategorias(categoriasRes.data || [])
      setAreasPreparo(areasRes.data || [])
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast.error("Erro ao carregar produtos")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      codigo_interno: "",
      codigo_barras: "",
      nome: "",
      descricao: "",
      categoria_id: "",
      marca: "",
      unidade_medida: "un",
      preco_custo: "",
      preco_venda: "",
      iva: "10",
      moeda: "PYG",
      estoque_atual: "",
      estoque_minimo: "",
      localizacao_estoque: "",
      area_preparo_id: "",
      imprimir_na_producao: false,
      ativo: true,
    })
    setEditingId(null)
  }

  const openEditDialog = (produto: Produto) => {
    setFormData({
      codigo_interno: produto.codigo_interno || "",
      codigo_barras: produto.codigo_barras || "",
      nome: produto.nome,
      descricao: produto.descricao || "",
      categoria_id: produto.categoria_id || "",
      marca: produto.marca || "",
      unidade_medida: produto.unidade_medida,
      preco_custo: produto.preco_custo.toString(),
      preco_venda: produto.preco_venda.toString(),
      iva: produto.iva.toString(),
      moeda: produto.moeda,
      estoque_atual: produto.estoque_atual.toString(),
      estoque_minimo: produto.estoque_minimo.toString(),
      localizacao_estoque: produto.localizacao_estoque || "",
      area_preparo_id: produto.area_preparo_id || "",
      imprimir_na_producao: produto.imprimir_na_producao,
      ativo: produto.ativo,
    })
    setEditingId(produto.id)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.nome || !formData.preco_venda) {
      toast.error("Nome e preço de venda são obrigatórios")
      return
    }

    try {
      const dataToSave = {
        codigo_interno: formData.codigo_interno || null,
        codigo_barras: formData.codigo_barras || null,
        nome: formData.nome,
        descricao: formData.descricao || null,
        categoria_id: formData.categoria_id || null,
        marca: formData.marca || null,
        unidade_medida: formData.unidade_medida,
        preco_custo: parseFloat(formData.preco_custo) || 0,
        preco_venda: parseFloat(formData.preco_venda),
        iva: parseInt(formData.iva),
        moeda: formData.moeda,
        estoque_atual: parseFloat(formData.estoque_atual) || 0,
        estoque_minimo: parseFloat(formData.estoque_minimo) || 0,
        localizacao_estoque: formData.localizacao_estoque || null,
        area_preparo_id: formData.area_preparo_id || null,
        imprimir_na_producao: formData.imprimir_na_producao,
        ativo: formData.ativo,
        updated_at: new Date().toISOString(),
      }

      // Calcular margem
      if (dataToSave.preco_custo > 0) {
        dataToSave.margem_lucro = ((dataToSave.preco_venda - dataToSave.preco_custo) / dataToSave.preco_custo) * 100
      }

      if (editingId) {
        const { error } = await supabase
          .from("produtos")
          .update(dataToSave)
          .eq("id", editingId)

        if (error) throw error
        toast.success("Produto atualizado com sucesso")
      } else {
        const { error } = await supabase
          .from("produtos")
          .insert(dataToSave)

        if (error) throw error
        toast.success("Produto adicionado com sucesso")
      }

      setDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error("Erro ao salvar produto:", error)
      toast.error("Erro ao salvar produto")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este produto?")) return

    try {
      const { error } = await supabase
        .from("produtos")
        .delete()
        .eq("id", id)

      if (error) throw error
      toast.success("Produto excluído com sucesso")
      fetchData()
    } catch (error) {
      console.error("Erro ao excluir produto:", error)
      toast.error("Erro ao excluir produto")
    }
  }

  const formatPrice = (value: number, moeda: string) => {
    if (moeda === "PYG") {
      return new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", maximumFractionDigits: 0 }).format(value)
    }
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda }).format(value)
  }

  const getCategoriaNome = (categoriaId: string | null) => {
    if (!categoriaId) return "-"
    const categoria = categorias.find((c) => c.id === categoriaId)
    return categoria?.nome || "-"
  }

  const filteredProdutos = produtos.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo_interno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo_barras?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cadastro de Produtos</h2>
          <p className="text-muted-foreground">
            Gerencie os produtos do seu estabelecimento
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Produto" : "Novo Produto"}</DialogTitle>
              <DialogDescription>
                Preencha os dados do produto
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="geral" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="geral">
                  <Package className="h-4 w-4 mr-2" />
                  Geral
                </TabsTrigger>
                <TabsTrigger value="precos">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Preços
                </TabsTrigger>
                {showProducaoTab && (
                  <TabsTrigger value="producao">
                    <ChefHat className="h-4 w-4 mr-2" />
                    Produção
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="geral" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="codigo_interno">Código Interno</Label>
                    <Input
                      id="codigo_interno"
                      value={formData.codigo_interno}
                      onChange={(e) => setFormData({ ...formData, codigo_interno: e.target.value })}
                      placeholder="001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="codigo_barras">Código de Barras</Label>
                    <Input
                      id="codigo_barras"
                      value={formData.codigo_barras}
                      onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                      placeholder="7891234567890"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome do produto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição do produto"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={formData.categoria_id}
                      onValueChange={(value) => setFormData({ ...formData, categoria_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marca">Marca</Label>
                    <Input
                      id="marca"
                      value={formData.marca}
                      onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                      placeholder="Marca"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Select
                      value={formData.unidade_medida}
                      onValueChange={(value) => setFormData({ ...formData, unidade_medida: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="un">Unidade</SelectItem>
                        <SelectItem value="kg">Quilograma</SelectItem>
                        <SelectItem value="g">Grama</SelectItem>
                        <SelectItem value="l">Litro</SelectItem>
                        <SelectItem value="ml">Mililitro</SelectItem>
                        <SelectItem value="m">Metro</SelectItem>
                        <SelectItem value="cx">Caixa</SelectItem>
                        <SelectItem value="pc">Pacote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estoque_atual">Estoque Atual</Label>
                    <Input
                      id="estoque_atual"
                      type="number"
                      value={formData.estoque_atual}
                      onChange={(e) => setFormData({ ...formData, estoque_atual: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estoque_minimo">Estoque Mínimo</Label>
                    <Input
                      id="estoque_minimo"
                      type="number"
                      value={formData.estoque_minimo}
                      onChange={(e) => setFormData({ ...formData, estoque_minimo: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                  />
                  <Label>Produto ativo</Label>
                </div>
              </TabsContent>

              <TabsContent value="precos" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Moeda</Label>
                    <Select
                      value={formData.moeda}
                      onValueChange={(value: Produto["moeda"]) => setFormData({ ...formData, moeda: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PYG">Guaraní (Gs)</SelectItem>
                        <SelectItem value="BRL">Real (R$)</SelectItem>
                        <SelectItem value="USD">Dólar (US$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preco_custo">Preço de Custo</Label>
                    <Input
                      id="preco_custo"
                      type="number"
                      step="0.01"
                      value={formData.preco_custo}
                      onChange={(e) => setFormData({ ...formData, preco_custo: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preco_venda">Preço de Venda *</Label>
                    <Input
                      id="preco_venda"
                      type="number"
                      step="0.01"
                      value={formData.preco_venda}
                      onChange={(e) => setFormData({ ...formData, preco_venda: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>IVA</Label>
                  <Select
                    value={formData.iva}
                    onValueChange={(value) => setFormData({ ...formData, iva: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.preco_custo && formData.preco_venda && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Margem de Lucro</p>
                    <p className="text-2xl font-bold text-primary">
                      {(((parseFloat(formData.preco_venda) - parseFloat(formData.preco_custo)) / parseFloat(formData.preco_custo)) * 100).toFixed(2)}%
                    </p>
                  </div>
                )}
              </TabsContent>

              {showProducaoTab && (
                <TabsContent value="producao" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Configuração de Produção</CardTitle>
                      <CardDescription>
                        Configure para qual área de preparo este produto será enviado
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Área de Preparo</Label>
                        <Select
                          value={formData.area_preparo_id}
                          onValueChange={(value) => setFormData({ ...formData, area_preparo_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a área" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Nenhuma</SelectItem>
                            {areasPreparo.map((area) => (
                              <SelectItem key={area.id} value={area.id}>
                                {area.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Selecione para qual área (Cozinha, Bar, Copa) o pedido deste produto será enviado
                        </p>
                      </div>

                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <Checkbox
                          id="imprimir_producao"
                          checked={formData.imprimir_na_producao}
                          onCheckedChange={(checked) => 
                            setFormData({ ...formData, imprimir_na_producao: checked as boolean })
                          }
                        />
                        <div>
                          <Label htmlFor="imprimir_producao" className="cursor-pointer">
                            Imprimir na Produção
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Quando ativo, o pedido será impresso automaticamente na impressora da área de preparo selecionada
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Produtos Cadastrados</CardTitle>
              <CardDescription>{produtos.length} produtos no total</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProdutos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProdutos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-mono text-sm">
                      {produto.codigo_interno || "-"}
                    </TableCell>
                    <TableCell className="font-medium">{produto.nome}</TableCell>
                    <TableCell>{getCategoriaNome(produto.categoria_id)}</TableCell>
                    <TableCell>{formatPrice(produto.preco_venda, produto.moeda)}</TableCell>
                    <TableCell>
                      <Badge variant={produto.estoque_atual <= produto.estoque_minimo ? "destructive" : "secondary"}>
                        {produto.estoque_atual} {produto.unidade_medida}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={produto.ativo ? "default" : "secondary"}>
                        {produto.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(produto)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(produto.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
