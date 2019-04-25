/**
 * @author Verliefden Romain
 * @module editModelAction
 * @description Edit a model
 */

// project modules
const removeColumn = require('./lib/removeFromModel');
const modelWrite = require('./writeModelAction');
const modelSpecs = require('./lib/modelSpecs');
const Log = require('../utils/log');
const migrate = require('./migrateAction');
const {format} = require('../actions/lib/utils');

const {Spinner} = require('clui');
const chalk = require('chalk');

/**
 * Main function
 * @param {string} action
 * @param {string} model Model name
 * @param {string|null} column Column name
 * @returns {Promise<void>}
 */
module.exports = async (action, model, column = null) => {
    model = format(model);
    const spinner = new Spinner("Generating and executing migration");

    if (action === 'remove')
        await removeColumn(model, column, false)
            .then(async () => {
                Log.success('Column successfully removed');
                spinner.start();
                await migrate(`add-to-${model}`)
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
            });

    if (action === 'add') {
        let data = await modelSpecs.newColumn();
        await modelWrite.addColumn(model, data)
            .then(async () =>{
                Log.success('Column successfully added');
                spinner.start();
                await migrate(`remove-${column}-from-${model}`)
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
            });
    }

    process.exit(0);
};