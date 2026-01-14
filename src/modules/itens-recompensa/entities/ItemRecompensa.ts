export interface ItemRecompensaProps {
  id_item_recompensa?: number
  nome_item: string
  descricao: string
  quantidade_pontos: number
  imagem_item?: string | null
  nao_retirar_loja: boolean
  dt_cadastro?: Date
  usu_cadastro: string | null
  dt_altera?: Date | null
  usu_altera?: string | null
}

export type CreateItemRecompensaProps = Omit<ItemRecompensaProps, 'id_item_recompensa' | 'dt_cadastro' | 'dt_altera' | 'nao_retirar_loja'> & {
  nao_retirar_loja?: boolean
}

export type UpdateItemRecompensaProps = {
  nome_item?: string
  descricao?: string
  quantidade_pontos?: number
  imagem_item?: string | null
  nao_retirar_loja?: boolean
  usu_altera?: string | null
}

export class ItemRecompensa {
  private constructor(private props: ItemRecompensaProps) {}

  static create(data: CreateItemRecompensaProps) {
    const timestamp = new Date()
    return new ItemRecompensa({
      ...data,
      nao_retirar_loja: data.nao_retirar_loja ?? false,
      dt_cadastro: timestamp,
      dt_altera: null,
      usu_altera: null,
    })
  }

  static restore(props: ItemRecompensaProps) {
    return new ItemRecompensa(props)
  }

  update(data: UpdateItemRecompensaProps) {
    const nextProps: ItemRecompensaProps = { ...this.props }

    if (typeof data.nome_item !== 'undefined') {
      nextProps.nome_item = data.nome_item
    }
    if (typeof data.descricao !== 'undefined') {
      nextProps.descricao = data.descricao
    }
    if (typeof data.quantidade_pontos !== 'undefined') {
      nextProps.quantidade_pontos = data.quantidade_pontos
    }
    if (typeof data.imagem_item !== 'undefined') {
      nextProps.imagem_item = data.imagem_item
    }
    if (typeof data.nao_retirar_loja !== 'undefined') {
      nextProps.nao_retirar_loja = data.nao_retirar_loja
    }

    nextProps.usu_altera = data.usu_altera ?? null
    nextProps.dt_altera = new Date()

    this.props = nextProps
  }

  toJSON(): ItemRecompensaProps {
    return { ...this.props }
  }

  get id() {
    return this.props.id_item_recompensa
  }
}

