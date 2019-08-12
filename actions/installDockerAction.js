const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = async (name = "mysql_nfw_server",port = "3306",version = "5.7",password = "test123*") => {
    let data = await exec(`docker pull mysql:${version}`);
    console.log(data.stdout);

    data = await exec(`docker run --name ${name} -p ${port}:3306 -e MYSQL_ROOT_PASSWORD=${password} -d mysql:${version}`);

    console.log(data.stdout);
};