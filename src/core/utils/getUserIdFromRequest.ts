import type { Request } from 'express'

/**
 * Obtém o UUID do usuário a partir do request
 * 
 * @param req - Request do Express
 * @returns UUID do usuário (string) ou null se não houver usuário autenticado
 */
export function getUserIdFromRequest(req: Request): string | null {
  // Se não houver usuário autenticado, retorna null
  if (!req.user?.userId) {
    return null
  }

  // Retorna o UUID do usuário
  return req.user.userId
}
