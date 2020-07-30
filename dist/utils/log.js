"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = exports.rainbow = exports.success = exports.warning = exports.error = exports.logModification = void 0;
/**
 * @module log
 * @description Shortcut module to log colorful text messages
 * @author Deflorenne Amaury
 */
var colors = require("colors/safe");
/**
 *
 * @param {string} fileInfo.fileName File
 * @param {string} fileInfo.type 'add','edit','delete'
 */
function logModification(fileInfo) {
    var typeString = 'add';
    if (fileInfo.type === 'add')
        typeString = 'Created';
    if (fileInfo.type === 'edit')
        typeString = 'Updated';
    if (fileInfo.type === 'delete')
        typeString = 'Deleted';
    exports.info(typeString + " " + fileInfo.fileName);
}
exports.logModification = logModification;
;
//Text with a red cross
function error(text) {
    console.log(colors.red('x') + " " + text);
}
exports.error = error;
;
//Text with a warning symbol
function warning(text) {
    console.log(colors.yellow('!') + " " + text);
}
exports.warning = warning;
;
//Text with a success symbol
function success(text) {
    console.log(colors.green('v') + " " + text);
}
exports.success = success;
;
//Text with rainbow text before
function rainbow(preText, text) {
    console.log(colors.rainbow(preText) + " " + text);
}
exports.rainbow = rainbow;
;
//Text with an info symbol
function info(text) {
    console.log(colors.blue('i') + " " + text);
}
exports.info = info;
;
