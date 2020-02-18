/**
 * @module generateRouteCommand
 * @description Command module to handle route with controller generation
 * @author Deflorenne Amaury
 */

// Node modules imports
import snakeCase = require('to-snake-case');
import chalk from 'chalk';

// Project imports
import commandUtils = require('./commandUtils');
import generateRouterAction = require('../actions/generateRouterAction');
import inquirer = require('../utils/inquirer');
import {lowercaseEntity} from "../actions/lib/utils";
import {fileExists} from '../utils/files';
import Log = require('../utils/log');
import project = require('../utils/project');


//Yargs command
export const command: string = 'createRouter <routeName>';

//Yargs command aliases
export const aliases: string[] = ['gr'];

//Yargs command description
export const describe: string = 'Generate a router with associated controller methods without model';

//Yargs command builder
export function builder() {};

/**
 * Main function
 * @param argv
 * @returns {Promise<void>}
 */
export async function handler (argv: any) {

    commandUtils.validateDirectory();
    await commandUtils.checkVersion();

    const routeName = snakeCase(argv.routeName);
    const lowercase = lowercaseEntity(routeName);
    const controllerPath = `/src/api/controllers/${lowercase}.controller.ts`;

    if (fileExists(process.cwd() + controllerPath)) {
        let {confirmation} = await inquirer.askForConfirmation(`${controllerPath} already exists , do you want to override ?`);

        if (!confirmation) {
            process.exit();
        }
    }

    // const rolesFile = project.getSourceFile('src/api/enums/role.enum.ts'); for later

    // ask template routes information
    let continueAsking = true;
    let routes = [];

    Log.info(`Base route will be : /api/v1/${routeName}`);

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

            continueAskingMethods = (await inquirer.askForConfirmation(`Do you want to add a new method to route /api/v1/${routeName}${routePath} ?`)).confirmation;
        }

        routes.push({
            path: routePath,
            methods: routeMethods
        });

        continueAsking = (await inquirer.askForConfirmation('Do you want to add a new route ?')).confirmation;
    }

    await new generateRouterAction.GenerateRouterActionClass(lowercase, routes).Main()
        .then((writtenPaths) => {
            writtenPaths.forEach((path) => {
                Log.info(`Created ${chalk.cyan(path)}`);
            });
        })
        .catch((error) => {
            console.log(error)
            Log.error('Failed to generate : ' + error.message);
        });

    process.exit();
};
