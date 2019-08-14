/**
 * @author Samuel Antoine
 * @module newAction
 * @description Generates and setup a new boilerplate project
 */

/// node modules
const util = require('util');
const chalk = require('chalk');
//const figlet = require('figlet');
const path = require('path');
const fs = require('fs');
const {Spinner} = require('clui');
const rimraf = require("rimraf");
const mkdirp = require("mkdirp");

// project modules
const files = require('../utils/files');
const inquirer = require('../utils/inquirer');
const Log = require('../utils/log');
const utils = require('./lib/utils');
const JsonFileWriter = require('json-file-rw');
const EnvFileWriter = require('env-file-rw');

// promisified
const exec = util.promisify(require('child_process').exec);
const rmdir = util.promisify(rimraf);
const renameDir = util.promisify(fs.rename);
const WriteFile = util.promisify(fs.writeFile);

// module vars
let newPath = undefined;

/**
 *  @description Generate a new project
 *  @param {string} name Project name
 *  @param {boolean} defaultEnv
 *  @param {boolean} pathOption Ask for path
 *  @param {boolean} yarn Install dependencies with yarn
 *  @returns {Promise<void>}
 */
module.exports = async (name, defaultEnv, pathOption, yarn) => {
    const pckManager = yarn ? 'yarn' : 'npm';

    if (pathOption) newPath = await inquirer.askForNewPath();

    if (files.directoryExists(path.resolve(newPath === undefined ? process.cwd() : newPath.path, "nfw")) || files.directoryExists(path.resolve(newPath === undefined ? process.cwd() : newPath.path, name))) {
        console.log(chalk.red('Error :') + `You already have a directory name \"nfw\" or "${name}" !`);
        process.exit(0);
    }

    let envVar = undefined;

    if (defaultEnv) {
        envVar = await inquirer.askForEnvVariable();
        envVar.URL = `http://localhost:${envVar.PORT}`;
    }

    await _gitCloneAndRemove(name);

    process.chdir(name); // set current directory inside boilerplate

    const kickstart = new Spinner('Generating app ...');
    kickstart.start();

    mkdirp.sync("./dist/migration/dump");
    mkdirp.sync("./dist/logs");
    mkdirp.sync("./dist/uploads/documents/xs");
    mkdirp.sync("./dist/uploads/documents/xl");
    mkdirp.sync("./dist/uploads/documents/md");

    await exec(`${pckManager} ${yarn ? 'add' : 'install'} bcrypt --save`)
        .then(() => console.log(chalk.green("Installed bcrypt successfully")));
    await exec(`${pckManager} ${yarn ? '' : 'install'}`)
        .then(() => console.log(chalk.green("Installed packages successfully")));

    kickstart.stop();

    const setupEnv = envVar === undefined ? 'development' : envVar.env.toLowerCase();

    const config = {
        name: name,
        path: process.cwd(),
        env: setupEnv
    };

    await WriteFile(`${config.path}/.nfw`, JSON.stringify(config, null, 2))
        .then(() => Log.success("Config file generated successfully"));

    if (defaultEnv) {
        const envFilePath = newPath === undefined ? `${setupEnv}.env` : path.resolve(newPath.path, `${setupEnv}.env`);
        const ormConfigPath = newPath === undefined ? `ormconfig.json` : path.resolve(newPath.path, `ormconfig.json`);

        const envFileWriter = new EnvFileWriter(envFilePath);
        const jsonFileWriter = new JsonFileWriter();
        jsonFileWriter.openSync(ormConfigPath);

        jsonFileWriter.setNodeValue("host",envVar.TYPEORM_HOST);
        jsonFileWriter.setNodeValue("port",envVar.TYPEORM_PORT);
        jsonFileWriter.setNodeValue("username",envVar.TYPEORM_USER);
        jsonFileWriter.setNodeValue("password",envVar.TYPEORM_PWD);
        jsonFileWriter.setNodeValue("database",envVar.TYPEORM_DB);

        envFileWriter.setNodeValue("TYPEORM_HOST",envVar.TYPEORM_HOST);
        envFileWriter.setNodeValue("TYPEORM_DB",envVar.TYPEORM_DB);
        envFileWriter.setNodeValue("TYPEORM_PORT",envVar.TYPEORM_PORT);
        envFileWriter.setNodeValue("TYPEORM_USER",envVar.TYPEORM_USER);
        envFileWriter.setNodeValue("TYPEORM_PWD",envVar.TYPEORM_PWD);

        jsonFileWriter.saveSync();
        envFileWriter.saveSync();
    }

    await utils.createDataBaseIfNotExists(setupEnv);
};

/**
 * Git clone and deletes .git folder
 * @param {string} name
 * @returns {Promise<void>}
 */
const _gitCloneAndRemove = async (name) => {
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
