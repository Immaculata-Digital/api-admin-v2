import { Router } from 'express'
import { comboController } from '../controllers/ComboController'

export const comboRoutes = Router()

// Rotas globais (sem schema)
comboRoutes.get('/combos', comboController.index)
comboRoutes.get('/combos/:id', comboController.show)
comboRoutes.get('/combos/chave/:chave/valores', comboController.getValues)
comboRoutes.post('/combos', comboController.store)
comboRoutes.put('/combos/:id', comboController.update)
comboRoutes.delete('/combos/:id', comboController.destroy)

