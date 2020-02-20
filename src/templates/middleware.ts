import {  capitalizeEntity  } from "../actions/lib/utils";
import project = require('../utils/project');

export = (path: string, {className,entityName}) => {

    const file = project.createSourceFile(path,null,{
        overwrite : true
    });
    const entityNameCapitalized = capitalizeEntity(entityName);

    file.addStatements(writer => writer.writeLine(`import Boom from '@hapi/boom';`));

    const middlewareClass = file.addClass({
        name: className
    });
    middlewareClass.setIsExported(true);
    middlewareClass.setExtends('BaseMiddleware');

    middlewareClass.addJsDoc(writer => {
        writer.writeLine(`Middleware functions for ${entityName}`)
    });

    middlewareClass.addConstructor({
        statements : `super( new ${entityNameCapitalized}Serializer() );`
    })
    .addJsDoc(writer => {
        writer.writeLine(`@description ${className} constructor`)
    });

    return file;
};