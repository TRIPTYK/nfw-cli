const util = require('util');
const exec = util.promisify(require('child_process').exec);
const Log = require('../utils/log');

module.exports = async (name = "mysql_nfw_server",port = "3306",version = "5.7",password = "test123*") => {
    const docker = new Docker();

    let data = await exec("docker ps")
        .catch((e) => {
            throw new Error('Cannot find or read docker file , please verify if docker is installed properly or that you have sufficient privileges.');
        });

    data = await docker.command(`ps -a`);

    const portString = `0.0.0.0:${port}->${port}/tcp, 33060/tcp`;
    
    const found = data.containerList.find((d) => {
        return d.names === name;
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
    
    data = await exec(`docker pull mysql:${version}`);
    console.log(data.stdout);
    
    data = await exec(`docker create --name ${name} -p ${port}:3306 -e MYSQL_ROOT_PASSWORD=${password} mysql:${version}`);
    console.log(data.stdout);
};