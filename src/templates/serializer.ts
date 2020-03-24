import { capitalizeEntity } from "../actions/lib/utils";
import project = require('../utils/project');

export = (path: string,{className,entityName}) => {

    const file = project.createSourceFile(path,null,{
        overwrite : true
    });

    const entityNameCapitalized = capitalizeEntity(entityName);

    const serializerClass = file.addClass({
        name: className
    });

    serializerClass.setIsExported(true);
    serializerClass.setExtends(`BaseSerializer`);

    serializerClass.addDecorator({
        name: 'injectable',
        arguments: []
    });

    serializerClass.addConstructor({
        parameters : [{ name : 'serializerParams: SerializerParams' , initializer : '{}'}],
        statements : [
            `super(${entityNameCapitalized}Schema.schema)`,
            `if(serializerParams.pagination) {
                this.setupPaginationLinks(serializerParams.pagination);
            }`
        ]
    })
    .addJsDoc(`${entityName} constructor`);

    return file;
};