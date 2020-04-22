"use strict";
var project = require("../utils/project");
module.exports = function (path, _a) {
    var className = _a.className, entityName = _a.entityName;
    var file = project.createSourceFile(path, null, {
        overwrite: true
    });
    var addedClass = file.addClass({
        name: className,
        isDefaultExport: true
    });
    addedClass.addProperty({
        isStatic: true,
        type: "string",
        name: "type",
        initializer: "\"" + entityName + "\""
    });
    addedClass.addProperty({
        isStatic: true,
        type: "string[]",
        name: "serialize"
    });
    addedClass.addProperty({
        isStatic: true,
        type: "string[]",
        name: "deserialize"
    });
    addedClass.addGetAccessor({
        isStatic: true,
        returnType: "Readonly<JSONAPISerializerSchema>",
        name: "schema"
    }).setBodyText("\nreturn {\n    relationships : {},\n    type: " + className + ".type,\n    whitelist: " + className + ".serialize,\n    whitelistOnDeserialize : " + className + ".deserialize\n};\n    ");
    return file;
};
