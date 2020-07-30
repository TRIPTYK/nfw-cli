"use strict";
/**
 * @author Samuel Antoine
 * @module files
 * @description Utils for file manipulation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Files = void 0;
// node modules
var fs = require("fs");
var path = require("path");
var Files = /** @class */ (function () {
    function Files() {
    }
    //description : Check if a directory exists
    Files.prototype.directoryExists = function (filePath) {
        try {
            return fs.statSync(filePath).isDirectory();
        }
        catch (err) {
            return false;
        }
    };
    //description Creates a directory
    Files.prototype.createDirectory = function (filePath) {
        try {
            fs.mkdirSync(filePath);
            return true;
        }
        catch (err) {
            return false;
        }
    };
    //description Check if a file exists
    Files.prototype.fileExists = function (filePath) {
        try {
            return fs.statSync(filePath).isFile();
        }
        catch (err) {
            return false;
        }
    };
    //description Check is the current working directory is a project directory
    Files.prototype.isProjectDirectory = function () {
        return this.fileExists(path.resolve(process.cwd(), ".nfw"));
    };
    return Files;
}());
exports.Files = Files;
;
