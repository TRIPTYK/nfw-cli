/**
 * @module removeRelationAction
 * @author Verliefden Romain
 * @description removes relation between 2 models
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
var utils = require('./lib/utils');
var project = require('../utils/project');
var removeFromModel = require('./lib/removeFromModel');
var _getModelFromRelationProperty = function (model1Class, model2Class, relation) {
    for (var _i = 0, _a = model1Class.getProperties(); _i < _a.length; _i++) {
        var p = _a[_i];
        for (var _b = 0, _c = p.getDecorators(); _b < _c.length; _b++) {
            var decorator = _c[_b];
            if (decorator.getName() === relation) {
                var type = decorator.getArguments()[0].getReturnType().getSymbol().getEscapedName();
                if (type === model2Class.getName()) {
                    return p;
                }
            }
        }
    }
};
/**
 * Main function
 * @param {string} model1
 * @param {string} model2
 * @returns {Promise<void>}
 */
module.exports = function (model1, model2, type) { return __awaiter(_this, void 0, void 0, function () {
    var relationsMap, model1File, model2File, model1Class, model2Class, p1, p2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!utils.modelFileExists(model1) || !utils.modelFileExists(model2)) {
                    throw new Error('Both model should exist in order to remove a relation between them');
                }
                relationsMap = {
                    otm: ['OneToMany', 'ManyToOne'],
                    oto: ['OneToOne', 'OneToOne'],
                    mto: ['ManyToOne', 'OneToMany'],
                    mtm: ['ManyToMany', 'ManyToMany'],
                };
                model1File = project.getSourceFile("src/api/models/" + model1 + ".model.ts");
                model2File = project.getSourceFile("src/api/models/" + model2 + ".model.ts");
                if (!model1File || !model2File)
                    throw new Error("One of the model does not exists");
                model1Class = model1File.getClasses()[0];
                model2Class = model2File.getClasses()[0];
                p1 = _getModelFromRelationProperty(model1Class, model2Class, relationsMap[type][0]);
                p2 = _getModelFromRelationProperty(model2Class, model1Class, relationsMap[type][1]);
                if (!p1 || !p2)
                    throw new Error("Relation properties not found");
                removeFromModel.removeFromRelationTable(model1, p1.getName());
                removeFromModel.removeFromRelationTable(model2, p2.getName());
                removeFromModel.removeFromSerializer(model1, p1.getName(), model2, true);
                removeFromModel.removeFromSerializer(model2, p2.getName(), model1, true);
                p1.remove();
                p2.remove();
                return [4 /*yield*/, project.save()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
