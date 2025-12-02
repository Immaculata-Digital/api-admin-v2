import type { Request, Response, NextFunction } from 'express'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        role?: string
        [key: string]: any
      }
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

