export interface ComboProps {
  id_combo?: number
  descricao: string
  chave: string
  script: string
  dt_cadastro?: Date
  usu_cadastro: string | null
  dt_altera?: Date | null
  usu_altera?: string | null
}

export type CreateComboProps = Omit<ComboProps, 'id_combo' | 'dt_cadastro' | 'dt_altera'>

export type UpdateComboProps = {
  descricao?: string
  chave?: string
  script?: string
  usu_altera?: string | null
}

export class Combo {
  private constructor(private props: ComboProps) {}

  static create(data: CreateComboProps) {
    const timestamp = new Date()
    return new Combo({
      ...data,
      dt_cadastro: timestamp,
      dt_altera: null,
      usu_altera: null,
    })
  }

  static restore(props: ComboProps) {
    return new Combo(props)
  }

  update(data: UpdateComboProps) {
    const nextProps: ComboProps = { ...this.props }

    if (typeof data.descricao !== 'undefined') {
      nextProps.descricao = data.descricao
    }
    if (typeof data.chave !== 'undefined') {
      nextProps.chave = data.chave
    }
    if (typeof data.script !== 'undefined') {
      nextProps.script = data.script
    }

    nextProps.usu_altera = data.usu_altera ?? null
    nextProps.dt_altera = new Date()

    this.props = nextProps
  }

  toJSON(): ComboProps {
    return { ...this.props }
  }

  get id() {
    return this.props.id_combo
  }
}

