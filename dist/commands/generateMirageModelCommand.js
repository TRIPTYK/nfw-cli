"use strict";
/**
 * @module generateEmberDataModelCommand
 * @description Command module to handle generating ember data model
 * @author Deflorenne Amaury
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.aliases = exports.command = void 0;
// Project imports
const commandUtils = require("./commandUtils");
const Log = require("../utils/log");
const generateMirageModelAction_1 = require("../actions/generateMirageModelAction");
//Yargs command
exports.command = 'generateMirageData [model]';
//Yargs command aliases
exports.aliases = [];
//Yargs command description
exports.describe = 'Generates mirage data';
//Yargs command builder
function builder(yargs) {
    yargs.option('rows', {
        default: 10,
        type: 'number'
    });
    yargs.option('exclude', {
        default: "refresh-token,oauth-token",
        type: 'number'
    });
}
exports.builder = builder;
;
//Main function
async function handler(argv) {
    commandUtils.validateDirectory();
    const { model, rows, exclude } = argv;
    await generateMirageModelAction_1.default(model, rows, exclude.split(','))
        .then(() => {
        Log.success(`Please the content of created folder ./fixtures to mirage/fixtures/`);
    })
        .catch((e) => {
        console.log(e);
        Log.error('Failed to generate model ' + e.message);
    });
    process.exit(0);
}
exports.handler = handler;
;
