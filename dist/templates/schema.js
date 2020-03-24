"use strict";
var project = require("../utils/project");
module.exports = function (path, _a) {
    var className = _a.className, entityName = _a.entityName;
    var file = project.createSourceFile(path, null, {
        overwrite: true
    });
    var schema = className + "SerializerSchema";
    var addedClass = file.addClass({
        name: schema,
        isDefaultExport: true
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
    }).setBodyText("\n        return {\n            relationships : {},\n            type: " + schema + ".type,\n            whitelist: " + schema + ".serialize,\n            whitelistOnDeserialize : " + schema + ".deserialize\n        };\n    ");
    return file;
};
