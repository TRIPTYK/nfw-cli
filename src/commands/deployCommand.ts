/**
 * @module deployCommand
 * @description Command module to handle project deploy
 * @author Deflorenne Amaury
 */

// Project imports
import commandUtils = require('./commandUtils');
import deployAction = require('./../actions/deployAction');
import Log = require('./../utils/log');

//Yargs command
export const command: string = 'deploy <env> [mode]';

//Yargs command aliases
export const aliases: string[] = ['dep'];

//Yargs command description
export const describe: string = 'Deploy to distant server using pm2';

//Yargs command builder
export function builder (yargs: any) {
    yargs.option('createDatabase', {
        alias: 'db',
        type: 'boolean',
        description: 'Create database'
    })
};


export async function handler (argv: any): Promise<void> {

    const {env,mode,createDatabase} = argv;

    commandUtils.validateDirectory();
    await commandUtils.checkVersion();

    await new deployAction.DeployActionClass(env,mode,createDatabase).main()
        .catch((e) => {
            Log.error(e.message);
        });

    process.exit();
};
