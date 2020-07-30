/**
 * @module log
 * @description Shortcut module to log colorful text messages
 * @author Deflorenne Amaury
 */
import colors = require('colors/safe');

/**
 *
 * @param {string} fileInfo.fileName File
 * @param {string} fileInfo.type 'add','edit','delete'
 */
export function logModification (fileInfo: any) {
    let typeString = 'add';

    if (fileInfo.type === 'add') typeString = 'Created';
    if (fileInfo.type === 'edit') typeString = 'Updated';
    if (fileInfo.type === 'delete') typeString = 'Deleted';

    exports.info(`${typeString} ${fileInfo.fileName}`);
};

//Text with a red cross
export function error (text: string) {
    console.log(`${colors.red('x')} ${text}`);
};

//Text with a warning symbol
export function warning (text: string) {
    console.log(`${colors.yellow('!')} ${text}`);
};

//Text with a success symbol
export function success (text: string) {
    console.log(`${colors.green('v')} ${text}`);
};

//Text with rainbow text before
export function rainbow (preText: string, text?: string) {
    console.log(`${colors.rainbow(preText)} ${text}`);
};

//Text with an info symbol
export function info (text: string) {
    console.log(`${colors.blue('i')} ${text}`);
};
