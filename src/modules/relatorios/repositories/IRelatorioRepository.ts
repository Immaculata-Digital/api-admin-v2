export interface HistoricoFidelidadeFiltro {
    dataInicial?: string | undefined
    dataFinal?: string | undefined
    id_loja?: number | undefined
}

export interface HistoricoFidelidadeRow {
    cliente_concordia: string
    cliente_nome: string
    email: string
    whatsapp: string
    Data: string
    Operação: string
    Pontos: number
    Saldo: number
    Origem: string
    Loja: string
    "Item Resgatado": string
    Observação: string
}

export interface IRelatorioRepository {
    getHistoricoFidelidade(schema: string, filtros: HistoricoFidelidadeFiltro): Promise<HistoricoFidelidadeRow[]>
}
