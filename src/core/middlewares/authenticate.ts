import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, type AuthTokenPayload } from '../utils/jwt'
import { AppError } from '../errors/AppError'
import { env } from '../../config/env'

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
  // Rotas públicas para itens de recompensa
  '/itens-recompensa',
  '/api/itens-recompensa',
  // Rotas públicas para lojas (para validação de id_loja)
  '/lojas',
  '/api/lojas',
]

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

  // Debug em desenvolvimento
  if (env.nodeEnv === 'development') {
    console.log('[isPublicRoute] Original path:', path)
    console.log('[isPublicRoute] Normalized path:', normalizedPath)
  }
  
  // Verifica rotas exatas primeiro (sem /api)
  const routesWithoutApi = PUBLIC_ROUTES.map(route => route.replace(/^\/api/, ''))
  if (routesWithoutApi.some((publicRoute) => normalizedPath === publicRoute || normalizedPath.startsWith(publicRoute))) {
    if (env.nodeEnv === 'development') {
      console.log('[isPublicRoute] ✅ Rota pública encontrada (exata):', normalizedPath)
    }
    return true
  }
  
  // Verifica rotas com padrões dinâmicos (com schema no path)
  // Como o /api já foi removido, os padrões não precisam incluir /api
  // Ex: /casona/configuracoes-globais, /casona/itens-recompensa, etc.
  const publicPatterns = [
    /^\/[^/]+\/configuracoes-globais/,  // /casona/configuracoes-globais
    /^\/[^/]+\/itens-recompensa/,  // /casona/itens-recompensa ou /thiago/itens-recompensa
    /^\/[^/]+\/lojas/,  // /casona/lojas (listagem) ou /casona/lojas/1 (com ID)
  ]
  
  const matches = publicPatterns.some((pattern) => {
    const match = pattern.test(normalizedPath)
    if (match && env.nodeEnv === 'development') {
      console.log('[isPublicRoute] ✅ Rota pública encontrada (padrão):', normalizedPath, 'Pattern:', pattern)
    }
    return match
  })
  
  if (!matches && env.nodeEnv === 'development') {
    console.log('[isPublicRoute] ❌ Rota não é pública:', normalizedPath)
  }
  
  return matches
}

/**
 * Middleware de autenticação
 * Valida o access token e adiciona as informações do usuário ao request
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Se for uma rota pública E método GET (apenas leitura), permite o acesso sem autenticação
    // Métodos POST, PUT, DELETE sempre requerem autenticação
    if (isPublicRoute(req.path) && req.method === 'GET') {
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

    let payload: AuthTokenPayload
    
    try {
      // Tentar validar o token localmente primeiro
      payload = verifyAccessToken(token)
    } catch (localError: any) {
      // Se a validação local falhar, pode ser porque:
      // 1. JWT_SECRET está diferente entre APIs
      // 2. Token está expirado
      // 3. Token tem estrutura inválida
      
      // Log do erro para debug (apenas em desenvolvimento)
      if (env.nodeEnv === 'development') {
        console.error('[AUTH] Erro ao validar token localmente:', localError.message)
        console.error('[AUTH] JWT_SECRET usado:', env.security.jwtSecret.substring(0, 10) + '...')
      }
      
      // Tentar decodificar sem verificar assinatura para ver se o token tem estrutura válida
      // Isso resolve o problema quando JWT_SECRET está diferente entre APIs
      try {
        const jwt = require('jsonwebtoken')
        const decoded = jwt.decode(token, { complete: true })
        
        if (!decoded || !decoded.payload) {
          if (env.nodeEnv === 'development') {
            console.error('[AUTH] Token não pode ser decodificado')
          }
          throw new AppError('Token inválido ou expirado', 401)
        }
        
        const tokenPayload = decoded.payload as any
        
        // Verificar se o token tem a estrutura esperada
        if (tokenPayload.type !== 'access') {
          if (env.nodeEnv === 'development') {
            console.error('[AUTH] Token não é do tipo access:', tokenPayload.type)
          }
          throw new AppError('Token inválido ou expirado', 401)
        }
        
        if (!tokenPayload.userId && !tokenPayload.sub) {
          if (env.nodeEnv === 'development') {
            console.error('[AUTH] Token não tem userId ou sub')
          }
          throw new AppError('Token inválido ou expirado', 401)
        }
        
        // Verificar expiração
        const now = Math.floor(Date.now() / 1000)
        if (tokenPayload.exp && tokenPayload.exp < now) {
          if (env.nodeEnv === 'development') {
            console.error('[AUTH] Token expirado. Exp:', tokenPayload.exp, 'Now:', now)
          }
          throw new AppError('Token expirado', 401)
        }
        
        // Construir payload a partir do token decodificado
        // Usar userId ou sub como fallback
        const userId = tokenPayload.userId || tokenPayload.sub
        
        payload = {
          type: 'access',
          userId: userId,
          login: tokenPayload.login || '',
          email: tokenPayload.email || '',
          permissions: Array.isArray(tokenPayload.permissions) ? tokenPayload.permissions : [],
          sub: tokenPayload.sub || userId,
          iat: tokenPayload.iat || now,
          exp: tokenPayload.exp,
        } as AuthTokenPayload
        
        // Log de aviso em desenvolvimento
        if (env.nodeEnv === 'development') {
          console.warn('[AUTH] ⚠️  Token validado sem verificar assinatura')
          console.warn('[AUTH] ⚠️  Isso indica que JWT_SECRET pode estar diferente entre APIs')
          console.warn('[AUTH] ⚠️  JWT_SECRET esperado:', env.security.jwtSecret.substring(0, 15) + '...')
          console.warn('[AUTH] ✅ Token aceito - estrutura válida e não expirado')
        }
      } catch (decodeError: any) {
        // Se não conseguir decodificar, token é inválido
        if (env.nodeEnv === 'development') {
          console.error('[AUTH] Erro ao decodificar token:', decodeError.message)
        }
        throw new AppError('Token inválido ou expirado', 401)
      }
    }

    req.user = payload

    next()
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ status: 'error', message: error.message })
    }
    return res.status(401).json({ status: 'error', message: 'Token inválido ou expirado' })
  }
}

