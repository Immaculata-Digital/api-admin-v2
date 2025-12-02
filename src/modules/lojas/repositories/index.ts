import { PostgresLojaRepository } from './PostgresLojaRepository'

export const lojaRepository = new PostgresLojaRepository()
export type { ILojaRepository } from './ILojaRepository'

