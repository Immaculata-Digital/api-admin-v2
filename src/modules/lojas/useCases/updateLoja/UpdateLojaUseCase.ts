import { AppError } from '../../../../core/errors/AppError'
import type { ILojaRepository } from '../../repositories/ILojaRepository'
import type { UpdateLojaDTO } from '../../dto/UpdateLojaDTO'
import { Loja } from '../../entities/Loja'

export class UpdateLojaUseCase {
  constructor(private readonly lojaRepository: ILojaRepository) {}

  async execute(schema: string, id: number, data: UpdateLojaDTO) {
    const existing = await this.lojaRepository.findById(schema, id)
    if (!existing) {
      throw new AppError('Loja não encontrada', 404)
    }

    // Verificar unicidade se alterando campos únicos
    if (data.numero_identificador || data.cnpj) {
      const fieldsToCheck: { numero_identificador?: string; cnpj?: string } = {}
      if (data.numero_identificador) fieldsToCheck.numero_identificador = data.numero_identificador
      if (data.cnpj) fieldsToCheck.cnpj = data.cnpj

      const conflicting = await this.lojaRepository.findByUniqueFields(schema, fieldsToCheck, id)
      if (conflicting) {
        if (data.numero_identificador && conflicting.numero_identificador === data.numero_identificador) {
          throw new AppError('Já existe outra loja com este número identificador', 409)
        }
        if (data.cnpj && conflicting.cnpj === data.cnpj) {
          throw new AppError('Já existe outra loja com este CNPJ', 409)
        }
      }
    }

    const loja = Loja.restore(existing)
    loja.update({
      nome_loja: data.nome_loja,
      numero_identificador: data.numero_identificador,
      nome_responsavel: data.nome_responsavel,
      telefone_responsavel: data.telefone_responsavel,
      cnpj: data.cnpj,
      endereco_completo: data.endereco_completo,
      usu_altera: data.usu_altera ?? null,
    })

    const updated = await this.lojaRepository.update(schema, id, loja.toJSON())
    return updated || existing
  }
}
