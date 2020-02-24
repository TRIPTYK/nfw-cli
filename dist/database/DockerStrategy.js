"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MongoDBStrategy = /** @class */ (function () {
    function MongoDBStrategy() {
    }
    MongoDBStrategy.prototype.createDockerContainer = function (name, port, version, password) {
        if (name === void 0) { name = 'nfw_server_mongo'; }
        if (port === void 0) { port = '27017'; }
        if (version === void 0) { version = '4.2'; }
        var dbEnvVariables = {
            host: 'localhost',
            dbType: 'mongo',
            password: password,
            port: port,
            version: version,
            name: name,
            complementaryEnvInfos: "MONGO_INITDB_ROOT_PASSWORD=" + password + " -e MONGO_INITDB_ROOT_USERNAME=root"
        };
        return dbEnvVariables;
    };
    return MongoDBStrategy;
}());
exports.MongoDBStrategy = MongoDBStrategy;
var MysqlStrategy = /** @class */ (function () {
    function MysqlStrategy() {
    }
    MysqlStrategy.prototype.createDockerContainer = function (name, port, version, password) {
        if (name === void 0) { name = 'nfw_server_mysql'; }
        if (port === void 0) { port = '3306'; }
        if (version === void 0) { version = '5.7'; }
        var dbEnvVariables = {
            host: 'localhost',
            dbType: 'mysql',
            password: password,
            port: port,
            version: version,
            name: name,
            complementaryEnvInfos: "MYSQL_ROOT_PASSWORD=" + password
        };
        return dbEnvVariables;
    };
    return MysqlStrategy;
}());
exports.MysqlStrategy = MysqlStrategy;
