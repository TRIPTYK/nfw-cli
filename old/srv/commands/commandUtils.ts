/**
 * @module commandUtils
 * @description Functions to help in command modules
 * @author Deflorenne Amaury
 */

// node modules
import chalk from 'chalk';
import fs = require('fs');
import { promisify } from 'util';
import path = require('path');
import util = require('util');
const exec = util.promisify(require('child_process').exec);

// project modules
import {Files} from '../utils/files';
import { SqlConnection } from '../database/sqlAdaptator';
import { DatabaseEnv } from '../database/DatabaseEnv';
import Log = require('../utils/log');
const readFilePromise = promisify(fs.readFile);
import JsonFileWriter = require('json-file-rw');
import dotenv = require('dotenv');
import { AdaptatorStrategy } from '../database/AdaptatorStrategy';


//Check if we are in a valid project directory
export function validateDirectory(): void {
    const filesHelper = new Files();
    if (!filesHelper.isProjectDirectory()) {
        console.log(chalk.bgRed(chalk.black('ERROR ! : You are not in a project directory')));
        process.exit(0);
    }
};

export function checkValidParam (string: string) {
    if (!util.isString(string)) {
        Log.error(`'${string}' must be alphanumeric and not beginning by a number`);
        process.exit();
    }
};

export async function startDockerContainers (environement: string) {
    const nfwFile = new JsonFileWriter();
    nfwFile.openSync(".nfw");
    const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

    if (nfwFile.nodeExists(`${environement}.dockerContainers`)) {
        const containers = nfwFile.getNodeValue(`${environement}.dockerContainers`);

        for (const container of containers) {
            Log.info("Starting your docker container " + container);

            exec(`docker start ${container}`);
        }
    }

    await snooze(1000);
}

export async function checkConnectToDatabase (databaseStrategy: AdaptatorStrategy): Promise<void> {
    try {
        const currentEnv: DatabaseEnv = exports.getCurrentEnvironment().getEnvironment();
        await databaseStrategy.connect(currentEnv);
        //await new SqlConnection(exports.getCurrentEnvironment()).connect();
    }catch(e) {
        Log.error("Can't connect to database : " + e.message);
        process.exit();
    }
};


export function getCurrentEnvironment (): DatabaseEnv {
    const nfwFile = fs.readFileSync('.nfw','utf-8');
    let nfwEnv = JSON.parse(nfwFile).env;

    if (!nfwEnv) nfwEnv = 'development';

    return new DatabaseEnv(`${nfwEnv.toLowerCase()}.env`);
};


export async function checkVersion (): Promise<void> {
    let [packageJsonCLI,packageJsonNFW]: any = await Promise.all(
        [readFilePromise(__baseDir + "/../package.json","utf-8"),readFilePromise(process.cwd() + "/package.json","utf-8")]
    );
    packageJsonCLI = JSON.parse(packageJsonCLI);
    packageJsonNFW = JSON.parse(packageJsonNFW);

    if (packageJsonCLI.version > packageJsonNFW.version)
        Log.warning("Your version of NFW is for an old verson of NFW-CLI , you may encounter unexpected behavior. Consider upgrading your nfw or downgrade your CLI to " + packageJsonNFW.version);
}

