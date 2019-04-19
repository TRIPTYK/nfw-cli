/**
 * Node Modules
 */
const util = require('util');
const fs = require('fs');
const ejs = require('ejs');

const routerWrite = require('./lib/routerWrite');
const {capitalizeEntity} = require("./lib/utils");

const ReadFile = util.promisify(fs.readFile);
const WriteFile = util.promisify(fs.writeFile);

/**
 *
 * @param entityName
 * @param routes
 */
module.exports = async (entityName, routes) => {
    const controllerTemplateFile = await ReadFile(`${__baseDir}/templates/custom/customController.ejs`, 'utf-8');
    const routerTemplateFile = await ReadFile(`${__baseDir}/templates/custom/customRouter.ejs`, 'utf-8');

    const methods = [];

    routes.forEach((route) => {
        route.methods.forEach((method) => {
            methods.push({
                name: method.controllerMethod
            });
        })
    });

    await Promise.all([
        WriteFile(
            `${process.cwd()}/src/api/controllers/${entityName}.controller.ts`,
            ejs.compile(controllerTemplateFile)({
                controllerName: entityName,
                methods: methods,
                capitalizeEntity
            })
        ),
        WriteFile(
            `${process.cwd()}/src/api/routes/v1/${entityName}.route.ts`,
            ejs.compile(routerTemplateFile)({
                controllerName: entityName,
                routes: routes,
                capitalizeEntity
            })
        ),
        routerWrite(entityName)
    ]);
};
