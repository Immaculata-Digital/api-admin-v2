import type { IRelatorioRepository, HistoricoFidelidadeFiltro } from '../repositories/IRelatorioRepository'

export class RelatorioUseCase {
    constructor(private relatorioRepository: IRelatorioRepository) { }

    async getHistoricoFidelidade(schema: string, filtros: HistoricoFidelidadeFiltro) {
        if (!schema) {
            throw new Error('Schema is required')
        }

        const data = await this.relatorioRepository.getHistoricoFidelidade(schema, filtros)
        return data
    }
}
