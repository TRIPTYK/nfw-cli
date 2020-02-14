/**
 * @module createRelationAction
 * @author Verliefden Romain
 * @description creates relationship between 2 models
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
var plural = require('pluralize').plural;
var stringifyObject = require('stringify-object');
var dashify = require('dashify');
// project object
var project = require('../utils/project');
var Log = require('../utils/log');
// project modules
var _a = require('./lib/utils'), modelFileExists = _a.modelFileExists, columnExist = _a.columnExist, relationExist = _a.relationExist, capitalizeEntity = _a.capitalizeEntity;
/**
 * @description add relationship in the serializer of an entity
 * @param {string} entity
 * @param {string} column
 */
exports.addToSerializer = function (entity, column, model, m1Name, m2Name) {
    var serializerFile = project.getSourceFile("src/api/serializers/" + entity + ".serializer.ts");
    var serializerClass = serializerFile.getClasses()[0];
    var constructor = serializerClass.getConstructors()[0];
    var relationshipsInitializer = constructor.getVariableDeclaration("data").getInitializer().getProperty("relationships").getInitializer();
    var serializerType = dashify(model);
    if (!relationshipsInitializer.getProperty(column)) {
        relationshipsInitializer.addPropertyAssignment({
            name: column,
            initializer: "{type : '" + serializerType + "'}"
        });
    }
    if (constructor.getStructure().statements.findIndex(function (e) {
        if (typeof e === 'string')
            return e.match(new RegExp("this.serializer.register.*" + model)) !== null;
        else
            return false;
    }) === -1) {
        constructor.addStatements(function (writer) {
            writer.write("this.serializer.register(\"" + serializerType + "\",").block(function () {
                writer.write("whitelist : " + capitalizeEntity(model) + "Serializer.whitelist");
            }).write(");");
        });
    }
    serializerFile.fixMissingImports();
    serializerFile.fixUnusedIdentifiers();
    Log.info("Updated " + serializerFile.getFilePath());
};
/**
 * @description add relationship in the controller of an entity
 * @param {string} entity
 * @param {string} column
 */
exports.addToRelation = function (entity, column, otherModel) {
    var relationFile = project.getSourceFile("src/api/enums/json-api/" + entity + ".enum.ts");
    if (!relationFile) {
        Log.info("Cannot find relation enum file , skiping ...");
        return;
    }
    relationFile.getVariableDeclaration(entity + "Relations").getInitializer().addElement("'" + column + "'");
    relationFile.fixMissingImports();
    relationFile.fixUnusedIdentifiers();
    Log.info("Updated " + relationFile.getFilePath());
};
/**
 * @description build the string to write in a model for many to many relationship
 * @param modelClass
 * @param {string} model2 model related to the model you want to write in
 * @param {boolean} isFirst First in the relationship
 * @param {string} name name of the bridging table
 * @param m1Name
 * @param m2Name
 * @return {array} to write in a model for many to many relationship
 */
var _Mtm = function (modelClass, model1, model2, isFirst, name, m1Name, m2Name) {
    var prop = modelClass.addProperty({ name: plural(m2Name), type: capitalizeEntity(model2) + "[]" });
    var args = {};
    prop.addDecorator({ name: "ManyToMany", arguments: ["type => " + capitalizeEntity(model2), model2 + " => " + model2 + "." + plural(m1Name)] }).setIsDecoratorFactory(true);
    if (name)
        args['name'] = name;
    if (isFirst)
        prop.addDecorator({ name: "JoinTable", arguments: [stringifyObject(args)] }).setIsDecoratorFactory(true);
    return prop.getName();
};
/**
 * @description build the string to write in a model for one to one relationship
 * @param modelClass
 * @param model1
 * @param {string} model2 model related to the model you want to write in
 * @param {boolean} isFirst First in the relationship
 * @param {string} name name of the foreignKey in the table
 * @param {string} refCol the column referenced in the foreign key
 * @param m1Name
 * @param m2Name
 * @return {array} to write in a model for one to one relationship
 */
var _Oto = function (modelClass, model1, model2, isFirst, name, refCol, m1Name, m2Name) {
    var prop = modelClass.addProperty({ name: m2Name, type: capitalizeEntity(model2) });
    var args = {};
    if (name)
        args['name'] = name;
    if (refCol)
        args['referencedColumnName'] = refCol;
    prop.addDecorator({ name: "OneToOne", arguments: ["type => " + capitalizeEntity(model2), model2 + " => " + model2 + "." + m1Name] }).setIsDecoratorFactory(true);
    if (isFirst)
        prop.addDecorator({ name: "JoinColumn", arguments: [stringifyObject(args)] }).setIsDecoratorFactory(true);
    return prop.getName();
};
/**
 * @description build the string to write in a model for one to many relationship
 * @param modelClass
 * @param modelClass
 * @param {string} model1 model you want to write in
 * @param {string} model2 model related to the model you want to write in
 * @param m1Name
 * @param m2Name
 * @param {boolean} isFirst First in the relationship
 * @return {array} string to write in a model for one to many relationship
 */
