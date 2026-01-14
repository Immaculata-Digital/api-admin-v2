export interface ConfiguracaoGlobalProps {
  id_config_global?: number
  logo_base64?: string | null
  cor_fundo?: string | null
  cor_card?: string | null
  cor_texto_card?: string | null
  cor_valor_card?: string | null
  cor_botao?: string | null
  cor_texto_botao?: string | null
  fonte_titulos?: string | null
  fonte_textos?: string | null
  dt_cadastro?: Date
  usu_cadastro: string | null
  dt_altera?: Date | null
  usu_altera?: string | null
}

export type CreateConfiguracaoGlobalProps = Omit<
  ConfiguracaoGlobalProps,
  'id_config_global' | 'dt_cadastro' | 'dt_altera'
>

export type UpdateConfiguracaoGlobalProps = {
  logo_base64?: string | null
  cor_fundo?: string | null
  cor_card?: string | null
  cor_texto_card?: string | null
  cor_valor_card?: string | null
  cor_botao?: string | null
  cor_texto_botao?: string | null
  fonte_titulos?: string | null
  fonte_textos?: string | null
  usu_altera?: string | null
}

export class ConfiguracaoGlobal {
  private constructor(private props: ConfiguracaoGlobalProps) {}

  static create(data: CreateConfiguracaoGlobalProps) {
    const timestamp = new Date()
    return new ConfiguracaoGlobal({
      ...data,
      dt_cadastro: timestamp,
      dt_altera: null,
      usu_altera: null,
    })
  }

  static restore(props: ConfiguracaoGlobalProps) {
    return new ConfiguracaoGlobal(props)
  }

  update(data: UpdateConfiguracaoGlobalProps) {
    const nextProps: ConfiguracaoGlobalProps = { ...this.props }

    if (typeof data.logo_base64 !== 'undefined') {
      nextProps.logo_base64 = data.logo_base64
    }
    if (typeof data.cor_fundo !== 'undefined') {
      nextProps.cor_fundo = data.cor_fundo
    }
    if (typeof data.cor_card !== 'undefined') {
      nextProps.cor_card = data.cor_card
    }
    if (typeof data.cor_texto_card !== 'undefined') {
      nextProps.cor_texto_card = data.cor_texto_card
    }
    if (typeof data.cor_valor_card !== 'undefined') {
      nextProps.cor_valor_card = data.cor_valor_card
    }
    if (typeof data.cor_botao !== 'undefined') {
      nextProps.cor_botao = data.cor_botao
    }
    if (typeof data.cor_texto_botao !== 'undefined') {
      nextProps.cor_texto_botao = data.cor_texto_botao
    }
    if (typeof data.fonte_titulos !== 'undefined') {
      nextProps.fonte_titulos = data.fonte_titulos
    }
    if (typeof data.fonte_textos !== 'undefined') {
      nextProps.fonte_textos = data.fonte_textos
    }

    nextProps.usu_altera = data.usu_altera ?? null
    nextProps.dt_altera = new Date()

    this.props = nextProps
  }

  toJSON(): ConfiguracaoGlobalProps {
    return { ...this.props }
  }

  get id() {
    return this.props.id_config_global
  }
}

