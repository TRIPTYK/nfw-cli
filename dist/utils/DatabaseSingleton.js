"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Singleton = void 0;
var sqlAdaptator_1 = require("../database/sqlAdaptator");
var mongoAdaptator_1 = require("../database/mongoAdaptator");
var commandUtils_1 = require("../commands/commandUtils");
var Singleton = /** @class */ (function () {
    function Singleton() {
    }
    Singleton.getInstance = function () {
        if (!Singleton.instance) {
            Singleton.instance = new Singleton();
            Singleton.instance._databaseStrategy = new sqlAdaptator_1.SqlConnection();
        }
        return Singleton.instance;
    };
    Singleton.prototype.setDatabaseStrategy = function () {
        var type = commandUtils_1.getCurrentEnvironment().envVariables.TYPEORM_TYPE;
        if (type === 'mongodb') {
            return this._databaseStrategy = new mongoAdaptator_1.MongoConnection();
        }
        else {
            return this._databaseStrategy = new sqlAdaptator_1.SqlConnection();
        }
    };
    return Singleton;
}());
exports.Singleton = Singleton;
