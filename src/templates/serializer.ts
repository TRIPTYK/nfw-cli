import { capitalizeEntity } from "../actions/lib/utils";
import project = require('../utils/project');
import dashify = require('dashify');

export = (path: string,{className,entityName}) => {
    const file = project.createSourceFile(path,null,{
        overwrite : true
    });
    const entityNameCapitalized = capitalizeEntity(entityName);

    file.addStatements(writer => writer.writeLine(`import Boom from '@hapi/boom';`));

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