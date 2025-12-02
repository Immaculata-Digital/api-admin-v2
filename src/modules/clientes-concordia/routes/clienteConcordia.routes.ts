import { Router } from 'express'
import { clienteConcordiaController } from '../controllers/ClienteConcordiaController'

export const clienteConcordiaRoutes = Router()

// Rotas globais (sem schema)
clienteConcordiaRoutes.get('/clientes-concordia', clienteConcordiaController.index)
clienteConcordiaRoutes.get('/clientes-concordia/schema/:schema', clienteConcordiaController.getBySchema)
clienteConcordiaRoutes.get('/clientes-concordia/:id', clienteConcordiaController.show)
clienteConcordiaRoutes.post('/clientes-concordia', clienteConcordiaController.store)
clienteConcordiaRoutes.put('/clientes-concordia/:id', clienteConcordiaController.update)
clienteConcordiaRoutes.delete('/clientes-concordia/:id', clienteConcordiaController.destroy)

