import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError'

/**
 * Lista de rotas públicas que não precisam de autorização
 * As rotas podem vir com ou sem o prefixo /api
 */
const PUBLIC_ROUTES = [
  '/health',
  '/api/health',
  '/docs',
  '/api/docs',
]

/**
 * Verifica se uma rota é pública
 */
const isPublicRoute = (path: string): boolean => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return PUBLIC_ROUTES.some((publicRoute) => normalizedPath.startsWith(publicRoute))
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

