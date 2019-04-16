/**
 * @author Samuel Antoine
 * @module files
 * @exports getCurrentDirectoryBase
 * @exports directoryExists
 * @exports creatDirectory
 * @exports fileExists
 * @exports isProjectDirectory
 */
const fs = require('fs');
const path = require('path');
module.exports = {

    /**
     * @description Return the current working directory
     * @returns {string}
     */
    getCurrentDirectoryBase: () => {
        return path.basename(process.cwd());
    },
    /**
     * @description Check if a directory exists
     * @returns {Boolean}
     */
    directoryExists: (filePath) => {
        try {
            return fs.statSync(filePath).isDirectory();
        } catch (err) {
            return false;
        }
    },
    /**
     * @description Create a directory (sync)
     * @param {string} filePath path
     * @returns {boolean}
     */
    creatDirectory: (filePath) => {
        try {
            fs.mkdirSync(filePath);
        } catch (err) {
            return false;
        }
    },
    /**
     * @description Check if a file exists
     * @param {string} filePath path
     * @returns {Boolean}
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
     * @returns {Boolean}
     */
    isProjectDirectory: () => {
        return module.exports.fileExists(path.resolve(process.cwd(), ".nfw"));
    }
};