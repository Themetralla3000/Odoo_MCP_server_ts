import { odooClient } from "../../core/odoo-client.js";
import {GetUsersDetailsInput, SearchUsersInput} from "./schemas.js"

export const UsersService = {
    //buscar usuarios (general o por texto)
    async searchUsers( args: SearchUsersInput){
        const domain: any[] =[];

        if (args.query){
            domain.push('|',
                ['name','ilike',args.query],
                ['login','ilike',args.query]
            );
        }

        const users = await odooClient.execute(
            'res.users',
            'search_read',
            [domain],
            {
                fields: ['id', 'name', 'email', 'active'], 
                limit: args.limit
            }
        );
        return users;

    },
    //buscar usuarios ( [id1,id2, ...])
    async getUsersDetails(ids: number[]){
        console.log("ejecutando")
        if (ids.length===0) return [];
     const users = await odooClient.execute(
          'res.users',
          'search_read',
          [
             [['id', 'in', ids]],                       
             ['id', 'name', 'login', 'email', 'active']  
          ], 
          { } 
        );

    return users;


    }

}