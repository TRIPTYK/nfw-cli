/**
 * @author Deflorenne Amaury
 * @description Generates a custom router and controller
 * @module generateRouterAction
 */

import project = require('../utils/project');
import { capitalizeEntity } from '../actions/lib/utils';
import customRouterTemplate = require("../templates/custom/customRouter");
import customControllerTemplate = require("../templates/custom/customController");
import { ThisExpression } from 'ts-morph';

/**
 * Main function
 * @param entityName
 * @param routes
 * @returns {Promise<string[]>} Generated files
 */


export class GenerateRouterActionClass {

    entityName: string;
    routes: {methods: any[]}[];

    constructor(entityName: string, routes: {methods: any[]}[]){

        this.entityName = entityName;
        this.routes = routes;
    }

    async main(): Promise<string[]> {
        
        const methods = [];
        const routerPath = `src/api/routes/v1/${this.entityName}.route.ts`;
        const controllerPath = `src/api/controllers/${this.entityName}.controller.ts`;
        const writtenFiles = [];
    
        this.routes.forEach((route) => {
            route.methods.forEach((method) => {
                methods.push({
                    name: method.controllerMethod
                });
            })
        });
    
        writtenFiles.push(customControllerTemplate(controllerPath,{
            className : `${capitalizeEntity(this.entityName)}Controller`,
            methods,
            entityName: this.entityName
        }));
    
        writtenFiles.push(customRouterTemplate(routerPath,{ routes: this.routes , entityName: this.entityName}));
    
        await project.save();
    
        // return written files
        return writtenFiles.map((f) => f.getFilePath());
    }

}
