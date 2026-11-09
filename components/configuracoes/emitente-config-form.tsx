"use client"

import { useState, useRef } from 'react'
import { useGestorX } from '@/lib/context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, Upload, X, Save, MapPin, Phone, Mail, Briefcase } from 'lucide-react'

const AREAS_ATUACAO = [
  'Comércio Varejista',
  'Comércio Atacadista',
  'Restaurante',
  'Bar e Lanchonete',
  'Pizzaria',
  'Padaria e Confeitaria',
  'Supermercado',
  'Minimercado',
  'Farmácia',
  'Vestuário',
  'Eletrônicos',
  'Materiais de Construção',
  'Autopeças',
  'Serviços',
  'Outros',
]

const DEPARTAMENTOS_PARAGUAY = [
  'Asunción',
  'Alto Paraná',
  'Central',
  'Itapúa',
  'Caaguazú',
  'San Pedro',
  'Paraguarí',
  'Cordillera',
  'Guairá',
  'Caazapá',
  'Misiones',
  'Ñeembucú',
  'Amambay',
  'Canindeyú',
  'Presidente Hayes',
  'Alto Paraguay',
  'Boquerón',
  'Concepción',
]

export function EmitenteConfigForm() {
  const { emitente, setEmitente } = useGestorX()
  const [formData, setFormData] = useState(emitente)
  const [logoPreview, setLogoPreview] = useState<string | null>(emitente.logo)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleEnderecoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      endereco: { ...prev.endereco, [field]: value }
    }))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setLogoPreview(result)
        setFormData(prev => ({ ...prev, logo: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoPreview(null)
    setFormData(prev => ({ ...prev, logo: null }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSave = () => {
    setEmitente(formData)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Dados do Emitente Fiscal</CardTitle>
              <CardDescription>Configure as informações da empresa para emissão de documentos fiscais</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Logo da Empresa</Label>
            <div className="flex items-start gap-4">
              <div 
                className="relative flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-primary/50"
              >
                {logoPreview ? (
                  <>
                    <img 
                      src={logoPreview} 
                      alt="Logo" 
                      className="h-full w-full rounded-lg object-contain p-2"
                    />
                    <button
                      onClick={removeLogo}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md transition-transform hover:scale-110"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <Upload className="h-8 w-8" />
                    <span className="text-xs">Sem logo</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Carregar Logo
                </Button>
                <p className="text-xs text-muted-foreground">
                  Formatos: JPG, PNG<br />
                  Tamanho máximo: 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Dados Fiscais */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ruc">RUC da Empresa *</Label>
              <Input
                id="ruc"
                placeholder="80000000-0"
                value={formData.ruc}
                onChange={(e) => handleChange('ruc', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Registro Único de Contribuyente</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="razaoSocial">Razão Social *</Label>
              <Input
                id="razaoSocial"
                placeholder="Nome legal da empresa"
                value={formData.razaoSocial}
                onChange={(e) => handleChange('razaoSocial', e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
              <Input
                id="nomeFantasia"
                placeholder="Nome comercial"
                value={formData.nomeFantasia}
                onChange={(e) => handleChange('nomeFantasia', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="areaAtuacao">Área de Atuação *</Label>
              <Select
                value={formData.areaAtuacao}
                onValueChange={(value) => handleChange('areaAtuacao', value)}
              >
                <SelectTrigger id="areaAtuacao">
                  <SelectValue placeholder="Selecione a área">
                    {formData.areaAtuacao && (
                      <span className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        {formData.areaAtuacao}
                      </span>
                    )}
                  </SelectValue>
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
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Endereço</CardTitle>
              <CardDescription>Endereço fiscal da empresa</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="rua">Rua / Avenida *</Label>
              <Input
                id="rua"
                placeholder="Nome da rua ou avenida"
                value={formData.endereco.rua}
                onChange={(e) => handleEnderecoChange('rua', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero">Número *</Label>
              <Input
                id="numero"
                placeholder="123"
                value={formData.endereco.numero}
                onChange={(e) => handleEnderecoChange('numero', e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                placeholder="Nome do bairro"
                value={formData.endereco.bairro}
                onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade *</Label>
              <Input
                id="cidade"
                placeholder="Nome da cidade"
                value={formData.endereco.cidade}
                onChange={(e) => handleEnderecoChange('cidade', e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="departamento">Departamento *</Label>
              <Select
                value={formData.endereco.departamento}
                onValueChange={(value) => handleEnderecoChange('departamento', value)}
              >
                <SelectTrigger id="departamento">
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
            <div className="space-y-2">
              <Label htmlFor="pais">País</Label>
              <Input
                id="pais"
                value={formData.endereco.pais}
                onChange={(e) => handleEnderecoChange('pais', e.target.value)}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cep">Código Postal</Label>
              <Input
                id="cep"
                placeholder="00000"
                value={formData.endereco.cep}
                onChange={(e) => handleEnderecoChange('cep', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contato */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Contato</CardTitle>
              <CardDescription>Informações de contato da empresa</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="telefone"
                  placeholder="+595 21 000 000"
                  className="pl-10"
                  value={formData.telefone}
                  onChange={(e) => handleChange('telefone', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="contato@empresa.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" className="min-w-[200px]">
          <Save className="mr-2 h-4 w-4" />
          {saved ? 'Salvo com sucesso!' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  )
}
