/**
 * @author Samuel Antoine
 * @module files
 * @description Utils for file manipulation
 */

// node modules
const fs = require('fs');
const path = require('path');

module.exports = {
    /**
     * @description Check if a directory exists
     * @returns {boolean}
     */
    directoryExists: (filePath) => {
        try {
            return fs.statSync(filePath).isDirectory();
        } catch (err) {
            return false;
        }
    },
    /**
     * @description Creates a directory
     * @param {string} filePath path
     * @returns {boolean}
     */
    createDirectory: (filePath) => {
        try {
            fs.mkdirSync(filePath);
        } catch (err) {
            return false;
        }
    },
    /**
     * @description Check if a file exists
     * @param {string} filePath path
     * @returns {boolean}
     */
    fileExists: (filePath) => {
        try {
            return fs.statSync(filePath).isFile();
        } catch (err) {
            return false
        }
    },
    /**
     * @description Check is the current working directory is a project directory
     * @returns {boolean}
     */
    isProjectDirectory: () => {
        return module.exports.fileExists(path.resolve(process.cwd(), ".nfw"));
    }
};