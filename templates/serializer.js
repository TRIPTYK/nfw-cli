const { capitalizeEntity } = require("../actions/lib/utils");
const project = require('../utils/project');
const dashify = require('dashify');

module.exports = (path,{className,entityName}) => {
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

    serializerClass.addConstructor({
        parameters : [{ name : 'serializerParams' , initializer : 'new SerializerParams()'}],
        statements : [
        `super('${dashify(entityName)}');`,
        writer => {
            writer.write("const data = ").block(() => {
                writer
                    .writeLine(`whitelist: ${entityName}Serialize,`)
                    .writeLine(`whitelistOnDeserialize : ${entityName}Deserialize,`)
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