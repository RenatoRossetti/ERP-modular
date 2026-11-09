export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      emitente: {
        Row: {
          id: string
          ruc: string
          razao_social: string
          nome_fantasia: string | null
          logo: string | null
          endereco_rua: string | null
          endereco_numero: string | null
          endereco_bairro: string | null
          endereco_cidade: string | null
          endereco_departamento: string | null
          endereco_pais: string | null
          endereco_cep: string | null
          area_atuacao: string | null
          telefone: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['emitente']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['emitente']['Insert']>
      }
      modulos_config: {
        Row: {
          id: string
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
          dashboard_avancado: boolean
          relatorios_premium: boolean
          controle_mesas: boolean
          impressao_termica: boolean
          backup_automatico: boolean
          nfce_fatura: boolean
          integracao_bancaria: boolean
          gestao_funcionarios: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['modulos_config']['Row']>
        Update: Partial<Database['public']['Tables']['modulos_config']['Row']>
      }
      impressoras: {
        Row: {
          id: string
          nome: string
          tipo: 'termica' | 'a4' | 'fiscal'
          conexao: 'usb' | 'rede' | 'bluetooth'
          ip: string | null
          porta: number | null
          funcoes: string[]
          area_preparo_id: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['impressoras']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['impressoras']['Insert']>
      }
      areas_preparo: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          impressora_id: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['areas_preparo']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['areas_preparo']['Insert']>
      }
      categorias: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          cor: string | null
          ativo: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['categorias']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['categorias']['Insert']>
      }
      produtos: {
        Row: {
          id: string
          codigo_interno: string | null
          codigo_barras: string | null
          nome: string
          descricao: string | null
          categoria_id: string | null
          marca: string | null
          unidade_medida: string
          preco_custo: number
          preco_venda: number
          margem_lucro: number
          iva: number
          moeda: 'PYG' | 'BRL' | 'USD'
          estoque_atual: number
          estoque_minimo: number
          localizacao_estoque: string | null
          imagem: string | null
          area_preparo_id: string | null
          imprimir_na_producao: boolean
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['produtos']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['produtos']['Insert']>
      }
      clientes: {
        Row: {
          id: string
          ruc: string | null
          nome: string
          telefone: string | null
          email: string | null
          endereco: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['clientes']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['clientes']['Insert']>
      }
      mesas: {
        Row: {
          id: string
          numero: number
          nome: string | null
          capacidade: number
          status: 'livre' | 'ocupada' | 'reservada' | 'conta'
          posicao_x: number
          posicao_y: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['mesas']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['mesas']['Insert']>
      }
      mesa_itens: {
        Row: {
          id: string
          mesa_id: string
          produto_id: string
          quantidade: number
          preco_unitario: number
          desconto: number
          observacao: string | null
          status: 'pendente' | 'preparando' | 'pronto' | 'entregue' | 'pago'
          impresso: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['mesa_itens']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['mesa_itens']['Insert']>
      }
      vendas: {
        Row: {
          id: string
          numero_venda: number
          tipo: 'pdv' | 'mesa' | 'delivery'
          mesa_id: string | null
          cliente_id: string | null
          cliente_nome: string | null
          cliente_ruc: string | null
          subtotal: number
          desconto: number
          total: number
          iva_5: number
          iva_10: number
          forma_pagamento: string
          valor_recebido: number
          troco: number
          tipo_documento: 'ticket' | 'fatura'
          numero_fatura: string | null
          status: 'pendente' | 'finalizada' | 'cancelada'
          observacao: string | null
          cotacao_brl: number | null
          cotacao_usd: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['vendas']['Row'], 'id' | 'numero_venda' | 'created_at' | 'updated_at'> & {
          id?: string
          numero_venda?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['vendas']['Insert']>
      }
      venda_itens: {
        Row: {
          id: string
          venda_id: string
          produto_id: string
          produto_nome: string
          quantidade: number
          preco_unitario: number
          desconto: number
          total: number
          iva: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['venda_itens']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['venda_itens']['Insert']>
      }
    }
  }
}

export type Emitente = Database['public']['Tables']['emitente']['Row']
export type ModulosConfig = Database['public']['Tables']['modulos_config']['Row']
export type Impressora = Database['public']['Tables']['impressoras']['Row']
export type AreaPreparo = Database['public']['Tables']['areas_preparo']['Row']
export type Categoria = Database['public']['Tables']['categorias']['Row']
export type Produto = Database['public']['Tables']['produtos']['Row']
export type Cliente = Database['public']['Tables']['clientes']['Row']
export type Mesa = Database['public']['Tables']['mesas']['Row']
export type MesaItem = Database['public']['Tables']['mesa_itens']['Row']
export type Venda = Database['public']['Tables']['vendas']['Row']
export type VendaItem = Database['public']['Tables']['venda_itens']['Row']

// Extended types with relations
export type MesaItemWithProduto = MesaItem & {
  produtos?: Produto | null
}

export type VendaItemWithProduto = VendaItem & {
  produtos?: Produto | null
}
