const { Pool } = require('pg');
const pool = new Pool({
  host: '193.203.183.47',
  port: 5433,
  database: 'concordia',
  user: 'postgres',
  password: 'sszprohcpKdGdhMA4OfGcURJE',
});

async function run() {
  const schema = 'imperiodochop'; // Assuming this might be the schema based on previous conversations. We can change it if we see errors.
  try {
     const resLojas = await pool.query(`SELECT id_loja, nome_fantasia FROM "${schema}".lojas LIMIT 10`);
     console.log("Lojas:", resLojas.rows);

     // Try the simplest query for ticket_medio for one logical store
     // Using store ID from the previous query (or let's just count without filter)
     
     const resTicket = await pool.query(`
        SELECT COALESCE(SUM(m.pontos), 0)::int as creditos, COUNT(m.id_movimentacao)::int as vendas
        FROM "${schema}".cliente_pontos_movimentacao m
        WHERE m.tipo = 'CREDITO'
     `);
     console.log("Global Ticket:", resTicket.rows);
  } catch (e) {
      console.error(e)
  }
  pool.end();
}
run();
