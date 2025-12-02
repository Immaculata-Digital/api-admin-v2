export interface ConfiguracaoGlobalProps {
  id_config_global?: number
  logo_base64?: string | null
  cor_primaria?: string | null
  cor_secundaria?: string | null
  cor_texto?: string | null
  cor_destaque_texto?: string | null
  fonte_titulos?: string | null
  fonte_textos?: string | null
  dt_cadastro?: Date
  usu_cadastro: number
  dt_altera?: Date | null
  usu_altera?: number | null
}

export type CreateConfiguracaoGlobalProps = Omit<
  ConfiguracaoGlobalProps,
  'id_config_global' | 'dt_cadastro' | 'dt_altera'
>

export type UpdateConfiguracaoGlobalProps = {
  logo_base64?: string | null
  cor_primaria?: string | null
  cor_secundaria?: string | null
  cor_texto?: string | null
  cor_destaque_texto?: string | null
  fonte_titulos?: string | null
  fonte_textos?: string | null
  usu_altera?: number | null
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
    if (typeof data.cor_primaria !== 'undefined') {
      nextProps.cor_primaria = data.cor_primaria
    }
    if (typeof data.cor_secundaria !== 'undefined') {
      nextProps.cor_secundaria = data.cor_secundaria
    }
    if (typeof data.cor_texto !== 'undefined') {
      nextProps.cor_texto = data.cor_texto
    }
    if (typeof data.cor_destaque_texto !== 'undefined') {
      nextProps.cor_destaque_texto = data.cor_destaque_texto
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

