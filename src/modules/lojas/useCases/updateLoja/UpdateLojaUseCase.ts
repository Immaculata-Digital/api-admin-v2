import { AppError } from '../../../../core/errors/AppError'
import type { ILojaRepository } from '../../repositories/ILojaRepository'
import type { UpdateLojaDTO } from '../../dto/UpdateLojaDTO'
import { Loja } from '../../entities/Loja'

export class UpdateLojaUseCase {
  constructor(private readonly lojaRepository: ILojaRepository) { }

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
    const updateData: UpdateLojaDTO = {
      usu_altera: data.usu_altera ?? null,
    }
    if (data.nome_loja !== undefined) updateData.nome_loja = data.nome_loja
    if (data.nome_loja_publico !== undefined) updateData.nome_loja_publico = data.nome_loja_publico
    if (data.numero_identificador !== undefined) updateData.numero_identificador = data.numero_identificador
    if (data.nome_responsavel !== undefined) updateData.nome_responsavel = data.nome_responsavel
    if (data.telefone_responsavel !== undefined) updateData.telefone_responsavel = data.telefone_responsavel
    if (data.cnpj !== undefined) updateData.cnpj = data.cnpj
    if (data.endereco_completo !== undefined) updateData.endereco_completo = data.endereco_completo
    loja.update(updateData)

    const updated = await this.lojaRepository.update(schema, id, loja.toJSON())
    return updated || existing
  }
}
