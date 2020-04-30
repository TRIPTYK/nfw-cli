/**
 * @module switchEnv
 * @description Switch env in nfw file
 * @author Deflorenne Amaury
 */

// Project imports
import commandUtils = require('./commandUtils');
import Log = require('../utils/log');
import Utils = require('../actions/lib/utils');

// node modules
import JsonFileWriter = require('json-file-rw');

//Yargs command
export const command: string = 'switchEnv <env>';

//Yargs command aliases
export const aliases: string[] = ['se'];

//Yargs command description
export const describe: string = 'Switch .nfw current env';

//Yargs command builder
export function builder (yargs: any) {
    yargs.positional('env', {
        type: 'string',
        description: 'Environnement to switch'
    });
};

/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
export async function handler (argv: any): Promise<void> {

    commandUtils.validateDirectory();
    await commandUtils.checkVersion();

    const { env } = argv;

    if (!Utils.getEnvFilesNames().includes(env)) {
        Log.error("This env does not exists");
        process.exit(0);
    }

    const nfwFile = new JsonFileWriter();
    nfwFile.openSync('.nfw');
    nfwFile.setNodeValue('env',env);
    nfwFile.saveSync();

    process.exit();
};
