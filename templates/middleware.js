const {  capitalizeEntity  } = require("../actions/lib/utils");
const project = require('../utils/project');

module.exports = (path,{className,entityName}) => {
    const file = project.createSourceFile(path,null,{
        overwrite : true
    });
    const entityNameCapitalized = capitalizeEntity(entityName);

    file.addStatements(writer => writer.writeLine(`import * as Boom from 'boom';`));

    const middlewareClass = file.addClass({
        name: className
    });
    middlewareClass.setIsExported(true);
    middlewareClass.setExtends('BaseMiddleware');

    middlewareClass.addConstructor({
        statements : `super( new ${entityNameCapitalized}Serializer() );`
    });

    file.fixMissingImports();
};