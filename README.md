# API Admin v2

API Admin v2 seguindo arquitetura SOLID/MVC em TypeScript.

## Estrutura

A API segue a mesma arquitetura da `api-usuarios-v2`:

- **Módulos**: Cada funcionalidade é um módulo independente
- **SOLID/MVC**: Separação clara de responsabilidades
- **JSON-driven**: Features e menus definidos em JSON
- **Migrations**: Gerenciamento de schema via `db-migrations`

## Módulos

1. **configuracoes-globais** - Configurações visuais por tenant
2. **lojas** - Gerenciamento de lojas/unidades
3. **logs-sistema** - Logs do sistema
4. **combos** - Combos dinâmicos
5. **itens-recompensa** - Itens de recompensa
6. **clientes-concordia** - Clientes Concordia
7. **dashboard** - Dados do dashboard
8. **webradio** - Gerenciamento de áudios da webradio
9. **schema** - Gerenciamento de schemas (multi-tenant)

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Variáveis de Ambiente

Crie um arquivo `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=immaculata-v2
DB_USER=developer
DB_PASS=sua_senha

# Security
JWT_SECRET=seu_jwt_secret
JWT_EXPIRES_IN=2h

# OpenAI (para geração de áudio)
OPENAI_API_KEY=sua_chave_openai

# Server
PORT=3335
NODE_ENV=development
```

## Documentação

Acesse a documentação Swagger em: `http://localhost:3335/docs`

