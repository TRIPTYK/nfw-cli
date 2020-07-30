"use strict";
var project = require("../utils/project");
var TsMorph = require("ts-morph");
var stringifyObject = require("stringify-object");
var utils_1 = require("../actions/lib/utils");
var pascalcase = require("pascalcase");
var kebab_case_1 = require("@queso/kebab-case");
module.exports = function (path, entityName, _a) {
    var entities = _a.entities, options = _a.options;
    var file = project.createSourceFile(path, null, {
        overwrite: true
    });
    var entityClassName = pascalcase(entityName);
    // filter special columns
    entities = entities.filter(function (entity) { return entity.Key !== "MUL"; });
    file.addStatements(function (writer) { return writer.writeLine("import * as Joi from \"@hapi/joi\";"); });
    file.addStatements(function (writer) { return writer.writeLine("import Boom from \"@hapi/boom\";"); });
    file.addStatements(function (writer) { return writer.writeLine("import * as Moment from \"moment-timezone\";"); });
    file.addStatements(function (writer) { return writer.writeLine("import { ValidationSchema } from \"../../core/types/validation\";"); });
    file.addStatements(function (writer) { return writer.writeLine("import { " + entityClassName + " } from \"../models/" + kebab_case_1.default(entityName) + ".model\";"); });
    if (options.read) {
        var variableStatement = file.addVariableStatement({
            declarationKind: TsMorph.VariableDeclarationKind.Const,
            declarations: [
                {
                    name: "get" + entityClassName,
                    type: "ValidationSchema<" + entityClassName + ">",
                    initializer: stringifyObject({
                        id: {
                            in: ["params"],
                            errorMessage: "Please provide a valid id",
                            isInt: true,
                            toInt: true
                        }
                    })
                }
            ]
        });
        variableStatement.setIsExported(true);
        variableStatement = file.addVariableStatement({
            declarationKind: TsMorph.VariableDeclarationKind.Const,
            declarations: [
                {
                    name: "list" + entityClassName,
                    type: "ValidationSchema<" + entityClassName + ">",
                    initializer: stringifyObject({})
                }
            ]
        });
        variableStatement.setIsExported(true);
        variableStatement.addJsDoc({
            description: "Get validation for " + entityName
        });
    }
    if (options.create) {
        var objectsToInsert = {};
        for (var _i = 0, entities_1 = entities; _i < entities_1.length; _i++) {
            var entity = entities_1[_i];
            objectsToInsert[entity.Field] = utils_1.buildValidationArgumentsFromObject(entity);
        }
        var variableStatement = file.addVariableStatement({
            declarationKind: TsMorph.VariableDeclarationKind.Const,
            declarations: [
                {
                    name: "create" + entityClassName,
                    type: "ValidationSchema<" + entityClassName + ">",
                    initializer: stringifyObject(objectsToInsert)
                }
            ]
        });
        variableStatement.setIsExported(true);
        variableStatement.addJsDoc({
            description: "Create validation for " + entityName
        });
    }
    if (options.update) {
        var variableStatement = file.addVariableStatement({
            declarationKind: TsMorph.VariableDeclarationKind.Const,
            declarations: [
                {
                    name: "replace" + entityClassName,
                    type: "ValidationSchema<" + entityClassName + ">",
                    initializer: function (writer) {
                        writer.block(function () {
                            writer.writeLine("...exports.get" + entityClassName + ",");
                            writer.writeLine("...exports.create" + entityClassName);
                        });
                    }
                }
            ]
        });
        variableStatement.setIsExported(true);
        variableStatement.addJsDoc({
            description: "Replace validation for " + entityName
        });
        var objectsToInsert_1 = {};
        for (var _b = 0, entities_2 = entities; _b < entities_2.length; _b++) {
            var entity = entities_2[_b];
            objectsToInsert_1[entity.Field] = utils_1.buildValidationArgumentsFromObject(entity, true);
        }
        variableStatement = file.addVariableStatement({
            declarationKind: TsMorph.VariableDeclarationKind.Const,
            declarations: [
                {
                    name: "update" + entityClassName,
                    type: "ValidationSchema<" + entityClassName + ">",
                    initializer: function (writer) {
                        writer.block(function () {
                            writer.writeLine("...exports.get" + entityClassName + ",");
                            writer.write("..." + stringifyObject(objectsToInsert_1));
                        });
                    }
                }
            ]
        });
        variableStatement.setIsExported(true);
        variableStatement.addJsDoc({
            description: "Update validation for " + entityName
        });
    }
    file.fixMissingImports();
    return file;
};
