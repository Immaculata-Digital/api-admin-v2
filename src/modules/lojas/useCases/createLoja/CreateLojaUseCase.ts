import { AppError } from '../../../../core/errors/AppError'
import type { ILojaRepository } from '../../repositories/ILojaRepository'
import type { CreateLojaDTO } from '../../dto/CreateLojaDTO'
import { Loja } from '../../entities/Loja'
import axios from 'axios'

export class CreateLojaUseCase {
  constructor(private readonly lojaRepository: ILojaRepository) { }

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

    // Buscar lat/long pelo endereço
    let latitude: number | null = null
    let longitude: number | null = null
    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.endereco_completo)}&limit=1`
      const geoResponse = await axios.get(geoUrl, {
        headers: { 'User-Agent': 'Concordia/1.0' }
      })
      if (geoResponse.data && geoResponse.data.length > 0) {
        latitude = Number(geoResponse.data[0].lat)
        longitude = Number(geoResponse.data[0].lon)
      }
    } catch (error: any) {
      console.warn(`[CreateLojaUseCase] Erro ao buscar geolocalização: ${error.message}`)
    }

    const loja = Loja.create({
      nome_loja: data.nome_loja,
      ...(data.nome_loja_publico ? { nome_loja_publico: data.nome_loja_publico } : {}),
      numero_identificador: data.numero_identificador,
      nome_responsavel: data.nome_responsavel,
      telefone_responsavel: data.telefone_responsavel ?? '',
      cnpj: data.cnpj,
      endereco_completo: data.endereco_completo,
      latitude,
      longitude,
      usu_cadastro: data.usu_cadastro ?? null,
    })

    return await this.lojaRepository.create(schema, loja.toJSON())
  }
}

