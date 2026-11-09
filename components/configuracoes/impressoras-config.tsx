"use client"

import { useState } from 'react'
import { useGestorX } from '@/lib/context'
import { Impressora, ImpressoraFuncao, IMPRESSORA_FUNCOES_LABELS } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
import { 
  Printer, 
  Plus, 
  Pencil, 
  Trash2, 
  Wifi, 
  Usb, 
  Bluetooth,
  Settings2,
  ChefHat,
  UtensilsCrossed,
  Wine,
  Truck
} from 'lucide-react'

const TIPOS_CONEXAO = [
  { value: 'usb', label: 'USB', icon: Usb },
  { value: 'rede', label: 'Rede (IP)', icon: Wifi },
  { value: 'bluetooth', label: 'Bluetooth', icon: Bluetooth },
]

const TIPOS_IMPRESSORA = [
  { value: 'termica', label: 'Térmica (80mm)' },
  { value: 'a4', label: 'A4 / Carta' },
  { value: 'fiscal', label: 'Fiscal' },
]

export function ImpressorasConfig() {
  const { impressoras, addImpressora, updateImpressora, removeImpressora, areasPreparo, moduloRestauranteAtivo } = useGestorX()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingImpressora, setEditingImpressora] = useState<Impressora | null>(null)
  const [formData, setFormData] = useState<Partial<Impressora>>({
    nome: '',
    tipo: 'termica',
    conexao: 'usb',
    ip: '',
    porta: 9100,
    funcao: [],
    areaPreparoId: null,
    ativo: true,
  })

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: 'termica',
      conexao: 'usb',
      ip: '',
      porta: 9100,
      funcao: [],
      areaPreparoId: null,
      ativo: true,
    })
    setEditingImpressora(null)
  }

  const openEdit = (impressora: Impressora) => {
    setEditingImpressora(impressora)
    setFormData(impressora)
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.nome) return

    if (editingImpressora) {
      updateImpressora(editingImpressora.id, formData)
    } else {
      const newImpressora: Impressora = {
        ...formData as Impressora,
        id: Date.now().toString(),
      }
      addImpressora(newImpressora)
    }
    setDialogOpen(false)
    resetForm()
  }

  const toggleFuncao = (funcao: ImpressoraFuncao) => {
    setFormData(prev => ({
      ...prev,
      funcao: prev.funcao?.includes(funcao)
        ? prev.funcao.filter(f => f !== funcao)
        : [...(prev.funcao || []), funcao]
    }))
  }

  const getFuncaoIcon = (funcao: ImpressoraFuncao) => {
    switch (funcao) {
      case 'cozinha': return <ChefHat className="h-3 w-3" />
      case 'bar': return <Wine className="h-3 w-3" />
      case 'entrega': return <Truck className="h-3 w-3" />
      default: return <UtensilsCrossed className="h-3 w-3" />
    }
  }

  const getConexaoIcon = (conexao: string) => {
    const tipo = TIPOS_CONEXAO.find(t => t.value === conexao)
    if (tipo) {
      const Icon = tipo.icon
      return <Icon className="h-4 w-4" />
    }
    return null
  }

  // Funções disponíveis baseadas nos módulos ativos
  const funcoesDisponiveis: ImpressoraFuncao[] = moduloRestauranteAtivo
    ? ['pdv', 'cozinha', 'bar', 'copa', 'entrega', 'comanda', 'fatura', 'relatorio', 'etiqueta']
    : ['pdv', 'fatura', 'relatorio', 'etiqueta']

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Printer className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Configuração de Impressoras</CardTitle>
                <CardDescription>
                  Configure as impressoras para cada função do sistema
                </CardDescription>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Impressora
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingImpressora ? 'Editar Impressora' : 'Nova Impressora'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure os detalhes da impressora e suas funções no sistema
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Dados básicos */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome da Impressora *</Label>
                      <Input
                        id="nome"
                        placeholder="Ex: Impressora Cozinha"
                        value={formData.nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select
                        value={formData.tipo}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as Impressora['tipo'] }))}
                      >
                        <SelectTrigger id="tipo">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_IMPRESSORA.map((tipo) => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Conexão */}
                  <div className="space-y-3">
                    <Label>Tipo de Conexão</Label>
                    <div className="flex gap-2">
                      {TIPOS_CONEXAO.map((tipo) => {
                        const Icon = tipo.icon
                        const isSelected = formData.conexao === tipo.value
                        return (
                          <Button
                            key={tipo.value}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => setFormData(prev => ({ ...prev, conexao: tipo.value as Impressora['conexao'] }))}
                          >
                            <Icon className="mr-2 h-4 w-4" />
                            {tipo.label}
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  {/* IP e Porta (apenas para conexão de rede) */}
                  {formData.conexao === 'rede' && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="ip">Endereço IP *</Label>
                        <Input
                          id="ip"
                          placeholder="192.168.1.100"
                          value={formData.ip}
                          onChange={(e) => setFormData(prev => ({ ...prev, ip: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="porta">Porta</Label>
                        <Input
                          id="porta"
                          type="number"
                          placeholder="9100"
                          value={formData.porta}
                          onChange={(e) => setFormData(prev => ({ ...prev, porta: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>
                  )}

                  {/* Funções */}
                  <div className="space-y-3">
                    <Label>Funções da Impressora</Label>
                    <p className="text-sm text-muted-foreground">
                      Selecione para quais funções esta impressora será utilizada
                    </p>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {funcoesDisponiveis.map((funcao) => (
                        <div
                          key={funcao}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                            formData.funcao?.includes(funcao)
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => toggleFuncao(funcao)}
                        >
                          <Checkbox
                            checked={formData.funcao?.includes(funcao)}
                            onCheckedChange={() => toggleFuncao(funcao)}
                          />
                          <span className="text-sm font-medium">
                            {IMPRESSORA_FUNCOES_LABELS[funcao]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Área de Preparo (se módulo restaurante ativo) */}
                  {moduloRestauranteAtivo && (
                    <div className="space-y-2">
                      <Label htmlFor="areaPreparo">Área de Preparo (opcional)</Label>
                      <Select
                        value={formData.areaPreparoId || 'none'}
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          areaPreparoId: value === 'none' ? null : value 
                        }))}
                      >
                        <SelectTrigger id="areaPreparo">
                          <SelectValue placeholder="Selecione uma área" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma área específica</SelectItem>
                          {areasPreparo.filter(a => a.ativo).map((area) => (
                            <SelectItem key={area.id} value={area.id}>
                              {area.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Vincule esta impressora a uma área de preparo específica
                      </p>
                    </div>
                  )}

                  {/* Ativo */}
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Impressora Ativa</Label>
                      <p className="text-sm text-muted-foreground">
                        Desative para não utilizar temporariamente
                      </p>
                    </div>
                    <Switch
                      checked={formData.ativo}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={!formData.nome}>
                    {editingImpressora ? 'Salvar Alterações' : 'Adicionar Impressora'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {impressoras.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Printer className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Nenhuma impressora configurada</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Configure suas impressoras para começar a imprimir cupons, comandas e faturas.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Conexão</TableHead>
                  <TableHead>Funções</TableHead>
                  {moduloRestauranteAtivo && <TableHead>Área</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {impressoras.map((impressora) => {
                  const areaPreparo = areasPreparo.find(a => a.id === impressora.areaPreparoId)
                  return (
                    <TableRow key={impressora.id}>
                      <TableCell className="font-medium">{impressora.nome}</TableCell>
                      <TableCell>
                        {TIPOS_IMPRESSORA.find(t => t.value === impressora.tipo)?.label}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getConexaoIcon(impressora.conexao)}
                          {impressora.conexao === 'rede' && impressora.ip && (
                            <span className="text-xs text-muted-foreground">
                              {impressora.ip}:{impressora.porta}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {impressora.funcao.slice(0, 2).map((f) => (
                            <Badge key={f} variant="secondary" className="text-xs">
                              {IMPRESSORA_FUNCOES_LABELS[f]}
                            </Badge>
                          ))}
                          {impressora.funcao.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{impressora.funcao.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      {moduloRestauranteAtivo && (
                        <TableCell>
                          {areaPreparo ? (
                            <Badge variant="outline">{areaPreparo.nome}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge variant={impressora.ativo ? "default" : "secondary"}>
                          {impressora.ativo ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(impressora)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeImpressora(impressora.id)}
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

      {/* Dica sobre áreas de preparo */}
      {moduloRestauranteAtivo && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="flex items-start gap-4 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
              <Settings2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900">Impressoras por Área de Preparo</h4>
              <p className="mt-1 text-sm text-blue-700">
                Em restaurantes, você pode configurar impressoras diferentes para cada área de preparo 
                (Cozinha, Bar, Copa, etc.). Quando um pedido for enviado, ele será impresso 
                automaticamente na impressora da área correspondente ao produto.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
