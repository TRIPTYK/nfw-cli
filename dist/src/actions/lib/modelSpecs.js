/**
 * @author Verliefden Romain
 * @module modelSpecs
 * @description TODO
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
// node modules
var colors = require('colors/safe');
//project modules
var inquirer = require('../../utils/inquirer');
var Log = require('../../utils/log');
var columnWritten = [];
/**
 * @description Ask every questions about the column
 * @returns {Promise<null|Array>}
 */
exports.newColumn = function (columnName) {
    if (columnName === void 0) { columnName = null; }
    return __awaiter(_this, void 0, void 0, function () {
        var length, def, uni, paramsTemp, paramsArray, length_enum, arrayDone, name_1, constraintValue, uniqueValue, type, enumTemp, confirm_1, more, defaultValue, lastConfirm;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    Log.info('You can cancel the column at anytime if you write :exit  in an input or choose cancel current column in a choice.');
                    length = '', paramsArray = [], arrayDone = false;
                    if (!!columnName) return [3 /*break*/, 2];
                    return [4 /*yield*/, inquirer.questionColumnName(columnWritten)];
                case 1:
                    name_1 = _a.sent();
                    columnName = name_1.columnName;
                    _a.label = 2;
                case 2:
                    if (columnName === ':exit')
                        return [2 /*return*/, null];
                    return [4 /*yield*/, inquirer.questionColumnKey()];
                case 3:
                    constraintValue = (_a.sent()).constraintValue;
                    if (constraintValue === ':exit')
                        return [2 /*return*/, null];
                    if (!(constraintValue === 'no constraint')) return [3 /*break*/, 5];
                    return [4 /*yield*/, inquirer.questionUnique()];
                case 4:
                    uniqueValue = (_a.sent()).uniqueValue;
                    uni = uniqueValue;
                    return [3 /*break*/, 6];
                case 5:
                    uni = true;
                    _a.label = 6;
                case 6: return [4 /*yield*/, inquirer.questionType(constraintValue)];
                case 7:
                    type = (_a.sent()).type;
                    if (type === ':exit')
                        return [2 /*return*/, null];
                    if (!needLength.includes(type)) return [3 /*break*/, 9];
                    return [4 /*yield*/, inquirer.lengthQuestion(type)];
                case 8:
                    length_enum = _a.sent();
                    if (length_enum.enum === ':exit')
                        return [2 /*return*/, null];
                    else
                        length = length_enum.enum;
                    return [3 /*break*/, 15];
                case 9:
                    if (!(type === 'enum')) return [3 /*break*/, 15];
                    _a.label = 10;
                case 10:
                    if (!!arrayDone) return [3 /*break*/, 14];
                    return [4 /*yield*/, inquirer.enumQuestion()];
                case 11:
                    enumTemp = _a.sent();
                    if (enumTemp.enum === ':exit')
                        return [2 /*return*/, null];
                    return [4 /*yield*/, inquirer.askForConfirmation('add this data ?')];
                case 12:
                    confirm_1 = _a.sent();
                    if (confirm_1.confirmation)
                        length += enumTemp.enum;
                    return [4 /*yield*/, inquirer.askForConfirmation('add more Value ?')];
                case 13:
                    more = _a.sent();
                    if (!more.confirmation)
                        arrayDone = true;
                    return [3 /*break*/, 10];
                case 14:
                    length = length.substr(0, length.length - 1);
                    _a.label = 15;
                case 15:
                    if (!(constraintValue !== 'no constraint' || type.includes('blob') || type.includes('json') || type.includes('text'))) return [3 /*break*/, 16];
                    def = ':no';
                    return [3 /*break*/, 18];
                case 16: return [4 /*yield*/, inquirer.questionDefault(type, length)];
                case 17:
                    defaultValue = (_a.sent()).defaultValue;
                    def = defaultValue;
                    _a.label = 18;
                case 18:
                    if (def === ':exit')
                        return [2 /*return*/, null];
                    console.clear();
                    //Same format as the one send by mysql with a describe query
                    paramsTemp = {
                        Field: columnName,
                        Type: { type: type, length: length },
                        Null: uni ? 'YES' : 'NO',
                        Key: constraintValue,
                        Default: def
                    };
                    console.log(paramsTemp);
                    return [4 /*yield*/, inquirer.askForConfirmation()];
                case 19:
                    lastConfirm = _a.sent();
                    if (lastConfirm.confirmation) {
                        paramsArray['columns'] = paramsTemp;
                        columnWritten[columnWritten.length] = paramsTemp.Field;
                    }
                    return [2 /*return*/, paramsArray];
            }
        });
    });
};
// TODO : move to resources
var needLength = ['int', 'varchar', 'tinyint', 'smallint', 'mediumint', 'bigint', 'char', 'binary', 'varbinary', 'decimal'];
/**
 * @description Ask for createAt,updateAt column then for a new column until user is done
 * @param {string} entity Model name
 * @param entity
 * @returns {Promise<Array>}
 */
exports.dbParams = function (entity) { return __awaiter(_this, void 0, void 0, function () {
    var isDoneColumn, paramsArray, _a, _b, data, confirmation;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                isDoneColumn = false, paramsArray = [];
                paramsArray['columns'] = [];
                paramsArray['foreignKeys'] = [];
                console.log(colors.green("Let's create a table for " + entity));
                console.log(colors.green('/!\\ id is added by default .'));
                _a = paramsArray;
                _b = 'createUpdate';
                return [4 /*yield*/, inquirer.askForCreateUpdate()];
            case 1:
                _a[_b] = _c.sent();
                _c.label = 2;
            case 2:
                if (!!isDoneColumn) return [3 /*break*/, 5];
                return [4 /*yield*/, module.exports.newColumn().catch(function (e) { return console.log(e.message); })];
            case 3:
                data = _c.sent();
                //add value to array that will be returned if value is not null
                if (data != null && data.columns !== undefined)
                    paramsArray['columns'].push(data.columns);
                if (data != null && data.foreignKeys !== undefined)
                    paramsArray['foreignKeys'].push(data.foreignKeys);
                console.clear();
                return [4 /*yield*/, inquirer.askForConfirmation("Want to add more column ? ")];
            case 4:
                confirmation = (_c.sent()).confirmation;
                if (!confirmation)
                    isDoneColumn = true;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/, paramsArray];
        }
    });
}); };
