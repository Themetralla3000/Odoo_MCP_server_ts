import { projectsTools } from "./modules/projects/tools.js";
import { tasksTools } from "./modules/tasks/tools.js";
import { usersTools } from "./modules/users/tools.js";
import { timesheetsTools } from "./modules/timesheets/tools.js";

const ALL_TOOLS_WRAPPERS= [
    ...projectsTools,
    ...tasksTools,
    ...usersTools,
    ...timesheetsTools
];

export function registerAllTools(toolHandlers: Map<string,Function>, toolDefinitions: any[]){
    for(const toolWraper of ALL_TOOLS_WRAPPERS){
        //guardar definicion
        toolDefinitions.push(toolWraper.definition);
        //guardar funcion   
        toolHandlers.set(toolWraper.definition.name, toolWraper.handler);
    }
}