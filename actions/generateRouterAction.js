/**
 * @author Deflorenne Amaury
 * @description Generates a custom router and controller
 * @module generateRouterAction
 */

// node modules
const util = require('util');
const fs = require('fs');
const ejs = require('ejs');

// project modules
const routerWrite = require('./lib/routerWrite');
const {capitalizeEntity} = require("./lib/utils");

// promisify
const ReadFile = util.promisify(fs.readFile);
const WriteFile = util.promisify(fs.writeFile);

/**
 * Main function
 * @param entityName
 * @param routes
 * @returns {Promise<string[]>} Generated files
 */
module.exports = async (entityName, routes) => {
    const [controllerTemplateFile, routerTemplateFile] = await Promise.all([
        ReadFile(`${__baseDir}/templates/custom/customController.ejs`, 'utf-8'),
        ReadFile(`${__baseDir}/templates/custom/customRouter.ejs`, 'utf-8')
    ]);

    const methods = [];
    const routerPath = `/src/api/routes/v1/${entityName}.route.ts`;
    const controllerPath = `/src/api/controllers/${entityName}.controller.ts`;

    routes.forEach((route) => {
        route.methods.forEach((method) => {
            methods.push({
                name: method.controllerMethod
            });
        })
    });

    await Promise.all([
        WriteFile(
            process.cwd() + controllerPath,
            ejs.compile(controllerTemplateFile)({
                controllerName: entityName,
                methods: methods,
                capitalizeEntity
            })
        ),
        WriteFile(
            process.cwd() + routerPath,
            ejs.compile(routerTemplateFile)({
                controllerName: entityName,
                routes: routes,
                capitalizeEntity
            })
        ),
        routerWrite(entityName,false)
    ]);

    // return written files
    return [controllerPath, routerPath];
};
