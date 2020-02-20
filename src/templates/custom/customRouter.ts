import project = require('../../utils/project');
import TsMorph = require('ts-morph');
import { capitalizeEntity } from "../../actions/lib/utils";

export = (path: string, {routes,entityName}) => {

    const file = project.createSourceFile(path,null,{
        overwrite : true
    });
    const entityNameCapitalized = capitalizeEntity(entityName);

    file.addVariableStatement({
        declarationKind : TsMorph.VariableDeclarationKind.Const,
        declarations : [{initializer : 'Router()',name : 'router'}]
    });

    file.addVariableStatement({
        declarationKind : TsMorph.VariableDeclarationKind.Const,
        declarations : [{initializer : `new ${entityNameCapitalized}Controller()`,name : `${entityName}Controller`}]
    });

    routes.forEach((route) => {
        file.addStatements(writer => {
            writer
                .blankLine()
                .writeLine(`router.route('${route.path}')`);

            route.methods.forEach((method) => {
                writer.write(`\t.${method.method}(`)
                    .conditionalWrite(method.authorization !== '',`authorize([roles.${method.authorization}]),`)
                    .write(`${entityName}Controller.method('${method.controllerMethod}'))`)
            });

            writer.write(";")
            .blankLine();
        });
    });

    file.addStatements('export { router }');

    file.fixMissingImports();

    return file;
};