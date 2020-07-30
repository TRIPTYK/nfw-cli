"use strict";
var project = require("../utils/project");
var TsMorph = require("ts-morph");
module.exports = function (path, entityName, _a) {
    var columns = _a.columns;
    var file = project.createSourceFile(path, null, {
        overwrite: true
    });
    var foreign = columns.filter(function (entity) { return entity.Key === 'MUL'; });
    columns = columns.filter(function (entity) { return entity.Key !== 'MUL'; });
    var array = file.addVariableStatement({
        declarationKind: TsMorph.VariableDeclarationKind.Const,
        declarations: [
            {
                name: entityName + "Relations",
                type: 'string[]',
                initializer: "[" + foreign.map(function (column) { return "'" + column.Field + "'"; }) + "]"
            }
        ]
    });
    array.addJsDoc(function (writer) {
        writer.writeLine("@description allowed JSON-API includes relations");
    });
    array.setIsExported(true);
    var serialized = file.addVariableStatement({
        declarationKind: TsMorph.VariableDeclarationKind.Const,
        declarations: [
            {
                name: entityName + "Serialize",
                type: 'string[]',
                initializer: "[" + columns.map(function (column) { return "'" + column.Field + "'"; }) + "]"
            }
        ]
    });
    serialized.addJsDoc(function (writer) {
        writer.writeLine("@description");
    });
    serialized.setIsExported(true);
    var deserialized = file.addVariableStatement({
        declarationKind: TsMorph.VariableDeclarationKind.Const,
        declarations: [
            {
                name: entityName + "Deserialize",
                type: 'string[]',
                initializer: "[" + columns.map(function (column) { return "'" + column.Field + "'"; }) + "]"
            }
        ]
    });
    deserialized.addJsDoc(function (writer) {
        writer.writeLine("@description");
    });
    deserialized.setIsExported(true);
    return file;
};
