import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/index.js"; //se importa pero no se arranca

//MOCK: hacer ver que se conecta a odoo
vi.mock("../../src/core/odoo-client.js", () => ({
  odooClient: {
    connect: vi.fn().mockResolvedValue(undefined), 
  },
}));

describe("Servidor MCP HTTP (Express)", () => {
  //TEST: verificar validación de SessionID (POST /messages)
  it("POST /messages -> Debería fallar si no hay sessionId", async () => {
    await request(app)
      .post("/messages") 
      .send({ jsonrpc: "2.0", method: "ping" })
      .expect(400); 
  });

  //TEST: verificar sesión inexistente (directamente a messages sin pasar por sse, con un sesionid inventado)
  it("POST /messages -> Debería fallar si la sesión no existe", async () => {
    const fakeSessionId = "sesion-falsa-123";
    
    const response = await request(app)
      .post(`/messages?sessionId=${fakeSessionId}`)
      .send({ jsonrpc: "2.0", method: "ping" })
      .expect(404); // Esperamos Not Found

    expect(response.text).toContain("Session not found");
  });
  //es complicado testear el happy path pq la conexion se queda abierta 
});