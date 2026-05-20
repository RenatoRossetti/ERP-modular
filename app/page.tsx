"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { GestorProvider, useGestor } from '@/lib/gestor-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  LayoutDashboard,
  Building2,
  Printer,
  ChefHat,
  Package,
  Boxes,
  ShoppingCart,
  UtensilsCrossed,
  Users,
  Settings,
  Menu,
  X,
  Search,
  Barcode,
  Hash,
  FileText,
  Plus,
  Minus,
  Trash2,
  Receipt,
  CreditCard,
  Banknote,
  QrCode,
  Camera,
  ChevronLeft,
  UserPlus,
  Edit,
  Tags
} from 'lucide-react'
import type { Produto, Mesa, MesaItem, Venda } from '@/lib/database.types'

type PageKey = 'dashboard' | 'emitente' | 'impressoras' | 'areas' | 'produtos' | 'categorias' | 'modulos' | 'pdv' | 'mesas' | 'mesa-detail' | 'clientes'

// ========== DASHBOARD ==========
function DashboardContent() {
  const { emitente, impressoras, areasPreparo, produtos, modulos, mesas } = useGestor()

  const mesasOcupadas = mesas.filter(m => m.status === 'ocupada').length
  const mesasLivres = mesas.filter(m => m.status === 'livre').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao GestorX - Sistema de Gestao Completo
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{produtos.length}</div>
            <p className="text-xs text-muted-foreground">cadastrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressoras</CardTitle>
            <Printer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{impressoras.length}</div>
            <p className="text-xs text-muted-foreground">configuradas</p>
          </CardContent>
        </Card>
        {modulos?.restaurante && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mesas Ocupadas</CardTitle>
                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mesasOcupadas}</div>
                <p className="text-xs text-muted-foreground">de {mesas.length} mesas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mesas Livres</CardTitle>
                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{mesasLivres}</div>
                <p className="text-xs text-muted-foreground">disponiveis</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status da Configuracao</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Dados do Emitente</span>
            <Badge variant={emitente?.ruc && emitente.ruc !== '00000000-0' ? "default" : "secondary"}>
              {emitente?.ruc && emitente.ruc !== '00000000-0' ? 'Configurado' : 'Pendente'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Impressoras</span>
            <Badge variant={impressoras.length > 0 ? "default" : "secondary"}>
              {impressoras.length > 0 ? `${impressoras.length} configurada(s)` : 'Pendente'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Produtos</span>
            <Badge variant={produtos.length > 0 ? "default" : "secondary"}>
              {produtos.length > 0 ? `${produtos.length} produto(s)` : 'Nenhum'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ========== MODULOS CONFIG ==========
function ModulosConfig() {
  const { modulos, updateModulos } = useGestor()
  const [saving, setSaving] = useState(false)

  if (!modulos) return <div>Carregando...</div>

  const handleToggle = async (key: string, value: boolean) => {
    setSaving(true)
    try {
      await updateModulos({ [key]: value } as any)
      toast.success(`Modulo ${value ? 'ativado' : 'desativado'}`)
    } catch (error) {
      toast.error('Erro ao atualizar modulo')
    } finally {
      setSaving(false)
    }
  }

  const modulosConfig = [
    { section: 'MODULOS ESSENCIAIS', items: [
      { id: 'pdv', label: 'PDV', description: 'Ponto de venda com vendas rapidas', icon: ShoppingCart },
      { id: 'estoque', label: 'Estoque', description: 'Gestao de estoque', icon: Package },
      { id: 'financeiro', label: 'Financeiro', description: 'Controle financeiro completo', icon: CreditCard },
      { id: 'faturamento', label: 'Faturamento', description: 'Emissao de faturas fiscais', icon: FileText },
    ]},
    { section: 'RESTAURANTE E DELIVERY', items: [
      { id: 'restaurante', label: 'Restaurante', description: 'Gestao de mesas e pedidos', icon: UtensilsCrossed },
      { id: 'delivery', label: 'Delivery', description: 'Controle de entregas', icon: Package },
      { id: 'comandas', label: 'Comandas', description: 'Comandas fisicas e digitais', icon: FileText },
      { id: 'controle_mesas', label: 'Controle de Mesas', description: 'Layout visual de mesas', icon: UtensilsCrossed },
    ]},
    { section: 'MODULOS AVANCADOS', items: [
      { id: 'agendamentos', label: 'Agendamentos', description: 'Agenda de servicos', icon: Settings },
      { id: 'whatsapp', label: 'WhatsApp', description: 'Integracao com WhatsApp', icon: Settings },
      { id: 'multiempresa', label: 'Multiempresa', description: 'Multiplas empresas', icon: Building2 },
      { id: 'multiusuario', label: 'Multiusuario', description: 'Multiplos usuarios', icon: Users },
    ]},
  ]

  const activeCount = Object.values(modulos).filter(v => v === true).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Modulos do Sistema</CardTitle>
            <CardDescription>Ative ou desative os modulos conforme sua necessidade</CardDescription>
          </div>
          <Badge variant="outline">{activeCount} ativos</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {modulosConfig.map((section) => (
          <div key={section.section} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">{section.section}</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {section.items.map((item) => {
                const Icon = item.icon
                const enabled = (modulos as any)[item.id] || false
                return (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <Label className="font-medium">{item.label}</Label>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(value) => handleToggle(item.id, value)}
                      disabled={saving}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ========== EMITENTE CONFIG ==========
function EmitenteConfig() {
  const { emitente, updateEmitente } = useGestor()
  const [form, setForm] = useState({
    ruc: '',
    razao_social: '',
    nome_fantasia: '',
    logo: '',
    endereco_rua: '',
    endereco_numero: '',
    endereco_bairro: '',
    endereco_cidade: '',
    endereco_departamento: '',
    area_atuacao: '',
    telefone: '',
    email: ''
  })
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (emitente) {
      setForm({
        ruc: emitente.ruc || '',
        razao_social: emitente.razao_social || '',
        nome_fantasia: emitente.nome_fantasia || '',
        logo: emitente.logo || '',
        endereco_rua: emitente.endereco_rua || '',
        endereco_numero: emitente.endereco_numero || '',
        endereco_bairro: emitente.endereco_bairro || '',
        endereco_cidade: emitente.endereco_cidade || '',
        endereco_departamento: emitente.endereco_departamento || '',
        area_atuacao: emitente.area_atuacao || '',
        telefone: emitente.telefone || '',
        email: emitente.email || ''
      })
    }
  }, [emitente])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Imagem muito grande. Maximo 2MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm({ ...form, logo: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateEmitente(form)
      toast.success('Dados salvos com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar dados')
    } finally {
      setSaving(false)
    }
  }

  const departamentos = [
    'Asuncion', 'Central', 'Alto Parana', 'Itapua', 'Caaguazu', 'San Pedro',
    'Paraguari', 'Canindeyu', 'Amambay', 'Concepcion', 'Guaira', 'Cordillera',
    'Misiones', 'Neembucu', 'Presidente Hayes', 'Alto Paraguay', 'Boqueron'
  ]

  const areasAtuacao = [
    'Comercio Varejista', 'Comercio Atacadista', 'Restaurante', 'Bar',
    'Lanchonete', 'Padaria', 'Supermercado', 'Farmacia', 'Servicos', 'Industria'
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do Emitente Fiscal</CardTitle>
        <CardDescription>Configure os dados da empresa para emissao de documentos fiscais</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Upload */}
        <div className="flex items-start gap-6">
          <div className="space-y-2">
            <Label>Logo da Empresa</Label>
            <div className="flex items-center gap-4">
              <div 
                className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {form.logo ? (
                  <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Selecionar Imagem
                </Button>
                {form.logo && (
                  <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, logo: '' })}>
                    Remover
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">PNG ou JPG, max 2MB</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>RUC da Empresa *</Label>
            <Input
              value={form.ruc}
              onChange={(e) => setForm({ ...form, ruc: e.target.value })}
              placeholder="00000000-0"
            />
          </div>
          <div className="space-y-2">
            <Label>Razao Social *</Label>
            <Input
              value={form.razao_social}
              onChange={(e) => setForm({ ...form, razao_social: e.target.value })}
              placeholder="Nome da empresa"
            />
          </div>
          <div className="space-y-2">
            <Label>Nome Fantasia</Label>
            <Input
              value={form.nome_fantasia}
              onChange={(e) => setForm({ ...form, nome_fantasia: e.target.value })}
              placeholder="Nome comercial"
            />
          </div>
          <div className="space-y-2">
            <Label>Area de Atuacao</Label>
            <Select value={form.area_atuacao} onValueChange={(v) => setForm({ ...form, area_atuacao: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {areasAtuacao.map(a => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />
        <h3 className="font-semibold">Endereco</h3>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <Label>Rua</Label>
            <Input
              value={form.endereco_rua}
              onChange={(e) => setForm({ ...form, endereco_rua: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Numero</Label>
            <Input
              value={form.endereco_numero}
              onChange={(e) => setForm({ ...form, endereco_numero: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Bairro</Label>
            <Input
              value={form.endereco_bairro}
              onChange={(e) => setForm({ ...form, endereco_bairro: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input
              value={form.endereco_cidade}
              onChange={(e) => setForm({ ...form, endereco_cidade: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Departamento</Label>
            <Select value={form.endereco_departamento} onValueChange={(v) => setForm({ ...form, endereco_departamento: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {departamentos.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />
        <h3 className="font-semibold">Contato</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              placeholder="+595 21 000 0000"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="empresa@email.com"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Dados'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ========== PRODUTOS MANAGER ==========
function ProdutosManager() {
  const { produtos, categorias, areasPreparo, addProduto, updateProduto, removeProduto, moduloRestauranteAtivo } = useGestor()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    codigo_interno: '',
    codigo_barras: '',
    nome: '',
    descricao: '',
    categoria_id: '',
    preco_custo: 0,
    preco_venda: 0,
    iva: 10,
    estoque_atual: 0,
    estoque_minimo: 0,
    area_preparo_id: '',
    imprimir_na_producao: false,
    ativo: true
  })

  const resetForm = () => {
    setForm({
      codigo_interno: '',
      codigo_barras: '',
      nome: '',
      descricao: '',
      categoria_id: '',
      preco_custo: 0,
      preco_venda: 0,
      iva: 10,
      estoque_atual: 0,
      estoque_minimo: 0,
      area_preparo_id: '',
      imprimir_na_producao: false,
      ativo: true
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (produto: Produto) => {
    setForm({
      codigo_interno: produto.codigo_interno || '',
      codigo_barras: produto.codigo_barras || '',
      nome: produto.nome,
      descricao: produto.descricao || '',
      categoria_id: produto.categoria_id || '',
      preco_custo: produto.preco_custo,
      preco_venda: produto.preco_venda,
      iva: produto.iva,
      estoque_atual: produto.estoque_atual,
      estoque_minimo: produto.estoque_minimo,
      area_preparo_id: produto.area_preparo_id || '',
      imprimir_na_producao: produto.imprimir_na_producao,
      ativo: produto.ativo
    })
    setEditingId(produto.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.nome || form.preco_venda <= 0) {
      toast.error('Preencha nome e preco de venda')
      return
    }

    try {
      const data = {
        ...form,
        categoria_id: form.categoria_id || null,
        area_preparo_id: form.area_preparo_id === 'none' ? null : (form.area_preparo_id || null),
        moeda: 'PYG' as const,
        unidade_medida: 'un',
        marca: null,
        margem_lucro: form.preco_custo > 0 ? ((form.preco_venda - form.preco_custo) / form.preco_custo) * 100 : 0,
        localizacao_estoque: null,
        imagem: null
      }

      if (editingId) {
        await updateProduto(editingId, data)
        toast.success('Produto atualizado!')
      } else {
        await addProduto(data)
        toast.success('Produto cadastrado!')
      }
      resetForm()
    } catch (error) {
      toast.error('Erro ao salvar produto')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja remover este produto?')) return
    try {
      await removeProduto(id)
      toast.success('Produto removido!')
    } catch (error) {
      toast.error('Erro ao remover produto')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Produtos</h2>
          <p className="text-muted-foreground">{produtos.length} produto(s) cadastrado(s)</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Produto' : 'Novo Produto'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Codigo Interno</Label>
                <Input
                  value={form.codigo_interno}
                  onChange={(e) => setForm({ ...form, codigo_interno: e.target.value })}
                  placeholder="SKU001"
                />
              </div>
              <div className="space-y-2">
                <Label>Codigo de Barras</Label>
                <Input
                  value={form.codigo_barras}
                  onChange={(e) => setForm({ ...form, codigo_barras: e.target.value })}
                  placeholder="7891234567890"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.categoria_id} onValueChange={(v) => setForm({ ...form, categoria_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nome do Produto *</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Nome do produto"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Preco Custo</Label>
                <Input
                  type="number"
                  value={form.preco_custo}
                  onChange={(e) => setForm({ ...form, preco_custo: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Preco Venda *</Label>
                <Input
                  type="number"
                  value={form.preco_venda}
                  onChange={(e) => setForm({ ...form, preco_venda: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>IVA</Label>
                <Select value={String(form.iva)} onValueChange={(v) => setForm({ ...form, iva: Number(v) })}>
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
                <Label>Estoque Atual</Label>
                <Input
                  type="number"
                  value={form.estoque_atual}
                  onChange={(e) => setForm({ ...form, estoque_atual: Number(e.target.value) })}
                />
              </div>
            </div>

            {moduloRestauranteAtivo && (
              <>
                <Separator />
                <h4 className="font-semibold">Producao (Restaurante/Delivery)</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Area de Preparo</Label>
                    <Select value={form.area_preparo_id} onValueChange={(v) => setForm({ ...form, area_preparo_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {areasPreparo.map(a => (
                          <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="imprimir"
                      checked={form.imprimir_na_producao}
                      onCheckedChange={(v) => setForm({ ...form, imprimir_na_producao: !!v })}
                    />
                    <Label htmlFor="imprimir">Imprimir na Producao</Label>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button onClick={handleSave}>Salvar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">Codigo</th>
                  <th className="p-3 text-left text-sm font-medium">Nome</th>
                  <th className="p-3 text-left text-sm font-medium">Categoria</th>
                  <th className="p-3 text-right text-sm font-medium">Preco</th>
                  <th className="p-3 text-right text-sm font-medium">Estoque</th>
                  <th className="p-3 text-center text-sm font-medium">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="p-3 text-sm">{p.codigo_interno || '-'}</td>
                    <td className="p-3 text-sm font-medium">{p.nome}</td>
                    <td className="p-3 text-sm">{categorias.find(c => c.id === p.categoria_id)?.nome || '-'}</td>
                    <td className="p-3 text-sm text-right">Gs. {p.preco_venda.toLocaleString()}</td>
                    <td className="p-3 text-sm text-right">{p.estoque_atual}</td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {produtos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Nenhum produto cadastrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ========== PDV ==========
interface CarrinhoItem {
  produtoId: string
  produtoNome: string
  quantidade: number
  precoUnitario: number
  desconto: number
  iva: number
}

function PDVPage() {
  const { produtos, clientes, emitente, criarVenda, addCliente, buscarProdutoPorCodigo, buscarProdutoPorCodigoBarras, buscarProdutosPorNome } = useGestor()
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([])
  const [searchBarcode, setSearchBarcode] = useState('')
  const [searchCodigo, setSearchCodigo] = useState('')
  const [searchNome, setSearchNome] = useState('')
  const [resultadosNome, setResultadosNome] = useState<Produto[]>([])
  const [clienteNome, setClienteNome] = useState('Consumidor Final')
  const [clienteRuc, setClienteRuc] = useState('00000000-0')
  const [desconto, setDesconto] = useState(0)
  const [valorRecebido, setValorRecebido] = useState(0)
  const [formaPagamento, setFormaPagamento] = useState('dinheiro')
  const [showFinalizarDialog, setShowFinalizarDialog] = useState(false)
  const [tipoDocumento, setTipoDocumento] = useState<'ticket' | 'fatura'>('ticket')
  const [cotacaoBrl, setCotacaoBrl] = useState(1350)
  const [cotacaoUsd, setCotacaoUsd] = useState(7500)
  const [vendaFinalizada, setVendaFinalizada] = useState<Venda | null>(null)
  const [showRecibo, setShowRecibo] = useState(false)
  const barcodeInputRef = useRef<HTMLInputElement>(null)

  // Calculate totals
  const subtotal = carrinho.reduce((acc, item) => acc + (item.quantidade * item.precoUnitario) - item.desconto, 0)
  const total = subtotal - desconto
  const troco = valorRecebido - total
  const iva5 = carrinho.filter(i => i.iva === 5).reduce((acc, i) => acc + ((i.quantidade * i.precoUnitario - i.desconto) * 0.05 / 1.05), 0)
  const iva10 = carrinho.filter(i => i.iva === 10).reduce((acc, i) => acc + ((i.quantidade * i.precoUnitario - i.desconto) * 0.10 / 1.10), 0)

  const addToCarrinho = (produto: Produto) => {
    const existing = carrinho.find(i => i.produtoId === produto.id)
    if (existing) {
      setCarrinho(carrinho.map(i => 
        i.produtoId === produto.id 
          ? { ...i, quantidade: i.quantidade + 1 }
          : i
      ))
    } else {
      setCarrinho([...carrinho, {
        produtoId: produto.id,
        produtoNome: produto.nome,
        quantidade: 1,
        precoUnitario: produto.preco_venda,
        desconto: 0,
        iva: produto.iva
      }])
    }
    toast.success(`${produto.nome} adicionado`)
  }

  const updateQuantidade = (produtoId: string, delta: number) => {
    setCarrinho(carrinho.map(i => {
      if (i.produtoId === produtoId) {
        const novaQtd = i.quantidade + delta
        return novaQtd > 0 ? { ...i, quantidade: novaQtd } : i
      }
      return i
    }))
  }

  const removeFromCarrinho = (produtoId: string) => {
    setCarrinho(carrinho.filter(i => i.produtoId !== produtoId))
  }

  // Search by barcode
  const handleBarcodeSearch = () => {
    if (!searchBarcode.trim()) return
    const produto = buscarProdutoPorCodigoBarras(searchBarcode.trim())
    if (produto) {
      addToCarrinho(produto)
      setSearchBarcode('')
    } else {
      toast.error('Produto nao encontrado')
    }
  }

  // Search by internal code
  const handleCodigoSearch = () => {
    if (!searchCodigo.trim()) return
    const produto = buscarProdutoPorCodigo(searchCodigo.trim())
    if (produto) {
      addToCarrinho(produto)
      setSearchCodigo('')
    } else {
      toast.error('Produto nao encontrado')
    }
  }

  // Search by name
  useEffect(() => {
    if (searchNome.length >= 2) {
      setResultadosNome(buscarProdutosPorNome(searchNome))
    } else {
      setResultadosNome([])
    }
  }, [searchNome, buscarProdutosPorNome])

  const handleFinalizar = async () => {
    if (carrinho.length === 0) {
      toast.error('Carrinho vazio')
      return
    }
    if (valorRecebido < total) {
      toast.error('Valor recebido insuficiente')
      return
    }

    try {
      const venda = await criarVenda({
        tipo: 'pdv',
        clienteNome,
        clienteRuc,
        itens: carrinho,
        desconto,
        formaPagamento,
        valorRecebido,
        tipoDocumento,
        cotacaoBrl,
        cotacaoUsd
      })

      setVendaFinalizada(venda)
      setShowFinalizarDialog(false)
      setShowRecibo(true)
      toast.success('Venda finalizada!')
    } catch (error) {
      toast.error('Erro ao finalizar venda')
    }
  }

  const novaVenda = () => {
    setCarrinho([])
    setClienteNome('Consumidor Final')
    setClienteRuc('00000000-0')
    setDesconto(0)
    setValorRecebido(0)
    setVendaFinalizada(null)
    setShowRecibo(false)
    barcodeInputRef.current?.focus()
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">PDV - Ponto de Venda</h1>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Total: Gs. {total.toLocaleString()}
        </Badge>
      </div>

      <div className="flex-1 grid gap-4 lg:grid-cols-3">
        {/* Left: Search blocks */}
        <div className="lg:col-span-2 space-y-4">
          {/* Barcode search */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Barcode className="h-5 w-5" />
                Buscar por Codigo de Barras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  ref={barcodeInputRef}
                  placeholder="Escanear ou digitar codigo de barras..."
                  value={searchBarcode}
                  onChange={(e) => setSearchBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSearch()}
                  autoFocus
                />
                <Button variant="outline" size="icon">
                  <Camera className="h-4 w-4" />
                </Button>
                <Button onClick={handleBarcodeSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Internal code search */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Hash className="h-5 w-5" />
                Buscar por Codigo Interno
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o codigo interno (SKU)..."
                  value={searchCodigo}
                  onChange={(e) => setSearchCodigo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCodigoSearch()}
                />
                <Button onClick={handleCodigoSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Name search */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-5 w-5" />
                Buscar por Nome
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Digite o nome do produto..."
                value={searchNome}
                onChange={(e) => setSearchNome(e.target.value)}
              />
              {resultadosNome.length > 0 && (
                <ScrollArea className="h-48 border rounded-lg">
                  <div className="p-2 space-y-1">
                    {resultadosNome.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          addToCarrinho(p)
                          setSearchNome('')
                        }}
                        className="w-full flex items-center justify-between p-2 rounded hover:bg-muted text-left"
                      >
                        <span className="font-medium">{p.nome}</span>
                        <span className="text-muted-foreground">Gs. {p.preco_venda.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Cliente */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>RUC</Label>
                  <Input
                    value={clienteRuc}
                    onChange={(e) => setClienteRuc(e.target.value)}
                    placeholder="00000000-0"
                  />
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
            </CardContent>
          </Card>
        </div>

        {/* Right: Cart */}
        <div className="flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrinho ({carrinho.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-2">
                  {carrinho.map((item) => (
                    <div key={item.produtoId} className="flex items-center justify-between p-2 rounded-lg border">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.produtoNome}</p>
                        <p className="text-sm text-muted-foreground">
                          Gs. {item.precoUnitario.toLocaleString()} x {item.quantidade}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantidade(item.produtoId, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantidade}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantidade(item.produtoId, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFromCarrinho(item.produtoId)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {carrinho.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Carrinho vazio
                    </div>
                  )}
                </div>
              </ScrollArea>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>Gs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Desconto:</span>
                  <span>Gs. {desconto.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL:</span>
                  <span>Gs. {total.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button variant="outline" onClick={novaVenda}>
                  Limpar
                </Button>
                <Button onClick={() => setShowFinalizarDialog(true)} disabled={carrinho.length === 0}>
                  <Receipt className="h-4 w-4 mr-2" />
                  Cobrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Finalizar Dialog */}
      <Dialog open={showFinalizarDialog} onOpenChange={setShowFinalizarDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Venda</DialogTitle>
            <DialogDescription>Total: Gs. {total.toLocaleString()}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Documento</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={tipoDocumento === 'ticket' ? 'default' : 'outline'}
                  onClick={() => setTipoDocumento('ticket')}
                  className="w-full"
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  TICKET COMUM
                </Button>
                <Button
                  variant={tipoDocumento === 'fatura' ? 'default' : 'outline'}
                  onClick={() => setTipoDocumento('fatura')}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  FATURA LEGAL
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao_credito">Cartao de Credito</SelectItem>
                  <SelectItem value="cartao_debito">Cartao de Debito</SelectItem>
                  <SelectItem value="pix">PIX / QR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Desconto</Label>
              <Input
                type="number"
                value={desconto}
                onChange={(e) => setDesconto(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Valor Recebido</Label>
              <Input
                type="number"
                value={valorRecebido}
                onChange={(e) => setValorRecebido(Number(e.target.value))}
              />
            </div>

            {valorRecebido >= total && (
              <div className="p-3 rounded-lg bg-green-50 text-green-800">
                <div className="flex justify-between font-semibold">
                  <span>Troco:</span>
                  <span>Gs. {troco.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinalizarDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleFinalizar} disabled={valorRecebido < total}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recibo Dialog */}
      <Dialog open={showRecibo} onOpenChange={setShowRecibo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {tipoDocumento === 'fatura' ? 'FATURA' : 'TICKET DE VENDA'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            {/* Header */}
            <div className="text-center border-b pb-3">
              <p className="font-bold">{emitente?.nome_fantasia || emitente?.razao_social}</p>
              <p>{emitente?.endereco_rua}, {emitente?.endereco_numero}</p>
              <p>{emitente?.endereco_cidade} - {emitente?.endereco_departamento}</p>
              <p>RUC: {emitente?.ruc}</p>
            </div>

            {/* Cliente */}
            <div className="border-b pb-3">
              <p><strong>Cliente:</strong> {clienteNome}</p>
              <p><strong>RUC:</strong> {clienteRuc}</p>
              <p><strong>Data:</strong> {new Date().toLocaleString('es-PY')}</p>
            </div>

            {/* Items */}
            <div className="border-b pb-3 space-y-1">
              {carrinho.map(item => (
                <div key={item.produtoId} className="flex justify-between">
                  <span>{item.quantidade}x {item.produtoNome}</span>
                  <span>Gs. {(item.quantidade * item.precoUnitario).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Gs. {subtotal.toLocaleString()}</span>
              </div>
              {desconto > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Desconto:</span>
                  <span>-Gs. {desconto.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>TOTAL:</span>
                <span>Gs. {total.toLocaleString()}</span>
              </div>
            </div>

            {/* IVA */}
            <div className="border-t pt-3 space-y-1 text-xs">
              <p><strong>Liquidacion IVA:</strong></p>
              {iva5 > 0 && <p>IVA 5%: Gs. {iva5.toLocaleString()}</p>}
              {iva10 > 0 && <p>IVA 10%: Gs. {iva10.toLocaleString()}</p>}
              <p>Total IVA: Gs. {(iva5 + iva10).toLocaleString()}</p>
            </div>

            {/* Payment */}
            <div className="border-t pt-3">
              <p><strong>Pago:</strong> Gs. {valorRecebido.toLocaleString()}</p>
              {troco > 0 && <p><strong>Troco:</strong> Gs. {troco.toLocaleString()}</p>}
            </div>

            {/* Exchange rates */}
            <div className="border-t pt-3 text-xs text-muted-foreground">
              <p>Cotizacion del dia:</p>
              <p>BRL: Gs. {cotacaoBrl.toLocaleString()} | Total: R$ {(total / cotacaoBrl).toFixed(2)}</p>
              <p>USD: Gs. {cotacaoUsd.toLocaleString()} | Total: $ {(total / cotacaoUsd).toFixed(2)}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button onClick={novaVenda}>
              Nova Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ========== MESAS ==========
function MesasGrid({ onSelectMesa }: { onSelectMesa: (mesa: Mesa) => void }) {
  const { mesas, modulos, addMesa } = useGestor()
  const [showNovaMesa, setShowNovaMesa] = useState(false)
  const [novaMesa, setNovaMesa] = useState({ numero: 0, nome: '', capacidade: 4 })

  if (!modulos?.restaurante && !modulos?.controle_mesas && !modulos?.delivery && !modulos?.comandas) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          Ative o modulo de Restaurante, Delivery, Comandas ou Controle de Mesas para usar esta funcionalidade.
        </p>
      </Card>
    )
  }

  const getStatusStyles = (status: Mesa['status']) => {
    switch (status) {
      case 'livre': return { overlay: 'bg-green-500/70', badge: 'bg-green-500' }
      case 'ocupada': return { overlay: 'bg-red-500/70', badge: 'bg-red-500' }
      case 'reservada': return { overlay: 'bg-yellow-500/70', badge: 'bg-yellow-500' }
      case 'conta': return { overlay: 'bg-blue-500/70', badge: 'bg-blue-500' }
      default: return { overlay: 'bg-gray-500/70', badge: 'bg-gray-500' }
    }
  }

  const handleAddMesa = async () => {
    if (novaMesa.numero <= 0) {
      toast.error('Numero da mesa deve ser maior que 0')
      return
    }
    try {
      await addMesa({
        numero: novaMesa.numero,
        nome: novaMesa.nome || `Mesa ${novaMesa.numero}`,
        capacidade: novaMesa.capacidade,
        status: 'livre',
        posicao_x: 0,
        posicao_y: 0
      })
      toast.success('Mesa criada!')
      setShowNovaMesa(false)
      setNovaMesa({ numero: 0, nome: '', capacidade: 4 })
    } catch (error) {
      toast.error('Erro ao criar mesa. Numero pode ja existir.')
    }
  }

  const nextMesaNumber = mesas.length > 0 ? Math.max(...mesas.map(m => m.numero)) + 1 : 1

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mesas</h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Livre: {mesas.filter(m => m.status === 'livre').length}
          </Badge>
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Ocupada: {mesas.filter(m => m.status === 'ocupada').length}
          </Badge>
          <Button onClick={() => { setNovaMesa({ ...novaMesa, numero: nextMesaNumber }); setShowNovaMesa(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Mesa
          </Button>
        </div>
      </div>

      {/* Dialog Nova Mesa */}
      <Dialog open={showNovaMesa} onOpenChange={setShowNovaMesa}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Mesa</DialogTitle>
            <DialogDescription>Configure os dados da nova mesa</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Numero da Mesa *</Label>
              <Input
                type="number"
                value={novaMesa.numero}
                onChange={(e) => setNovaMesa({ ...novaMesa, numero: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={novaMesa.nome}
                onChange={(e) => setNovaMesa({ ...novaMesa, nome: e.target.value })}
                placeholder={`Mesa ${novaMesa.numero}`}
              />
            </div>
            <div className="space-y-2">
              <Label>Capacidade (lugares)</Label>
              <Input
                type="number"
                value={novaMesa.capacidade}
                onChange={(e) => setNovaMesa({ ...novaMesa, capacidade: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNovaMesa(false)}>Cancelar</Button>
            <Button onClick={handleAddMesa}>Criar Mesa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {mesas.map((mesa) => {
          const styles = getStatusStyles(mesa.status)
          return (
            <button
              key={mesa.id}
              onClick={() => onSelectMesa(mesa)}
              className="relative aspect-square rounded-xl overflow-hidden shadow-lg transition-all hover:scale-105 hover:shadow-xl group"
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(/mesa-bg.jpg)' }}
              />
              {/* Overlay */}
              <div className={`absolute inset-0 ${styles.overlay} transition-opacity group-hover:opacity-90`} />
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-4">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold mb-2 ${styles.badge}`}>
                  {mesa.status.toUpperCase()}
                </div>
                <p className="text-3xl font-bold drop-shadow-lg">{mesa.numero}</p>
                <p className="text-sm font-medium drop-shadow">{mesa.nome || `Mesa ${mesa.numero}`}</p>
                <p className="text-xs opacity-80">{mesa.capacidade} lugares</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ========== MESA DETAIL ==========
function MesaDetail({ mesa, onBack, onPagar }: { mesa: Mesa, onBack: () => void, onPagar: (itens: MesaItem[]) => void }) {
  const { produtos, loadMesaItens, addMesaItem, removeMesaItem, mesaItens } = useGestor()
  const [searchNome, setSearchNome] = useState('')
  const [resultados, setResultados] = useState<Produto[]>([])
  const [itensSelecionados, setItensSelecionados] = useState<Set<string>>(new Set())
  const [showPagarDialog, setShowPagarDialog] = useState(false)

  const itens = mesaItens[mesa.id] || []

  useEffect(() => {
    loadMesaItens(mesa.id)
  }, [mesa.id, loadMesaItens])

  useEffect(() => {
    if (searchNome.length >= 2) {
      setResultados(produtos.filter(p => p.nome.toLowerCase().includes(searchNome.toLowerCase())))
    } else {
      setResultados([])
    }
  }, [searchNome, produtos])

  const handleAddItem = async (produto: Produto) => {
    try {
      await addMesaItem(mesa.id, {
        produto_id: produto.id,
        quantidade: 1,
        preco_unitario: produto.preco_venda,
        desconto: 0,
        observacao: null,
        status: 'pendente',
        impresso: false
      })
      setSearchNome('')
      toast.success(`${produto.nome} adicionado`)
    } catch (error) {
      toast.error('Erro ao adicionar item')
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeMesaItem(itemId, mesa.id)
      toast.success('Item removido')
    } catch (error) {
      toast.error('Erro ao remover item')
    }
  }

  const toggleItemSelecionado = (itemId: string) => {
    const newSet = new Set(itensSelecionados)
    if (newSet.has(itemId)) {
      newSet.delete(itemId)
    } else {
      newSet.add(itemId)
    }
    setItensSelecionados(newSet)
  }

  const totalMesa = itens.reduce((acc, item) => acc + (item.quantidade * item.preco_unitario) - item.desconto, 0)
  const totalSelecionado = itens
    .filter(i => itensSelecionados.has(i.id))
    .reduce((acc, item) => acc + (item.quantidade * item.preco_unitario) - item.desconto, 0)

  const handlePagar = () => {
    const itensToPay = itensSelecionados.size > 0 
      ? itens.filter(i => itensSelecionados.has(i.id))
      : itens
    onPagar(itensToPay)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Mesa {mesa.numero}</h1>
          <p className="text-muted-foreground">{mesa.nome} - {mesa.capacidade} lugares</p>
        </div>
        <Badge className={mesa.status === 'ocupada' ? 'bg-red-500' : 'bg-green-500'}>
          {mesa.status}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Add items */}
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Itens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Buscar produto..."
              value={searchNome}
              onChange={(e) => setSearchNome(e.target.value)}
            />
            {resultados.length > 0 && (
              <ScrollArea className="h-64 border rounded-lg">
                <div className="p-2 space-y-1">
                  {resultados.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleAddItem(p)}
                      className="w-full flex items-center justify-between p-2 rounded hover:bg-muted text-left"
                    >
                      <span>{p.nome}</span>
                      <span className="text-muted-foreground">Gs. {p.preco_venda.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Items list */}
        <Card>
          <CardHeader>
            <CardTitle>Comanda da Mesa</CardTitle>
            <CardDescription>Selecione itens para pagamento parcial</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {itens.map((item) => {
                  const produto = produtos.find(p => p.id === item.produto_id)
                  return (
                    <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg border">
                      <Checkbox
                        checked={itensSelecionados.has(item.id)}
                        onCheckedChange={() => toggleItemSelecionado(item.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{produto?.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantidade}x Gs. {item.preco_unitario.toLocaleString()}
                        </p>
                      </div>
                      <span className="font-semibold">
                        Gs. {((item.quantidade * item.preco_unitario) - item.desconto).toLocaleString()}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )
                })}
                {itens.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum item na comanda
                  </p>
                )}
              </div>
            </ScrollArea>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total da Mesa:</span>
                <span className="font-bold">Gs. {totalMesa.toLocaleString()}</span>
              </div>
              {itensSelecionados.size > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Selecionado ({itensSelecionados.size} itens):</span>
                  <span className="font-bold">Gs. {totalSelecionado.toLocaleString()}</span>
                </div>
              )}
            </div>

            <Button 
              className="w-full" 
              disabled={itens.length === 0}
              onClick={handlePagar}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {itensSelecionados.size > 0 ? `Cobrar Selecionados (Gs. ${totalSelecionado.toLocaleString()})` : `Cobrar Tudo (Gs. ${totalMesa.toLocaleString()})`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ========== MAIN LAYOUT ==========
function MainContent() {
  const [activePage, setActivePage] = useState<PageKey>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null)
  const { loading, modulos, emitente, moduloRestauranteAtivo } = useGestor()

  const menuItems = [
    { key: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard, description: 'Visao geral' },
    { key: 'pdv' as const, label: 'PDV', icon: ShoppingCart, description: 'Ponto de venda', show: modulos?.pdv },
    { key: 'mesas' as const, label: 'Mesas', icon: UtensilsCrossed, description: 'Controle de mesas', show: moduloRestauranteAtivo },
    { key: 'produtos' as const, label: 'Produtos', icon: Package, description: 'Cadastro de produtos' },
    { key: 'emitente' as const, label: 'Emitente Fiscal', icon: Building2, description: 'Dados da empresa' },
    { key: 'modulos' as const, label: 'Modulos', icon: Boxes, description: 'Ativar/desativar' },
  ].filter(item => item.show !== false)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  const handleSelectMesa = (mesa: Mesa) => {
    setSelectedMesa(mesa)
    setActivePage('mesa-detail')
  }

  const handleBackFromMesa = () => {
    setSelectedMesa(null)
    setActivePage('mesas')
  }

  const handlePagarMesa = (itens: MesaItem[]) => {
    // TODO: Integrate with PDV for mesa payment
    toast.info('Integrar com PDV para pagamento')
  }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardContent />
      case 'modulos':
        return <ModulosConfig />
      case 'emitente':
        return <EmitenteConfig />
      case 'produtos':
        return <ProdutosManager />
      case 'pdv':
        return <PDVPage />
      case 'mesas':
        return <MesasGrid onSelectMesa={handleSelectMesa} />
      case 'mesa-detail':
        return selectedMesa ? <MesaDetail mesa={selectedMesa} onBack={handleBackFromMesa} onPagar={handlePagarMesa} /> : null
      default:
        return <DashboardContent />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} flex flex-col border-r bg-card transition-all duration-300`}>
        <div className="flex h-14 items-center justify-between border-b px-4">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Settings className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">GestorX</span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.key || (activePage === 'mesa-detail' && item.key === 'mesas')
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActivePage(item.key)
                    if (item.key !== 'mesas') setSelectedMesa(null)
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
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

        {sidebarOpen && emitente?.nome_fantasia && (
          <div className="border-t p-4">
            <p className="truncate text-sm font-medium">{emitente.nome_fantasia}</p>
            <p className="truncate text-xs text-muted-foreground">{emitente.ruc}</p>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="container max-w-6xl py-6">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <GestorProvider>
      <MainContent />
    </GestorProvider>
  )
}
