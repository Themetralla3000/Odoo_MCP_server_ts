import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';
import path from 'path';

// 1. Cargamos el .env explícitamente usando la ruta absoluta
// Esto evita problemas si Vitest se ejecuta desde otra carpeta
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Aumentamos el timeout por si Odoo tarda en responder
    testTimeout: 10000, 
  },
});