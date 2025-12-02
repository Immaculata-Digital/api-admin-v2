export interface LogSistemaProps {
  id_log?: number
  dt_log?: Date
  nivel: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
  operacao: string
  tabela?: string | null
  id_registro?: number | null
  usuario_id?: number | null
  mensagem: string
  dados_antes?: object | null
  dados_depois?: object | null
  ip_origem?: string | null
  user_agent?: string | null
  dados_extras?: object | null
}

export type CreateLogSistemaProps = Omit<LogSistemaProps, 'id_log' | 'dt_log'>

export class LogSistema {
  private constructor(private props: LogSistemaProps) {}

  static create(data: CreateLogSistemaProps) {
    const timestamp = new Date()
    return new LogSistema({
      ...data,
      dt_log: timestamp,
    })
  }

  static restore(props: LogSistemaProps) {
    return new LogSistema(props)
  }

  toJSON(): LogSistemaProps {
    return { ...this.props }
  }

  get id() {
    return this.props.id_log
  }
}

