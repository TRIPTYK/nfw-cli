import { capitalizeEntity } from "../actions/lib/utils";
import project = require('../utils/project');
import * as pascalcase from "pascalcase";
import kebab from '@queso/kebab-case'

export = (path,entityName) => {
    const file = project.createSourceFile(path,null,{
        overwrite : true
    });
    const entityClassName = pascalcase(entityName);

    file.addStatements(writer => writer.writeLine(`import Boom from '@hapi/boom';`));
    file.addStatements(writer => writer.writeLine(`import { ${entityClassName} } from "../models/${kebab(entityName)}.model";`));

    const repoClass = file.addClass({
        name: `${entityClassName}Repository`
    });

    repoClass.setIsExported(true);
    repoClass.setExtends(`BaseRepository<${entityClassName}>`);

    repoClass.addDecorator({
        name : 'EntityRepository',
        arguments : `${entityClassName}` as any
    }).setIsDecoratorFactory(true);

    repoClass.addConstructor({
        statements : `super();`
    })
    .toggleModifier("public");

    return file;
};