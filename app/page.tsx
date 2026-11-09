"use client"

import { useState, useEffect, useRef } from 'react'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import {
  LayoutDashboard, Building2, Printer, ChefHat, Package, ShoppingCart, UtensilsCrossed,
  Users, Settings, Menu, X, Search, Barcode, Hash, FileText, Plus, Minus, Trash2,
  Receipt, CreditCard, Banknote, QrCode, Camera, ChevronLeft, Edit, DollarSign,
  TrendingUp, Clock, BarChart3, PieChart, Calendar, Download, Filter, ImageIcon, Upload
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RePieChart, Pie, Cell } from 'recharts'
import type { Produto, Mesa, Venda, Cliente } from '@/lib/database.types'

type PageKey = 'dashboard' | 'emitente' | 'impressoras' | 'produtos' | 'modulos' | 'pdv' | 'mesas' | 'mesa-detail' | 'clientes' | 'relatorios'

// ========== DASHBOARD ==========
function DashboardContent() {
  const { produtos, mesas, modulos, vendas } = useGestor()
  
  const mesasOcupadas = mesas.filter(m => m.status === 'ocupada').length
  const totalVendas = vendas.reduce((acc, v) => acc + v.total, 0)
  const vendasHoje = vendas.filter(v => {
    const hoje = new Date().toDateString()
    return new Date(v.created_at).toDateString() === hoje
  })
  const totalHoje = vendasHoje.reduce((acc, v) => acc + v.total, 0)

  // Dados para graficos
  const vendasPorDia = [
    { dia: 'Seg', vendas: 45000 },
    { dia: 'Ter', vendas: 52000 },
    { dia: 'Qua', vendas: 38000 },
    { dia: 'Qui', vendas: 61000 },
    { dia: 'Sex', vendas: 78000 },
    { dia: 'Sab', vendas: 95000 },
    { dia: 'Dom', vendas: 42000 },
  ]

  const vendasPorCategoria = [
    { nome: 'Bebidas', valor: 35, color: '#3B82F6' },
    { nome: 'Refeicoes', valor: 40, color: '#10B981' },
    { nome: 'Lanches', valor: 15, color: '#F59E0B' },
    { nome: 'Sobremesas', valor: 10, color: '#EC4899' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visao geral do sistema</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gs. {totalHoje.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{vendasHoje.length} vendas realizadas</p>
          </CardContent>
        </Card>
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
        {(modulos?.restaurante || modulos?.controle_mesas) && (
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
        )}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gs. {totalVendas.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{vendas.length} vendas total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Vendas por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vendasPorDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip formatter={(v) => `Gs. ${Number(v).toLocaleString()}`} />
                <Bar dataKey="vendas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Vendas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={vendasPorCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nome, valor }) => `${nome}: ${valor}%`}
                  outerRadius={100}
                  dataKey="valor"
                >
                  {vendasPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ========== RELATORIOS ==========
function RelatoriosPage() {
  const { vendas, produtos } = useGestor()
  const [periodo, setPeriodo] = useState('hoje')

  const filterVendas = () => {
    const hoje = new Date()
    switch (periodo) {
      case 'hoje':
        return vendas.filter(v => new Date(v.created_at).toDateString() === hoje.toDateString())
      case 'semana':
        const semanaAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000)
        return vendas.filter(v => new Date(v.created_at) >= semanaAtras)
      case 'mes':
        return vendas.filter(v => {
          const d = new Date(v.created_at)
          return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear()
        })
      default:
        return vendas
    }
  }

  const vendasFiltradas = filterVendas()
  const totalVendas = vendasFiltradas.reduce((acc, v) => acc + v.total, 0)
  const totalIva = vendasFiltradas.reduce((acc, v) => acc + (v.iva_5 || 0) + (v.iva_10 || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatorios</h1>
          <p className="text-muted-foreground">Analise de vendas e desempenho</p>
        </div>
        <div className="flex gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="semana">Ultima Semana</SelectItem>
              <SelectItem value="mes">Este Mes</SelectItem>
              <SelectItem value="todos">Todos</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gs. {totalVendas.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{vendasFiltradas.length} vendas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total IVA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gs. {totalIva.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ticket Medio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Gs. {vendasFiltradas.length > 0 ? Math.round(totalVendas / vendasFiltradas.length).toLocaleString() : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendasFiltradas.slice(0, 20).map((venda) => (
                <TableRow key={venda.id}>
                  <TableCell>#{venda.numero_venda}</TableCell>
                  <TableCell>{new Date(venda.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{venda.cliente_nome || 'Consumidor Final'}</TableCell>
                  <TableCell><Badge variant="outline">{venda.tipo}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={venda.tipo_documento === 'fatura' ? 'default' : 'secondary'}>
                      {venda.tipo_documento === 'fatura' ? 'Fatura' : 'Ticket'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">Gs. {venda.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {vendasFiltradas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhuma venda encontrada no periodo
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ========== CLIENTES ==========
function ClientesManager() {
  const { clientes, addCliente, updateCliente } = useGestor()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ruc: '', nome: '', telefone: '', email: '', endereco: '' })
  const [search, setSearch] = useState('')

  const resetForm = () => {
    setForm({ ruc: '', nome: '', telefone: '', email: '', endereco: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (cliente: Cliente) => {
    setForm({
      ruc: cliente.ruc || '',
      nome: cliente.nome,
      telefone: cliente.telefone || '',
      email: cliente.email || '',
      endereco: cliente.endereco || ''
    })
    setEditingId(cliente.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.nome) {
      toast.error('Nome e obrigatorio')
      return
    }
    try {
      if (editingId) {
        await updateCliente(editingId, form)
        toast.success('Cliente atualizado!')
      } else {
        await addCliente(form)
        toast.success('Cliente cadastrado!')
      }
      resetForm()
    } catch {
      toast.error('Erro ao salvar cliente')
    }
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.ruc?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Clientes</h2>
          <p className="text-muted-foreground">{clientes.length} cliente(s) cadastrado(s)</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            <DialogDescription>Preencha os dados do cliente</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>RUC</Label>
                <Input value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value })} placeholder="00000000-0" />
              </div>
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Endereco</Label>
              <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou RUC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RUC</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientesFiltrados.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>{cliente.ruc || '-'}</TableCell>
                  <TableCell className="font-medium">{cliente.nome}</TableCell>
                  <TableCell>{cliente.telefone || '-'}</TableCell>
                  <TableCell>{cliente.email || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(cliente)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {clientesFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhum cliente encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ========== EMITENTE CONFIG ==========
function EmitenteConfig() {
  const { emitente, updateEmitente } = useGestor()
  const [form, setForm] = useState({
    ruc: '', razao_social: '', nome_fantasia: '', logo: '',
    endereco_rua: '', endereco_numero: '', endereco_bairro: '',
    endereco_cidade: '', endereco_departamento: '', area_atuacao: '',
    telefone: '', email: ''
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
      reader.onloadend = () => setForm({ ...form, logo: reader.result as string })
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateEmitente(form)
      toast.success('Dados salvos!')
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Emitente Fiscal
        </CardTitle>
        <CardDescription>Dados da empresa para emissao de documentos fiscais</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-6">
          <div className="space-y-2">
            <Label>Logo da Empresa</Label>
            <div className="flex items-center gap-4">
              <div 
                className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                {form.logo ? (
                  <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Selecionar</Button>
                {form.logo && <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, logo: '' })}>Remover</Button>}
                <p className="text-xs text-muted-foreground">PNG ou JPG, max 2MB</p>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleLogoUpload} />
          </div>
        </div>
        <Separator />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>RUC *</Label>
            <Input value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value })} placeholder="00000000-0" />
          </div>
          <div className="space-y-2">
            <Label>Razao Social *</Label>
            <Input value={form.razao_social} onChange={(e) => setForm({ ...form, razao_social: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Nome Fantasia</Label>
            <Input value={form.nome_fantasia} onChange={(e) => setForm({ ...form, nome_fantasia: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Area de Atuacao</Label>
            <Select value={form.area_atuacao} onValueChange={(v) => setForm({ ...form, area_atuacao: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="comercio">Comercio</SelectItem>
                <SelectItem value="restaurante">Restaurante</SelectItem>
                <SelectItem value="servicos">Servicos</SelectItem>
                <SelectItem value="industria">Industria</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <Label>Rua</Label>
            <Input value={form.endereco_rua} onChange={(e) => setForm({ ...form, endereco_rua: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Numero</Label>
            <Input value={form.endereco_numero} onChange={(e) => setForm({ ...form, endereco_numero: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Bairro</Label>
            <Input value={form.endereco_bairro} onChange={(e) => setForm({ ...form, endereco_bairro: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input value={form.endereco_cidade} onChange={(e) => setForm({ ...form, endereco_cidade: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Departamento</Label>
            <Select value={form.endereco_departamento} onValueChange={(v) => setForm({ ...form, endereco_departamento: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Central">Central</SelectItem>
                <SelectItem value="Alto Parana">Alto Parana</SelectItem>
                <SelectItem value="Itapua">Itapua</SelectItem>
                <SelectItem value="Caaguazu">Caaguazu</SelectItem>
                <SelectItem value="Asuncion">Asuncion</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar Dados'}</Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ========== IMPRESSORAS CONFIG ==========
function ImpressorasConfig() {
  const { impressoras, areasPreparo, addImpressora, updateImpressora, removeImpressora } = useGestor()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    nome: '', tipo: 'termica' as const, conexao: 'usb' as const,
    ip: '', porta: 9100, funcoes: [] as string[], area_preparo_id: '', ativo: true
  })

  const funcoesDisponiveis = [
    { id: 'pdv', label: 'PDV / Caixa' },
    { id: 'cozinha', label: 'Cozinha' },
    { id: 'bar', label: 'Bar' },
    { id: 'copa', label: 'Copa' },
    { id: 'fatura', label: 'Fatura Legal' },
    { id: 'comanda', label: 'Comanda' },
    { id: 'entrega', label: 'Entrega / Delivery' },
  ]

  const resetForm = () => {
    setForm({ nome: '', tipo: 'termica', conexao: 'usb', ip: '', porta: 9100, funcoes: [], area_preparo_id: '', ativo: true })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSave = async () => {
    if (!form.nome) { toast.error('Nome obrigatorio'); return }
    try {
      const data = { ...form, area_preparo_id: form.area_preparo_id || null }
      if (editingId) {
        await updateImpressora(editingId, data)
        toast.success('Impressora atualizada!')
      } else {
        await addImpressora(data)
        toast.success('Impressora cadastrada!')
      }
      resetForm()
    } catch {
      toast.error('Erro ao salvar')
    }
  }

  const toggleFuncao = (funcao: string) => {
    if (form.funcoes.includes(funcao)) {
      setForm({ ...form, funcoes: form.funcoes.filter(f => f !== funcao) })
    } else {
      setForm({ ...form, funcoes: [...form.funcoes, funcao] })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Impressoras</h2>
          <p className="text-muted-foreground">Configure as impressoras do sistema</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Impressora
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Impressora' : 'Nova Impressora'}</DialogTitle>
            <DialogDescription>Configure a impressora e suas funcoes</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Impressora Cozinha" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={(v: 'termica' | 'a4' | 'fiscal') => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="termica">Termica (80mm)</SelectItem>
                    <SelectItem value="a4">A4</SelectItem>
                    <SelectItem value="fiscal">Fiscal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Conexao</Label>
                <Select value={form.conexao} onValueChange={(v: 'usb' | 'rede' | 'bluetooth') => setForm({ ...form, conexao: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usb">USB</SelectItem>
                    <SelectItem value="rede">Rede (IP)</SelectItem>
                    <SelectItem value="bluetooth">Bluetooth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.conexao === 'rede' && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>IP</Label>
                  <Input value={form.ip} onChange={(e) => setForm({ ...form, ip: e.target.value })} placeholder="192.168.1.100" />
                </div>
                <div className="space-y-2">
                  <Label>Porta</Label>
                  <Input type="number" value={form.porta} onChange={(e) => setForm({ ...form, porta: Number(e.target.value) })} />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Area de Preparo (Vinculada)</Label>
              <Select value={form.area_preparo_id || 'none'} onValueChange={(v) => setForm({ ...form, area_preparo_id: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {areasPreparo.map(a => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Funcoes da Impressora</Label>
              <div className="grid grid-cols-2 gap-2">
                {funcoesDisponiveis.map(f => (
                  <label key={f.id} className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted">
                    <Checkbox checked={form.funcoes.includes(f.id)} onCheckedChange={() => toggleFuncao(f.id)} />
                    <span className="text-sm">{f.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.ativo} onCheckedChange={(v) => setForm({ ...form, ativo: v })} />
              <Label>Impressora Ativa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {impressoras.map((imp) => (
          <Card key={imp.id} className={!imp.ativo ? 'opacity-50' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  {imp.nome}
                </CardTitle>
                <Badge variant={imp.ativo ? 'default' : 'secondary'}>{imp.ativo ? 'Ativa' : 'Inativa'}</Badge>
              </div>
              <CardDescription>{imp.tipo} - {imp.conexao}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {imp.conexao === 'rede' && <p className="text-sm text-muted-foreground">IP: {imp.ip}:{imp.porta}</p>}
                <div className="flex flex-wrap gap-1">
                  {imp.funcoes?.map(f => (
                    <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => {
                  setForm({ ...imp, funcoes: imp.funcoes || [], area_preparo_id: imp.area_preparo_id || '' })
                  setEditingId(imp.id)
                  setShowForm(true)
                }}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeImpressora(imp.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {impressoras.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma impressora configurada
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// ========== PRODUTOS MANAGER ==========
function ProdutosManager() {
  const { produtos, categorias, areasPreparo, addProduto, updateProduto, removeProduto, moduloRestauranteAtivo } = useGestor()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    codigo_interno: '', codigo_barras: '', nome: '', descricao: '', categoria_id: '',
    preco_custo: 0, preco_venda: 0, iva: 10, estoque_atual: 0, estoque_minimo: 0,
    area_preparo_id: '', imprimir_na_producao: false, imagem: '', ativo: true
  })
  const [search, setSearch] = useState('')
  const imgInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setForm({
      codigo_interno: '', codigo_barras: '', nome: '', descricao: '', categoria_id: '',
      preco_custo: 0, preco_venda: 0, iva: 10, estoque_atual: 0, estoque_minimo: 0,
      area_preparo_id: '', imprimir_na_producao: false, imagem: '', ativo: true
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
      imagem: produto.imagem || '',
      ativo: produto.ativo
    })
    setEditingId(produto.id)
    setShowForm(true)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toast.error('Imagem muito grande. Maximo 1MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => setForm({ ...form, imagem: reader.result as string })
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!form.nome || form.preco_venda <= 0) {
      toast.error('Preencha nome e preco de venda')
      return
    }
    try {
      const data = {
        ...form,
        codigo_interno: form.codigo_interno || null,
        codigo_barras: form.codigo_barras || null,
        categoria_id: form.categoria_id || null,
        area_preparo_id: form.area_preparo_id || null,
        imagem: form.imagem || null,
        moeda: 'PYG' as const,
        unidade_medida: 'un',
        marca: null,
        margem_lucro: form.preco_custo > 0 ? ((form.preco_venda - form.preco_custo) / form.preco_custo) * 100 : 0,
        localizacao_estoque: null
      }
      if (editingId) {
        await updateProduto(editingId, data)
        toast.success('Produto atualizado!')
      } else {
        await addProduto(data)
        toast.success('Produto cadastrado!')
      }
      resetForm()
    } catch (err) {
      console.log('[v0] Error saving product:', err)
      toast.error('Erro ao salvar produto')
    }
  }

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo_interno?.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo_barras?.includes(search)
  )

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

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            <DialogDescription>Preencha os dados do produto</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="space-y-2">
                <Label>Imagem</Label>
                <div
                  className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary"
                  onClick={() => imgInputRef.current?.click()}
                >
                  {form.imagem ? (
                    <img src={form.imagem} alt="Produto" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Codigo Interno</Label>
                    <Input value={form.codigo_interno} onChange={(e) => setForm({ ...form, codigo_interno: e.target.value })} placeholder="SKU001" />
                  </div>
                  <div className="space-y-2">
                    <Label>Codigo de Barras</Label>
                    <Input value={form.codigo_barras} onChange={(e) => setForm({ ...form, codigo_barras: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={form.categoria_id || 'none'} onValueChange={(v) => setForm({ ...form, categoria_id: v === 'none' ? '' : v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {categorias.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nome do Produto *</Label>
                  <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Preco Custo</Label>
                <Input type="number" value={form.preco_custo} onChange={(e) => setForm({ ...form, preco_custo: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Preco Venda *</Label>
                <Input type="number" value={form.preco_venda} onChange={(e) => setForm({ ...form, preco_venda: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>IVA</Label>
                <Select value={String(form.iva)} onValueChange={(v) => setForm({ ...form, iva: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="10">10%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estoque Atual</Label>
                <Input type="number" value={form.estoque_atual} onChange={(e) => setForm({ ...form, estoque_atual: Number(e.target.value) })} />
              </div>
            </div>
            {moduloRestauranteAtivo && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Producao (Restaurante/Delivery)</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Area de Preparo</Label>
                      <Select value={form.area_preparo_id || 'none'} onValueChange={(v) => setForm({ ...form, area_preparo_id: v === 'none' ? '' : v })}>
                        <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma</SelectItem>
                          {areasPreparo.map(a => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <Checkbox checked={form.imprimir_na_producao} onCheckedChange={(v) => setForm({ ...form, imprimir_na_producao: !!v })} />
                      <Label>Imprimir na Producao</Label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar produto..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Codigo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Preco</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtosFiltrados.map((produto) => (
                <TableRow key={produto.id}>
                  <TableCell>
                    {produto.imagem ? (
                      <img src={produto.imagem} alt="" className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{produto.codigo_interno || '-'}</TableCell>
                  <TableCell className="font-medium">{produto.nome}</TableCell>
                  <TableCell>{categorias.find(c => c.id === produto.categoria_id)?.nome || '-'}</TableCell>
                  <TableCell className="text-right">Gs. {produto.preco_venda.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{produto.estoque_atual}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(produto)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeProduto(produto.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {produtosFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhum produto encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ========== MODULOS CONFIG ==========
function ModulosConfig() {
  const { modulos, updateModulos } = useGestor()
  const [saving, setSaving] = useState(false)

  const handleToggle = async (key: string, value: boolean) => {
    setSaving(true)
    try {
      await updateModulos({ [key]: value })
      toast.success('Modulo atualizado!')
    } catch {
      toast.error('Erro ao atualizar')
    } finally {
      setSaving(false)
    }
  }

  if (!modulos) return null

  const modulosEssenciais = [
    { key: 'pdv', label: 'PDV', desc: 'Ponto de venda' },
    { key: 'estoque', label: 'Estoque', desc: 'Gestao de estoque' },
    { key: 'financeiro', label: 'Financeiro', desc: 'Controle financeiro' },
    { key: 'faturamento', label: 'Faturamento', desc: 'Emissao de faturas' },
  ]

  const modulosRestaurante = [
    { key: 'restaurante', label: 'Restaurante', desc: 'Gestao de mesas' },
    { key: 'delivery', label: 'Delivery', desc: 'Entregas' },
    { key: 'comandas', label: 'Comandas', desc: 'Comandas digitais' },
    { key: 'controle_mesas', label: 'Controle de Mesas', desc: 'Layout de mesas' },
  ]

  const modulosAvancados = [
    { key: 'agendamentos', label: 'Agendamentos', desc: 'Agenda de servicos' },
    { key: 'whatsapp', label: 'WhatsApp', desc: 'Integracao WhatsApp' },
    { key: 'multiempresa', label: 'Multiempresa', desc: 'Multiplas empresas' },
    { key: 'multiusuario', label: 'Multiusuario', desc: 'Multiplos usuarios' },
  ]

  const renderModulo = (m: { key: string; label: string; desc: string }) => (
    <Card key={m.key} className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{m.label}</p>
          <p className="text-sm text-muted-foreground">{m.desc}</p>
        </div>
        <Switch
          checked={modulos[m.key as keyof typeof modulos] as boolean}
          onCheckedChange={(v) => handleToggle(m.key, v)}
          disabled={saving}
        />
      </div>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Modulos do Sistema</h1>
        <p className="text-muted-foreground">Ative ou desative conforme sua necessidade</p>
      </div>
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase">Essenciais</h3>
        <div className="grid gap-3 md:grid-cols-2">{modulosEssenciais.map(renderModulo)}</div>
      </div>
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase">Restaurante e Delivery</h3>
        <div className="grid gap-3 md:grid-cols-2">{modulosRestaurante.map(renderModulo)}</div>
      </div>
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase">Avancados</h3>
        <div className="grid gap-3 md:grid-cols-2">{modulosAvancados.map(renderModulo)}</div>
      </div>
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

interface PagamentoItem {
  forma: string
  valor: number
}

function PDVPage() {
  const { produtos, clientes, emitente, criarVenda, buscarProdutoPorCodigo, buscarProdutoPorCodigoBarras, buscarProdutosPorNome } = useGestor()
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([])
  const [searchBarcode, setSearchBarcode] = useState('')
  const [searchCodigo, setSearchCodigo] = useState('')
  const [searchNome, setSearchNome] = useState('')
  const [resultadosNome, setResultadosNome] = useState<Produto[]>([])
  const [clienteNome, setClienteNome] = useState('Consumidor Final')
  const [clienteRuc, setClienteRuc] = useState('00000000-0')
  const [desconto, setDesconto] = useState(0)
  const [showFinalizarDialog, setShowFinalizarDialog] = useState(false)
  const [showClienteDialog, setShowClienteDialog] = useState(false)
  const [showDescontoDialog, setShowDescontoDialog] = useState(false)
  const [tipoDocumento, setTipoDocumento] = useState<'ticket' | 'fatura'>('ticket')
  const [cotacaoBrl, setCotacaoBrl] = useState(1350)
  const [cotacaoUsd, setCotacaoUsd] = useState(7500)
  const [vendaFinalizada, setVendaFinalizada] = useState<Venda | null>(null)
  const [showRecibo, setShowRecibo] = useState(false)
  const [pagamentos, setPagamentos] = useState<PagamentoItem[]>([{ forma: 'dinheiro', valor: 0 }])
  const [searchCliente, setSearchCliente] = useState('')
  const barcodeInputRef = useRef<HTMLInputElement>(null)

  const subtotal = carrinho.reduce((acc, item) => acc + (item.quantidade * item.precoUnitario) - item.desconto, 0)
  const total = subtotal - desconto
  const totalPago = pagamentos.reduce((acc, p) => acc + p.valor, 0)
  const troco = totalPago - total
  const iva5 = carrinho.filter(i => i.iva === 5).reduce((acc, i) => acc + ((i.quantidade * i.precoUnitario - i.desconto) * 0.05 / 1.05), 0)
  const iva10 = carrinho.filter(i => i.iva === 10).reduce((acc, i) => acc + ((i.quantidade * i.precoUnitario - i.desconto) * 0.10 / 1.10), 0)

  const addToCarrinho = (produto: Produto) => {
    const existing = carrinho.find(i => i.produtoId === produto.id)
    if (existing) {
      setCarrinho(carrinho.map(i => i.produtoId === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i))
    } else {
      setCarrinho([...carrinho, {
        produtoId: produto.id, produtoNome: produto.nome, quantidade: 1,
        precoUnitario: produto.preco_venda, desconto: 0, iva: produto.iva
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

  const removeFromCarrinho = (produtoId: string) => setCarrinho(carrinho.filter(i => i.produtoId !== produtoId))

  const handleBarcodeSearch = () => {
    if (!searchBarcode.trim()) return
    const produto = buscarProdutoPorCodigoBarras(searchBarcode.trim())
    if (produto) { addToCarrinho(produto); setSearchBarcode('') }
    else toast.error('Produto nao encontrado')
  }

  const handleCodigoSearch = () => {
    if (!searchCodigo.trim()) return
    const produto = buscarProdutoPorCodigo(searchCodigo.trim())
    if (produto) { addToCarrinho(produto); setSearchCodigo('') }
    else toast.error('Produto nao encontrado')
  }

  useEffect(() => {
    if (searchNome.length >= 2) setResultadosNome(buscarProdutosPorNome(searchNome))
    else setResultadosNome([])
  }, [searchNome, buscarProdutosPorNome])

  const handleFinalizar = async () => {
    if (carrinho.length === 0) { toast.error('Carrinho vazio'); return }
    if (totalPago < total) { toast.error('Valor pago insuficiente'); return }
    try {
      const venda = await criarVenda({
        tipo: 'pdv', clienteNome, clienteRuc, itens: carrinho, desconto,
        formaPagamento: pagamentos.map(p => p.forma).join(', '),
        valorRecebido: totalPago, tipoDocumento, cotacaoBrl, cotacaoUsd
      })
      setVendaFinalizada(venda)
      setShowFinalizarDialog(false)
      setShowRecibo(true)
      toast.success('Venda finalizada!')
    } catch { toast.error('Erro ao finalizar venda') }
  }

  const novaVenda = () => {
    setCarrinho([])
    setClienteNome('Consumidor Final')
    setClienteRuc('00000000-0')
    setDesconto(0)
    setPagamentos([{ forma: 'dinheiro', valor: 0 }])
    setVendaFinalizada(null)
    setShowRecibo(false)
    barcodeInputRef.current?.focus()
  }

  const selecionarCliente = (cliente: Cliente) => {
    setClienteNome(cliente.nome)
    setClienteRuc(cliente.ruc || '00000000-0')
    setShowClienteDialog(false)
    toast.success('Cliente selecionado')
  }

  const addPagamento = () => setPagamentos([...pagamentos, { forma: 'dinheiro', valor: 0 }])
  const removePagamento = (idx: number) => setPagamentos(pagamentos.filter((_, i) => i !== idx))
  const updatePagamento = (idx: number, field: 'forma' | 'valor', value: string | number) => {
    setPagamentos(pagamentos.map((p, i) => i === idx ? { ...p, [field]: value } : p))
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(searchCliente.toLowerCase()) ||
    c.ruc?.toLowerCase().includes(searchCliente.toLowerCase())
  )

  return (
    <div className="h-[calc(100vh-2rem)] flex gap-4">
      {/* Left Panel - Search */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">PDV - Ponto de Venda</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Search Tabs */}
        <Tabs defaultValue="barcode" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="barcode"><Barcode className="h-4 w-4 mr-2" />Codigo Barras</TabsTrigger>
            <TabsTrigger value="codigo"><Hash className="h-4 w-4 mr-2" />Codigo Interno</TabsTrigger>
            <TabsTrigger value="nome"><Search className="h-4 w-4 mr-2" />Nome</TabsTrigger>
          </TabsList>

          <TabsContent value="barcode" className="flex-1">
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <Input
                    ref={barcodeInputRef}
                    placeholder="Escanear ou digitar codigo de barras..."
                    value={searchBarcode}
                    onChange={(e) => setSearchBarcode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSearch()}
                    className="text-lg h-12"
                    autoFocus
                  />
                  <Button variant="outline" size="icon" className="h-12 w-12"><Camera className="h-5 w-5" /></Button>
                  <Button onClick={handleBarcodeSearch} className="h-12 px-6">Buscar</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="codigo" className="flex-1">
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite o codigo interno (SKU)..."
                    value={searchCodigo}
                    onChange={(e) => setSearchCodigo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCodigoSearch()}
                    className="text-lg h-12"
                  />
                  <Button onClick={handleCodigoSearch} className="h-12 px-6">Buscar</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nome" className="flex-1">
            <Card className="h-full flex flex-col">
              <CardContent className="pt-6 flex-1 flex flex-col">
                <Input
                  placeholder="Digite o nome do produto..."
                  value={searchNome}
                  onChange={(e) => setSearchNome(e.target.value)}
                  className="text-lg h-12"
                />
                <ScrollArea className="flex-1 mt-4">
                  {resultadosNome.map(p => (
                    <button key={p.id} onClick={() => { addToCarrinho(p); setSearchNome('') }}
                      className="w-full flex items-center justify-between p-3 rounded hover:bg-muted text-left border-b">
                      <span className="font-medium">{p.nome}</span>
                      <span className="text-muted-foreground">Gs. {p.preco_venda.toLocaleString()}</span>
                    </button>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Cart Table */}
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Itens: {carrinho.length}</CardTitle>
              <span className="text-sm text-muted-foreground">Total: Gs. {subtotal.toLocaleString()}</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-center">Qtd</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carrinho.map((item, idx) => (
                  <TableRow key={item.produtoId}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">{item.produtoNome}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantidade(item.produtoId, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantidade}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantidade(item.produtoId, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{item.precoUnitario.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">{(item.quantidade * item.precoUnitario).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFromCarrinho(item.produtoId)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Payment */}
      <div className="w-80 flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-center py-2 bg-muted rounded">
                <p className="font-medium">{clienteNome}</p>
                <p className="text-sm text-muted-foreground">RUC: {clienteRuc}</p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setShowClienteDialog(true)}>
                <Users className="h-4 w-4 mr-2" />
                Selecionar Cliente
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Desconto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">Gs. {desconto.toLocaleString()}</span>
              <Button variant="outline" size="sm" onClick={() => setShowDescontoDialog(true)}>Editar</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between"><span>Subtotal:</span><span>Gs. {subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Desconto:</span><span className="text-destructive">-Gs. {desconto.toLocaleString()}</span></div>
              <Separator />
              <div className="flex justify-between text-2xl font-bold"><span>TOTAL:</span><span>Gs. {total.toLocaleString()}</span></div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={novaVenda} className="h-12">Limpar</Button>
          <Button onClick={() => setShowFinalizarDialog(true)} disabled={carrinho.length === 0} className="h-12 bg-green-600 hover:bg-green-700">
            <Receipt className="h-4 w-4 mr-2" />
            Cobrar
          </Button>
        </div>
      </div>

      {/* Cliente Dialog */}
      <Dialog open={showClienteDialog} onOpenChange={setShowClienteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecionar Cliente</DialogTitle>
            <DialogDescription>Busque ou selecione um cliente</DialogDescription>
          </DialogHeader>
          <Input placeholder="Buscar por nome ou RUC..." value={searchCliente} onChange={(e) => setSearchCliente(e.target.value)} />
          <ScrollArea className="h-64">
            {clientesFiltrados.map(c => (
              <button key={c.id} onClick={() => selecionarCliente(c)}
                className="w-full flex items-center justify-between p-3 rounded hover:bg-muted text-left border-b">
                <div>
                  <p className="font-medium">{c.nome}</p>
                  <p className="text-sm text-muted-foreground">{c.ruc || 'Sem RUC'}</p>
                </div>
              </button>
            ))}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Desconto Dialog */}
      <Dialog open={showDescontoDialog} onOpenChange={setShowDescontoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aplicar Desconto</DialogTitle>
            <DialogDescription>Informe o valor do desconto</DialogDescription>
          </DialogHeader>
          <Input type="number" value={desconto} onChange={(e) => setDesconto(Number(e.target.value))} />
          <DialogFooter>
            <Button onClick={() => setShowDescontoDialog(false)}>Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finalizar Dialog */}
      <Dialog open={showFinalizarDialog} onOpenChange={setShowFinalizarDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Finalizar Venda</DialogTitle>
            <DialogDescription>Total: Gs. {total.toLocaleString()}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Documento</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant={tipoDocumento === 'ticket' ? 'default' : 'outline'} onClick={() => setTipoDocumento('ticket')} className="h-16 flex-col">
                  <Receipt className="h-6 w-6 mb-1" />
                  TICKET COMUM
                </Button>
                <Button variant={tipoDocumento === 'fatura' ? 'default' : 'outline'} onClick={() => setTipoDocumento('fatura')} className="h-16 flex-col bg-blue-600 hover:bg-blue-700">
                  <FileText className="h-6 w-6 mb-1" />
                  FATURA LEGAL
                </Button>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Formas de Pagamento</Label>
                <Button variant="outline" size="sm" onClick={addPagamento}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              {pagamentos.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Select value={p.forma} onValueChange={(v) => updatePagamento(idx, 'forma', v)}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartao_credito">Cartao Credito</SelectItem>
                      <SelectItem value="cartao_debito">Cartao Debito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={p.valor}
                    onChange={(e) => updatePagamento(idx, 'valor', Number(e.target.value))}
                    className="flex-1"
                  />
                  {pagamentos.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removePagamento(idx)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <div className="flex justify-between text-sm pt-2">
                <span>Total Pago:</span>
                <span className={totalPago >= total ? 'text-green-600 font-bold' : 'text-destructive font-bold'}>
                  Gs. {totalPago.toLocaleString()}
                </span>
              </div>
              {totalPago > total && (
                <div className="flex justify-between text-sm">
                  <span>Troco:</span>
                  <span className="font-bold">Gs. {troco.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinalizarDialog(false)}>Cancelar</Button>
            <Button onClick={handleFinalizar} disabled={totalPago < total} className="bg-green-600 hover:bg-green-700">
              Confirmar Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recibo Dialog */}
      <Dialog open={showRecibo} onOpenChange={setShowRecibo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Venda Finalizada</DialogTitle>
          </DialogHeader>
          {vendaFinalizada && (
            <div className="font-mono text-sm bg-white p-4 rounded border">
              <div className="text-center border-b pb-2 mb-2">
                {emitente?.logo && <img src={emitente.logo} alt="Logo" className="h-12 mx-auto mb-2" />}
                <p className="font-bold">{emitente?.razao_social || 'EMPRESA'}</p>
                <p className="text-xs">{emitente?.endereco_rua}, {emitente?.endereco_numero}</p>
                <p className="text-xs">{emitente?.endereco_cidade} - {emitente?.endereco_departamento}</p>
                <p className="text-xs">RUC: {emitente?.ruc}</p>
              </div>
              <div className="text-center border-b pb-2 mb-2">
                <p className="font-bold">{vendaFinalizada.tipo_documento === 'fatura' ? 'FATURA LEGAL' : 'TICKET'}</p>
                <p className="text-xs">#{vendaFinalizada.numero_venda}</p>
                <p className="text-xs">{new Date(vendaFinalizada.created_at).toLocaleString()}</p>
              </div>
              <div className="border-b pb-2 mb-2">
                <p className="text-xs">Cliente: {vendaFinalizada.cliente_nome}</p>
                <p className="text-xs">RUC: {vendaFinalizada.cliente_ruc}</p>
              </div>
              <div className="border-b pb-2 mb-2">
                {carrinho.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span>{item.quantidade}x {item.produtoNome}</span>
                    <span>{(item.quantidade * item.precoUnitario).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs"><span>Subtotal:</span><span>Gs. {vendaFinalizada.subtotal.toLocaleString()}</span></div>
                {vendaFinalizada.desconto > 0 && (
                  <div className="flex justify-between text-xs"><span>Desconto:</span><span>-Gs. {vendaFinalizada.desconto.toLocaleString()}</span></div>
                )}
                <div className="flex justify-between font-bold"><span>TOTAL:</span><span>Gs. {vendaFinalizada.total.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs"><span>IVA 5%:</span><span>Gs. {Math.round(iva5).toLocaleString()}</span></div>
                <div className="flex justify-between text-xs"><span>IVA 10%:</span><span>Gs. {Math.round(iva10).toLocaleString()}</span></div>
              </div>
              <div className="border-t mt-2 pt-2 text-center text-xs">
                <p>USD: {cotacaoUsd.toLocaleString()} | BRL: {cotacaoBrl.toLocaleString()}</p>
                <p>Total USD: ${(vendaFinalizada.total / cotacaoUsd).toFixed(2)}</p>
                <p className="mt-2">Obrigado pela preferencia!</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={novaVenda}>Nova Venda</Button>
            <Button onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
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
        <p className="text-muted-foreground">Ative o modulo de Restaurante para usar esta funcionalidade.</p>
      </Card>
    )
  }

  const getStatusColor = (status: Mesa['status']) => {
    switch (status) {
      case 'livre': return 'bg-green-500'
      case 'ocupada': return 'bg-red-500'
      case 'reservada': return 'bg-yellow-500'
      case 'conta': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const handleAddMesa = async () => {
    if (novaMesa.numero <= 0) { toast.error('Numero invalido'); return }
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
    } catch {
      toast.error('Erro ao criar mesa')
    }
  }

  const nextMesaNumber = mesas.length > 0 ? Math.max(...mesas.map(m => m.numero)) + 1 : 1

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mesas</h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-100 text-green-800">Livre: {mesas.filter(m => m.status === 'livre').length}</Badge>
          <Badge variant="outline" className="bg-red-100 text-red-800">Ocupada: {mesas.filter(m => m.status === 'ocupada').length}</Badge>
          <Button onClick={() => { setNovaMesa({ ...novaMesa, numero: nextMesaNumber }); setShowNovaMesa(true) }}>
            <Plus className="h-4 w-4 mr-2" />Nova Mesa
          </Button>
        </div>
      </div>

      <Dialog open={showNovaMesa} onOpenChange={setShowNovaMesa}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Mesa</DialogTitle>
            <DialogDescription>Configure a nova mesa</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Numero *</Label>
              <Input type="number" value={novaMesa.numero} onChange={(e) => setNovaMesa({ ...novaMesa, numero: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={novaMesa.nome} onChange={(e) => setNovaMesa({ ...novaMesa, nome: e.target.value })} placeholder={`Mesa ${novaMesa.numero}`} />
            </div>
            <div className="space-y-2">
              <Label>Capacidade</Label>
              <Input type="number" value={novaMesa.capacidade} onChange={(e) => setNovaMesa({ ...novaMesa, capacidade: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNovaMesa(false)}>Cancelar</Button>
            <Button onClick={handleAddMesa}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {mesas.map((mesa) => (
          <button
            key={mesa.id}
            onClick={() => onSelectMesa(mesa)}
            className="relative p-4 rounded-xl border-2 bg-card hover:shadow-lg transition-all hover:scale-105"
          >
            <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getStatusColor(mesa.status)}`} />
            <div className="text-center pt-2">
              <p className="text-3xl font-bold">{mesa.numero}</p>
              <p className="text-sm text-muted-foreground">{mesa.nome || `Mesa ${mesa.numero}`}</p>
              <p className="text-xs text-muted-foreground mt-1">{mesa.capacidade} lugares</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ========== MESA DETAIL ==========
function MesaDetail({ mesa, onBack }: { mesa: Mesa; onBack: () => void }) {
  const { produtos, loadMesaItens, addMesaItem, removeMesaItem, updateMesaStatus, mesaItens, criarVenda } = useGestor()
  const [searchProduto, setSearchProduto] = useState('')
  const [itensSelecionados, setItensSelecionados] = useState<string[]>([])
  const [showPagamento, setShowPagamento] = useState(false)

  useEffect(() => { loadMesaItens(mesa.id) }, [mesa.id, loadMesaItens])

  const itens = mesaItens[mesa.id] || []
  const total = itens.reduce((acc, i) => acc + (i.quantidade * i.preco_unitario - i.desconto), 0)
  const totalSelecionados = itens.filter(i => itensSelecionados.includes(i.id)).reduce((acc, i) => acc + (i.quantidade * i.preco_unitario - i.desconto), 0)

  const produtosFiltrados = produtos.filter(p => p.nome.toLowerCase().includes(searchProduto.toLowerCase())).slice(0, 10)

  const handleAddItem = async (produto: Produto) => {
    await addMesaItem(mesa.id, {
      produto_id: produto.id,
      quantidade: 1,
      preco_unitario: produto.preco_venda,
      desconto: 0,
      observacao: '',
      status: 'pendente',
      impresso: false
    })
    toast.success(`${produto.nome} adicionado`)
    setSearchProduto('')
  }

  const toggleItemSelection = (itemId: string) => {
    if (itensSelecionados.includes(itemId)) {
      setItensSelecionados(itensSelecionados.filter(id => id !== itemId))
    } else {
      setItensSelecionados([...itensSelecionados, itemId])
    }
  }

  const handlePagarSelecionados = async () => {
    if (itensSelecionados.length === 0) { toast.error('Selecione itens'); return }
    try {
      const itensParaPagar = itens.filter(i => itensSelecionados.includes(i.id))
      await criarVenda({
        tipo: 'mesa',
        mesaId: mesa.id,
        clienteNome: 'Consumidor Final',
        clienteRuc: '00000000-0',
        itens: itensParaPagar.map(i => ({
          produtoId: i.produto_id,
          produtoNome: i.produtos?.nome || 'Produto',
          quantidade: i.quantidade,
          precoUnitario: i.preco_unitario,
          desconto: i.desconto,
          iva: i.produtos?.iva || 10
        })),
        desconto: 0,
        formaPagamento: 'dinheiro',
        valorRecebido: totalSelecionados,
        tipoDocumento: 'ticket',
        cotacaoBrl: 1350,
        cotacaoUsd: 7500
      })
      for (const itemId of itensSelecionados) {
        await removeMesaItem(itemId, mesa.id)
      }
      setItensSelecionados([])
      toast.success('Pagamento realizado!')
      const itensRestantes = itens.filter(i => !itensSelecionados.includes(i.id))
      if (itensRestantes.length === 0) {
        await updateMesaStatus(mesa.id, 'livre')
      }
    } catch {
      toast.error('Erro no pagamento')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-2" />Voltar</Button>
        <div>
          <h1 className="text-2xl font-bold">Mesa {mesa.numero}</h1>
          <p className="text-muted-foreground">{mesa.nome}</p>
        </div>
        <Badge className="ml-auto">{mesa.status}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Item</CardTitle>
          </CardHeader>
          <CardContent>
            <Input placeholder="Buscar produto..." value={searchProduto} onChange={(e) => setSearchProduto(e.target.value)} />
            {searchProduto && (
              <ScrollArea className="h-48 mt-2">
                {produtosFiltrados.map(p => (
                  <button key={p.id} onClick={() => handleAddItem(p)}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-muted text-left">
                    <span>{p.nome}</span>
                    <span className="text-muted-foreground">Gs. {p.preco_venda.toLocaleString()}</span>
                  </button>
                ))}
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Itens da Mesa</CardTitle>
            <CardDescription>Total: Gs. {total.toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {itens.map((item) => (
                <div key={item.id} className="flex items-center gap-2 p-2 border-b">
                  <Checkbox checked={itensSelecionados.includes(item.id)} onCheckedChange={() => toggleItemSelection(item.id)} />
                  <div className="flex-1">
                    <p className="font-medium">{item.produtos?.nome}</p>
                    <p className="text-sm text-muted-foreground">{item.quantidade}x Gs. {item.preco_unitario.toLocaleString()}</p>
                  </div>
                  <span className="font-medium">Gs. {(item.quantidade * item.preco_unitario).toLocaleString()}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeMesaItem(item.id, mesa.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {itens.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum item</p>}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {itensSelecionados.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{itensSelecionados.length} item(ns) selecionado(s)</p>
              <p className="text-2xl font-bold">Gs. {totalSelecionados.toLocaleString()}</p>
            </div>
            <Button onClick={handlePagarSelecionados} className="bg-green-600 hover:bg-green-700">
              <CreditCard className="h-4 w-4 mr-2" />
              Pagar Selecionados
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ========== MAIN CONTENT ==========
function MainContent() {
  const { modulos, emitente } = useGestor()
  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard')
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const moduloRestauranteAtivo = modulos?.restaurante || modulos?.delivery || modulos?.comandas || modulos?.controle_mesas

  const menuItems: { key: PageKey; label: string; desc: string; icon: React.ReactNode; show: boolean }[] = [
    { key: 'dashboard', label: 'Dashboard', desc: 'Visao geral', icon: <LayoutDashboard className="h-5 w-5" />, show: true },
    { key: 'pdv', label: 'PDV', desc: 'Ponto de venda', icon: <ShoppingCart className="h-5 w-5" />, show: !!modulos?.pdv },
    { key: 'mesas', label: 'Mesas', desc: 'Controle de mesas', icon: <UtensilsCrossed className="h-5 w-5" />, show: !!moduloRestauranteAtivo },
    { key: 'produtos', label: 'Produtos', desc: 'Cadastro de produtos', icon: <Package className="h-5 w-5" />, show: true },
    { key: 'clientes', label: 'Clientes', desc: 'Cadastro de clientes', icon: <Users className="h-5 w-5" />, show: true },
    { key: 'relatorios', label: 'Relatorios', desc: 'Analise de vendas', icon: <BarChart3 className="h-5 w-5" />, show: true },
    { key: 'emitente', label: 'Emitente Fiscal', desc: 'Dados da empresa', icon: <Building2 className="h-5 w-5" />, show: true },
    { key: 'impressoras', label: 'Impressoras', desc: 'Configurar impressoras', icon: <Printer className="h-5 w-5" />, show: true },
    { key: 'modulos', label: 'Modulos', desc: 'Ativar/desativar', icon: <Settings className="h-5 w-5" />, show: true },
  ]

  const renderContent = () => {
    if (currentPage === 'mesa-detail' && selectedMesa) {
      return <MesaDetail mesa={selectedMesa} onBack={() => { setCurrentPage('mesas'); setSelectedMesa(null) }} />
    }
    switch (currentPage) {
      case 'dashboard': return <DashboardContent />
      case 'pdv': return <PDVPage />
      case 'mesas': return <MesasGrid onSelectMesa={(mesa) => { setSelectedMesa(mesa); setCurrentPage('mesa-detail') }} />
      case 'produtos': return <ProdutosManager />
      case 'clientes': return <ClientesManager />
      case 'relatorios': return <RelatoriosPage />
      case 'emitente': return <EmitenteConfig />
      case 'impressoras': return <ImpressorasConfig />
      case 'modulos': return <ModulosConfig />
      default: return <DashboardContent />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} border-r bg-card transition-all overflow-hidden`}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold">GestorX</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}><X className="h-4 w-4" /></Button>
        </div>
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <nav className="p-2 space-y-1">
            {menuItems.filter(m => m.show).map((item) => (
              <button
                key={item.key}
                onClick={() => setCurrentPage(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  currentPage === item.key ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                {item.icon}
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className={`text-xs ${currentPage === item.key ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{item.desc}</p>
                </div>
              </button>
            ))}
          </nav>
        </ScrollArea>
        {emitente && (
          <div className="p-4 border-t">
            <p className="text-sm font-medium truncate">{emitente.nome_fantasia || emitente.razao_social}</p>
            <p className="text-xs text-muted-foreground">{emitente.ruc}</p>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {!sidebarOpen && (
          <Button variant="ghost" size="icon" className="m-2" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="p-6">{renderContent()}</div>
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