var _Otm = function (modelClass, model1, model2, isFirst, m1Name, m2Name) {
    var prop;
    if (isFirst) {
        prop = modelClass.addProperty({ name: plural(m2Name), type: capitalizeEntity(model2) + "[]" });
        prop.addDecorator({
            name: "OneToMany",
            arguments: ["type => " + capitalizeEntity(model2), model2 + " => " + model2 + "." + m1Name]
        }).setIsDecoratorFactory(true);
    }
    else {
        prop = modelClass.addProperty({ name: m2Name, type: capitalizeEntity(model2) });
        prop.addDecorator({
            name: "ManyToOne",
            arguments: ["type => " + capitalizeEntity(model2), model2 + " => " + model2 + "." + plural(m1Name)]
        }).setIsDecoratorFactory(true);
    }
    return prop.getName();
};
/**
 * @description build the string to write in a model for one to many relationship
 * @param modelClass
 * @param {string} model1 model you want to write in
 * @param {string} model2 model related to the model you want to write in
 * @param {boolean} isFirst First in the relationship
 * @param m1Name
 * @param m2Name
 * @return {array} string to write in a model for one to many relationship
 */
var _Mto = function (modelClass, model1, model2, isFirst, m1Name, m2Name) {
    var prop;
    if (isFirst) {
        prop = modelClass.addProperty({ name: m2Name, type: capitalizeEntity(model2) });
        prop.addDecorator({
            name: "ManyToOne",
            arguments: ["type => " + capitalizeEntity(model2), model2 + " => " + model2 + "." + plural(m1Name)]
        }).setIsDecoratorFactory(true);
    }
    else {
        prop = modelClass.addProperty({ name: plural(m2Name), type: capitalizeEntity(model2) + "[]" });
        prop.addDecorator({
            name: "OneToMany",
            arguments: ["type => " + capitalizeEntity(model2), model2 + " => " + model2 + "." + m1Name]
        }).setIsDecoratorFactory(true);
    }
    return prop.getName();
};
/**
 * @description Define which relation need to be written in the model
 * @param {string} model1 the model you want to write in
 * @param {string} model2 the model that need to be included in the first model
 * @param {boolean} isFirst Does he carry the foreignKey (Oto) or assure that you write JoinTable only in one side of the relation for mtm
 * @param {string} relation Relation type
 * @param {string} name either the name of the foreign key (for oto) or the name of the bridging table (for mtm)
 * @param {string} refCol  for Oto only , name of the referenced column in the foreign key (must be primary or unique)
 * @param m1Name
 * @param m2Name
 */
var _addRelation = function (model1, model2, isFirst, relation, name, refCol, m1Name, m2Name) {
    var addedPropertyName;
    var modelFile = project.getSourceFile("src/api/models/" + model1 + ".model.ts");
    var modelClass = modelFile.getClasses()[0];
    if (relation === 'mtm')
        addedPropertyName = _Mtm(modelClass, model1, model2, isFirst, name, m1Name, m2Name);
    if (relation === 'oto')
        addedPropertyName = _Oto(modelClass, model1, model2, isFirst, name, refCol, m1Name, m2Name);
    if (relation === 'otm')
        addedPropertyName = _Otm(modelClass, model1, model2, isFirst, m1Name, m2Name);
    if (relation === 'mto')
        addedPropertyName = _Mto(modelClass, model1, model2, isFirst, m1Name, m2Name);
    modelFile.fixMissingImports();
    Log.info("Updated " + modelFile.getFilePath());
    exports.addToSerializer(model1, addedPropertyName, model2, m1Name, m2Name);
    exports.addToRelation(model1, addedPropertyName, model2);
};
/**
 *
 * @param {String} model1 one of the model of the relationship
 * @param {String} model2 the second model of the relationship
 * @param {String} relation the relation you want between the two models
 * @param {String} name either the name of the foreign key (for oto) or the name of the bridging table (for mtm)
 * @param {String} refCol for Oto only , name of the referenced column in the foreign key (must be primary or unique)
 * @param m1Name
 * @param m2Name
 * @description  Create a relationship between 2 models
 * @returns {Promise<void>}
 */
module.exports = function (model1, model2, relation, name, refCol, m1Name, m2Name) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!modelFileExists(model1) || !modelFileExists(model2))
                    throw new Error("Both model should exist in order to create a many to many relationship");
                if (columnExist(model1, m2Name) || columnExist(model2, m1Name) || relationExist(model1, m2Name) || relationExist(model2, m1Name))
                    throw new Error("A Column have a name that conflicts with the creation of the relationship in one or both models \n Please use m1Name and m2Name option");
                _addRelation(model1, model2, true, relation, name, refCol, m1Name, m2Name);
                _addRelation(model2, model1, false, relation, name, refCol, m2Name, m1Name);
                return [4 /*yield*/, project.save()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
