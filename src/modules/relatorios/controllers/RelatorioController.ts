import type { Request, Response } from 'express'
import { PostgresRelatorioRepository } from '../repositories/PostgresRelatorioRepository'
import { RelatorioUseCase } from '../useCases/RelatorioUseCase'

const relatorioRepository = new PostgresRelatorioRepository()
const relatorioUseCase = new RelatorioUseCase(relatorioRepository)

export class RelatorioController {
    async historicoFidelidade(req: Request, res: Response) {
        try {
            const { schema } = req.params
            const { dataInicial, dataFinal, id_loja } = req.query

            const filtros = {
                dataInicial: dataInicial as string | undefined,
                dataFinal: dataFinal as string | undefined,
                id_loja: id_loja ? parseInt(id_loja as string, 10) : undefined
            }

            const relatorio = await relatorioUseCase.getHistoricoFidelidade(schema as string, filtros)

            return res.status(200).json(relatorio)
        } catch (error) {
            console.error(error)
            return res.status(500).json({
                message: 'Erro interno ao gerar o relatório historico-compras',
                details: error instanceof Error ? error.message : undefined
            })
        }
    }
}

export const relatorioController = new RelatorioController()
