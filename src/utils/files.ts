/**
 * @author Samuel Antoine
 * @module files
 * @description Utils for file manipulation
 */

// node modules
import fs = require('fs');
import path = require('path');

export class Files {
    
    //description : Check if a directory exists
    directoryExists (filePath: string): boolean {
        try {
            return fs.statSync(filePath).isDirectory();
        } catch (err) {
            return false;
        }
    }
 
    //description Creates a directory
    createDirectory (filePath: string): boolean {
        try {
            fs.mkdirSync(filePath);
            return true;
        } catch (err) {
            return false;
        }
    }
 
    //description Check if a file exists
    fileExists (filePath: string): boolean {
        try {
            return fs.statSync(filePath).isFile();
        } catch (err) {
            return false
        }
    }
    
    //description Check is the current working directory is a project directory
    isProjectDirectory (): boolean {
        return module.exports.fileExists(path.resolve(process.cwd(), ".nfw"));
    }
};