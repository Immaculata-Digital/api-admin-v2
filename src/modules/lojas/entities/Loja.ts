export interface LojaProps {
  id_loja?: number
  nome_loja: string
  nome_loja_publico?: string
  numero_identificador: string
  nome_responsavel: string
  telefone_responsavel: string
  cnpj: string
  endereco_completo: string
  dt_cadastro?: Date
  usu_cadastro: string | null
  dt_altera?: Date | null
  usu_altera?: string | null
}

export type CreateLojaProps = Omit<LojaProps, 'id_loja' | 'dt_cadastro' | 'dt_altera'>

export type UpdateLojaProps = {
  nome_loja?: string
  nome_loja_publico?: string
  numero_identificador?: string
  nome_responsavel?: string
  telefone_responsavel?: string
  cnpj?: string
  endereco_completo?: string
  usu_altera?: string | null
}

export class Loja {
  private constructor(private props: LojaProps) { }

  static create(data: CreateLojaProps) {
    const timestamp = new Date()
    return new Loja({
      ...data,
      dt_cadastro: timestamp,
      dt_altera: null,
      usu_altera: null,
    })
  }

  static restore(props: LojaProps) {
    return new Loja(props)
  }

  update(data: UpdateLojaProps) {
    const nextProps: LojaProps = { ...this.props }

    if (typeof data.nome_loja !== 'undefined') {
      nextProps.nome_loja = data.nome_loja
    }
    if (typeof data.nome_loja_publico !== 'undefined') {
      nextProps.nome_loja_publico = data.nome_loja_publico
    }
    if (typeof data.numero_identificador !== 'undefined') {
      nextProps.numero_identificador = data.numero_identificador
    }
    if (typeof data.nome_responsavel !== 'undefined') {
      nextProps.nome_responsavel = data.nome_responsavel
    }
    if (typeof data.telefone_responsavel !== 'undefined') {
      nextProps.telefone_responsavel = data.telefone_responsavel
    }
    if (typeof data.cnpj !== 'undefined') {
      nextProps.cnpj = data.cnpj
    }
    if (typeof data.endereco_completo !== 'undefined') {
      nextProps.endereco_completo = data.endereco_completo
    }

    nextProps.usu_altera = data.usu_altera ?? null
    nextProps.dt_altera = new Date()

    this.props = nextProps
  }

  toJSON(): LojaProps {
    return { ...this.props }
  }

  get id() {
    return this.props.id_loja
  }
}

