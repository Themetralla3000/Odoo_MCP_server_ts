import xmlrpc from "xmlrpc";
import { config } from "../config/index.js";

class OdooClient {
  private uid: number | null = null;
  private commonClient: xmlrpc.Client;
  private objectClient: xmlrpc.Client;

  constructor() {

    const isSecure = config.odoo.url.startsWith("https");
    const createClient = isSecure ? xmlrpc.createSecureClient : xmlrpc.createClient;
    
    // Configuración para autenticación
    this.commonClient = createClient({
      url: `${config.odoo.url}/xmlrpc/2/common`,
    });

    // Configuración para ejecución de comandos
    this.objectClient = createClient({
      url: `${config.odoo.url}/xmlrpc/2/object`,
    });
  }

  //login y uid
  async connect(): Promise<void> {
    console.error(`Connecting to Odoo at ${config.odoo.url}...`);

    return new Promise((resolve, reject) => {
      this.commonClient.methodCall(
        "authenticate",
        [
          config.odoo.db,
          config.odoo.username,
          config.odoo.password,
          {}, 
        ],
        (error, value) => {
          if (error) {
            reject(new Error(`Odoo Connection Error: ${(error as any).message}`));
          } else if (typeof value !== "number") {
            reject(new Error("Odoo Authentication Failed: No UID returned. Check credentials."));
          } else {
            this.uid = value;
            console.error(`✅ Odoo Connected. UID: ${this.uid}`);
            resolve();
          }
        }
      );
    });
  }

  /**
   * Ejecuta cualquier método en cualquier modelo.
   * * @param model El modelo de Odoo (ej: 'res.partner', 'project.project')
   * @param method El método a ejecutar (ej: 'search_read', 'create', 'action_confirm')
   * @param args Argumentos posicionales (lista)
   * @param kwargs Argumentos con nombre (diccionario)
   */
  async execute<T = any>(
    model: string,
    method: string,
    args: any[] = [],
    kwargs: any = {}
  ): Promise<T> {
    if (!this.uid) {
      throw new Error("Client not connected. Call connect() first.");
    }

    // Estructura oficial de Odoo execute_kw:
    // [db, uid, password, model, method, [args], {kwargs}]
    const payload = [
      config.odoo.db,
      this.uid,
      config.odoo.password,
      model,
      method,
      args,
      kwargs,
    ];

    return new Promise((resolve, reject) => {
      this.objectClient.methodCall("execute_kw", payload, (error, value) => {
        if (error) {
            
            const msg = `Odoo Fault (${model}.${method}): ${(error as any).message}`;
            reject(new Error(msg));
        } else {
          resolve(value as T);
        }
      });
    });
  }
}

//unica instancia singleton
export const odooClient = new OdooClient();