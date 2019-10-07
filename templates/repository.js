const { capitalizeEntity } = require("../actions/lib/utils");
const project = require('../utils/project');

module.exports = (path,{className,entityName}) => {
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
        arguments : entityNameCapitalized
    }).setIsDecoratorFactory(true);

    repoClass.addConstructor({
        statements : `super();`
    });

    return file;
};