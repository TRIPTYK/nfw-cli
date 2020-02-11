/**
 * @module utils
 * @description utilities for project
 * @author Deflorenne Amaury
 * @author Verliefden Romain
 * @author Sam Antoine
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
// node modules
var FS = require('fs');
var readline = require('readline');
var snake = require('to-snake-case');
var removeAccent = require('remove-accents');
var reservedWords = require('reserved-words');
var project = require('../../utils/project');
var _a = require('../../database/sqlAdaptator'), SqlConnection = _a.SqlConnection, DatabaseEnv = _a.DatabaseEnv;
/**
 * @description : Count the lines of a file
 * @param {string} path File path
 * @returns {Promise<number>}
 */
exports.countLines = function (path) {
    var count = 0;
    return new Promise(function (resolve, reject) {
        try {
            FS.createReadStream(path)
                .on('data', function (chunk) {
                var i;
                for (i = 0; i < chunk.length; ++i)
                    if (chunk[i] === 10)
                        count++; // 10 -> line ending in ASCII table
            })
                .on('end', function () {
                resolve(count); // return promise
            });
        }
        catch (e) {
            reject(e.message);
        }
    });
};
/**
 * @description prompt a question and wait for a response
 * @param {string} question
 * @returns {Promise<string>}
 */
exports.prompt = function (question) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(function (res) {
        rl.question(question, function (answer) {
            res(answer);
            rl.close();
        });
    });
};
/**
 * @description Check if import is present in string
 * @param {string} string
 * @param {string} importName import name
 * @returns {boolean}
 */
exports.isImportPresent = function (string, importName) {
    var match = string.match(new RegExp("import\\s+{.*" + importName + "\\b.*}.*;", 'gm'));
    return match !== null;
};
/**
 * @description replace text to the first empty line of string
 * @param {string} string
 * @param {string} by text to replace by
 * @returns {string}
 */
exports.writeToFirstEmptyLine = function (string, by) {
    if (by === void 0) { by = ""; }
    return string.replace(/^\s*$/m, by);
};
/**
 * @description remove blank lines from text
 * @param {string} string
 * @returns {string}
 */
exports.removeEmptyLines = function (string) { return string.replace(/\n?^\s*$/gm, ""); };
/**
 * @description check if model file exists in projet
 * @param {string} entity
 * @returns {boolean}
 */
exports.modelFileExists = function (entity) { return exports.fileExists(process.cwd() + "/src/api/models/" + exports.lowercaseEntity(entity) + ".model.ts"); };
/**
 * @description capitalize first letter of String
 * @param {string} entity
 * @returns {string}
 */
exports.capitalizeEntity = function (entity) { return entity[0].toUpperCase() + entity.substr(1); };
/**
 * @description lowercase first letter of string
 * @param {string} entity
 * @returns {string}
 */
exports.lowercaseEntity = function (entity) { return entity[0].toLowerCase() + entity.substr(1); };
/**
 * @description transform an sql type string to an object with type and length
 * @param {string} type
 * @returns {object}
 */
exports.sqlTypeData = function (type) { return /(?<type>\w+)(?:\((?<length>.+)\))?/.exec(type).groups; };
/**
 * @description check if file exists
 * @param {string} filePath
 * @returns {boolean}
 */
exports.fileExists = function (filePath) {
    try {
        return FS.statSync(filePath).isFile();
    }
    catch (err) {
        return false;
    }
};
/**
 * @description Create a validation to a generated model
 * @param {column} column Column name
 * @returns {object}
 */
exports.buildJoiFromColumn = function (column) {
    var _a = column.Type, length = _a.length, type = _a.type;
    var joiObject = {
        name: column.Field,
        baseType: "any",
        specificType: null,
        length: length,
        baseColumn: column,
    };
    if (type.match(/text|char/i))
        joiObject.baseType = "string";
    if (type.match(/time|date/i))
        joiObject.baseType = "date";
    if (type.match(/binary|image|blob/i))
        joiObject.baseType = "binary";
    if (type.match(/int|float|double|decimal/i)) {
        joiObject.baseType = "number";
        joiObject.length = null;
        if (type === "int")
            joiObject.specificType = "integer";
    }
    return joiObject;
};
/**
 * @description Check if a table is a bridging table in a many to many relationship
 * @returns {boolean}
 * @param {string} entity
 */
