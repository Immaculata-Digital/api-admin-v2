export interface ClienteConcordiaProps {
  id_cliente_concordia?: number
  nome: string
  email: string
  whatsapp: string
  schema: string
  ativo: boolean
  dt_cadastro?: Date
  usu_cadastro: number
  dt_altera?: Date | null
  usu_altera?: number | null
}

export type CreateClienteConcordiaProps = Omit<ClienteConcordiaProps, 'id_cliente_concordia' | 'dt_cadastro' | 'dt_altera' | 'ativo'> & {
  ativo?: boolean
}

export type UpdateClienteConcordiaProps = {
  nome?: string
  email?: string
  whatsapp?: string
  schema?: string
  ativo?: boolean
  usu_altera?: number | null
}

export class ClienteConcordia {
  private constructor(private props: ClienteConcordiaProps) {}

  static create(data: CreateClienteConcordiaProps) {
    const timestamp = new Date()
    return new ClienteConcordia({
      ...data,
      ativo: data.ativo ?? true,
      dt_cadastro: timestamp,
      dt_altera: null,
      usu_altera: null,
    })
  }

  static restore(props: ClienteConcordiaProps) {
    return new ClienteConcordia(props)
  }

  update(data: UpdateClienteConcordiaProps) {
    const nextProps: ClienteConcordiaProps = { ...this.props }

    if (typeof data.nome !== 'undefined') {
      nextProps.nome = data.nome
    }
    if (typeof data.email !== 'undefined') {
      nextProps.email = data.email
    }
    if (typeof data.whatsapp !== 'undefined') {
      nextProps.whatsapp = data.whatsapp
    }
    if (typeof data.schema !== 'undefined') {
      nextProps.schema = data.schema
    }
    if (typeof data.ativo !== 'undefined') {
      nextProps.ativo = data.ativo
    }

    nextProps.usu_altera = data.usu_altera ?? null
    nextProps.dt_altera = new Date()

    this.props = nextProps
  }

  toJSON(): ClienteConcordiaProps {
    return { ...this.props }
  }

  get id() {
    return this.props.id_cliente_concordia
  }
}

