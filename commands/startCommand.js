/**
 * node modules imports
 */
const yargs = require('yargs');
const chalk = require('chalk');
const fs = require('fs');
const spawn = require('cross-spawn');
const dotenv = require('dotenv');

/**
 * project imports
 */
const commandUtils = require('./commandUtils');
const Log = require('../generate/log');
const sqlAdaptor = require('../generate/database/sqlAdaptator');

exports.command = 'start';
exports.aliases = [];

exports.describe = 'Start the api server';

exports.builder = (yargs) => {
  yargs.option('env',{
    desc: "Specify the environement type",
    type: "string"
  }),
  yargs.option('monitoring',{
    desc: "Launch monitoring websockets server",
    type: "boolean"
  })
}

exports.handler = async (argv) => {
  commandUtils.validateDirectory();

  let environement = argv.env !== undefined ? argv.env : "development";
  let monitoringEnabled = argv.monitoring !== undefined ? argv.monitoring : false;

  let envFile = dotenv.parse(fs.readFileSync(`${environement}.env`));
  let ormconfigFile = JSON.parse(fs.readFileSync(`ormconfig.json`));

  let mergeNeeded = false;
  if(envFile.TYPEORM_TYPE !== ormconfigFile.type){

  }else if((envFile.TYPEORM_NAME != ormconfigFile.name)){
    mergeNeeded = true;
  }
  if((envFile.TYPEORM_HOST != ormconfigFile.host) && !mergeNeeded){
    mergeNeeded = true;
  }
  if((envFile.TYPEORM_DB != ormconfigFile.database) && !mergeNeeded){
    mergeNeeded = true;
  }
  if((envFile.TYPEORM_USER != ormconfigFile.username) && !mergeNeeded){
    mergeNeeded = true;
  }
  if((envFile.TYPEORM_PWD != ormconfigFile.password) && !mergeNeeded){
    mergeNeeded = true;
  }
  if((parseInt(envFile.TYPEORM_PORT) != ormconfigFile.port) && !mergeNeeded){
    mergeNeeded = true;
  }

  if(mergeNeeded){
      ormconfigFile.name = envFile.TYPEORM_NAME;
      ormconfigFile.host = envFile.TYPEORM_HOST;
      ormconfigFile.database = envFile.TYPEORM_DB;
      ormconfigFile.username = envFile.TYPEORM_USER;
      ormconfigFile.password = (envFile.TYPEORM_PWD);
      ormconfigFile.port = parseInt(envFile.TYPEORM_PORT);
      fs.writeFileSync('ormconfig.json', JSON.stringify(ormconfigFile, null, 1));
      console.log(chalk.green('Successfully updated the ormconfig.json file'))
}

  try {
    await sqlAdaptor.tryConnect();
  }catch(e) {
    if (e.code == 'ER_BAD_DB_ERROR')
    {
        let { canCreate } = await inquirer.askForDatabaseCreation();
        if (canCreate) {
          await sqlAdaptor.createDatabase();
        }
    }else{
      Log.error("Unhandled database connection error : exiting ...");
      process.exit();
    }
  }

  if (monitoringEnabled) {
    let monitoring = spawn(`node`,[`${path.resolve('monitoring','app.js')}`]);
    monitoring.stdout.on('data', (chunk) => {
      console.log(`Monitoring: ${chunk}`)
    });
  }

  let executed = spawn(`ts-node-dev --respawn --transpileOnly ./src/app.bootstrap.ts --env ${environement}`);

  executed.stdout.on('data', (chunk) => {
      console.log(chunk.toString())
  });

  executed.on('close', (code) => {
    console.log(chalk.red(`Process exited with code ${code}`));
  });
}
