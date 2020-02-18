"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var project = require("../../utils/project");
/**
 *
 * @param path
 * @param className
 * @param {array} methods
 * @param entityName
 */
function Main(path, _a) {
    var className = _a.className, entityName = _a.entityName, methods = _a.methods;
    var file = project.createSourceFile(path, null, {
        overwrite: true
    });
    file.addImportDeclaration({ moduleSpecifier: "express", defaultImport: "{Request,Response}" });
    file.addStatements(function (writer) { return writer.writeLine("import Boom from '@hapi/boom';"); });
    file.addStatements(function (writer) { return writer.writeLine("import * as HttpStatus from 'http-status';"); });
    var controllerClass = file.addClass({
        name: className
    });
    controllerClass.setExtends('BaseController');
    controllerClass.setIsExported(true);
    controllerClass.addConstructor({
        statements: "super();"
    });
    controllerClass.addMethod({
        name: 'beforeMethod',
        returnType: 'void'
    }).toggleModifier("protected");
    var middlewareFunctionParameters = [
        { type: 'Request', name: 'req' },
        { type: 'Response', name: 'res' },
        { type: 'Function', name: 'next' }
    ];
    methods.forEach(function (method) {
        controllerClass.addMethod({
            name: method.name,
            parameters: middlewareFunctionParameters
        })
            .toggleModifier("public")
            .toggleModifier("async")
            .addStatements([
            "throw Boom.notImplemented();"
        ]);
    });
    file.fixMissingImports();
    return file;
}
exports.Main = Main;
;
