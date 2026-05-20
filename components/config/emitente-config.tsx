"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Emitente } from "@/lib/database.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Upload, X, Building2, MapPin, Phone, Mail, Briefcase, Save } from "lucide-react"

const DEPARTAMENTOS_PARAGUAY = [
  "Asunción",
  "Alto Paraguay",
  "Alto Paraná",
  "Amambay",
  "Boquerón",
  "Caaguazú",
  "Caazapá",
  "Canindeyú",
  "Central",
  "Concepción",
  "Cordillera",
  "Guairá",
  "Itapúa",
  "Misiones",
  "Ñeembucú",
  "Paraguarí",
  "Presidente Hayes",
  "San Pedro",
]

const AREAS_ATUACAO = [
  "Comércio Varejista",
  "Comércio Atacadista",
  "Restaurante",
  "Lanchonete",
  "Bar",
  "Padaria",
  "Supermercado",
  "Minimercado",
  "Farmácia",
  "Loja de Roupas",
  "Loja de Calçados",
  "Loja de Eletrônicos",
  "Posto de Combustível",
  "Serviços",
  "Outros",
]

export function EmitenteConfig() {
  const [emitente, setEmitente] = useState<Emitente | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchEmitente()
  }, [])

  const fetchEmitente = async () => {
    try {
      const { data, error } = await supabase
        .from("emitente")
        .select("*")
        .single()

      if (error) throw error
      setEmitente(data)
      setLogoPreview(data.logo)
    } catch (error) {
      console.error("Erro ao carregar emitente:", error)
      toast.error("Erro ao carregar dados do emitente")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof Emitente, value: string) => {
    if (!emitente) return
    setEmitente({ ...emitente, [field]: value })
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida (PNG ou JPEG)")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setLogoPreview(base64)
      if (emitente) {
        setEmitente({ ...emitente, logo: base64 })
      }
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setLogoPreview(null)
    if (emitente) {
      setEmitente({ ...emitente, logo: null })
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSave = async () => {
    if (!emitente) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from("emitente")
        .update({
          ruc: emitente.ruc,
          razao_social: emitente.razao_social,
          nome_fantasia: emitente.nome_fantasia,
          logo: emitente.logo,
          endereco_rua: emitente.endereco_rua,
          endereco_numero: emitente.endereco_numero,
          endereco_bairro: emitente.endereco_bairro,
          endereco_cidade: emitente.endereco_cidade,
          endereco_departamento: emitente.endereco_departamento,
          endereco_cep: emitente.endereco_cep,
          area_atuacao: emitente.area_atuacao,
          telefone: emitente.telefone,
          email: emitente.email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", emitente.id)

      if (error) throw error
      toast.success("Dados do emitente salvos com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar emitente:", error)
      toast.error("Erro ao salvar dados do emitente")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!emitente) {
    return <div>Erro ao carregar dados do emitente</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configuração do Emitente Fiscal</h2>
          <p className="text-muted-foreground">
            Configure os dados fiscais da sua empresa
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Dados da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados da Empresa
            </CardTitle>
            <CardDescription>Informações fiscais obrigatórias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ruc">RUC *</Label>
              <Input
                id="ruc"
                value={emitente.ruc}
                onChange={(e) => handleChange("ruc", e.target.value)}
                placeholder="00000000-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="razao_social">Razão Social *</Label>
              <Input
                id="razao_social"
                value={emitente.razao_social}
                onChange={(e) => handleChange("razao_social", e.target.value)}
                placeholder="Nome da empresa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
              <Input
                id="nome_fantasia"
                value={emitente.nome_fantasia || ""}
                onChange={(e) => handleChange("nome_fantasia", e.target.value)}
                placeholder="Nome comercial"
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Logo da Empresa
            </CardTitle>
            <CardDescription>Imagem PNG ou JPEG (máx. 2MB)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo da empresa"
                    className="w-32 h-32 object-contain rounded-lg border bg-white"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={removeLogo}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={handleLogoChange}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview ? "Trocar Logo" : "Selecionar Logo"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço
            </CardTitle>
            <CardDescription>Localização da empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="endereco_rua">Rua</Label>
                <Input
                  id="endereco_rua"
                  value={emitente.endereco_rua || ""}
                  onChange={(e) => handleChange("endereco_rua", e.target.value)}
                  placeholder="Nome da rua"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco_numero">Número</Label>
                <Input
                  id="endereco_numero"
                  value={emitente.endereco_numero || ""}
                  onChange={(e) => handleChange("endereco_numero", e.target.value)}
                  placeholder="123"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endereco_bairro">Bairro</Label>
              <Input
                id="endereco_bairro"
                value={emitente.endereco_bairro || ""}
                onChange={(e) => handleChange("endereco_bairro", e.target.value)}
                placeholder="Nome do bairro"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endereco_cidade">Cidade</Label>
                <Input
                  id="endereco_cidade"
                  value={emitente.endereco_cidade || ""}
                  onChange={(e) => handleChange("endereco_cidade", e.target.value)}
                  placeholder="Nome da cidade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco_departamento">Departamento</Label>
                <Select
                  value={emitente.endereco_departamento || ""}
                  onValueChange={(value) => handleChange("endereco_departamento", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTAMENTOS_PARAGUAY.map((dep) => (
                      <SelectItem key={dep} value={dep}>
                        {dep}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endereco_cep">CEP</Label>
              <Input
                id="endereco_cep"
                value={emitente.endereco_cep || ""}
                onChange={(e) => handleChange("endereco_cep", e.target.value)}
                placeholder="000000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contato e Área de Atuação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Contato e Atividade
            </CardTitle>
            <CardDescription>Informações de contato e área de atuação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telefone"
                  value={emitente.telefone || ""}
                  onChange={(e) => handleChange("telefone", e.target.value)}
                  placeholder="+595 21 000 0000"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={emitente.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="empresa@email.com"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="area_atuacao">Área de Atuação</Label>
              <Select
                value={emitente.area_atuacao || ""}
                onValueChange={(value) => handleChange("area_atuacao", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a área" />
                </SelectTrigger>
                <SelectContent>
                  {AREAS_ATUACAO.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
