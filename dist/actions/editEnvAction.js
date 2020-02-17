"use strict";
/**
 * @module editEnvAction
 * @author Samuel Antoine
 * @description Edit existing environment file
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
Object.defineProperty(exports, "__esModule", { value: true });
// Node modules
var fs = require("fs");
// Project modules
var inquirer = require("../utils/inquirer");
var EditEnvActionClass = /** @class */ (function () {
    function EditEnvActionClass(env, chosenOne) {
        this.env = env;
        this.chosenOne = chosenOne;
    }
    //Main function
    EditEnvActionClass.prototype.Main = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, envString, reg, output, writeFileName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, inquirer.editEnvFile(this.chosenOne)];
                    case 1:
                        response = _a.sent();
                        response.NODE_ENV = this.env;
                        response.API_VERSION = "v1";
                        response.PORT = parseInt(response.PORT);
                        response.JWT_EXPIRATION_MINUTES = parseInt(response.JWT_EXPIRATION_MINUTES);
                        response.JIMP_SIZE_XS = parseInt(response.JIMP_SIZE_XS);
                        response.JIMP_SIZE_MD = parseInt(response.JIMP_SIZE_MD);
                        response.JIMP_SIZE_XL = parseInt(response.JIMP_SIZE_XL);
                        if (response.HTTPS_IS_ACTIVE === false) {
                            response.HTTPS_IS_ACTIVE = 0;
                        }
                        else {
                            response.HTTPS_IS_ACTIVE = 1;
                        }
                        if (response.JIMP_IS_ACTIVE === false) {
                            response.JIMP_IS_ACTIVE = 0;
                        }
                        else {
                            response.JIMP_IS_ACTIVE = 1;
                        }
                        envString = JSON.stringify(response, null, '\n');
                        reg = /"(.*)":\s*(".*"|\d+)/gm;
                        output = envString
                            .replace(reg, "$1 = $2")
                            .replace('{', "")
                            .replace('}', '')
                            .replace(/(,)(?!.*,)/gm, "");
                        writeFileName = this.env + ".env";
                        fs.writeFileSync(writeFileName, output);
                        return [2 /*return*/, [writeFileName]];
                }
            });
        });
    };
    return EditEnvActionClass;
}());
exports.EditEnvActionClass = EditEnvActionClass;
