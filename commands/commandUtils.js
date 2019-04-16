const filesHelper = require('../utils/files');
const chalk = require('chalk');

/**
 *  Check if we are in a valid project directory
 */
exports.validateDirectory = () => {
    if (!filesHelper.isProjectDirectory()) {
        console.log(chalk.bgRed(chalk.black('ERROR ! : You are not in a project directory')));
        process.exit(0);
    }
};
