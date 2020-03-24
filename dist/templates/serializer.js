"use strict";
var utils_1 = require("../actions/lib/utils");
var project = require("../utils/project");
module.exports = function (path, _a) {
    var className = _a.className, entityName = _a.entityName;
    var file = project.createSourceFile(path, null, {
        overwrite: true
    });
    var entityNameCapitalized = utils_1.capitalizeEntity(entityName);
    var serializerClass = file.addClass({
        name: className
    });
    serializerClass.setIsExported(true);
    serializerClass.setExtends("BaseSerializer");
    serializerClass.addDecorator({
        name: 'injectable',
        arguments: []
    });
    serializerClass.addConstructor({
        parameters: [{ name: 'serializerParams: SerializerParams', initializer: '{}' }],
        statements: [
            "super(" + entityNameCapitalized + "SerializerSchema.schema)",
            "if(serializerParams.pagination) {\n                this.setupPaginationLinks(serializerParams.pagination);\n            }"
        ]
    })
        .addJsDoc(entityName + " constructor");
    return file;
};
