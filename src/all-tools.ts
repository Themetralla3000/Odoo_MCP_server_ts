import { projectsTools } from "./modules/projects/tools.js";

const ALL_TOOLS_WRAPPERS= [
    ...projectsTools
];

export function registerAllTools(toolHandlers: Map<string,Function>, toolDefinitions: any[]){
    for(const toolWraper of ALL_TOOLS_WRAPPERS){
        //guardar definicion
        toolDefinitions.push(toolWraper.definition);
        //guardar funcion   
        toolHandlers.set(toolWraper.definition.name, toolWraper.handler);
    }
}