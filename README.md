# Odoo MCP Server

> Servidor [Model Context Protocol (MCP)](https://modelcontextprotocol.io) per a Odoo, implementat amb Node.js / TypeScript i transport Streamable HTTP.

Part del TFG *"Desenvolupament d'un Agent Intel·ligent per a la Gestió i Suport de Processos Empresarials mitjançant MCP"* — TecnoCampus / UPF 2025–2026.

> **Documentació generada amb [Claude Code](https://claude.ai/claude-code)**

---

## Contingut

- [Descripció](#descripció)
- [Arquitectura](#arquitectura)
- [Requisits](#requisits)
- [Instal·lació](#installació)
- [Configuració](#configuració)
- [Ús](#ús)
- [Eines MCP disponibles](#eines-mcp-disponibles)
- [Tests](#tests)
- [Estructura del projecte](#estructura-del-projecte)

---

## Descripció

Aquest servidor exposa les dades d'**Odoo** com a eines MCP consumibles per qualsevol agent LLM compatible (Claude, GPT-4o, etc.). Permet a un model de llenguatge:

- Consultar i cercar projectes, tasques i usuaris d'Odoo
- Registrar, consultar i eliminar imputacions d'hores (*timesheets*)
- Llegir i actualitzar l'estat kanban dels projectes

La comunicació amb Odoo es realitza via **XML-RPC 2.0** (l'API nativa d'Odoo). El servidor implementa el transport **Streamable HTTP** de l'especificació MCP, amb gestió de sessions stateful mitjançant UUID.

---

## Arquitectura

```
[LLM Host / Agent]
       │  Streamable HTTP (JSON-RPC 2.0)
       ▼
[Odoo MCP Server]  ← Node.js + Express + @modelcontextprotocol/sdk
       │  XML-RPC 2.0
       ▼
[Odoo ERP]  ← instància cloud o on-premise
```

**Endpoints HTTP:**

| Mètode   | Ruta       | Funció                                      |
|----------|------------|---------------------------------------------|
| `POST`   | `/mcp`     | Missatges JSON-RPC (initialize, tools/call) |
| `GET`    | `/mcp`     | Canal SSE per a notificacions del servidor  |
| `DELETE` | `/mcp`     | Tancament de sessió                         |
| `GET`    | `/health`  | Estat del servidor i sessions actives       |

---

## Requisits

- Node.js >= 22 LTS
- Instància Odoo 17+ accessible (cloud o local)
- Compte d'usuari Odoo amb permisos de lectura/escriptura sobre els models utilitzats

---

## Instal·lació

```bash
git clone <repo-url>
cd mcp_js
npm install
npm run build
```

---

## Configuració

El servidor utilitza fitxers `.env` per entorn. Crea el fitxer corresponent abans d'arrencar:

```bash
# .env.dev | .env.test | .env.prod
ODOO_URL=https://la-teva-instancia.odoo.com
ODOO_DB=nom_de_la_base_de_dades
ODOO_USERNAME=usuari@empresa.com
ODOO_PASSWORD=contrasenya_o_token_api
LOG_LEVEL=info   # debug | info | warn | error
```

L'entorn s'activa amb la variable `NODE_ENV`:

```bash
NODE_ENV=dev   npm start   # .env.dev
NODE_ENV=prod  npm start   # .env.prod
```

---

## Ús

```bash
# Compilar
npm run build

# Arrencar (producció)
npm start

# Arrencar (desenvolupament, NODE_ENV=dev)
npm run dev
```

En arrencar correctament veuràs:

```
Connecting to Odoo...
✅ Odoo Connected. UID: 42
Server running in Streamable HTTP mode on port 3000
  POST   /mcp    - JSON-RPC messages
  GET    /mcp    - SSE channel
  DELETE /mcp    - Close session
  GET    /health - Health check
```

Pots verificar l'estat amb:

```bash
curl http://localhost:3000/health
# {"status":"ok","activeSessions":0,"timestamp":"..."}
```

---

## Eines MCP disponibles

### Projectes

| Eina | Descripció |
|------|------------|
| `projects_get_list` | Llista projectes actius. Filtre opcional per etapa (`TODO`, `DOING`, `DONE`). |

### Tasques

| Eina | Descripció |
|------|------------|
| `tasks_search` | Cerca tasques per projecte, responsable, etiqueta o paraula clau. |

### Usuaris

| Eina | Descripció |
|------|------------|
| `users_search` | Cerca usuaris per nom o email. |
| `users_get_details` | Recupera detalls (nom, email) a partir d'una llista d'IDs. |

### Imputació d'hores (Timesheets)

| Eina | Descripció |
|------|------------|
| `timesheets_create` | Registra hores en una tasca (task_id, hores, descripció, data opcional, user_id opcional). |
| `timesheets_get_by_task` | Consulta les imputacions d'una tasca concreta. |
| `timesheets_delete` | Elimina una imputació per ID. |

### Estat Kanban

| Eina | Descripció |
|------|------------|
| `project_get_state` | Llegeix l'estat kanban d'un projecte. |
| `project_update_state` | Actualitza l'estat: `a_tiempo` · `en_riesgo` · `atrasado` · `en_espera` · `hecho` |
| `projects_search_by_state` | Filtra tots els projectes per estat, opcionalment per responsable. |

---

## Tests

```bash
# Tests unitaris
npm test

# Tests unitaris en mode watch
npm run test:watch

# Tests d'integració (requereix .env.test amb Odoo real)
npm run test:integration

# Informe de cobertura
npm run coverage
```

Els tests d'integració requereixen un fitxer `.env.test` configurat amb una instància Odoo accessible.

---

## Estructura del projecte

```
src/
├── config/
│   └── index.ts          # Validació de variables d'entorn (Zod)
├── core/
│   └── odoo-client.ts    # Singleton XML-RPC d'Odoo
├── modules/
│   ├── projects/         # tools.ts · service.ts · schemas.ts
│   ├── tasks/
│   ├── users/
│   ├── timesheets/
│   └── kanban/
├── all-tools.ts          # Registre centralitzat de totes les eines
└── index.ts              # Servidor HTTP + gestió de sessions MCP
tests/
├── setup.ts
├── unit/
└── integration/
```

---

## Referències

- [Model Context Protocol — Especificació oficial](https://modelcontextprotocol.io)
- [Odoo External API (XML-RPC)](https://www.odoo.com/documentation/17.0/developer/reference/external_api.html)
- [Odoo ORM — Search domains](https://www.odoo.com/documentation/17.0/developer/reference/backend/orm.html#search-domains)
- [`xmlrpc` npm package](https://www.npmjs.com/package/xmlrpc)
