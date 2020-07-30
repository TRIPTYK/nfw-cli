"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoConnection = void 0;
var DatabaseEnv_1 = require("./DatabaseEnv");
var mongoose = require("mongoose");
var fs = require("fs");
var bcrypt = require("bcryptjs");
var userModel_1 = require("./userModel");
var MongoConnection = /** @class */ (function () {
    function MongoConnection(env) {
        if (env === void 0) { env = null; }
        if (env) {
            this.environement = env.getEnvironment();
        }
    }
    //connection to mongo using mongoose
    MongoConnection.prototype.connect = function (env) {
        if (env === void 0) { env = null; }
        return __awaiter(this, void 0, void 0, function () {
            var uri;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!env) {
                            env = this.environement;
                        }
                        uri = "mongodb://" + env.TYPEORM_USER + ":" + env.TYPEORM_PWD + "@" + env.TYPEORM_HOST + ":" + env.TYPEORM_PORT + "/" + env.TYPEORM_DB;
                        return [4 /*yield*/, mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, authSource: 'admin' })];
                    case 1:
                        _a.sent();
                        this.db = mongoose.connection;
                        return [2 /*return*/];
                }
            });
        });
    };
    //Insert admin into user collection with 'userModel' stored in ./database
    MongoConnection.prototype.insertAdmin = function (_a) {
        var username = _a.username, mail = _a.mail, role = _a.role, password = _a.password;
        return __awaiter(this, void 0, void 0, function () {
            var possible, i, hashed, user;
            return __generator(this, function (_b) {
                switch (_b.label) {
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
                        if (!role) {
                            role = 'admin';
                        }
                        return [4 /*yield*/, bcrypt.hash(password, 10)];
                    case 1:
                        hashed = _b.sent();
                        user = new userModel_1.default({
                            _id: new mongoose.Types.ObjectId(),
                            firstname: username,
                            lastname: username,
                            email: mail,
                            password: hashed,
                            role: role,
                            username: username
                        });
                        return [4 /*yield*/, user.save()];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, {
                                login: mail,
                                password: password
                            }];
                }
            });
        });
    };
    //insert an object containing fields names associated with its value. Obj has the following format:
    //{field1 : value1, field2, value2}
    MongoConnection.prototype.insertIntoTable = function (collName, fields, values) {
        return __awaiter(this, void 0, void 0, function () {
            var obj, index, element, val;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        obj = {
                            _id: new mongoose.Types.ObjectId()
                        };
                        for (index = 0; index < fields.length; index++) {
                            element = fields[index];
                            val = values[index];
                            obj[element] = val;
                        }
                        return [4 /*yield*/, this.db.collection(collName).insertOne(obj)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    //Select the first document from given collection to sample data (used to seed database)
    MongoConnection.prototype.selectFromTable = function (collName, fieldName) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.collection(collName).aggregate([
                            { "$project": { "res": fieldName, "_id": 0 } }
                        ]).toArray()];
                    case 1:
                        results = (_a.sent())[0];
                        return [2 /*return*/, results.res];
                }
            });
        });
    };
    MongoConnection.prototype.dropTable = function (collName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.db.dropCollection(collName)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MongoConnection.prototype.truncateTable = function (collName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dropTable(collName)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MongoConnection.prototype.tableExists = function (collName) {
        return __awaiter(this, void 0, void 0, function () {
            var exists;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.db.listCollections({ name: collName }).hasNext()];
                    case 1:
                        exists = _a.sent();
                        if (exists) {
                            return [2 /*return*/, true];
                        }
                        else
                            return [2 /*return*/, false];
                        return [2 /*return*/];
                }
            });
        });
    };
    //get collection fields names and type. If a collection is empty, throws and error
    //Remove _id and __v from results
    MongoConnection.prototype.getTableInfo = function (collName) {
        return __awaiter(this, void 0, void 0, function () {
            var fields, newColumn, _i, _a, name_1, colType, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.db.collection(collName).aggregate([
                            { "$project": { "arrayofkeyvalue": { "$objectToArray": "$$ROOT" } } },
                            { "$unwind": "$arrayofkeyvalue" },
                            { "$group": { "_id": null, "names": { "$addToSet": "$arrayofkeyvalue.k" } } }
                        ]).toArray()];
                    case 1:
                        fields = (_b.sent())[0];
                        newColumn = [];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 7, , 8]);
                        _i = 0, _a = fields.names;
                        _b.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        name_1 = _a[_i];
                        if (!(name_1 !== '__v' && name_1 !== '_id')) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getTableType(collName, name_1)];
                    case 4:
                        colType = _b.sent();
                        newColumn.push({ Field: name_1, Type: colType });
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        e_1 = _b.sent();
                        if (!fields) {
                            throw Error("One or more collection in you database is empty, please check you database");
                        }
                        else {
                            console.log(e_1);
                        }
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, { columns: newColumn, foreignKeys: [] }];
                }
            });
        });
    };
    MongoConnection.prototype.getTableType = function (collName, name) {
        return __awaiter(this, void 0, void 0, function () {
            var columnType;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.collection(collName).aggregate([
                            { "$project": { "types": { "$type": name } } }
                        ]).toArray()];
                    case 1:
                        columnType = (_a.sent())[0];
                        return [2 /*return*/, columnType.types];
                }
            });
        });
    };
    //list collections
    MongoConnection.prototype.getTables = function () {
        return __awaiter(this, void 0, void 0, function () {
            var collList, collNames, _i, collNames_1, coll;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        collList = [];
                        return [4 /*yield*/, this.db.db.listCollections().toArray()];
                    case 1:
                        collNames = _a.sent();
                        for (_i = 0, collNames_1 = collNames; _i < collNames_1.length; _i++) {
                            coll = collNames_1[_i];
                            collList.push({ Tables_in_nfw: coll.name });
                        }
                        return [2 /*return*/, collList];
                }
            });
        });
    };
    MongoConnection.prototype.getConnectionFromNFW = function () {
        return __awaiter(this, void 0, void 0, function () {
            var nfwFile, nfwEnv, connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nfwFile = fs.readFileSync('.nfw', 'utf-8');
                        nfwEnv = JSON.parse(nfwFile).env;
                        if (!nfwEnv)
                            nfwEnv = 'development';
                        connection = new MongoConnection(new DatabaseEnv_1.DatabaseEnv(nfwEnv.toLowerCase() + ".env"));
                        return [4 /*yield*/, connection.connect()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, connection];
                }
            });
        });
    };
    MongoConnection.prototype.createDatabase = function (dbName) {
        return null;
    };
    return MongoConnection;
}());
exports.MongoConnection = MongoConnection;
