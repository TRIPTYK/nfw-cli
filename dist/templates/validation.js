"use strict";
var project = require("../utils/project");
var TsMorph = require("ts-morph");
var stringifyObject = require("stringify-object");
var utils_1 = require("../actions/lib/utils");
module.exports = function (path, _a) {
    var entities = _a.entities, options = _a.options, entityName = _a.entityName;
    var file = project.createSourceFile(path, null, {
        overwrite: true
    });
    var entityNameCapitalized = utils_1.capitalizeEntity(entityName);
    // filter special columns
    entities = entities.filter(function (entity) { return !['createdAt', 'updatedAt'].includes(entity.Field); });
    entities = entities.filter(function (entity) { return entity.Key !== 'MUL'; });
    file.addStatements(function (writer) { return writer.writeLine("import * as Joi from '@hapi/joi';"); });
    file.addStatements(function (writer) { return writer.writeLine("import Boom from '@hapi/boom';"); });
    file.addStatements(function (writer) { return writer.writeLine("import * as Moment from \"moment-timezone\";"); });
    if (options.read) {
        var variableStatement = file.addVariableStatement({
            declarationKind: TsMorph.VariableDeclarationKind.Const,
            declarations: [
                {
                    name: "get" + entityNameCapitalized,
                    type: "Schema",
                    initializer: stringifyObject({
                        id: {
                            in: ['params'],
                            errorMessage: 'Please provide a valid id',
                            isInt: true
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
                    name: "list" + entityNameCapitalized,
                    type: "Schema",
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
                    name: "create" + entityNameCapitalized,
                    type: "Schema",
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
                    name: "replace" + entityNameCapitalized,
                    type: "Schema",
                    initializer: function (writer) {
                        writer.block(function () {
                            writer.writeLine('...exports.get,');
                            writer.writeLine('...exports.create');
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
                    name: "update" + entityNameCapitalized,
                    type: "Schema",
                    initializer: function (writer) {
                        writer.block(function () {
                            writer.writeLine('...exports.get,');
                            writer.write('...' + stringifyObject(objectsToInsert_1));
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
