import type { WebRadioProps } from '../entities/WebRadio'

export interface IWebRadioRepository {
  findAll(schema: string, filters: { limit: number; offset: number; search?: string }): Promise<{ rows: WebRadioProps[]; count: number }>
  findById(schema: string, id: number): Promise<WebRadioProps | null>
  findNextByOrder(schema: string, currentAudioId: number): Promise<WebRadioProps | null>
  create(schema: string, data: Omit<WebRadioProps, 'id_webradio' | 'dt_cadastro' | 'dt_altera'>): Promise<WebRadioProps>
  update(schema: string, id: number, data: Partial<WebRadioProps>): Promise<WebRadioProps | null>
  delete(schema: string, id: number): Promise<boolean>
  reorder(schema: string, ids: number[]): Promise<void>
}

