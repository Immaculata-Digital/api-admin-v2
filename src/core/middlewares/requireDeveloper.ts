import type { Request, Response, NextFunction } from 'express'
import type { AuthTokenPayload } from '../utils/jwt'

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload
    }
  }
}

export function requireDeveloper(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).json({ mensagem: 'Não autenticado' })
  if (req.user.role !== 'DEV') {
    return res
      .status(403)
      .json({ mensagem: 'Acesso restrito a desenvolvedores' })
  }
  next()
}