exports.isBridgindTable = function (entity) {
    var columns = entity.columns, foreignKeys = entity.foreignKeys;
    columns = columns.filter(function (column) {
        return foreignKeys.find(function (elem) { return elem.COLUMN_NAME === column.Field; }) === undefined;
    });
    return columns.length === 0;
};
/**
 * @description Check if a column exist in a database table
 * @param {string} model Model name
 * @param {string} column Column name
 * @returns {boolean}
 */
exports.columnExist = function (model, column) {
    var modelClass = project.getSourceFile("src/api/models/" + module.exports.lowercaseEntity(model) + ".model.ts").getClasses()[0];
    return modelClass.getInstanceProperty(column) !== undefined;
};
/**
 * Check if relation exists in model
 * @param {string} model
 * @param {string} column
 * @returns {boolean}
 */
exports.relationExist = function (model, column) {
    var modelClass = project.getSourceFile("src/api/models/" + module.exports.lowercaseEntity(model) + ".model.ts").getClasses()[0];
    var relProp = modelClass.getInstanceMember(column);
    if (relProp) {
        relProp.getDecorator(function (declaration) {
            return declaration.getName().includes('To');
        });
    }
    return false;
};
/**
 * Sanitize string : removes accents and transform to snake_case
 * @param name
 * @returns {String}
 */
exports.format = function (name) {
    return snake(removeAccent(name));
};
/**
 *
 * @param string
 * @returns {Promise<Response | undefined> | *}
 */
exports.isAlphanumeric = function (string) {
    return string.match(/(?:^|(?<= ))[a-zA-Z0-9]+(?= |$)/);
};
/**
 *
 * @param string
 * @returns {Promise<Response | undefined> | *}
 */
exports.isValidVarname = function (string) {
    return string.match(/^[a-zA-Z_$][a-zA-Z_$0-9]*$/);
};
/**
 *
 * @param string
 * @returns {boolean}
 */
