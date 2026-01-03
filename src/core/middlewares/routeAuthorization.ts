import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError'

/**
 * Verifica se uma rota é pública
 * Nota: O path que chega aqui pode ter o prefixo /api (req.path não remove automaticamente)
 * Então /api/casona/lojas/1 pode chegar como /api/casona/lojas/1
 * Precisamos remover o /api manualmente se presente
 */
const isPublicRoute = (path: string): boolean => {
  // Remove query string e normaliza o path
  const pathWithoutQuery = path.split('?')[0]
  if (!pathWithoutQuery) return false
  
  // Remove o prefixo /api se presente (já que o middleware é aplicado em /api)
  // req.path pode vir como /thiago/itens-recompensa (sem /api) quando aplicado em /api
  let normalizedPath = pathWithoutQuery.startsWith('/api') 
    ? pathWithoutQuery.replace(/^\/api/, '') 
    : pathWithoutQuery
  
  normalizedPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
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
    /^\/[^/]+\/itens-recompensa/,  // /casona/itens-recompensa ou /thiago/itens-recompensa
    /^\/[^/]+\/lojas/,  // /casona/lojas (listagem) ou /casona/lojas/1 (com ID)
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
    // Se for uma rota pública E método GET (apenas leitura), permite o acesso sem verificação
    // Métodos POST, PUT, DELETE sempre requerem autenticação
    if (isPublicRoute(req.path) && req.method === 'GET') {
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

