import type { Request } from 'express'
import { AppError } from '../errors/AppError'
import { env } from '../../config/env'

/**
 * Obtém o ID do usuário autenticado a partir do request
 * Se não houver usuário autenticado, lança um erro
 */
export function getUserIdFromRequest(req: Request): number {
  // Debug em desenvolvimento
  if (env.nodeEnv === 'development') {
    console.log('[getUserIdFromRequest] req.user:', req.user ? { ...req.user, userId: req.user.userId } : 'undefined')
  }

  // Verificar se req.user existe
  if (!req.user) {
    if (env.nodeEnv === 'development') {
      console.error('[getUserIdFromRequest] req.user não existe')
    }
    throw new AppError('Usuário não autenticado', 401)
  }

  // Verificar se userId existe e não está vazio
  const userIdString = req.user.userId || req.user.sub
  
  if (!userIdString || userIdString.trim() === '') {
    if (env.nodeEnv === 'development') {
      console.error('[getUserIdFromRequest] userId não encontrado no token:', {
        userId: req.user.userId,
        sub: req.user.sub,
        user: req.user
      })
    }
    throw new AppError('ID do usuário não encontrado no token', 401)
  }

  const userId = parseInt(userIdString, 10)

  if (isNaN(userId) || userId <= 0) {
    if (env.nodeEnv === 'development') {
      console.error('[getUserIdFromRequest] userId inválido:', {
        userIdString,
        parsed: userId,
        isNaN: isNaN(userId),
        isPositive: userId > 0
      })
    }
    throw new AppError('ID do usuário inválido no token', 401)
  }

  return userId
}

