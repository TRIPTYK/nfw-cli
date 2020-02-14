var capitalizeEntity = require("../actions/lib/utils").capitalizeEntity;
var project = require('../utils/project');
/**
 *
 * @param path
 * @param className
 * @param options
 * @param entityName
 */
module.exports = function (path, _a) {
    var className = _a.className, options = _a.options, entityName = _a.entityName;
    var file = project.createSourceFile(path, null, {
        overwrite: true
    });
    var entityNameCapitalized = capitalizeEntity(entityName);
    file.addImportDeclaration({ moduleSpecifier: "express", defaultImport: "{Request,Response}" });
    file.addStatements(function (writer) { return writer.writeLine("import Boom from '@hapi/boom';"); });
    file.addStatements(function (writer) { return writer.writeLine("import * as HttpStatus from 'http-status';"); });
    var controllerClass = file.addClass({
        name: className
    });
    controllerClass.setExtends('BaseController');
    controllerClass.setIsExported(true);
    controllerClass.addDecorator({
        name: "Controller",
        arguments: ["{repository : " + entityNameCapitalized + "Repository}"]
    }).setIsDecoratorFactory(true);
    var middlewareFunctionParameters = [
        { type: 'Request', name: 'req' },
        { type: 'Response', name: 'res' },
        { type: 'any', name: 'next' }
    ];
    if (options.read) {
        var getMethod = controllerClass.addMethod({
            name: 'get',
            parameters: middlewareFunctionParameters
        });
        getMethod.addJsDoc(function (writer) {
            writer.writeLine("@description GET " + entityName + " by id");
            writer.writeLine("@throws {Boom.notFound}");
            writer.writeLine("@return {any} result to send to client");
        });
        getMethod.toggleModifier("public").toggleModifier("async")
            .addStatements([
            "const " + entityName + " = await this.repository.jsonApiFindOne(req,req.params.id," + entityName + "Relations);",
            "if (!" + entityName + ") { throw Boom.notFound(); }",
            "return new " + entityNameCapitalized + "Serializer().serialize(" + entityName + ");",
        ]);
        var listMethod = controllerClass.addMethod({
            name: 'list',
            parameters: middlewareFunctionParameters
        });
        listMethod.toggleModifier("public").toggleModifier("async");
        listMethod.addStatements([
            "const [" + entityName + "s,total] = await this.repository.jsonApiRequest(req.query," + entityName + "Relations).getManyAndCount();",
            "return new " + entityNameCapitalized + "Serializer( new SerializerParams().enablePagination(req,total) ).serialize(" + entityName + "s);"
        ]);
        listMethod.addJsDoc(function (writer) {
            writer.writeLine("@description LIST " + entityName);
            writer.writeLine("@return {any} result to send to client");
        });
        var relationshipsMethod = controllerClass.addMethod({
            name: 'fetchRelationships',
            parameters: middlewareFunctionParameters
        });
        relationshipsMethod.toggleModifier("public").toggleModifier("async");
        relationshipsMethod.addStatements([
            "return this.repository.fetchRelationshipsFromRequest(req,new " + entityNameCapitalized + "Serializer());"
        ]);
        relationshipsMethod.addJsDoc(function (writer) {
            writer.writeLine("@description Get " + entityName + " relationships");
            writer.writeLine("@return {array} of relationships id and type");
        });
        var relatedMethod = controllerClass.addMethod({
            name: 'fetchRelated',
            parameters: middlewareFunctionParameters
        });
        relatedMethod.toggleModifier("public").toggleModifier("async");
        relatedMethod.addStatements([
            "return this.repository.fetchRelated(req,new " + entityNameCapitalized + "Serializer());"
        ]);
        relatedMethod.addJsDoc(function (writer) {
            writer.writeLine("@description Get related " + entityName + " entities");
            writer.writeLine("@return");
        });
    }
    if (options.create) {
        var createMethod = controllerClass.addMethod({
            name: 'create',
            parameters: middlewareFunctionParameters
        });
        createMethod.toggleModifier("public").toggleModifier("async")
            .addStatements([
            "const " + entityName + " = new " + entityNameCapitalized + "(req.body);",
            "const saved = await this.repository.save(" + entityName + ");",
            "res.status( HttpStatus.CREATED );",
            "return new " + entityNameCapitalized + "Serializer().serialize(saved);"
        ]);
        createMethod.addJsDoc(function (writer) {
            writer.writeLine("@description CREATE " + entityName);
            writer.writeLine("@return {any} result to send to client");
        });
        var addRelationshipsMethod = controllerClass.addMethod({
            name: 'addRelationships',
            parameters: middlewareFunctionParameters
        });
        addRelationshipsMethod.toggleModifier("public").toggleModifier("async");
        addRelationshipsMethod.addStatements([
            "await this.repository.addRelationshipsFromRequest(req);",
            "res.sendStatus(HttpStatus.NO_CONTENT).end();"
        ]);
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
        updateMethod.toggleModifier("public").toggleModifier("async")
            .addStatements([
            "const " + entityName + " = await this.repository.findOne(req.params.id);",
            "if (!" + entityName + ") throw Boom.notFound();",
            "this.repository.merge(" + entityName + ", req.body);",
            "const saved = await this.repository.save(" + entityName + ");",
            "return new " + entityNameCapitalized + "Serializer().serialize(saved);"
        ]);
        updateMethod.addJsDoc(function (writer) {
            writer.writeLine("@description UPDATE " + entityName);
            writer.writeLine("@throws {Boom.notFound}");
            writer.writeLine("@return {any} result to send to client");
        });
        var updateRelationshipsMethod = controllerClass.addMethod({
            name: 'updateRelationships',
            parameters: middlewareFunctionParameters
        });
        updateRelationshipsMethod.toggleModifier("public").toggleModifier("async");
        updateRelationshipsMethod.addStatements([
            "await this.repository.updateRelationshipsFromRequest(req);",
            "res.sendStatus(HttpStatus.NO_CONTENT).end();"
        ]);
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
        deleteMethod.toggleModifier("public").toggleModifier("async")
            .addStatements([
            "const " + entityName + " = await this.repository.findOne(req.params.id);",
            "if (!" + entityName + ") throw Boom.notFound();",
            "await this.repository.remove(" + entityName + ");",
            "res.sendStatus(HttpStatus.NO_CONTENT).end();"
        ]);
        deleteMethod.addJsDoc(function (writer) {
            writer.writeLine("@description DELETE " + entityName);
            writer.writeLine("@throws {Boom.notFound}");
            writer.writeLine("@return {any} result to send to client");
        });
        var deleteRelationshipsMethod = controllerClass.addMethod({
            name: 'removeRelationships',
            parameters: middlewareFunctionParameters
        });
        deleteRelationshipsMethod.toggleModifier("public").toggleModifier("async");
        deleteRelationshipsMethod.addStatements([
            "await this.repository.removeRelationshipsFromRequest(req);",
            "res.sendStatus(HttpStatus.NO_CONTENT).end();"
        ]);
        deleteRelationshipsMethod.addJsDoc(function (writer) {
            writer.writeLine("@description DELETE " + entityName + " relationships");
            writer.writeLine("@return");
        });
    }
    return file;
};
