
import type { ILojaRepository } from '../../repositories/ILojaRepository'

export class UpdateLojaResponsaveisUseCase {
    constructor(private lojaRepository: ILojaRepository) { }

    async execute(schema: string, idLoja: number, userIds: string[]): Promise<void> {
        const loja = await this.lojaRepository.findById(schema, idLoja)
        if (!loja) {
            throw new Error('Loja não encontrada')
        }
        await this.lojaRepository.syncResponsaveis(schema, idLoja, userIds)
    }
}
