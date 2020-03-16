"use strict";
var project = require("../utils/project");
var ts_morph_1 = require("ts-morph");
module.exports = function (path, _a) {
    var className = _a.className, entityName = _a.entityName;
    var file = project.createSourceFile(path, null, {
        overwrite: true
    });
    file.addVariableStatement({
        declarationKind: ts_morph_1.VariableDeclarationKind.Const,
        declarations: [{
                name: entityName + "Serialize",
                type: 'string[]',
                initializer: "[]"
            }]
    }).setIsExported(true);
    file.addVariableStatement({
        declarationKind: ts_morph_1.VariableDeclarationKind.Const,
        declarations: [
            {
                name: entityName + "Deserialize",
                type: 'string[]',
                initializer: '[]'
            }
        ]
    }).setIsExported(true);
    file.addVariableStatement({
        declarationKind: ts_morph_1.VariableDeclarationKind.Const,
        declarations: [{
                name: "" + className,
                type: 'Readonly<JSONAPISerializerSchema>',
                initializer: "{\n                relationships : {},\n                type: documentType,\n                whitelist: documentSerialize,\n                whitelistOnDeserialize: " + entityName + "Deserialize\n            }"
            }]
    });
    file.addStatements(function (writer) { return writer.writeLine("export default " + className + ";"); });
    return file;
};
