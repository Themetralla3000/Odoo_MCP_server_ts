import { describe, it, expect, beforeAll } from 'vitest';
import { odooClient } from '../../src/core/odoo-client'; //sin .js que sino no va ?¿


describe('Integración Real con Odoo (E2E)', () => {

  it('debería autenticarse correctamente y obtener un UID', async () => {
    await odooClient.connect();
    
    const uid = (odooClient as any).uid;
    
    console.log(`Login correcto. UID recibido: ${uid}`);
    
    expect(uid).toBeDefined();
    expect(typeof uid).toBe('number');
    expect(uid).toBeGreaterThan(0);
  });

  it('debería poder leer datos reales (res.users)', async () => {
    //esperar al connect por si acaso
    await odooClient.connect();

    const users = await odooClient.execute(
      "res.users", 
      "search_read", 
      [[]], // Domain vacío
      { 
        fields: ["name", "login", "active"], 
        limit: 1 
      }
    );

    console.log("Dato real recuperado");

    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toHaveProperty('login');
  });

});