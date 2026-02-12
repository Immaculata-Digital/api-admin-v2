
import type { ILojaRepository } from '../../repositories/ILojaRepository'

export class GetLojaResponsaveisUseCase {
    constructor(private lojaRepository: ILojaRepository) { }

    async execute(schema: string, idLoja: number): Promise<string[]> {
        const loja = await this.lojaRepository.findById(schema, idLoja)
        if (!loja) {
            throw new Error('Loja não encontrada')
        }
        return this.lojaRepository.findResponsaveis(schema, idLoja)
    }
}
