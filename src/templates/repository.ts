import { capitalizeEntity } from "../actions/lib/utils";
import project = require('../utils/project');

export = (path,{className,entityName}) => {
    const file = project.createSourceFile(path,null,{
        overwrite : true
    });
    const entityNameCapitalized = capitalizeEntity(entityName);

    file.addStatements(writer => writer.writeLine(`import Boom from '@hapi/boom';`));

    const repoClass = file.addClass({
        name: className
    });

    repoClass.setIsExported(true);
    repoClass.setExtends(`BaseRepository<${entityNameCapitalized}>`);

    repoClass.addDecorator({
        name : 'EntityRepository',
        arguments : `${entityNameCapitalized}` as any
    }).setIsDecoratorFactory(true);

    repoClass.addConstructor({
        statements : `super();`
    });

    return file;
};