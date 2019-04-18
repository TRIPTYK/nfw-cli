/**
 * node modules imports
 */
const reservedWords = require('reserved-words');

/**
 * project imports
 */
const commandUtils = require('./commandUtils');
const sqlAdaptor = require('../database/sqlAdaptator');
const generateAction = require('../actions/generateAction');

exports.command = 'generate <modelName> [CRUD]';
exports.aliases = ['gen', 'g'];

exports.describe = 'Generate a new model';

exports.builder = (yargs) => {
    yargs.default('CRUD', 'CRUD');
};

exports.handler = async (argv) => {
    const modelName = argv.modelName;
    const crud = argv.CRUD;

    commandUtils.validateDirectory();
    await sqlAdaptor.checkConnexion();

    if (await reservedWords.check(modelName, 6)) {
        console.log("modelName is a reserved word");
        process.exit(0);
    }

    let crudOptions = {
        create: true,
        read: true,
        update: true,
        delete: true
    };

    if ((/^[crud]{1,4}$/).test(crud)) {
        crudOptions.create = crud.includes('c');
        crudOptions.read = crud.includes('r');
        crudOptions.update = crud.includes('u');
        crudOptions.delete = crud.includes('d');
    }

    generateAction(modelName, crudOptions);
};