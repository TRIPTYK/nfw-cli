"use strict";
var project = require("../../utils/project");
var TsMorph = require("ts-morph");
var utils_1 = require("../../actions/lib/utils");
module.exports = function (path, _a) {
    var routes = _a.routes, entityName = _a.entityName;
    var file = project.createSourceFile(path, null, {
        overwrite: true
    });
    var entityNameCapitalized = utils_1.capitalizeEntity(entityName);
    file.addVariableStatement({
        declarationKind: TsMorph.VariableDeclarationKind.Const,
        declarations: [{ initializer: 'Router()', name: 'router' }]
    });
    file.addVariableStatement({
        declarationKind: TsMorph.VariableDeclarationKind.Const,
        declarations: [{ initializer: "new " + entityNameCapitalized + "Controller()", name: entityName + "Controller" }]
    });
    routes.forEach(function (route) {
        file.addStatements(function (writer) {
            writer
                .blankLine()
                .writeLine("router.route('" + route.path + "')");
            route.methods.forEach(function (method) {
                writer.write("\t." + method.method + "(")
                    .conditionalWrite(method.authorization !== '', "authorize([roles." + method.authorization + "]),")
                    .write(entityName + "Controller.method('" + method.controllerMethod + "'))");
            });
            writer.write(";")
                .blankLine();
        });
    });
    file.addStatements('export { router }');
    file.fixMissingImports();
    return file;
};
