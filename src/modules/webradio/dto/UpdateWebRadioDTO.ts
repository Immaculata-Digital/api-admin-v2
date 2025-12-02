export interface UpdateWebRadioDTO {
  nome_audio?: string
  arquivo_audio_base64?: string | null
  duracao_segundos?: number | null
  ordem?: number
  usu_altera?: number | null
}

