/**
 * @module log
 * @description Shortcut module to log colorful text messages
 * @author Deflorenne Amaury
 */
const colors = require('colors/safe');

/**
 *
 * @param {string} fileInfo.fileName File
 * @param {string} fileInfo.type 'add','edit','delete'
 */
exports.logModification = (fileInfo) => {
    let typeString = 'add';

    if (fileInfo.type === 'add') typeString = 'Created';
    if (fileInfo.type === 'edit') typeString = 'Updated';
    if (fileInfo.type === 'delete') typeString = 'Deleted';

    exports.info(`${typeString} ${fileInfo.fileName}`);

};

/**
 * Text with a red cross
 * @param {string} text Log text
 */
exports.error = text => {
    console.log(`${colors.red('x')} ${text}`);
};

/**
 * Text with a warning symbol
 * @param {string} text Log text
 */
exports.warning = text => {
    console.log(`${colors.yellow('!')} ${text}`);
};

/**
 * Text with a success symbol
 * @param {string} text Log text
 */
exports.success = text => {
    console.log(`${colors.green('v')} ${text}`);
};

/**
 * Text with rainbow text before
 * @param {string} preText Rainbow-color text
 */
exports.rainbow = preText => {
    console.log(`${colors.rainbow(preText)} ${text}`);
};

/**
 * Text with an info symbol
 * @param {string} text Log text
 */
exports.info = text => {
    console.log(`${colors.blue('i')} ${text}`);
};
