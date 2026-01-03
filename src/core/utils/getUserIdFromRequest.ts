import type { Request } from 'express'
import { AppError } from '../errors/AppError'

/**
 * Obtém o ID do usuário autenticado a partir do request
 * Se não houver usuário autenticado, lança um erro
 */
export function getUserIdFromRequest(req: Request): number {
  if (!req.user?.userId) {
    throw new AppError('Usuário não autenticado', 401)
  }

  const userId = parseInt(req.user.userId, 10)

  if (isNaN(userId) || userId <= 0) {
    throw new AppError('ID do usuário inválido no token', 401)
  }

  return userId
}

