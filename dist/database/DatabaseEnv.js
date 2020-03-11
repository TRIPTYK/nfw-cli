"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
var DatabaseEnv = /** @class */ (function () {
    function DatabaseEnv(path) {
        dotenv.config();
        if (typeof path === "string") {
            this.loadFromFile(path);
        }
        if (typeof path === "object")
            this.envVariables = path;
    }
    DatabaseEnv.prototype.loadFromFile = function (path) {
        this.envVariables = dotenv.config({ path: path }).parsed;
    };
    DatabaseEnv.prototype.getEnvironment = function () {
        return this.envVariables;
    };
    return DatabaseEnv;
}());
exports.DatabaseEnv = DatabaseEnv;
