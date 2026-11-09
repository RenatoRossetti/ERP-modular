"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Impressora, AreaPreparo } from "@/lib/database.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Plus, Printer, Edit, Trash2, Wifi, Usb, Bluetooth } from "lucide-react"

const FUNCOES_IMPRESSORA = [
  { id: "pdv", label: "PDV / Caixa" },
  { id: "cozinha", label: "Cozinha" },
  { id: "bar", label: "Bar" },
  { id: "copa", label: "Copa" },
  { id: "entrega", label: "Entrega" },
  { id: "comanda", label: "Comanda" },
  { id: "fatura", label: "Fatura / NFC-e" },
  { id: "relatorio", label: "Relatórios" },
]

export function ImpressorasConfig() {
  const [impressoras, setImpressoras] = useState<Impressora[]>([])
  const [areasPreparo, setAreasPreparo] = useState<AreaPreparo[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "termica" as Impressora["tipo"],
    conexao: "usb" as Impressora["conexao"],
    ip: "",
    porta: "",
    funcoes: [] as string[],
    area_preparo_id: "",
    ativo: true,
  })
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [impressorasRes, areasRes] = await Promise.all([
        supabase.from("impressoras").select("*").order("nome"),
        supabase.from("areas_preparo").select("*").eq("ativo", true).order("nome"),
      ])

      if (impressorasRes.error) throw impressorasRes.error
      if (areasRes.error) throw areasRes.error

      setImpressoras(impressorasRes.data || [])
      setAreasPreparo(areasRes.data || [])
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast.error("Erro ao carregar impressoras")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      tipo: "termica",
      conexao: "usb",
      ip: "",
      porta: "",
      funcoes: [],
      area_preparo_id: "",
      ativo: true,
    })
    setEditingId(null)
  }

  const openEditDialog = (impressora: Impressora) => {
    setFormData({
      nome: impressora.nome,
      tipo: impressora.tipo,
      conexao: impressora.conexao,
      ip: impressora.ip || "",
      porta: impressora.porta?.toString() || "",
      funcoes: impressora.funcoes || [],
      area_preparo_id: impressora.area_preparo_id || "",
      ativo: impressora.ativo,
    })
    setEditingId(impressora.id)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.nome) {
      toast.error("Nome é obrigatório")
      return
    }

    try {
      const dataToSave = {
        nome: formData.nome,
        tipo: formData.tipo,
        conexao: formData.conexao,
        ip: formData.conexao === "rede" ? formData.ip : null,
        porta: formData.conexao === "rede" && formData.porta ? parseInt(formData.porta) : null,
        funcoes: formData.funcoes,
        area_preparo_id: formData.area_preparo_id || null,
        ativo: formData.ativo,
        updated_at: new Date().toISOString(),
      }

      if (editingId) {
        const { error } = await supabase
          .from("impressoras")
          .update(dataToSave)
          .eq("id", editingId)

        if (error) throw error
        toast.success("Impressora atualizada com sucesso")
      } else {
        const { error } = await supabase
          .from("impressoras")
          .insert(dataToSave)

        if (error) throw error
        toast.success("Impressora adicionada com sucesso")
      }

      setDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error("Erro ao salvar impressora:", error)
      toast.error("Erro ao salvar impressora")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta impressora?")) return

    try {
      const { error } = await supabase
        .from("impressoras")
        .delete()
        .eq("id", id)

      if (error) throw error
      toast.success("Impressora excluída com sucesso")
      fetchData()
    } catch (error) {
      console.error("Erro ao excluir impressora:", error)
      toast.error("Erro ao excluir impressora")
    }
  }

  const toggleFuncao = (funcaoId: string) => {
    setFormData((prev) => ({
      ...prev,
      funcoes: prev.funcoes.includes(funcaoId)
        ? prev.funcoes.filter((f) => f !== funcaoId)
        : [...prev.funcoes, funcaoId],
    }))
  }

  const getConexaoIcon = (conexao: string) => {
    switch (conexao) {
      case "rede":
        return <Wifi className="h-4 w-4" />
      case "usb":
        return <Usb className="h-4 w-4" />
      case "bluetooth":
        return <Bluetooth className="h-4 w-4" />
      default:
        return <Printer className="h-4 w-4" />
    }
  }

  const getAreaNome = (areaId: string | null) => {
    if (!areaId) return "-"
    const area = areasPreparo.find((a) => a.id === areaId)
    return area?.nome || "-"
  }

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
          <h2 className="text-2xl font-bold">Configuração de Impressoras</h2>
          <p className="text-muted-foreground">
            Configure as impressoras para cada função do sistema
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Impressora
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Impressora" : "Nova Impressora"}</DialogTitle>
              <DialogDescription>
                Configure os dados da impressora
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Impressora Cozinha"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: Impressora["tipo"]) => setFormData({ ...formData, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="termica">Térmica</SelectItem>
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="fiscal">Fiscal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Conexão</Label>
                  <Select
                    value={formData.conexao}
                    onValueChange={(value: Impressora["conexao"]) => setFormData({ ...formData, conexao: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usb">USB</SelectItem>
                      <SelectItem value="rede">Rede</SelectItem>
                      <SelectItem value="bluetooth">Bluetooth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.conexao === "rede" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ip">IP</Label>
                    <Input
                      id="ip"
                      value={formData.ip}
                      onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="porta">Porta</Label>
                    <Input
                      id="porta"
                      value={formData.porta}
                      onChange={(e) => setFormData({ ...formData, porta: e.target.value })}
                      placeholder="9100"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Área de Preparo</Label>
                <Select
                  value={formData.area_preparo_id}
                  onValueChange={(value) => setFormData({ ...formData, area_preparo_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhuma" />
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
              </div>

              <div className="space-y-2">
                <Label>Funções</Label>
                <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg">
                  {FUNCOES_IMPRESSORA.map((funcao) => (
                    <div key={funcao.id} className="flex items-center gap-2">
                      <Checkbox
                        id={funcao.id}
                        checked={formData.funcoes.includes(funcao.id)}
                        onCheckedChange={() => toggleFuncao(funcao.id)}
                      />
                      <Label htmlFor={funcao.id} className="text-sm cursor-pointer">
                        {funcao.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                />
                <Label>Impressora ativa</Label>
              </div>
            </div>
            <DialogFooter>
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
          <CardTitle>Impressoras Cadastradas</CardTitle>
          <CardDescription>
            Gerencie as impressoras do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {impressoras.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma impressora cadastrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Conexão</TableHead>
                  <TableHead>Área de Preparo</TableHead>
                  <TableHead>Funções</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {impressoras.map((impressora) => (
                  <TableRow key={impressora.id}>
                    <TableCell className="font-medium">{impressora.nome}</TableCell>
                    <TableCell className="capitalize">{impressora.tipo}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getConexaoIcon(impressora.conexao)}
                        <span className="capitalize">{impressora.conexao}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getAreaNome(impressora.area_preparo_id)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(impressora.funcoes || []).slice(0, 3).map((funcao) => (
                          <Badge key={funcao} variant="secondary" className="text-xs">
                            {FUNCOES_IMPRESSORA.find((f) => f.id === funcao)?.label || funcao}
                          </Badge>
                        ))}
                        {(impressora.funcoes || []).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(impressora.funcoes || []).length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={impressora.ativo ? "default" : "secondary"}>
                        {impressora.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(impressora)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(impressora.id)}
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
