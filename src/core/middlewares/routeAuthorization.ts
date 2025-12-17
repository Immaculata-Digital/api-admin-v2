import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError'

/**
 * Verifica se uma rota é pública
 * Nota: O path que chega aqui já tem o prefixo /api removido (porque o middleware é aplicado em /api)
 * Então /api/casona/lojas/1 chega como /casona/lojas/1
 */
const isPublicRoute = (path: string): boolean => {
  // Remove query string e normaliza o path
  const pathWithoutQuery = path.split('?')[0]
  if (!pathWithoutQuery) return false
  
  const normalizedPath = pathWithoutQuery.startsWith('/') ? pathWithoutQuery : `/${pathWithoutQuery}`
  if (!normalizedPath) return false
  
  // Rotas exatas públicas
  const exactPublicRoutes = [
    '/health',
    '/docs',
  ]
  
  if (exactPublicRoutes.some((publicRoute) => normalizedPath === publicRoute || normalizedPath.startsWith(publicRoute))) {
    return true
  }
  
  // Verifica rotas com padrões dinâmicos (com schema no path)
  // Como o /api já foi removido, os padrões não precisam incluir /api
  // Ex: /casona/configuracoes-globais, /casona/itens-recompensa, etc.
  const publicPatterns = [
    /^\/[^/]+\/configuracoes-globais/,  // /casona/configuracoes-globais
    /^\/clientes-concordia\/schema\/[^/]+/,  // /clientes-concordia/schema/casona
    /^\/[^/]+\/itens-recompensa/,  // /casona/itens-recompensa
    /^\/[^/]+\/lojas\/\d+/,  // /casona/lojas/1
  ]
  
  return publicPatterns.some((pattern) => pattern.test(normalizedPath))
}

/**
 * Middleware de autorização simplificado para api-admin-v2
 * Apenas verifica se o usuário está autenticado
 * A autorização baseada em features é gerenciada pela api-usuarios-v2
 */
export const routeAuthorization = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Se for uma rota pública, permite o acesso sem verificação
    if (isPublicRoute(req.path)) {
      return next()
    }

    // Se não houver usuário autenticado, retorna erro
    // (o middleware authenticate deve ser aplicado antes deste)
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401)
    }

    // Para api-admin-v2, apenas verifica se está autenticado
    // A autorização baseada em features é feita na api-usuarios-v2
    // Se necessário, pode-se adicionar verificação de permissões específicas aqui
    next()
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ status: 'error', message: error.message })
    }
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao verificar autorização da rota',
    })
  }
}

