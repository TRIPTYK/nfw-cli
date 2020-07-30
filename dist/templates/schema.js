"use strict";
var project = require("../utils/project");
var pascalcase = require("pascalcase");
module.exports = function (path, modelName) {
    var file = project.createSourceFile(path, null, {
        overwrite: true
    });
    ;
    var className = pascalcase(modelName);
    var addedClass = file.addClass({
        name: className + "SerializerSchema",
        isDefaultExport: true
    });
    addedClass.addProperty({
        isStatic: true,
        type: "string",
        name: "type",
        initializer: "\"" + modelName + "\""
    })
        .toggleModifier("public");
    addedClass.addProperty({
        isStatic: true,
        type: "string[]",
        name: "serialize"
    })
        .toggleModifier("public");
    addedClass.addProperty({
        isStatic: true,
        type: "string[]",
        name: "deserialize"
    })
        .toggleModifier("public");
    addedClass.addGetAccessor({
        isStatic: true,
        returnType: "Readonly<JSONAPISerializerSchema>",
        name: "schema"
    }).setBodyText("\nreturn {\n    relationships : {},\n    type: " + className + "SerializerSchema.type,\n    whitelist: " + className + "SerializerSchema.serialize,\n    whitelistOnDeserialize : " + className + "SerializerSchema.deserialize\n};\n    ")
        .toggleModifier("public");
    return file;
};
