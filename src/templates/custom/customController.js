const { capitalizeEntity } = require("../../actions/lib/utils");
const project = require('../../utils/project');

/**
 *
 * @param path
 * @param className
 * @param {array} methods
 * @param entityName
 */
module.exports = (path,{className,entityName,methods}) => {
    const file = project.createSourceFile(path,null,{
        overwrite : true
    });

    file.addImportDeclaration({ moduleSpecifier : "express" , defaultImport : "{Request,Response}"  });

    file.addStatements(writer => writer.writeLine(`import Boom from '@hapi/boom';`));
    file.addStatements(writer => writer.writeLine(`import * as HttpStatus from 'http-status';`));

    const controllerClass = file.addClass({
        name: className
    });

    controllerClass.setExtends('BaseController');
    controllerClass.setIsExported(true);

    controllerClass.addConstructor({
        statements : `super();`
    });

    controllerClass.addMethod({
        name : 'beforeMethod',
        returnType : 'void'
    }).toggleModifier("protected");

    const middlewareFunctionParameters = [
        { type : 'Request' , name : 'req' },
        { type : 'Response' , name : 'res' },
        { type : 'Function' , name : 'next' }
    ];

    methods.forEach((method) => {
        controllerClass.addMethod({
            name : method.name,
            parameters : middlewareFunctionParameters
        })
        .toggleModifier("public")
        .toggleModifier("async")
        .addStatements([
           `throw Boom.notImplemented();`
        ]);
    });

    file.fixMissingImports();

    return file;
};