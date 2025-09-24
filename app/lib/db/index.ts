import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Verificar que la URL de la base de datos esté definida
if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not defined');
}

// Cliente de base de datos
const client = postgres(process.env.POSTGRES_URL);
const db = drizzle(client, { schema });

export { db, client };
