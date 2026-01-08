import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ralphban',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

export default pool;
