import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../../../core/errors/AppError'
import { SchemaService } from '../services/SchemaService'
import { createSchemaSchema } from '../validators/schema.schema'

export class SchemaController {
  private readonly schemaService: SchemaService

  constructor() {
    this.schemaService = new SchemaService()
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schemas = await this.schemaService.listSchemas()
      return res.json({ schemas })
    } catch (error) {
      return next(error)
    }
  }

  checkExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { schemaName } = req.params
      if (!schemaName) {
        throw new AppError('Nome do schema é obrigatório', 400)
      }
      const exists = await this.schemaService.checkSchemaExists(schemaName)
      return res.json({ exists })
    } catch (error) {
      return next(error)
    }
  }

  createSchema = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = createSchemaSchema.safeParse(req.body)
      if (!parseResult.success) {
        throw new AppError('Falha de validação', 422, parseResult.error.flatten())
      }

      const { schemaName } = parseResult.data
      const result = await this.schemaService.createSchema(schemaName)

      if (result.success) {
        return res.status(201).json(result)
      } else {
        return res.status(400).json(result)
      }
    } catch (error) {
      return next(error)
    }
  }

  createSchemaTables = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { schemaName } = req.params
      if (!schemaName) {
        throw new AppError('Nome do schema é obrigatório', 400)
      }

      const result = await this.schemaService.createSchemaTables(schemaName)

      if (result.success) {
        return res.status(201).json(result)
      } else {
        return res.status(400).json(result)
      }
    } catch (error) {
      return next(error)
    }
  }

  createCompleteTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = createSchemaSchema.safeParse(req.body)
      if (!parseResult.success) {
        throw new AppError('Falha de validação', 422, parseResult.error.flatten())
      }

      const { schemaName } = parseResult.data
      const result = await this.schemaService.createCompleteTenant(schemaName)

      if (result.success) {
        return res.status(201).json(result)
      } else {
        return res.status(400).json(result)
      }
    } catch (error) {
      return next(error)
    }
  }
}

export const schemaController = new SchemaController()

