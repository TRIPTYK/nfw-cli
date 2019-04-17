/**
 * @author Samuel Antoine
 * @module New
 * @exports New
 */
const util = require('util');
const chalk = require('chalk');
const figlet = require('figlet');
const operatingSystem = process.platform;
const path = require('path');
const fs = require('fs');
const cmdExists = require('command-exists').sync;
const {Spinner} = require('clui');
const rimraf = require("rimraf");
const exec = util.promisify(require('child_process').exec);
const rmdir = util.promisify(rimraf);
const renameDir = util.promisify(fs.rename);

const files = require('../utils/files');
const inquirer = require('../utils/inquirer');
const commands = require("../static/commands");
const Log = require('../utils/log');

const WriteFile = util.promisify(fs.writeFile);

var newPath = undefined;
let dockerFile = undefined;
let Container_name = undefined;
let dockerEnv = undefined;

/**
 *  @description Generate a new project
 *   @param {string} name Project name
 *   @param defaultEnv
 *   @param {boolean} pathOption Ask for path
 *   @param {boolean} docker Ask for docker env variables
 *   @param {boolean} yarn Install dependencies with yarn
 */
module.exports = async (name, defaultEnv, pathOption, docker, yarn) => {
    console.log(
        chalk.blue(
            figlet.textSync('NFW', {horizontalLayout: 'full', kerning: "fitted"})
        )
    );

    if (pathOption) {
        newPath = await inquirer.askForNewPath();
    }
    if (files.directoryExists(path.resolve(newPath === undefined ? process.cwd() : newPath.path, "3rd_party_ts_boilerplate")) || files.directoryExists(path.resolve(newPath === undefined ? process.cwd() : newPath.path, name))) {
        console.log(chalk.red('Error :') + `You already have a directory name \"3rd_party_ts_boilerplate\" or "${name}" !`);
        process.exit(0);
    }
    if (docker) {
        if (!cmdExists('docker')) {
            console.log(chalk.red('Error: docker is not installed on your device !'));
            process.exit(0);
        } else {
            defaultEnv = true;
            dockerEnv = await inquirer.askForDockerVars();
            Container_name = dockerEnv.Container_name;
            dockerFile = "FROM mysql:5.7 \n" +
                "SHELL [\"/bin/bash\", \"-c\"] \n" +
                `ENV MYSQL_ROOT_PASSWORD ${dockerEnv.MYSQL_ROOT_PASSWORD} \n` +
                `ENV MYSQL_DATABASE ${dockerEnv.MYSQL_DATABASE} \n` +
                `EXPOSE ${dockerEnv.EXPOSE}`;
        }
    }

    let envVar = undefined;

    if (defaultEnv) {
        envVar = await inquirer.askForEnvVariable();
        envVar.URL = `http://localhost:${envVar.PORT}`;
    }

    await _gitCloneAndRemove(name);
    const kickstartCommand = operatingSystem === 'win32' ? yarn ? commands.getYarnCommandsWindows : commands.getNPMCommandsWindows : yarn ? commands.getYarnCommandsUnix : commands.getNPMCommandsUnix;
    await _kickStart(kickstartCommand, name, newPath);

    const config = {
        name: name,
        path: newPath === undefined ? path.resolve(process.cwd(), name) : path.resolve(newPath.path, name)
    };

    await WriteFile(`${config.path}/.nfw`, JSON.stringify(config, null, 4))
        .then(() => Log.success("Config file generated successfully"))
        .catch(e => Log.error(e.message));

    if (process.cwd() !== newPath && newPath !== undefined) {
        console.log(chalk.bgYellow("\n" + chalk.black('/!\\ Warning /!\\')) + chalk.yellow(" If you want to perform any other nfw commands please go to the generated folder -> ") + chalk.blue(path.resolve(newPath.path, name)));
    }
    if (defaultEnv) {
        const envFilePath = newPath === undefined ? path.resolve(process.cwd(), name + `/${envVar.env.toLowerCase()}.env`) : path.resolve(newPath.path, name + `/${envVar.env.toLowerCase()}.env`);
        const ormConfigPath = newPath === undefined ? path.resolve(process.cwd(), name + `/ormconfig.json`) : path.resolve(newPath.path, name + `/ormconfig.json`);
        let envFileContent = await fs.readFileSync(envFilePath).toString();
        const ormConfigRaw = fs.readFileSync(ormConfigPath);
        const ormConfig = JSON.parse(ormConfigRaw);
        const variables = Object.entries(envVar);
        ormConfig.host = variables[2][1];
        ormConfig.port = variables[6][1];
        ormConfig.username = variables[4][1];
        ormConfig.password = variables[5][1];
        ormConfig.database = variables[3][1];
        fs.writeFileSync(ormConfigPath, JSON.stringify(ormConfig, null, '\t'));
        for (const [k, v] of variables) {
            let reg = new RegExp(`^(?<key>${k})\\s*=\\s*(?<value>.+)$`, "gm");
            envFileContent = envFileContent.replace(reg, "$1= " + "'" + v + "'");
        }
        fs.writeFileSync(envFilePath, envFileContent)
    }
    if (docker) {
        const projectPath = newPath === undefined ? path.resolve(process.cwd(), name, "Docker") : path.resolve(newPath.path, name, "Docker");
        files.createDirectory(projectPath);

        fs.writeFileSync(path.resolve(projectPath, "dockerfile"), dockerFile);
        await exec(`docker build ${projectPath} -t ${Container_name.toLowerCase()}`);
        try {
            await exec(`docker run -p ${dockerEnv.EXPOSE}:${dockerEnv.EXPOSE} -d --name=${Container_name} ${Container_name}`);
            console.log(`Container launched and named: ${Container_name}`);
        } catch (err) {
            console.log(err);
            console.log(`Can't start the container run the command below to see the details \n docker run -p ${dockerEnv.EXPOSE}:${dockerEnv.EXPOSE} -d --name=${Container_name} ${Container_name.toLowerCase()}`)
        }
    }
};

const _kickStart = async (command, name, newPath) => {
    const kickstart = new Spinner('Generating app ...');
    kickstart.start();
    const dir = newPath === undefined ? command.currentDirectory + name + "  && " : command.currentDirectory + path.resolve(newPath.path, name) + " && ";

    await exec(dir + command.kickstart)
        .catch(e => Log.error(`Failed to generate project : ${e.message}`))
        .then(() => console.log(chalk.green("Generated successfully, Compiling TypeScript ")));

    await exec(dir + command.compileTypeScript)
        .catch(e => Log.error(`Failed to compile typescript : ${e.message}`))
        .then(() => console.log(chalk.green("Compiled successfully")));

    kickstart.stop();
};

const _gitCloneAndRemove = async (name) => {
    Log.success('Cloning repository  ...');
    const clone = await exec("git clone https://github.com/TRIPTYK/3rd-party-ts-boilerplate.git");

    if (clone.stderr.length) {
        Log.success('Git repository cloned successfully ....');
    } else {
        Log.error(clone.stdout);
    }

    const newDirPath = `${process.cwd()}/${name}`;

    // rename git folder command
    await renameDir(`${process.cwd()}/3rd-party-ts-boilerplate`, newDirPath)
        .then(() => Log.success('Renamed directory successfully'))
        .catch(() => Log.error('Failed to rename directory'));

    await rmdir(`${newDirPath}/.git`)
        .then(() => Log.success('.git folder successfully deleted ...'))
        .catch(() => Log.error('Failed to remove .git directory'));

    Log.success("Project successfully set up ....");
};