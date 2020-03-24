"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sqlAdaptator_1 = require("../database/sqlAdaptator");
var mongoAdaptator_1 = require("../database/mongoAdaptator");
var JsonFileWriter = require("json-file-rw");
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
        var nfwConfig = new JsonFileWriter();
        nfwConfig.openSync('./ormconfig.json');
        var currentDB = nfwConfig.getNodeValue('type');
        if (currentDB === 'mongodb') {
            return this._databaseStrategy = new mongoAdaptator_1.MongoConnection();
        }
        else {
            return this._databaseStrategy = new sqlAdaptator_1.SqlConnection();
        }
    };
    return Singleton;
}());
exports.Singleton = Singleton;
