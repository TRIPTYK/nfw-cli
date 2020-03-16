import project = require ('../utils/project');
import { VariableDeclarationKind } from 'ts-morph';


export = (path: string, {className, entityName}) => {

    const file = project.createSourceFile(path,null,{
        overwrite : true
    });

    file.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [{
            name: `${entityName}Serialize`,
            type: 'string[]',
            initializer: `[]`
        }]
    }).setIsExported(true);
    file.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
            {
                name: `${entityName}Deserialize`,
                type: 'string[]',
                initializer: '[]'
            }
        ]
    }).setIsExported(true);

    file.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [{
            name: `${className}`,
            type: 'Readonly<JSONAPISerializerSchema>',
            initializer: `{
                relationships : {},
                type: documentType,
                whitelist: documentSerialize,
                whitelistOnDeserialize: ${entityName}Deserialize
            }`
        }]
    });

    file.addStatements(writer => writer.writeLine(`export default ${className};`));

    return file;

}