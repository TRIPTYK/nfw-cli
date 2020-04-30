/**
 * @author Samuel Antoine
 * @module newAction
 * @description Generates and setup a new boilerplate project
 */

/// node modules
import util = require('util');
import chalk from 'chalk';
//const figlet = require('figlet');
import path = require('path');
import fs = require('fs');
import {Spinner} from 'clui';
import rimraf = require("rimraf");
import mkdirp = require("mkdirp");

// project modules
import {Files} from '../utils/files';
import {Inquirer} from '../utils/inquirer';
import Log = require('../utils/log');
import utils = require('./lib/utils');
import JsonFileWriter = require('json-file-rw');
import EnvFileWriter = require('env-file-rw');

// promisified
const exec = util.promisify(require('child_process').exec);
const rmdir = util.promisify(rimraf);
const renameDir = util.promisify(fs.rename);
const WriteFile = util.promisify(fs.writeFile);

// module vars
let newPath = undefined;


export class NewActionClass {
    
    envVar: any
    name: string;
    defaultEnv: boolean;
    pathOption: boolean;
    yarn: boolean;

    constructor(envVar: any, name: string, defaultenv: boolean, pathoption: boolean, yarn: boolean){
        this.envVar = envVar;
        this.name = name;
        this.defaultEnv = defaultenv;
        this.pathOption = pathoption;
        this.yarn = yarn;
    }

    //description: Generate a new project
    async main(){

        const pckManager = this.yarn ? 'yarn' : 'npm';
        const inquirer = new Inquirer();
        const files = new Files();

        if (this.pathOption) newPath = await inquirer.askForNewPath();
    
        if (files.directoryExists(path.resolve(newPath === undefined ? process.cwd() : newPath.path, "nfw")) || files.directoryExists(path.resolve(newPath === undefined ? process.cwd() : newPath.path, this.name))) {
            console.log(chalk.red('Error :') + `You already have a directory name \"nfw\" or "${this.name}" !`);
            process.exit(0);
        }
    
        //let envVar = undefined;
    
        if (this.defaultEnv) {
            this.envVar.URL = `http://localhost:${this.envVar.PORT}`;
        }

    
        await _gitCloneAndRemove(this.name);
    
        process.chdir(this.name); // set current directory inside boilerplate
    
        const kickstart = new Spinner('Generating app ...');
        kickstart.start();
    
    
        mkdirp.sync("./dist/migration/dump");
        mkdirp.sync("./dist/logs");
        mkdirp.sync("./dist/uploads/documents/xs");
        mkdirp.sync("./dist/uploads/documents/xl");
        mkdirp.sync("./dist/uploads/documents/md");
    
        await exec(`${pckManager} ${this.yarn ? 'add' : 'install'} bcrypt --save`)
            .then(() => console.log(chalk.green("Installed bcrypt successfully")));
        await exec(`${pckManager} ${this.yarn ? '' : 'install'}`)
            .then(() => console.log(chalk.green("Installed packages successfully")));
    
        kickstart.stop();
    
        const setupEnv = this.envVar === undefined ? 'development' : this.envVar.env.toLowerCase();
    
        const config = {
            name: this.name,
            path: process.cwd(),
            env: setupEnv
        };
    
        await WriteFile(`${config.path}/.nfw`, JSON.stringify(config, null, 2))
            .then(() => Log.success("Config file generated successfully"));

    
        if (this.defaultEnv) {
            //Gets .env files from root dir to write env values in each of them
            const extenstion = '.env';
            const files = fs.readdirSync('./');
            const envFiles = files.filter(function(file) {
                return path.extname(file).toLowerCase() === extenstion;
            });

            for (const environmentFile of envFiles) {
                const envFileWriter = new EnvFileWriter(environmentFile);

                envFileWriter.setNodeValue("TYPEORM_HOST",this.envVar.TYPEORM_HOST);
                envFileWriter.setNodeValue("TYPEORM_DB",this.envVar.TYPEORM_DB);
                envFileWriter.setNodeValue("TYPEORM_PORT",this.envVar.TYPEORM_PORT);
                envFileWriter.setNodeValue("TYPEORM_USER",this.envVar.TYPEORM_USER);
                envFileWriter.setNodeValue("TYPEORM_PWD",this.envVar.TYPEORM_PWD);
                envFileWriter.setNodeValue("TYPEORM_TYPE", this.envVar.TYPEORM_TYPE);

                envFileWriter.saveSync();
            }
        }
    
        if(this.envVar.TYPEORM_TYPE === 'mysql'){
            await utils.createDataBaseIfNotExists(setupEnv);
        }
    }
}

/*
 * Git clone and deletes .git folder
 * @param {string} name
 * @returns {Promise<void>}
 */
const _gitCloneAndRemove = async (name: string): Promise<void> => {
    Log.success('Cloning repository  ...');
    const clone = await exec("git clone https://github.com/TRIPTYK/nfw.git --branch=develop");

    if (clone.stderr.length) {
        Log.success('Git repository cloned successfully ....');
    } else {
        Log.error(clone.stdout);
    }

    const newDirPath = `${process.cwd()}/${name}`;

    // rename git folder command
    await renameDir(`${process.cwd()}/nfw`, newDirPath)
        .then(() => Log.success('Renamed directory successfully'));

    await rmdir(`${newDirPath}/.git`)
        .then(() => Log.success('.git folder successfully deleted ...'));

    Log.success("Project successfully set up ....");
};
