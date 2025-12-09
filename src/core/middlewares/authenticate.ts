import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, type AuthTokenPayload } from '../utils/jwt'
import { AppError } from '../errors/AppError'

// Estender o tipo Request para incluir informações do usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload
    }
  }
}

/**
 * Lista de rotas públicas que não precisam de autenticação
 * As rotas podem vir com ou sem o prefixo /api
 */
const PUBLIC_ROUTES = [
  '/health',
  '/api/health',
  '/auth/login',
  '/api/auth/login',
  '/auth/logout',
  '/api/auth/logout',
  '/auth/refresh-token',
  '/api/auth/refresh-token',
  '/auth/refresh',
  '/api/auth/refresh',
  '/users/password/reset-request',
  '/api/users/password/reset-request',
  '/users/password/reset',
  '/api/users/password/reset',
  '/users/clientes/publico',
  '/api/users/clientes/publico',
  '/groups/public/admin',
  '/api/groups/public/admin',
  '/clientes/auth/password/forgot',
  '/api/clientes/auth/password/forgot',
  '/clientes/auth/password/reset',
  '/api/clientes/auth/password/reset',
  '/docs',
  '/api/docs',
  // Rotas públicas para configurações globais
  '/configuracoes-globais',
  '/api/configuracoes-globais',
  // Rotas públicas para clientes concordia
  '/clientes-concordia/schema',
  '/api/clientes-concordia/schema',
  // Rotas públicas para itens de recompensa
  '/itens-recompensa',
  '/api/itens-recompensa',
  // Rotas públicas para lojas (para validação de id_loja)
  '/lojas',
  '/api/lojas',
]

/**
 * Verifica se uma rota é pública
 * Nota: O path que chega aqui já tem o prefixo /api removido (porque o middleware é aplicado em /api)
 * Então /api/casona/lojas/1 chega como /casona/lojas/1
 */
const isPublicRoute = (path: string): boolean => {
  // Remove query string e normaliza o path
  const pathWithoutQuery = path.split('?')[0]
  const normalizedPath = pathWithoutQuery.startsWith('/') ? pathWithoutQuery : `/${pathWithoutQuery}`
  
  // Verifica rotas exatas primeiro (sem /api porque já foi removido)
  const routesWithoutApi = PUBLIC_ROUTES.map(route => route.replace('/api', ''))
  if (routesWithoutApi.some((publicRoute) => normalizedPath === publicRoute || normalizedPath.startsWith(publicRoute))) {
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
 * Middleware de autenticação
 * Valida o access token e adiciona as informações do usuário ao request
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Se for uma rota pública, permite o acesso sem autenticação
    if (isPublicRoute(req.path)) {
      return next()
    }

    const authHeader = req.headers.authorization

    if (!authHeader) {
      throw new AppError('Token de autenticação não fornecido', 401)
    }

    const [scheme, token] = authHeader.split(' ')

    if (scheme !== 'Bearer' || !token) {
      throw new AppError('Formato de token inválido. Use: Bearer <token>', 401)
    }

    const payload = verifyAccessToken(token)
    req.user = payload

    next()
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ status: 'error', message: error.message })
    }
    return res.status(401).json({ status: 'error', message: 'Token inválido ou expirado' })
  }
}

