/**
 * Node modules
 */
const reservedWords = require('reserved-words');

/**
 * project imports
 */
const commandUtils = require('./commandUtils');
const sqlAdaptor = require('../database/sqlAdaptator');
const migrateAction = require('../actions/migrateAction');

exports.command = 'migrate  <migrateName>';
exports.aliases = ["mig", "M"];

exports.describe = 'Generate, compile and run the migration';

exports.builder = () => {

};

exports.handler = async (argv) => {
    const modelName = argv.modelName;

    commandUtils.validateDirectory();
    await sqlAdaptor.checkConnexion();

    if (await reservedWords.check(modelName, 6)) {
        console.log(`${modelName} is a reserved word`);
        process.exit(0);
    }

    migrateAction(modelName);
};