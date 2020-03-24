import project = require('../utils/project');
import TsMorph = require('ts-morph');

export = function (path: string,{entityName,columns}) {
    const file = project.createSourceFile(path,null,{
        overwrite : true
    });

    let foreign = columns.filter(entity => entity.Key === 'MUL');
    columns = columns.filter(entity => entity.Key !== 'MUL');

    const array = file.addVariableStatement({
        declarationKind: TsMorph.VariableDeclarationKind.Const,
        declarations : [
            {
                name: `${entityName}Relations`,
                type : 'string[]',
                initializer : `[${foreign.map(column => `'${column.Field}'`)}]`
            }
        ]
    });

    array.addJsDoc(writer => {
        writer.writeLine(`@description allowed JSON-API includes relations`);
    });

    array.setIsExported(true);

    const serialized = file.addVariableStatement({
        declarationKind: TsMorph.VariableDeclarationKind.Const,
        declarations : [
            {
                name: `${entityName}Serialize`,
                type : 'string[]',
                initializer : `[${columns.map(column => `'${column.Field}'`)}]`
            }
        ]
    });

    serialized.addJsDoc(writer => {
        writer.writeLine(`@description`);
    });

    serialized.setIsExported(true);

    const deserialized = file.addVariableStatement({
        declarationKind: TsMorph.VariableDeclarationKind.Const,
        declarations : [
            {
                name: `${entityName}Deserialize`,
                type : 'string[]',
                initializer : `[${columns.map(column => `'${column.Field}'`)}]`
            }
        ]
    });

    deserialized.addJsDoc(writer => {
        writer.writeLine(`@description`);
    });

    deserialized.setIsExported(true);

    return file;
};