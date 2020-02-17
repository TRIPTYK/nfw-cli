import util = require('util');
const exec = util.promisify(require('child_process').exec);
import Log = require('../utils/log');
import { Options,Docker} from 'docker-cli-js';
import { basicModel } from './writeModelAction';


export class InstallDockerActionAclass {
    name: string;
    port: number;
    version: string;
    password: string;

    constructor (name: string, port: number, version: string, password: string){
        this.name = name;
        this.port = port;
        this.version = version;
        this.password = password;
    }

    async Main() {
        const docker = new Docker();

        let data = await exec("docker ps")
            .catch((e) => {
                throw new Error('Cannot find or read docker file , please verify if docker is installed properly or that you have sufficient privileges.');
            });
    
        data = await docker.command(`ps -a`);
    
        const portString = `0.0.0.0:${this.port}->${this.port}/tcp, 33060/tcp`;
        
        const found = data.containerList.find((d) => {
            return d.names === this.name;
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
        
        data = await exec(`docker pull mysql:${this.version}`);
        console.log(data.stdout);
        
        data = await exec(`docker create --name ${this.name} -p ${this.port}:3306 -e MYSQL_ROOT_PASSWORD=${this.password} mysql:${this.version}`);
        console.log(data.stdout);
    }
}