import util = require('util');
const exec = util.promisify(require('child_process').exec);
import Log = require('../utils/log');
import { Options,Docker} from 'docker-cli-js';
import { basicModel } from './writeModelAction';
import { DockerStrategy } from '../database/DockerStrategy';
import { DBEnvVariables } from '../utils/interfaces';

import JsonFileWriter = require('json-file-rw');
import EnvFileWriter = require('env-file-rw');
import { Inquirer } from '../utils/inquirer';


export class InstallDockerActionAclass {
    private strategy: DockerStrategy;
    name: string;
    port: string;
    version: string;
    password: string;

    constructor (strategy: DockerStrategy, name: string, port: string, version: string, password: string) {
        this.strategy = strategy;
        this.name = name;
        this.port = port;
        this.version = version;
        this.password = password;
    }

    setStrategy(strategy: DockerStrategy) {
        this.strategy = strategy;
    }
 
    async main() {
        
        const docker = new Docker();
        const inquirer = new Inquirer();

        let envFileValues: DBEnvVariables = this.strategy.createDockerContainer(this.name, this.port, this.version, this.password);

        let data = await exec("docker ps")
            .catch((e) => {
                throw new Error('Cannot find or read docker file , please verify if docker is installed properly or that you have sufficient privileges.');
            });
    
        data = await docker.command(`ps -a`);
    
        const portString = `0.0.0.0:${envFileValues.port}->${envFileValues.port}/tcp, 33060/tcp`;
        
        const found = data.containerList.find((d: any) => {
            return d.names === envFileValues.name;
        });
    
        if(found) {
            throw new Error(`Container ${found.names} already exists, please use --name to change container name`);
        }
        
        for (let d of data.containerList) {
            if (d.status.includes("Up") && d.ports === portString) {
                Log.warning(`Container ${d.names} is configured with this port and is running`);
            }else{
                Log.info(`Container ${d.names} is configured with this port but is not running`);
            }
        }
        
        data = await exec(`docker pull ${envFileValues.dbType}:${envFileValues.version}`);
        console.log(data.stdout);
        
        data = await exec(`docker create --name ${envFileValues.name} -p ${envFileValues.port}:${envFileValues.port} -e ${envFileValues.complementaryEnvInfos} ${envFileValues.dbType}:${envFileValues.version}`);
        console.log(data.stdout);


        const nfwFile = new JsonFileWriter();
        nfwFile.openSync('.nfw');
        const currentEnv = nfwFile.getNodeValue("env","development");
        const array = nfwFile.getNodeValue(`${currentEnv}.dockerContainers`,[]);
        array.push(envFileValues.name);
        nfwFile.saveSync();

        Log.success(`Your docker container was created on localhost , port ${envFileValues.port} with ${envFileValues.dbType} version ${envFileValues.version} and password ${envFileValues.password}`);

        const {confirmation} = await inquirer.askForConfirmation("Do you want to update your current environment file with these values ?");

        if (confirmation) {
            const envFileWriter = new EnvFileWriter(currentEnv + '.env');
            envFileWriter.setNodeValue('TYPEORM_HOST',envFileValues.host);
            envFileWriter.setNodeValue('TYPEORM_TYPE',envFileValues.dbType);
            envFileWriter.setNodeValue('TYPEORM_PWD',envFileValues.password);
            envFileWriter.setNodeValue('TYPEORM_PORT',envFileValues.port);
            envFileWriter.saveSync();
        }
        
    }
}