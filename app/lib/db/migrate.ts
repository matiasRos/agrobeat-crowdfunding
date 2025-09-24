import fs from 'fs';
import path from 'path';
import { client } from './index';

/**
 * Ejecuta las migraciones de base de datos
 */
export async function runMigrations() {
  try {
    console.log('🚀 Iniciando migraciones de base de datos...');
    
    // Crear tabla de migraciones si no existe
    await client`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Obtener migraciones ejecutadas
    const executedMigrations = await client`
      SELECT filename FROM migrations ORDER BY executed_at
    `;
    
    const executedFiles = new Set(executedMigrations.map(m => m.filename));
    
    // Leer archivos de migración
    const migrationsDir = path.join(process.cwd(), 'app/lib/db/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`📁 Encontradas ${migrationFiles.length} migraciones`);
    
    for (const filename of migrationFiles) {
      if (executedFiles.has(filename)) {
        console.log(`⏭️  Saltando migración ya ejecutada: ${filename}`);
        continue;
      }
      
      console.log(`⚡ Ejecutando migración: ${filename}`);
      
      // Leer y ejecutar migración
      const migrationPath = path.join(migrationsDir, filename);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      try {
        // Ejecutar migración en una transacción
        await client.begin(async (sql) => {
          // Ejecutar el SQL de la migración
          await sql.unsafe(migrationSQL);
          
          // Registrar que la migración se ejecutó
          await sql`
            INSERT INTO migrations (filename) VALUES (${filename})
          `;
        });
        
        console.log(`✅ Migración completada: ${filename}`);
      } catch (error) {
        console.error(`❌ Error ejecutando migración ${filename}:`, error);
        throw error;
      }
    }
    
    console.log('🎉 Todas las migraciones completadas exitosamente');
    
  } catch (error) {
    console.error('💥 Error en las migraciones:', error);
    throw error;
  }
}

/**
 * Script para ejecutar migraciones desde línea de comandos
 */
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('✨ Migraciones completadas');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💀 Error fatal en migraciones:', error);
      process.exit(1);
    });
}
