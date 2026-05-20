"use client"

import { useState, useRef } from 'react'
import { useGestorX } from '@/lib/context'
import { Produto, UNIDADES_MEDIDA } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Package, 
  Plus, 
  Pencil, 
  Trash2, 
  Upload,
  X,
  Search,
  Barcode,
  ChefHat,
  Printer,
  AlertCircle
} from 'lucide-react'

const CATEGORIAS = [
  'Alimentos',
  'Bebidas',
  'Sobremesas',
  'Lanches',
  'Carnes',
  'Massas',
  'Saladas',
  'Porções',
  'Combos',
  'Outros',
]

export function ProdutoCadastroForm() {
  const { 
    produtos, 
    addProduto, 
    updateProduto, 
    removeProduto, 
    areasPreparo, 
    moduloRestauranteAtivo 
  } = useGestorX()
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [imagemPreview, setImagemPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const defaultFormData: Partial<Produto> = {
    nome: '',
    codigoInterno: '',
    codigoBarras: '',
    categoria: '',
    subcategoria: '',
    marca: '',
    fornecedorId: '',
    unidadeMedida: 'un',
    estoqueMinimo: 0,
    estoqueAtual: 0,
    localizacaoEstoque: '',
    precoCusto: 0,
    precoVenda: 0,
    margemLucro: 0,
    iva: 10,
    moeda: 'PYG',
    imagem: null,
    descricao: '',
    areaPreparoId: null,
    imprimirNaProducao: false,
    ativo: true,
  }

  const [formData, setFormData] = useState<Partial<Produto>>(defaultFormData)

  const resetForm = () => {
    setFormData(defaultFormData)
    setImagemPreview(null)
    setEditingProduto(null)
  }

  const openEdit = (produto: Produto) => {
    setEditingProduto(produto)
    setFormData(produto)
    setImagemPreview(produto.imagem)
    setDialogOpen(true)
  }

  const handleChange = (field: string, value: string | number | boolean | null) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Calcular margem de lucro automaticamente
      if (field === 'precoCusto' || field === 'precoVenda') {
        const custo = field === 'precoCusto' ? Number(value) : Number(prev.precoCusto || 0)
        const venda = field === 'precoVenda' ? Number(value) : Number(prev.precoVenda || 0)
        if (custo > 0 && venda > 0) {
          updated.margemLucro = Number((((venda - custo) / custo) * 100).toFixed(2))
        }
      }
      
      return updated
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.match(/image\/(jpeg|png)/)) {
        alert('Por favor, selecione uma imagem JPG ou PNG.')
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('O arquivo deve ter no máximo 2MB.')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setImagemPreview(result)
        setFormData(prev => ({ ...prev, imagem: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagemPreview(null)
    setFormData(prev => ({ ...prev, imagem: null }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSave = () => {
    if (!formData.nome || !formData.categoria) return

    if (editingProduto) {
      updateProduto(editingProduto.id, { ...formData, updatedAt: new Date() })
    } else {
      const newProduto: Produto = {
        ...formData as Produto,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      addProduto(newProduto)
    }
    setDialogOpen(false)
    resetForm()
  }

  const filteredProdutos = produtos.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigoInterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigoBarras.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (value: number, moeda: string = 'PYG') => {
    const symbols: Record<string, string> = { PYG: 'Gs.', BRL: 'R$', USD: '$' }
    return `${symbols[moeda]} ${value.toLocaleString('es-PY')}`
  }

  const areasAtivas = areasPreparo.filter(a => a.ativo)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Cadastro de Produtos</CardTitle>
                <CardDescription>
                  Gerencie os produtos do seu estabelecimento
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open)
                if (!open) resetForm()
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduto ? 'Editar Produto' : 'Novo Produto'}
                    </DialogTitle>
                    <DialogDescription>
                      Preencha os dados do produto
                    </DialogDescription>
                  </DialogHeader>

                  <Tabs defaultValue="geral" className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="geral">Dados Gerais</TabsTrigger>
                      <TabsTrigger value="precos">Preços e Estoque</TabsTrigger>
                      {moduloRestauranteAtivo && (
                        <TabsTrigger value="producao">Produção</TabsTrigger>
                      )}
                    </TabsList>

                    {/* Aba Dados Gerais */}
                    <TabsContent value="geral" className="space-y-4 pt-4">
                      <div className="flex gap-6">
                        {/* Imagem */}
                        <div className="space-y-2">
                          <Label>Imagem do Produto</Label>
                          <div 
                            className="relative flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-primary/50"
                          >
                            {imagemPreview ? (
                              <>
                                <img 
                                  src={imagemPreview} 
                                  alt="Produto" 
                                  className="h-full w-full rounded-lg object-contain p-2"
                                />
                                <button
                                  onClick={removeImage}
                                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </>
                            ) : (
                              <div 
                                className="flex cursor-pointer flex-col items-center gap-1 text-muted-foreground"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Upload className="h-8 w-8" />
                                <span className="text-xs">Adicionar</span>
                              </div>
                            )}
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>

                        {/* Campos */}
                        <div className="flex-1 space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="nome">Nome do Produto *</Label>
                              <Input
                                id="nome"
                                placeholder="Digite o nome"
                                value={formData.nome}
                                onChange={(e) => handleChange('nome', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="categoria">Categoria *</Label>
                              <Select
                                value={formData.categoria}
                                onValueChange={(value) => handleChange('categoria', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  {CATEGORIAS.map((cat) => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                              <Label htmlFor="codigoInterno">Código Interno</Label>
                              <Input
                                id="codigoInterno"
                                placeholder="SKU001"
                                value={formData.codigoInterno}
                                onChange={(e) => handleChange('codigoInterno', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="codigoBarras">Código de Barras</Label>
                              <div className="relative">
                                <Barcode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id="codigoBarras"
                                  placeholder="7890000000000"
                                  className="pl-10"
                                  value={formData.codigoBarras}
                                  onChange={(e) => handleChange('codigoBarras', e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="marca">Marca</Label>
                              <Input
                                id="marca"
                                placeholder="Marca do produto"
                                value={formData.marca}
                                onChange={(e) => handleChange('marca', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea
                          id="descricao"
                          placeholder="Descrição detalhada do produto..."
                          value={formData.descricao}
                          onChange={(e) => handleChange('descricao', e.target.value)}
                        />
                      </div>
                    </TabsContent>

                    {/* Aba Preços e Estoque */}
                    <TabsContent value="precos" className="space-y-4 pt-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="precoCusto">Preço de Custo</Label>
                          <Input
                            id="precoCusto"
                            type="number"
                            placeholder="0"
                            value={formData.precoCusto}
                            onChange={(e) => handleChange('precoCusto', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="precoVenda">Preço de Venda *</Label>
                          <Input
                            id="precoVenda"
                            type="number"
                            placeholder="0"
                            value={formData.precoVenda}
                            onChange={(e) => handleChange('precoVenda', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="margemLucro">Margem de Lucro</Label>
                          <div className="relative">
                            <Input
                              id="margemLucro"
                              type="number"
                              value={formData.margemLucro}
                              readOnly
                              className="bg-muted"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="moeda">Moeda</Label>
                          <Select
                            value={formData.moeda}
                            onValueChange={(value) => handleChange('moeda', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PYG">Guarani (PYG)</SelectItem>
                              <SelectItem value="BRL">Real (BRL)</SelectItem>
                              <SelectItem value="USD">Dólar (USD)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="iva">IVA</Label>
                          <Select
                            value={String(formData.iva)}
                            onValueChange={(value) => handleChange('iva', parseInt(value))}
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
                        <div className="space-y-2">
                          <Label htmlFor="unidadeMedida">Unidade de Medida</Label>
                          <Select
                            value={formData.unidadeMedida}
                            onValueChange={(value) => handleChange('unidadeMedida', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {UNIDADES_MEDIDA.map((um) => (
                                <SelectItem key={um.value} value={um.value}>{um.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="estoqueAtual">Estoque Atual</Label>
                          <Input
                            id="estoqueAtual"
                            type="number"
                            placeholder="0"
                            value={formData.estoqueAtual}
                            onChange={(e) => handleChange('estoqueAtual', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
                          <Input
                            id="estoqueMinimo"
                            type="number"
                            placeholder="0"
                            value={formData.estoqueMinimo}
                            onChange={(e) => handleChange('estoqueMinimo', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="localizacaoEstoque">Localização</Label>
                          <Input
                            id="localizacaoEstoque"
                            placeholder="Ex: Prateleira A1"
                            value={formData.localizacaoEstoque}
                            onChange={(e) => handleChange('localizacaoEstoque', e.target.value)}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    {/* Aba Produção (apenas se módulo restaurante ativo) */}
                    {moduloRestauranteAtivo && (
                      <TabsContent value="producao" className="space-y-4 pt-4">
                        <Card className="border-amber-200 bg-amber-50/50">
                          <CardContent className="flex items-start gap-4 pt-6">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                              <ChefHat className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-amber-900">Configuração de Produção</h4>
                              <p className="mt-1 text-sm text-amber-700">
                                Configure para qual área de preparo este produto será enviado quando pedido.
                                O pedido será impresso automaticamente na impressora vinculada à área.
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="areaPreparo">Área de Preparo</Label>
                            <Select
                              value={formData.areaPreparoId || 'none'}
                              onValueChange={(value) => handleChange('areaPreparoId', value === 'none' ? null : value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a área de preparo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Nenhuma área (não será enviado para produção)</SelectItem>
                                {areasAtivas.map((area) => (
                                  <SelectItem key={area.id} value={area.id}>
                                    <span className="flex items-center gap-2">
                                      <ChefHat className="h-4 w-4" />
                                      {area.nome}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                              Selecione a área responsável pelo preparo deste produto
                            </p>
                          </div>

                          <div className="flex items-start gap-3 rounded-lg border p-4">
                            <Checkbox
                              id="imprimirNaProducao"
                              checked={formData.imprimirNaProducao}
                              onCheckedChange={(checked) => handleChange('imprimirNaProducao', checked)}
                            />
                            <div className="space-y-1">
                              <Label 
                                htmlFor="imprimirNaProducao" 
                                className="flex cursor-pointer items-center gap-2 font-medium"
                              >
                                <Printer className="h-4 w-4" />
                                Imprimir na Produção
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Marque esta opção para que o pedido seja impresso automaticamente 
                                na impressora da área de preparo selecionada
                              </p>
                            </div>
                          </div>

                          {formData.areaPreparoId && !formData.imprimirNaProducao && (
                            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                              <AlertCircle className="h-4 w-4" />
                              <span>
                                O produto tem área de preparo definida, mas não será impresso automaticamente.
                              </span>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>

                  <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={!formData.nome || !formData.categoria}>
                      {editingProduto ? 'Salvar Alterações' : 'Adicionar Produto'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {produtos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Nenhum produto cadastrado</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Comece cadastrando os produtos do seu estabelecimento.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  {moduloRestauranteAtivo && <TableHead>Área/Impressão</TableHead>}
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProdutos.map((produto) => {
                  const areaPreparo = areasPreparo.find(a => a.id === produto.areaPreparoId)
                  return (
                    <TableRow key={produto.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {produto.imagem ? (
                            <img 
                              src={produto.imagem} 
                              alt={produto.nome}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <span className="font-medium">{produto.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-1 text-xs">
                          {produto.codigoInterno || produto.codigoBarras || '-'}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{produto.categoria}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(produto.precoVenda, produto.moeda)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={produto.estoqueAtual <= produto.estoqueMinimo ? "destructive" : "secondary"}
                        >
                          {produto.estoqueAtual} {produto.unidadeMedida}
                        </Badge>
                      </TableCell>
                      {moduloRestauranteAtivo && (
                        <TableCell>
                          {areaPreparo ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{areaPreparo.nome}</Badge>
                              {produto.imprimirNaProducao && (
                                <Printer className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(produto)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeProduto(produto.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
