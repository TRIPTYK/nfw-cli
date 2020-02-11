/**
 * @module sqlAdapatator
 * @description Fetch data from an sql database
 * @author Verliefden Romain
 * @author Deflorenne Amaury
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
// project modules
var mysql = require('mysql');
var util = require('util');
var mysqldump = require('mysqldump');
var bcrypt = require('bcryptjs');
var singular = require('pluralize').singular;
var dotenv = require('dotenv');
var fs = require('fs');
// project imports
var utils = require('../actions/lib/utils');
var DatabaseEnv = /** @class */ (function () {
    /**
     *
     * @param {string} path
     */
    function DatabaseEnv(path) {
        if (typeof path === "string")
            this.loadFromFile(path);
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
var SqlConnection = /** @class */ (function () {
    /**
     *
     * @param {DatabaseEnv} env
     */
    function SqlConnection(env) {
        if (env === void 0) { env = null; }
        if (env)
            this.environement = env.getEnvironment();
    }
    /**
     *
     * @param {DatabaseEnv} env
     */
    SqlConnection.prototype.connect = function (env) {
        if (env === void 0) { env = null; }
        return __awaiter(this, void 0, void 0, function () {
            var connect;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!env)
                            env = this.environement;
                        this.db = mysql.createConnection({
                            host: env.TYPEORM_HOST,
                            user: env.TYPEORM_USER,
                            password: env.TYPEORM_PWD,
                            database: env.TYPEORM_DB,
                            port: env.TYPEORM_PORT,
                            multipleStatements: true
                        });
                        connect = util.promisify(this.db.connect).bind(this.db);
                        return [4 /*yield*/, connect()];
                    case 1:
                        _a.sent();
                        this.query = util.promisify(this.db.query).bind(this.db);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param tableName
     * @returns {Promise<{foreignKeys: *, columns: *}>}
     */
    SqlConnection.prototype.getTableInfo = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var p_columns, p_foreignKeys, _a, columns, foreignKeys;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        p_columns = this.getColumns(tableName);
                        p_foreignKeys = this.getForeignKeys(tableName);
                        return [4 /*yield*/, Promise.all([p_columns, p_foreignKeys])];
                    case 1:
                        _a = _b.sent(), columns = _a[0], foreignKeys = _a[1];
                        return [2 /*return*/, { columns: columns, foreignKeys: foreignKeys }];
                }
            });
        });
    };
    /**
     *
     * @param model1
     * @param model2
     * @returns {Promise<void>}
     */
    SqlConnection.prototype.dropBridgingTable = function (model1, model2) {
        return __awaiter(this, void 0, void 0, function () {
            var result, i, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        model1 = singular(model1);
                        model2 = singular(model2);
                        return [4 /*yield*/, this.query("SELECT DISTINCT TABLE_NAME FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS \n            WHERE CONSTRAINT_SCHEMA = '" + this.environement.TYPEORM_DB + "' \n            AND (REFERENCED_TABLE_NAME ='" + model1 + "' \n            OR REFERENCED_TABLE_NAME='" + model2 + "');\n        ")];
                    case 1:
                        result = _c.sent();
                        i = 0;
                        _c.label = 2;
                    case 2:
                        if (!(i < result.length)) return [3 /*break*/, 6];
                        _b = (_a = utils).isBridgindTable;
                        return [4 /*yield*/, module.exports.getTableInfo(result[i].TABLE_NAME)];
                    case 3:
                        if (!_b.apply(_a, [_c.sent()])) return [3 /*break*/, 5];
                        return [4 /*yield*/, module.exports.dropTable(result[i].TABLE_NAME)];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 2];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @returns {Promise<void>}
     */
    SqlConnection.prototype.getTables = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("SHOW TABLES")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     *
     * @param tableName
     * @returns {Promise<void>}
     */
    SqlConnection.prototype.getForeignKeys = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("SELECT TABLE_NAME,COLUMN_NAME,CONSTRAINT_NAME,REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_SCHEMA='" + this.environement.TYPEORM_DB + "' AND TABLE_NAME='" + tableName + "';")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ;
    /**
     *
     * @param username
     * @returns {Promise<{password: (string|string), login: string}>}
     */
    SqlConnection.prototype.insertAdmin = function (_a) {
        var username = _a.username, mail = _a.mail, _b = _a.role, role = _b === void 0 ? 'admin' : _b, password = _a.password;
        return __awaiter(this, void 0, void 0, function () {
            var possible, i, hashed;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!mail) {
                            mail = username + "@localhost.com";
                        }
                        if (!password) {
                            password = "";
                            possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                            for (i = 0; i < 24; i++)
                                password += possible.charAt(Math.floor(Math.random() * possible.length));
                        }
                        return [4 /*yield*/, bcrypt.hash(password, 10)];
                    case 1:
                        hashed = _c.sent();
                        return [4 /*yield*/, this.query("INSERT INTO user(username, email, firstname, lastname, role, password) VALUES('" + username + "', '" + mail + "','" + username + "','" + username + "','" + role + "', '" + hashed + "')")];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, {
                                login: mail,
                                password: password
                            }];
                }
            });
        });
    };
    /**
     *
     * @param tableName
     * @returns {Promise<boolean>}
     */
    SqlConnection.prototype.tableExists = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("\n            SELECT COUNT(*) as 'count'\n            FROM information_schema.tables\n            WHERE table_schema = '" + this.environement.TYPEORM_DB + "'\n            AND table_name = '" + tableName + "';\n        ").catch(function () { return [{ count: false }]; })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0].count > 0];
                }
            });
        });
    };
    /**
     *
     * @param tableName
     * @returns {Promise<void>}
     */
    SqlConnection.prototype.getColumns = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("SHOW COLUMNS FROM " + tableName + " ;")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     *
     * @param table
     * @param fields
     * @param supplement
     * @returns {Promise<void>}
     */
    SqlConnection.prototype.select = function (table, fields, supplement) {
        if (supplement === void 0) { supplement = ''; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("SELECT " + fields + " from  " + table + " " + supplement)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     *
     * @param databaseName
     * @returns {Promise<void>}
     */
    SqlConnection.prototype.createDatabase = function (databaseName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("CREATE DATABASE IF NOT EXISTS " + databaseName)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     *
     * @param tableName
     * @returns {Promise<void>}
     */
    SqlConnection.prototype.dropTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("DROP TABLE " + tableName + ";")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * @description Delete all foreignKeys that point to a specific table
     * @returns {Promise<void>}
     * @param tableName
     */
    SqlConnection.prototype.getForeignKeysRelatedTo = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("SELECT REFERENCED_TABLE_NAME,TABLE_NAME \n        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE \n        WHERE REFERENCED_TABLE_SCHEMA='" + this.environement.TYPEORM_DB + "' \n        AND REFERENCED_TABLE_NAME='" + tableName + "'\n        OR TABLE_NAME='" + tableName + "'\n        AND REFERENCED_TABLE_NAME IS NOT NULL;\n        ")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * @description return number table of databse
     * @param database
     */
    SqlConnection.prototype.getTablesCount = function (database) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("SELECT count(*) AS TOTALNUMBEROFTABLES \n        FROM INFORMATION_SCHEMA.TABLES \n        WHERE TABLE_SCHEMA = '" + database + "'")];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0].TOTALNUMBEROFTABLES];
                }
            });
        });
    };
    /**
     *
     * @param path
     * @param table
     * @returns {Promise<void>}
     */
    SqlConnection.prototype.dumpTable = function (path, table) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mysqldump({
                            connection: {
                                host: this.environement.TYPEORM_HOST,
                                user: this.environement.TYPEORM_USER,
                                password: this.environement.TYPEORM_PWD,
                                database: this.environement.TYPEORM_DB,
                                port: parseInt(this.environement.TYPEORM_PORT),
                            },
                            dumpToFile: path + '.sql',
                            dump: {
                                tables: [table]
                            }
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param path
     * @param dumpOptions
     * @returns {Promise<void>}
     */
    SqlConnection.prototype.dumpAll = function (path, _a) {
        var dumpOptions = _a.dumpOptions;
        return __awaiter(this, void 0, void 0, function () {
            var options;
            return __generator(this, function (_b) {
                options = {
                    connection: {
                        host: this.environement.TYPEORM_HOST,
                        user: this.environement.TYPEORM_USER,
                        password: this.environement.TYPEORM_PWD,
                        database: this.environement.TYPEORM_DB,
                        port: parseInt(this.environement.TYPEORM_PORT),
                    },
                    dump: dumpOptions
                };
                if (path !== null) {
                    options['dumpToFile'] = path + '.sql';
                }
                return [2 /*return*/, mysqldump(options)];
            });
        });
    };
    return SqlConnection;
}());
exports.DatabaseEnv = DatabaseEnv;
exports.SqlConnection = SqlConnection;
exports.getSqlConnectionFromNFW = function () { return __awaiter(_this, void 0, void 0, function () {
    var nfwFile, nfwEnv, connection;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                nfwFile = fs.readFileSync('.nfw', 'utf-8');
                nfwEnv = JSON.parse(nfwFile).env;
                if (!nfwEnv)
                    nfwEnv = 'development';
                connection = new SqlConnection(new DatabaseEnv(nfwEnv.toLowerCase() + ".env"));
                return [4 /*yield*/, connection.connect()];
            case 1:
                _a.sent();
                return [2 /*return*/, connection];
        }
    });
}); };
