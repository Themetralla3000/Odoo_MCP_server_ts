import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createHttpServer } from '../../src/index.js';

// Headers obligatorios para POST /mcp según la spec MCP Streamable HTTP
const MCP_HEADERS = {
  'Accept': 'application/json, text/event-stream',
  'Content-Type': 'application/json',
};

// Extrae el objeto JSON de la primera línea "data: ..." de una respuesta SSE
function parseSseResponse(text: string): any {
  const dataLine = text.split('\n').find(line => line.startsWith('data: '));
  if (!dataLine) return null;
  return JSON.parse(dataLine.slice('data: '.length));
}

describe('Transport Layer - Streamable HTTP /mcp', () => {
  let app: ReturnType<typeof createHttpServer>;

  beforeAll(() => {
    app = createHttpServer();
  });

  // --- GET /health ---

  describe('GET /health', () => {
    it('responde 200 con status ok y 0 sesiones activas', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.activeSessions).toBe(0);
    });
  });

  // --- POST /mcp - casos de error ---

  describe('POST /mcp - casos de error', () => {
    it('devuelve 400 si no hay session ID y el body no es initialize', async () => {
      const res = await request(app)
        .post('/mcp')
        .send({ jsonrpc: '2.0', id: 1, method: 'ping' });
      expect(res.status).toBe(400);
    });

    it('devuelve 404 con session ID inexistente', async () => {
      const res = await request(app)
        .post('/mcp')
        .set('mcp-session-id', '00000000-0000-0000-0000-000000000000')
        .send({ jsonrpc: '2.0', id: 1, method: 'ping' });
      expect(res.status).toBe(404);
    });
  });

  // --- GET /mcp - casos de error ---

  describe('GET /mcp - casos de error', () => {
    it('devuelve 400 sin header Mcp-Session-Id', async () => {
      const res = await request(app).get('/mcp');
      expect(res.status).toBe(400);
    });

    it('devuelve 404 con session ID inexistente', async () => {
      const res = await request(app)
        .get('/mcp')
        .set('mcp-session-id', '00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
    });
  });

  // --- DELETE /mcp - casos de error ---

  describe('DELETE /mcp - casos de error', () => {
    it('devuelve 400 sin header Mcp-Session-Id', async () => {
      const res = await request(app).delete('/mcp');
      expect(res.status).toBe(400);
    });

    it('devuelve 404 con session ID inexistente', async () => {
      const res = await request(app)
        .delete('/mcp')
        .set('mcp-session-id', '00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
    });
  });

  // --- Flujo MCP completo (sin Odoo) ---

  describe('Flujo MCP completo', () => {
    let sessionId: string;

    it('POST initialize crea sesión y devuelve mcp-session-id en la cabecera', async () => {
      const res = await request(app)
        .post('/mcp')
        .set(MCP_HEADERS)
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'test', version: '1.0' },
          },
        });

      expect(res.status).toBe(200);
      sessionId = res.headers['mcp-session-id'];
      expect(sessionId).toBeDefined();
    });

    it('POST tools/list devuelve las 10 tools registradas', async () => {
      const res = await request(app)
        .post('/mcp')
        .set(MCP_HEADERS)
        .set('mcp-session-id', sessionId)
        .send({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });

      expect(res.status).toBe(200);
      const body = parseSseResponse(res.text);
      expect(Array.isArray(body?.result?.tools)).toBe(true);
      expect(body.result.tools).toHaveLength(10);
    });

    it('DELETE termina la sesión y devuelve 200', async () => {
      const res = await request(app)
        .delete('/mcp')
        .set('mcp-session-id', sessionId);
      expect(res.status).toBe(200);
    });
  });
});
