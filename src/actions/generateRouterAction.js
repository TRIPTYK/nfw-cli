/**
 * @author Deflorenne Amaury
 * @description Generates a custom router and controller
 * @module generateRouterAction
 */

const project = require('../utils/project');
const { capitalizeEntity } = require('../actions/lib/utils');
const customRouterTemplate = require("../templates/custom/customRouter");
const customControllerTemplate = require("../templates/custom/customController");

/**
 * Main function
 * @param entityName
 * @param routes
 * @returns {Promise<string[]>} Generated files
 */
module.exports = async (entityName, routes) => {
    const methods = [];
    const routerPath = `src/api/routes/v1/${entityName}.route.ts`;
    const controllerPath = `src/api/controllers/${entityName}.controller.ts`;
    const writtenFiles = [];

    routes.forEach((route) => {
        route.methods.forEach((method) => {
            methods.push({
                name: method.controllerMethod
            });
        })
    });

    writtenFiles.push(customControllerTemplate(controllerPath,{
        className : `${capitalizeEntity(entityName)}Controller`,
        methods,
        entityName
    }));

    writtenFiles.push(customRouterTemplate(routerPath,{ routes , entityName}));

    await project.save();

    // return written files
    return writtenFiles.map((f) => f.getFilePath());
};
