import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest'; // Seguimos usándolo para los POST, que sí cierran
import { createHttpServer } from '../../src/index';
import { Server } from 'http';

//mock de odoo
vi.mock('../src/core/odoo-client.js', () => ({
  odooClient: {
    connect: vi.fn().mockResolvedValue(true)
  }
}));

describe('Capa de Transporte MCP (SSE)', () => {
  let app: any;
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    app = createHttpServer();
    
    //levantar servidor
    return new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const address = server.address() as any;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  afterAll(() => {
    //cerrarlo al acabar
    server.close();
  });

  describe('GET /sse (Handshake)', () => {
    
    it('debe responder con headers de Event Stream', async () => {
      const controller = new AbortController();
      
      
      const response = await fetch(`${baseUrl}/sse`, { 
        signal: controller.signal 
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('text/event-stream');
      expect(response.headers.get('cache-control')).toContain('no-cache');
      expect(response.headers.get('connection')).toBe('keep-alive');

      //cerrar la conexion
      controller.abort();
    });

    it('Debe devolver la ruta pública correcta (/mcp/messages)', async () => {
      const controller = new AbortController();
      const response = await fetch(`${baseUrl}/sse`, { 
        signal: controller.signal 
      });

      
      const reader = response.body?.getReader();
      const { value } = await reader?.read() || {};
      const text = new TextDecoder().decode(value);

   
      expect(text).toContain('event: endpoint');
      //que devuelva la ruta correcta
      expect(text).toContain('/mcp/messages');

      //cerrar conexion
      controller.abort();
    });
  });

  //los posts usando supertest en vez de fetch (a supertest no le gustan las conexiones que no se cierran, da tiemout)
  describe('POST /messages (Recepción de comandos)', () => {
    it('debe fallar 400 si no se envía sessionId', async () => {
      const response = await request(app)
        .post('/messages')
        .send({ jsonrpc: '2.0', method: 'ping', id: 1 });
        
      expect(response.status).toBe(400);
    });

    it('debe fallar 404 si el sessionId no existe', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post(`/messages?sessionId=${fakeUuid}`)
        .send({ jsonrpc: '2.0', method: 'ping', id: 1 });
        
      expect(response.status).toBe(404);
    });
  });

  describe('Flujo Completo', () => {
    it('debe aceptar mensajes POST una vez conectado SSE', async () => {
      const controller = new AbortController();
      
      //1. conectar SSE
      const responseSSE = await fetch(`${baseUrl}/sse`, { 
        signal: controller.signal 
      });
      
      //2. leer session id
      const reader = responseSSE.body?.getReader();
      const { value } = await reader?.read() || {};
      const chunk = new TextDecoder().decode(value);
      
      const match = chunk.match(/sessionId=([a-f0-9\-]+)/);
      const sessionId = match ? match[1] : null;

      expect(sessionId).toBeDefined();

      //3. enviar post a la ruta que escucha el servidor
      //como este test es directo y no pasamos por ningun proxy, a la ruta sin /mcp primero
      const postResponse = await fetch(`${baseUrl}/messages?sessionId=${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'notifications/initialized',
          params: {}
        })
      });

      expect(postResponse.status).toBe(202);

      controller.abort();
    });
  });
});