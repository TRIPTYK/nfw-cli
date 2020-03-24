"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../actions/lib/utils");
var project = require("../utils/project");
var ts_morph_1 = require("ts-morph");
/**
 *
 * @param path
 * @param className
 * @param options
 * @param entityName
 */
function main(path, _a) {
    var className = _a.className, options = _a.options, entityName = _a.entityName;
    var file = project.createSourceFile(path, null, {
        overwrite: true
    });
    file.addStatements(function (writer) { return writer.writeLine("import Boom from '@hapi/boom';"); });
    file.addStatements(function (writer) { return writer.writeLine("import * as HttpStatus from 'http-status';"); });
    file.addStatements(function (writer) { return writer.writeLine("import {Request , Response} from \"express\";"); });
    var entityNameCapitalized = utils_1.capitalizeEntity(entityName);
    var controllerClass = file.addClass({
        name: className
    });
    controllerClass.setIsDefaultExport(true);
    controllerClass.addDecorator({
        name: "Controller",
        arguments: ["\"" + entityName + "\""]
    }).setIsDecoratorFactory(true);
    controllerClass.addDecorator({ name: "RouteMiddleware", arguments: ["DeserializeMiddleware, " + entityNameCapitalized + "Serializer"] });
    controllerClass.addDecorator({ name: "autoInjectable", arguments: [] });
    var middlewareFunctionParameters = [
        { type: 'Request', name: 'req' },
        { type: 'Response', name: 'res' }
    ];
    controllerClass.addProperty({
        scope: ts_morph_1.Scope.Private,
        name: 'repository',
        type: entityNameCapitalized + "Repository"
    });
    controllerClass.addConstructor({
        scope: ts_morph_1.Scope.Public,
        parameters: [{
                name: "private serializer?: " + entityNameCapitalized + "Serializer",
            }],
        statements: [
            "this.repository = getCustomRepository(" + entityNameCapitalized + "Repository);"
        ],
    });
    if (options.read) {
        var getMethod = controllerClass.addMethod({
            name: 'get',
            parameters: middlewareFunctionParameters
        });
        getMethod.addJsDoc(function (writer) {
            writer.writeLine("@description GET " + entityName + " by id");
            writer.writeLine("@throws {Boom.notFound()}");
            writer.writeLine("@return {any} result to send to client");
        });
        getMethod.toggleModifier("public").toggleModifier("async")
            .addStatements([
            "const " + entityName + " = await this.repository.jsonApiFindOne(req,req.params.id," + entityName + "Relations);",
            "if (!" + entityName + ") { throw Boom.notFound(\"" + entityNameCapitalized + " not found\"); }",
            "return this.serializer.serialize(" + entityName + ");",
        ]);
        getMethod.addDecorator({
            name: "Get",
            arguments: ["\"/:id\""]
        });
        var listMethod = controllerClass.addMethod({
            name: 'list',
            parameters: middlewareFunctionParameters
        });
        listMethod.addDecorator({
            name: 'Get',
            arguments: ["\"/\""]
        });
        listMethod.toggleModifier("public").toggleModifier("async");
        listMethod.addStatements([
            "const [" + entityName + ", total" + entityNameCapitalized + "] = await this.repository.jsonApiRequest(req.query," + entityName + "Relations).getManyAndCount();",
            "if(req.query.page) {\n                return new " + entityNameCapitalized + "Serializer({\n                    pagination: {\n                        page: parseInt(req.query.page.number, 10),\n                        size: parseInt(req.query.page.size, 10),\n                        total: total" + entityNameCapitalized + ",\n                        url: req.url\n                    }\n                }).serialize(" + entityName + ");\n            }",
            "return this.serializer.serialize(" + entityName + ");"
        ]);
        listMethod.addJsDoc(function (writer) {
            writer.writeLine("@description LIST " + entityName);
            writer.writeLine("@return {any} result to send to client");
        });
        var relatedMethod = controllerClass.addMethod({
            name: 'fetchRelated',
            parameters: middlewareFunctionParameters
        });
        relatedMethod.toggleModifier('public').toggleModifier('async');
        relatedMethod.addStatements([
            "return this.repository.fetchRelated(req, this.serializer);"
        ]);
        relatedMethod.addDecorator({
            name: 'Get',
            arguments: ["\"/:id/:relation\""]
        });
        relatedMethod.addJsDoc(function (writer) {
            writer.writeLine("@description Get related " + entityName + " entities");
            writer.writeLine("@return");
        });
        var relationshipsMethod = controllerClass.addMethod({
            name: 'fetchRelationships',
            parameters: middlewareFunctionParameters
        });
        relationshipsMethod.toggleModifier('public').toggleModifier('async');
        relationshipsMethod.addStatements([
            "return this.repository.fetchRelationshipsFromRequest(req, this.serializer);"
        ]);
        relationshipsMethod.addDecorator({
            name: 'Get',
            arguments: ["\"/:id/relationships/:relation\""]
        });
        relationshipsMethod.addJsDoc(function (writer) {
            writer.writeLine("@description Get " + entityName + " relationships");
            writer.writeLine("@return {array} of relationships id and type");
        });
    }
    if (options.create) {
        var createMethod = controllerClass.addMethod({
            name: 'create',
            parameters: middlewareFunctionParameters
        });
        createMethod.toggleModifier('public').toggleModifier('async').addStatements([
            "const " + entityName + " = this.repository.create(req.body);",
            "await this.repository.insert(" + entityName + ");",
            "res.status(HttpStatus.CREATED);",
            "return this.serializer.serialize(" + entityName + ");"
        ]);
        createMethod.addDecorator({
            name: 'Post',
            arguments: ["\"/\""]
        });
        createMethod.addDecorator({
            name: 'MethodMiddleware',
            arguments: ["DeserializeRelationsMiddleware, { schema : " + entityNameCapitalized + "SerializerSchema }"]
        });
        createMethod.addDecorator({
            name: 'MethodMiddleware',
            arguments: ["ValidationMiddleware, { schema: create" + entityNameCapitalized + " }"]
        });
        createMethod.addJsDoc(function (writer) {
            writer.writeLine("@description CREATE " + entityName);
            writer.writeLine("@return {any} result to send to client");
        });
        var addRelationshipsMethod = controllerClass.addMethod({
            name: 'addRelationships',
            parameters: middlewareFunctionParameters
        });
        addRelationshipsMethod.toggleModifier('public').toggleModifier('async');
        addRelationshipsMethod.addStatements([
            "await this.repository.addRelationshipsFromRequest(req);",
            "res.sendStatus(HttpStatus.NO_CONTENT).end();"
        ]);
        addRelationshipsMethod.addDecorator({
            name: 'Post',
            arguments: ["\"/:id/relationships/:relation\""]
        });
        addRelationshipsMethod.addJsDoc(function (writer) {
            writer.writeLine("@description Add " + entityName + " relationships");
            writer.writeLine("@return");
        });
    }
    if (options.update) {
        var updateMethod = controllerClass.addMethod({
            name: 'update',
            parameters: middlewareFunctionParameters
        });
        updateMethod.toggleModifier('public').toggleModifier('async');
        updateMethod.addStatements([
            "let saved = await this.repository.preload({\n                ...req.body, ...{id: req.params.id}\n            } as any);",
            "if (saved === undefined) {\n                throw Boom.notFound(\"" + entityNameCapitalized + " not found\");\n            }",
            "saved = await this.repository.save(saved);",
            "return this.serializer.serialize(saved);"
        ]);
        updateMethod.addDecorator({
            name: 'Patch',
            arguments: ["\"/:id\""]
        });
        updateMethod.addDecorator({
            name: 'Put',
            arguments: ["\"/:id\""]
        });
        updateMethod.addDecorator({
            name: 'MethodMiddleware',
            arguments: ["ValidationMiddleware, { schema: update" + entityNameCapitalized + " }"]
        });
        var updateRelationshipsMethod = controllerClass.addMethod({
            name: 'updateRelationships',
            parameters: middlewareFunctionParameters
        });
        updateRelationshipsMethod.toggleModifier('public').toggleModifier('async');
        updateRelationshipsMethod.addStatements([
            "await this.repository.updateRelationshipsFromRequest(req);",
            "res.sendStatus(HttpStatus.NO_CONTENT).end();"
        ]);
        updateRelationshipsMethod.addDecorator({
            name: 'Patch',
            arguments: ["\"/:id/relationships/:relation\""]
        });
        updateRelationshipsMethod.addJsDoc(function (writer) {
            writer.writeLine("@description REPLACE " + entityName + " relationships");
            writer.writeLine("@return");
        });
    }
    if (options.delete) {
        var deleteMethod = controllerClass.addMethod({
            name: 'remove',
            parameters: middlewareFunctionParameters
        });
        deleteMethod.toggleModifier('public').toggleModifier('async');
        deleteMethod.addStatements([
            "const " + entityName + " = await this.repository.findOne(req.params.id);",
            "if(!" + entityName + ") {\n                throw Boom.notFound();\n            }",
            "await this.repository.remove(" + entityName + ");",
            "res.sendStatus(HttpStatus.NO_CONTENT).end();"
        ]);
        deleteMethod.addDecorator({
            name: 'Delete',
            arguments: ["\"/:id\""]
        });
        deleteMethod.addJsDoc(function (writer) {
            writer.writeLine("@description DELETE " + entityName);
            writer.writeLine("@throws {Boom.notFound}");
            writer.writeLine("@return {any} result to send to client");
        });
        var deleteRelationshipsMethod = controllerClass.addMethod({
            name: 'removeRelationships',
            parameters: middlewareFunctionParameters
        });
        deleteRelationshipsMethod.toggleModifier('public').toggleModifier('async');
        deleteRelationshipsMethod.addStatements([
            "await this.repository.removeRelationshipsFromRequest(req);",
            "res.sendStatus(HttpStatus.NO_CONTENT).end();"
        ]);
        deleteRelationshipsMethod.addDecorator({
            name: 'Delete',
            arguments: ["\"/:id/relationships/:relation\""]
        });
        deleteRelationshipsMethod.addJsDoc(function (writer) {
            writer.writeLine("@description DELETE " + entityName + " relationships");
            writer.writeLine("@return");
        });
    }
    return file;
}
exports.main = main;
;
