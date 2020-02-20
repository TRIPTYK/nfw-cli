"use strict";
var utils_1 = require("../actions/lib/utils");
var project = require("../utils/project");
module.exports = function (path, _a) {
    var className = _a.className, entityName = _a.entityName;
    var file = project.createSourceFile(path, null, {
        overwrite: true
    });
    var entityNameCapitalized = utils_1.capitalizeEntity(entityName);
    file.addStatements(function (writer) { return writer.writeLine("import Boom from '@hapi/boom';"); });
    var middlewareClass = file.addClass({
        name: className
    });
    middlewareClass.setIsExported(true);
    middlewareClass.setExtends('BaseMiddleware');
    middlewareClass.addJsDoc(function (writer) {
        writer.writeLine("Middleware functions for " + entityName);
    });
    middlewareClass.addConstructor({
        statements: "super( new " + entityNameCapitalized + "Serializer() );"
    })
        .addJsDoc(function (writer) {
        writer.writeLine("@description " + className + " constructor");
    });
    return file;
};
