"use strict";
var project = require("../utils/project");
var TsMorph = require("ts-morph");
var utils_1 = require("../actions/lib/utils");
module.exports = function (path, _a) {
    var options = _a.options, entityName = _a.entityName;
    var file = project.createSourceFile(path, null, {
        overwrite: true
    });
    var entityNameCapitalized = utils_1.capitalizeEntity(entityName);
    file.addStatements("import * as Validation from \"../../validations/" + entityName + ".validation\";");
    file.addVariableStatement({
        declarationKind: TsMorph.VariableDeclarationKind.Const,
        declarations: [{ initializer: 'Router()', name: 'router' }]
    });
    file.addVariableStatement({
        declarationKind: TsMorph.VariableDeclarationKind.Const,
        declarations: [{ initializer: "new " + entityNameCapitalized + "Controller()", name: entityName + "Controller" }]
    });
    file.addVariableStatement({
        declarationKind: TsMorph.VariableDeclarationKind.Const,
        declarations: [{ initializer: "new " + entityNameCapitalized + "Middleware()", name: entityName + "Middleware" }]
    });
    file.addStatements(function (writer) {
        writer
            .blankLine()
            .writeLine("router.route('/')")
            .conditionalWriteLine(options.read, "\t.get(authorize([roles.admin]), " + entityName + "Controller.method('list'))")
            .conditionalWriteLine(options.create, "\t.post(authorize([roles.admin])," + entityName + "Middleware.deserialize()," + entityName + "Middleware.handleValidation(Validation.create" + entityNameCapitalized + "), SecurityMiddleware.sanitize, " + entityName + "Controller.method('create'))")
            .write(";")
            .blankLine();
    });
    file.addStatements(function (writer) {
        writer
            .blankLine()
            .writeLine("router.route('/:id')")
            .conditionalWriteLine(options.read, "\t.get(authorize([roles.admin]), " + entityName + "Middleware.handleValidation(Validation.get" + entityNameCapitalized + "), " + entityName + "Controller.method('get'))")
            .conditionalWriteLine(options.update, "\t.put(authorize([roles.admin])," + entityName + "Middleware.deserialize()," + entityName + "Middleware.handleValidation(Validation.replace" + entityNameCapitalized + "), SecurityMiddleware.sanitize, " + entityName + "Controller.method('update'))")
            .conditionalWriteLine(options.update, "\t.patch(authorize([roles.admin])," + entityName + "Middleware.deserialize()," + entityName + "Middleware.handleValidation(Validation.update" + entityNameCapitalized + "), SecurityMiddleware.sanitize, " + entityName + "Controller.method('update'))")
            .conditionalWriteLine(options.delete, "\t.delete(authorize([roles.admin]), " + entityName + "Middleware.handleValidation(Validation.get" + entityNameCapitalized + "), " + entityName + "Controller.method('remove'))")
            .write(";")
            .blankLine();
    });
    file.addStatements(function (writer) {
        writer
            .blankLine()
            .writeLine("router.route('/:id/:relation')")
            .conditionalWriteLine(options.read, "\t.get(authorize([roles.admin]), " + entityName + "Middleware.handleValidation(relationships), " + entityName + "Controller.method('fetchRelated'))")
            .write(";")
            .blankLine();
    });
    file.addStatements(function (writer) {
        writer
            .blankLine()
            .writeLine("router.route('/:id/relationships/:relation')")
            .conditionalWriteLine(options.read, "\t.get(authorize([roles.admin]), " + entityName + "Middleware.handleValidation(relationships), " + entityName + "Controller.method('fetchRelationships'))")
            .conditionalWriteLine(options.create, "\t.get(authorize([roles.admin]), " + entityName + "Middleware.handleValidation(relationships), " + entityName + "Controller.method('addRelationships'))")
            .conditionalWriteLine(options.update, "\t.get(authorize([roles.admin]), " + entityName + "Middleware.handleValidation(relationships), " + entityName + "Controller.method('updateRelationships'))")
            .conditionalWriteLine(options.delete, "\t.get(authorize([roles.admin]), " + entityName + "Middleware.handleValidation(relationships), " + entityName + "Controller.method('removeRelationships'))")
            .write(";")
            .blankLine();
    });
    file.addStatements('export { router }');
    return file;
};
