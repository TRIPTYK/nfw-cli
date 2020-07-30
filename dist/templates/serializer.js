"use strict";
var project = require("../utils/project");
var pascalcase = require("pascalcase");
var kebab_case_1 = require("@queso/kebab-case");
module.exports = function (path, entityName) {
    var file = project.createSourceFile(path, null, {
        overwrite: true
    });
    var className = pascalcase(entityName);
    file.addStatements(function (writer) { return writer.writeLine("import { " + className + " } from \"../models/" + kebab_case_1.default(entityName) + ".model\";"); });
    var serializerClass = file.addClass({
        name: className + "Serializer"
    });
    serializerClass.setIsExported(true);
    serializerClass.setExtends("BaseSerializer<" + className + ">");
    serializerClass.addDecorator({
        name: 'injectable',
        arguments: []
    });
    serializerClass.addConstructor({
        parameters: [{ name: 'serializerParams: SerializerParams', initializer: '{}' }],
        statements: [
            "super(" + className + "SerializerSchema.schema)",
            "if(serializerParams.pagination) {\n                this.setupPaginationLinks(serializerParams.pagination);\n            }"
        ]
    })
        .toggleModifier("public")
        .addJsDoc(entityName + " constructor");
    return file;
};
