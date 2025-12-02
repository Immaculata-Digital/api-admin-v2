import { AppError } from '../../../../core/errors/AppError'
import type { ILojaRepository } from '../../repositories/ILojaRepository'
import type { CreateLojaDTO } from '../../dto/CreateLojaDTO'
import { Loja } from '../../entities/Loja'

export class CreateLojaUseCase {
  constructor(private readonly lojaRepository: ILojaRepository) {}

  async execute(schema: string, data: CreateLojaDTO) {
    // Verificar unicidade
    const existing = await this.lojaRepository.findByUniqueFields(schema, {
      numero_identificador: data.numero_identificador,
      cnpj: data.cnpj,
    })

    if (existing) {
      if (existing.numero_identificador === data.numero_identificador) {
        throw new AppError('Já existe uma loja com este número identificador', 409)
      }
      if (existing.cnpj === data.cnpj) {
        throw new AppError('Já existe uma loja com este CNPJ', 409)
      }
    }

    const loja = Loja.create({
      nome_loja: data.nome_loja,
      numero_identificador: data.numero_identificador,
      nome_responsavel: data.nome_responsavel,
      telefone_responsavel: data.telefone_responsavel,
      cnpj: data.cnpj,
      endereco_completo: data.endereco_completo,
      usu_cadastro: data.usu_cadastro ?? 0,
    })

    return await this.lojaRepository.create(schema, loja.toJSON())
  }
}

