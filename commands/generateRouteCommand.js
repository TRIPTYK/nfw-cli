/**
 * @module generateRouteCommand
 * @description Command module to handle route with controller generation
 * @author Deflorenne Amaury
 */

// Node modules imports
const snakeCase = require('to-snake-case');

// Project imports
const commandUtils = require('./commandUtils');
const generateRouterAction = require('../actions/generateRouterAction');
const inquirer = require('../utils/inquirer');
const {lowercaseEntity} = require("../actions/lib/utils");
const {fileExists} = require('../utils/files');
const Log = require('../utils/log');

/**
 * Yargs command
 * @type {string}
 */
exports.command = 'createRouter <routeName>';

/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ['gr'];

/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Generate a router with associated controller methods without model';

/**
 * Yargs command builder
 */
exports.builder = () => {

};

/**
 * Main function
 * @param argv
 * @returns {Promise<void>}
 */
exports.handler = async (argv) => {
    commandUtils.validateDirectory();

    const routeName = snakeCase(argv.routeName);
    const lowercase = lowercaseEntity(routeName);
    const controllerPath = `/src/api/controllers/${lowercase}.controller.ts`;

    if (fileExists(process.cwd() + controllerPath)) {
        let {confirmation} = await inquirer.askForConfirmation(`${controllerPath} already exists , do you want to override ?`);

        if (!confirmation) {
            process.exit();
        }
    }


    // ask template routes information
    let continueAsking = true;
    let routes = [];

    while (continueAsking) {
        let {routePath} = await inquirer.askRoutePath();
        let routeMethods = [];
        let continueAskingMethods = true;

        while (continueAskingMethods) {
            let {routeMethod, controllerMethod, routeAuthorization} = await inquirer.askRouteData();

            if (routeAuthorization === 'GHOST') routeAuthorization = null; //quick fix because GHOST is by default

            routeMethods.push({
                method: routeMethod,
                authorization: routeAuthorization,
                controllerMethod: controllerMethod
            });

            continueAskingMethods = (await inquirer.askForConfirmation(`Do you want to add a new method to route '${routePath}' ?`)).confirmation;
        }

        routes.push({
            path: routePath,
            methods: routeMethods
        });

        continueAsking = (await inquirer.askForConfirmation('Do you want to add a new route ?')).confirmation;
    }

    await generateRouterAction(lowercase, routes)
        .then((writtenPaths) => {
            writtenPaths.forEach((path) => {
                Log.success(`Created ${path}`);
            });
        })
        .catch((error) => {
            Log.error('Failed to generate : ' + error.message);
        });

    process.exit();
};
