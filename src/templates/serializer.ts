import project = require('../utils/project');
import * as pascalcase from "pascalcase";
import kebab from '@queso/kebab-case'

export = (path: string,entityName: string) => {

    const file = project.createSourceFile(path,null,{
        overwrite : true
    });

    const className = pascalcase(entityName);

    file.addStatements(writer => writer.writeLine(`import { ${className} } from "../models/${kebab(entityName)}.model";`));
    

    const serializerClass = file.addClass({
        name: `${className}Serializer`
    });

    serializerClass.setIsExported(true);
    serializerClass.setExtends(`BaseSerializer<${className}>`);

    serializerClass.addDecorator({
        name: 'injectable',
        arguments: []
    });

    serializerClass.addConstructor({
        parameters : [{ name : 'serializerParams: SerializerParams' , initializer : '{}'}],
        statements : [
            `super(${className}SerializerSchema.schema)`,
            `if(serializerParams.pagination) {
                this.setupPaginationLinks(serializerParams.pagination);
            }`
        ]
    })
    .toggleModifier("public")
    .addJsDoc(`${entityName} constructor`)

    return file;
};