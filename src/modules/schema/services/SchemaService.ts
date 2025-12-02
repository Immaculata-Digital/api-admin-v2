import { pool } from '../../../infra/database/pool'
import { AppError } from '../../../core/errors/AppError'

export interface SchemaResponse {
  success: boolean
  message: string
  schemaName: string
}

export class SchemaService {
  private isValidSchemaName(schemaName: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schemaName)
  }

  async checkSchemaExists(schemaName: string): Promise<boolean> {
    const client = await pool.connect()
    try {
      const result = await client.query<{ exists: boolean }>(
        `SELECT EXISTS(
          SELECT 1 FROM information_schema.schemata 
          WHERE schema_name = $1
        ) as exists`,
        [schemaName]
      )
      return result.rows[0]?.exists ?? false
    } finally {
      client.release()
    }
  }

  async listSchemas(): Promise<string[]> {
    const client = await pool.connect()
    try {
      const result = await client.query<{ schema_name: string }>(
        `SELECT schema_name 
         FROM information_schema.schemata 
         WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1', 'public')
         ORDER BY schema_name`
      )
      return result.rows.map(row => row.schema_name)
    } finally {
      client.release()
    }
  }

  async createSchema(schemaName: string): Promise<SchemaResponse> {
    if (!this.isValidSchemaName(schemaName)) {
      return {
        success: false,
        message: 'Nome do schema inválido. Use apenas letras, números e underscore.',
        schemaName,
      }
    }

    const exists = await this.checkSchemaExists(schemaName)
    if (exists) {
      return {
        success: false,
        message: `Schema "${schemaName}" já existe.`,
        schemaName,
      }
    }

    const client = await pool.connect()
    try {
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`)
      
      // Registrar na tabela schemas
      await client.query(
        `INSERT INTO schemas (schema_name, created_at, updated_at)
         VALUES ($1, NOW(), NOW())
         ON CONFLICT (schema_name) DO NOTHING`,
        [schemaName]
      )

      return {
        success: true,
        message: `SUCESSO: Schema "${schemaName}" criado.`,
        schemaName,
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        schemaName,
      }
    } finally {
      client.release()
    }
  }

  async createSchemaTables(schemaName: string): Promise<SchemaResponse> {
    const exists = await this.checkSchemaExists(schemaName)
    if (!exists) {
      return {
        success: false,
        message: `Schema "${schemaName}" não existe. Crie o schema primeiro.`,
        schemaName,
      }
    }

    const client = await pool.connect()
    try {
      // Chamar a função create_tenant_tables
      const result = await client.query<{ create_tenant_tables: string }>(
        `SELECT create_tenant_tables($1) as create_tenant_tables`,
        [schemaName]
      )

      const message = result.rows[0]?.create_tenant_tables || 'Tabelas criadas com sucesso'

      return {
        success: true,
        message: `SUCESSO: ${message}`,
        schemaName,
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        schemaName,
      }
    } finally {
      client.release()
    }
  }

  async createCompleteTenant(schemaName: string): Promise<SchemaResponse> {
    if (!this.isValidSchemaName(schemaName)) {
      return {
        success: false,
        message: 'Nome do schema inválido. Use apenas letras, números e underscore.',
        schemaName,
      }
    }

    const exists = await this.checkSchemaExists(schemaName)
    if (exists) {
      return {
        success: false,
        message: `Schema "${schemaName}" já existe.`,
        schemaName,
      }
    }

    // Criar schema primeiro
    const schemaResult = await this.createSchema(schemaName)
    if (!schemaResult.success) {
      return schemaResult
    }

    // Criar tabelas
    const tablesResult = await this.createSchemaTables(schemaName)
    return tablesResult
  }
}

