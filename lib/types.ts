// Tipos para o sistema GestorX

export interface EmitenteConfig {
  ruc: string
  razaoSocial: string
  nomeFantasia: string
  logo: string | null
  endereco: {
    rua: string
    numero: string
    bairro: string
    cidade: string
    departamento: string
    pais: string
    cep: string
  }
  areaAtuacao: string
  telefone: string
  email: string
}

export interface AreaPreparo {
  id: string
  nome: string
  descricao: string
  impressoraId: string | null
  ativo: boolean
}

export interface Impressora {
  id: string
  nome: string
  tipo: 'termica' | 'a4' | 'fiscal'
  conexao: 'usb' | 'rede' | 'bluetooth'
  ip?: string
  porta?: number
  funcao: ImpressoraFuncao[]
  areaPreparoId?: string | null
  ativo: boolean
}

export type ImpressoraFuncao = 
  | 'pdv'
  | 'cozinha'
  | 'bar'
  | 'copa'
  | 'entrega'
  | 'comanda'
  | 'fatura'
  | 'relatorio'
  | 'etiqueta'

export interface Produto {
  id: string
  nome: string
  codigoInterno: string
  codigoBarras: string
  categoria: string
  subcategoria: string
  marca: string
  fornecedorId: string
  unidadeMedida: string
  estoqueMinimo: number
  estoqueAtual: number
  localizacaoEstoque: string
  precoCusto: number
  precoVenda: number
  margemLucro: number
  iva: 5 | 10
  moeda: 'PYG' | 'BRL' | 'USD'
  imagem: string | null
  descricao: string
  // Campos para restaurante/comandas/delivery
  areaPreparoId: string | null
  imprimirNaProducao: boolean
  ativo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ModulosAtivos {
  pdv: boolean
  restaurante: boolean
  delivery: boolean
  comandas: boolean
  agendamentos: boolean
  whatsapp: boolean
  financeiro: boolean
  estoque: boolean
  faturamento: boolean
  multiempresa: boolean
  multiusuario: boolean
  dashboardAvancado: boolean
  relatoriosPremium: boolean
  controleMesas: boolean
  impressaoTermica: boolean
  backupAutomatico: boolean
  nfceFatura: boolean
  integracaoBancaria: boolean
  gestaoFuncionarios: boolean
}

export const MODULOS_LABELS: Record<keyof ModulosAtivos, string> = {
  pdv: 'PDV',
  restaurante: 'Restaurante',
  delivery: 'Delivery',
  comandas: 'Comandas',
  agendamentos: 'Agendamentos',
  whatsapp: 'WhatsApp',
  financeiro: 'Financeiro',
  estoque: 'Estoque',
  faturamento: 'Faturamento',
  multiempresa: 'Multiempresa',
  multiusuario: 'Multiusuário',
  dashboardAvancado: 'Dashboard Avançado',
  relatoriosPremium: 'Relatórios Premium',
  controleMesas: 'Controle de Mesas',
  impressaoTermica: 'Impressão Térmica',
  backupAutomatico: 'Backup Automático',
  nfceFatura: 'NFC-e/Fatura',
  integracaoBancaria: 'Integração Bancária',
  gestaoFuncionarios: 'Gestão de Funcionários',
}

export const IMPRESSORA_FUNCOES_LABELS: Record<ImpressoraFuncao, string> = {
  pdv: 'PDV / Cupom',
  cozinha: 'Cozinha',
  bar: 'Bar',
  copa: 'Copa',
  entrega: 'Entrega / Delivery',
  comanda: 'Comanda',
  fatura: 'Fatura Fiscal',
  relatorio: 'Relatórios',
  etiqueta: 'Etiquetas',
}

export const AREAS_PREPARO_PADRAO: Omit<AreaPreparo, 'id'>[] = [
  { nome: 'Cozinha', descricao: 'Área de preparo de pratos quentes', impressoraId: null, ativo: true },
  { nome: 'Bar', descricao: 'Área de preparo de bebidas', impressoraId: null, ativo: true },
  { nome: 'Copa', descricao: 'Área de preparo de sobremesas e lanches', impressoraId: null, ativo: true },
  { nome: 'Churrasqueira', descricao: 'Área de preparo de carnes grelhadas', impressoraId: null, ativo: true },
  { nome: 'Pizzaria', descricao: 'Área de preparo de pizzas', impressoraId: null, ativo: true },
]

export const UNIDADES_MEDIDA = [
  { value: 'un', label: 'Unidade' },
  { value: 'cx', label: 'Caixa' },
  { value: 'pc', label: 'Pacote' },
  { value: 'kg', label: 'Quilo' },
  { value: 'g', label: 'Grama' },
  { value: 'l', label: 'Litro' },
  { value: 'ml', label: 'Mililitro' },
  { value: 'm', label: 'Metro' },
  { value: 'm2', label: 'Metro Quadrado' },
  { value: 'm3', label: 'Metro Cúbico' },
]
