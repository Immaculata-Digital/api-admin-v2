export interface WebRadioProps {
  id_webradio?: number
  nome_audio: string
  arquivo_audio_base64?: string | null
  duracao_segundos?: number | null
  ordem: number
  dt_cadastro?: Date
  usu_cadastro: number
  dt_altera?: Date | null
  usu_altera?: number | null
}

export type CreateWebRadioProps = Omit<WebRadioProps, 'id_webradio' | 'dt_cadastro' | 'dt_altera' | 'duracao_segundos'> & {
  duracao_segundos?: number | null
}

export type UpdateWebRadioProps = {
  nome_audio?: string
  arquivo_audio_base64?: string | null
  duracao_segundos?: number | null
  ordem?: number
  usu_altera?: number | null
}

export class WebRadio {
  private constructor(private props: WebRadioProps) {}

  static create(data: CreateWebRadioProps) {
    const timestamp = new Date()
    return new WebRadio({
      ...data,
      ordem: data.ordem ?? 1,
      dt_cadastro: timestamp,
      dt_altera: null,
      usu_altera: null,
    })
  }

  static restore(props: WebRadioProps) {
    return new WebRadio(props)
  }

  update(data: UpdateWebRadioProps) {
    const nextProps: WebRadioProps = { ...this.props }

    if (typeof data.nome_audio !== 'undefined') {
      nextProps.nome_audio = data.nome_audio
    }
    if (typeof data.arquivo_audio_base64 !== 'undefined') {
      nextProps.arquivo_audio_base64 = data.arquivo_audio_base64
    }
    if (typeof data.duracao_segundos !== 'undefined') {
      nextProps.duracao_segundos = data.duracao_segundos
    }
    if (typeof data.ordem !== 'undefined') {
      nextProps.ordem = data.ordem
    }

    nextProps.usu_altera = data.usu_altera ?? null
    nextProps.dt_altera = new Date()

    this.props = nextProps
  }

  toJSON(): WebRadioProps {
    return { ...this.props }
  }

  get id() {
    return this.props.id_webradio
  }
}

