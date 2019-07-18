const { capitalizeEntity } = require("../actions/lib/utils");
const project = require('../utils/project');

module.exports = (path,{className,entityName,columns}) => {
    const file = project.createSourceFile(path,null,{
        overwrite : true
    });
    const entityNameCapitalized = capitalizeEntity(entityName);

    file.addStatements(writer => writer.writeLine(`import * as Boom from 'boom';`));

    const serializerClass = file.addClass({
        name: className
    });

    serializerClass.setIsExported(true);
    serializerClass.setExtends(`BaseSerializer`);

    const property = serializerClass.addProperty({
        isStatic : true,
        type : "string[]",
        name : "whitelist",
        initializer : `[${columns.map(column => `'${column.Field}'`)}]`
    }).toggleModifier("public");

    property.addJsDoc(writer => {
        writer.writeLine(`@description list of fields to be serialized and deserialized`)
    });

    serializerClass.addConstructor({
        parameters : [{ name : 'serializerParams' , initializer : 'new SerializerParams()'}],
        statements : [
        `super('${entityName}');`,
        writer => {
            writer.write("const data = ").block(() => {
                writer
                    .writeLine(`whitelist: ${entityNameCapitalized}Serializer.whitelist,`)
                    .writeLine(`relationships: {}`);
            }).write(";");
        },
        `this.setupLinks(data, serializerParams);`,
        `this.serializer.register(this.type, data);`
        ]
    })
    .addJsDoc(`${entityName} constructor`);

    return file;
};