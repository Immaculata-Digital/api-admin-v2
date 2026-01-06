import { Router } from 'express'
import { configuracaoGlobalRoutes } from '../modules/configuracoes-globais/routes/configuracaoGlobal.routes'
import { lojaRoutes } from '../modules/lojas/routes/loja.routes'
import { comboRoutes } from '../modules/combos/routes/combo.routes'
import { itemRecompensaRoutes } from '../modules/itens-recompensa/routes/itemRecompensa.routes'
import { webRadioRoutes } from '../modules/webradio/routes/webRadio.routes'
import { logSistemaRoutes } from '../modules/logs-sistema/routes/logSistema.routes'
import { dashboardRoutes } from '../modules/dashboard/routes/dashboard.routes'
import { schemaRoutes } from '../modules/schema/routes/schema.routes'

const router = Router()

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Admin v2 está funcionando' })
})

// Rotas dos módulos
router.use(configuracaoGlobalRoutes)
router.use(lojaRoutes)
router.use(comboRoutes)
router.use(itemRecompensaRoutes)
router.use(webRadioRoutes)
router.use(logSistemaRoutes)
router.use(dashboardRoutes)
router.use(schemaRoutes)

export { router as routes }

