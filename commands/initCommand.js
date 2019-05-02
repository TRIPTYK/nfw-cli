/**
 * @module initCommand
 * @description Command module to create a database, execute migration and create a super user
 * @author Antoine Samuel
 */
// Project imports
const commandUtils = require('../commands/commandUtils');
const Log = require('../utils/log');
const actionUtils = require('../actions/lib/utils');
const migrateAction = require('../actions/migrateAction');
const createSuperUserAction = require('../actions/createSuperUserAction');
//Node_modules import
const fs = require('fs');
const chalk = require('chalk');
const {Spinner} = require('clui');
/**
 * Yargs command
 * @type {string}
 */
exports.command = 'initialize';

/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ['init'];

/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Create a database if not existing, add tables and creates a super user';

/**
 * Yargs command builder
 */
exports.builder = (yargs) => {
  yargs.option('env', {
   desc: "Allow user to chose which environement to use",
   type: "string",
   default: 'development'
  });
};

/**
 * Main function
 * @return {void}
 */
exports.handler = async(argv) => {
  commandUtils.validateDirectory();

  let files = fs.readdirSync('./');

  // select only env files
  let envFiles = files.filter((file) => file.includes('.env')).map((fileName) => fileName.substr(0, fileName.lastIndexOf('.')));
  if(!envFiles.includes(argv.env)){
    Log.error(`Error: ${argv.env} is not found, available environment are : ${envFiles}`);
    process.exit(0);
  }
  actionUtils.createDataBaseIfNotExists(argv.env);
  const spinner = new Spinner("Generating and executing migration");
  spinner.start();

  await migrateAction("init")
      .then((generated) => {
          const [migrationDir] = generated;
          spinner.stop(true);
          Log.success(`Executed migration successfully`);
          Log.info(`Generated in ${chalk.cyan(migrationDir)}`);
      })
      .catch((e) => {
          spinner.stop(true);
          Log.error(e.message);
      });
  await commandUtils.checkConnectToDatabase();


  await createSuperUserAction("admin")
      .then((generated) => {
          const [ filePath ] = generated;

          Log.info(`Created ${filePath}`);

          console.log(
              chalk.bgYellow(chalk.black('/!\\ WARNING /!\\ :')) +
              `\nYou have generated a Super User named ${chalk.red("admin")} for your API, the credentials are written in the file named \"credentials.json\" located int he root folder, please modify the password as soon as possible, we are not responsible if someone finds it, it is your responsibility to change this password to your own password`
          );
      })
      .catch((e) => {
          Log.error("Failed to create super user : " + e.message);
      });
  process.exit(0);
};
