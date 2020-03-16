"use strict";
var project = require("../utils/project");
var ts_morph_1 = require("ts-morph");
module.exports = function (path, typeName) {
    typeName.toLowerCase();
    var sourceFile = project.getSourceFileOrThrow(path);
    sourceFile.addVariableStatement({
        declarationKind: ts_morph_1.VariableDeclarationKind.Const,
        declarations: [{
                name: typeName + "Type",
                type: 'string',
                initializer: "\"" + typeName + "\""
            }]
    }).setIsExported(true);
};
