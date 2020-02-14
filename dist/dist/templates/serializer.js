var capitalizeEntity = require("../actions/lib/utils").capitalizeEntity;
var project = require('../utils/project');
var dashify = require('dashify');
module.exports = function (path, _a) {
    var className = _a.className, entityName = _a.entityName;
    var file = project.createSourceFile(path, null, {
        overwrite: true
    });
    var entityNameCapitalized = capitalizeEntity(entityName);
    file.addStatements(function (writer) { return writer.writeLine("import Boom from '@hapi/boom';"); });
    var serializerClass = file.addClass({
        name: className
    });
    serializerClass.setIsExported(true);
    serializerClass.setExtends("BaseSerializer");
    serializerClass.addConstructor({
        parameters: [{ name: 'serializerParams', initializer: 'new SerializerParams()' }],
        statements: [
            "super('" + dashify(entityName) + "');",
            function (writer) {
                writer.write("const data = ").block(function () {
                    writer
                        .writeLine("whitelist: " + entityName + "Serialize,")
                        .writeLine("whitelistOnDeserialize : " + entityName + "Deserialize,")
                        .writeLine("relationships: {}");
                }).write(";");
            },
            "this.setupLinks(data, serializerParams);",
            "this.serializer.register(this.type, data);"
        ]
    })
        .addJsDoc(entityName + " constructor");
    return file;
};