exports.isValidParam = function (string) { return !exports.isValidVarname(string) || !reservedWords.check(string, 6); };
exports.createDataBaseIfNotExists = function (setupEnv) { return __awaiter(_this, void 0, void 0, function () {
    var env, sqlConnection, currentEnvData, e_1, clonedEnv;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                env = new DatabaseEnv(setupEnv + ".env");
                sqlConnection = new SqlConnection();
                currentEnvData = env.getEnvironment();
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 8]);
                return [4 /*yield*/, sqlConnection.connect(env.getEnvironment())];
            case 2:
                _a.sent();
                return [3 /*break*/, 8];
            case 3:
                e_1 = _a.sent();
                clonedEnv = __assign({}, currentEnvData);
                delete clonedEnv.TYPEORM_DB;
                return [4 /*yield*/, sqlConnection.connect(clonedEnv)];
            case 4:
                _a.sent();
                if (!(e_1.code === 'ER_BAD_DB_ERROR')) return [3 /*break*/, 6];
                return [4 /*yield*/, sqlConnection.createDatabase(env.getEnvironment().TYPEORM_DB)];
            case 5:
                _a.sent();
                return [3 /*break*/, 7];
            case 6: throw new Error("Unhandled database connection error (" + e_1.code + ") : exiting ...");
            case 7: return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
/**
 *
 * @param dbColumnaData object
 */
exports.buildModelColumnArgumentsFromObject = function (dbColumnaData) {
    var columnArgument = {};
    columnArgument['type'] = dbColumnaData.Type.type;
    //handle default
    if (dbColumnaData.Default !== ":no")
        columnArgument['default'] = dbColumnaData.Default;
    if (dbColumnaData.Default === null && dbColumnaData.Null === 'NO')
        delete columnArgument['default'];
    //handle nullable
    if (dbColumnaData.Key !== 'PRI' && dbColumnaData.Key !== 'UNI') {
        columnArgument['nullable'] = dbColumnaData.Null === 'YES';
    }
    else if (dbColumnaData.Key === 'UNI')
        columnArgument['unique'] = true;
    else if (dbColumnaData.Key === 'PRI')
        columnArgument['primary'] = true;
    //handle length
    if (dbColumnaData.Type.type === "enum") {
        columnArgument['enum'] = dbColumnaData.Type.length.split(',').map(function (e) { return e.replace(/'|\\'/g, ""); });
        return columnArgument;
    }
    if (dbColumnaData.Type.type === 'decimal') {
        var _a = dbColumnaData.Type.length.split(','), precision = _a[0], scale = _a[1];
        columnArgument['precision'] = parseInt(precision);
        columnArgument['scale'] = parseInt(scale);
        return columnArgument;
    }
    if (dbColumnaData.Type.length !== undefined && dbColumnaData.Type.length !== '') {
        var length_1 = parseInt(dbColumnaData.Type.length);
        if (dbColumnaData.Type.type.includes('int'))
            columnArgument['width'] = length_1;
        else if (dbColumnaData.Type.type.includes('date') || dbColumnaData.Type.type.includes('time') || dbColumnaData.Type.type === 'year')
            columnArgument['precision'] = length_1;
        else
            columnArgument['length'] = length_1;
    }
    return columnArgument;
};
/**
 *
 * @param dbColumnaData object
 * @param isUpdate
 */
exports.buildValidationArgumentsFromObject = function (dbColumnaData, isUpdate) {
    if (isUpdate === void 0) { isUpdate = false; }
    var validationArguments = {};
    if (!isUpdate && dbColumnaData.Null !== 'NO' && dbColumnaData.Default !== 'NULL' && !(['createdAt', 'updatedAt'].includes(dbColumnaData.Field)))
        validationArguments['exists'] = true;
    else
        validationArguments['optional'] = {
            options: {
                nullable: true,
                checkFalsy: true
            }
        };
    if (dbColumnaData.Type.length)
        validationArguments['isLength'] = {
            errorMessage: "Maximum length is " + dbColumnaData.Type.length,
            options: { min: 0, max: parseInt(dbColumnaData.Type.length) }
        };
    else
        validationArguments['optional'] = true;
    if (dbColumnaData.Field === 'email')
        validationArguments['isEmail'] = {
            errorMessage: 'Email is not valid'
        };
    if (dbColumnaData.Type.type.includes('text') || dbColumnaData.Type.type.includes('char')) {
        validationArguments['isString'] = {
            errorMessage: 'This field must be a string'
        };
    }
    if (dbColumnaData.Type.type === 'decimal') {
        validationArguments['isDecimal'] = {
            errorMessage: 'This field must be decimal'
        };
    }
    if (dbColumnaData.Type.type === 'int') {
        if (dbColumnaData.Type.length !== 1) {
            validationArguments['isInt'] = {
                errorMessage: 'This field must be an integer'
            };
        }
        else {
            delete validationArguments['isLength'];
            validationArguments['isBoolean'] = {
                errorMessage: 'This field must be a boolean'
            };
        }
    }
    if (dbColumnaData.Type.type.includes('time') || dbColumnaData.Type.type.includes('date')) {
        delete validationArguments['isLength'];
        validationArguments['custom'] = {
            errorMessage: 'This field is not a valid date',
            options: function (date) {
                return Moment(date, true).isValid();
            }
        };
    }
    if (dbColumnaData.Type.type === 'enum') {
        delete validationArguments['isLength'];
        validationArguments['isIn'] = {
            errorMessage: "Must be in these values : " + dbColumnaData.Type.length,
            options: [dbColumnaData.Type.length.split(',').map(function (e) { return e.replace(/'|\\'/g, ""); })]
        };
    }
    return validationArguments;
};
/**
 * Get env files in directory
 * @param {string} directory
 * @return {string[]}
 */
exports.getEnvFilesNames = function (directory) {
    if (directory === void 0) { directory = '.'; }
    var files = FS.readdirSync(directory);
    // select only env files
    return files
        .filter(function (file) { return file.includes('.env'); })
        .map(function (fileName) { return fileName.substr(0, fileName.lastIndexOf('.')); });
};
