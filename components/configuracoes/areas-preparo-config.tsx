"use client"

import { useState } from 'react'
import { useGestorX } from '@/lib/context'
import { AreaPreparo } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  ChefHat, 
  Plus, 
  Pencil, 
  Trash2, 
  Printer,
  Wine,
  Coffee,
  Flame,
  Pizza,
  UtensilsCrossed
} from 'lucide-react'

const ICONES_AREAS = [
  { value: 'chef', label: 'Cozinha', icon: ChefHat },
  { value: 'wine', label: 'Bar', icon: Wine },
  { value: 'coffee', label: 'Copa', icon: Coffee },
  { value: 'flame', label: 'Churrasqueira', icon: Flame },
  { value: 'pizza', label: 'Pizzaria', icon: Pizza },
  { value: 'utensils', label: 'Outros', icon: UtensilsCrossed },
]

export function AreasPreparoConfig() {
  const { areasPreparo, addAreaPreparo, updateAreaPreparo, removeAreaPreparo, impressoras } = useGestorX()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingArea, setEditingArea] = useState<AreaPreparo | null>(null)
  const [formData, setFormData] = useState<Partial<AreaPreparo>>({
    nome: '',
    descricao: '',
    impressoraId: null,
    ativo: true,
  })

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      impressoraId: null,
      ativo: true,
    })
    setEditingArea(null)
  }

  const openEdit = (area: AreaPreparo) => {
    setEditingArea(area)
    setFormData(area)
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.nome) return

    if (editingArea) {
      updateAreaPreparo(editingArea.id, formData)
    } else {
      const newArea: AreaPreparo = {
        ...formData as AreaPreparo,
        id: Date.now().toString(),
      }
      addAreaPreparo(newArea)
    }
    setDialogOpen(false)
    resetForm()
  }

  const getAreaIcon = (nome: string) => {
    const nomeLower = nome.toLowerCase()
    if (nomeLower.includes('cozinha')) return ChefHat
    if (nomeLower.includes('bar')) return Wine
    if (nomeLower.includes('copa')) return Coffee
    if (nomeLower.includes('churras')) return Flame
    if (nomeLower.includes('pizza')) return Pizza
    return UtensilsCrossed
  }

  const impressorasAtivas = impressoras.filter(i => i.ativo)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ChefHat className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Áreas de Preparo</CardTitle>
                <CardDescription>
                  Configure as áreas de preparo para envio de pedidos às impressoras corretas
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
                  Nova Área
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingArea ? 'Editar Área de Preparo' : 'Nova Área de Preparo'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure os detalhes da área de preparo
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Área *</Label>
                    <Input
                      id="nome"
                      placeholder="Ex: Cozinha Principal"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      placeholder="Descreva o tipo de preparo desta área..."
                      value={formData.descricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="impressora">Impressora Vinculada</Label>
                    <Select
                      value={formData.impressoraId || 'none'}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        impressoraId: value === 'none' ? null : value 
                      }))}
                    >
                      <SelectTrigger id="impressora">
                        <SelectValue placeholder="Selecione uma impressora" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma impressora</SelectItem>
                        {impressorasAtivas.map((impressora) => (
                          <SelectItem key={impressora.id} value={impressora.id}>
                            <span className="flex items-center gap-2">
                              <Printer className="h-4 w-4" />
                              {impressora.nome}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Os pedidos desta área serão enviados para esta impressora
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Área Ativa</Label>
                      <p className="text-sm text-muted-foreground">
                        Desative para ocultar nos cadastros
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
                    {editingArea ? 'Salvar Alterações' : 'Adicionar Área'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {areasPreparo.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ChefHat className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Nenhuma área configurada</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Configure as áreas de preparo do seu estabelecimento (Cozinha, Bar, Copa, etc.)
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {areasPreparo.map((area) => {
                const Icon = getAreaIcon(area.nome)
                const impressora = impressoras.find(i => i.id === area.impressoraId)
                return (
                  <Card key={area.id} className={`relative ${!area.ativo ? 'opacity-60' : ''}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{area.nome}</h4>
                            {area.descricao && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {area.descricao}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant={area.ativo ? "default" : "secondary"}>
                          {area.ativo ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <Printer className="h-4 w-4" />
                        {impressora ? (
                          <span>{impressora.nome}</span>
                        ) : (
                          <span className="italic">Sem impressora vinculada</span>
                        )}
                      </div>

                      <div className="mt-4 flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(area)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeAreaPreparo(area.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
