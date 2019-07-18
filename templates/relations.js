const project = require('../utils/project');
const TsMorph = require('ts-morph');

module.exports = (path,{}) => {
    const file = project.createSourceFile(path,null,{
        overwrite : true
    });

    const array = file.addVariableStatement({
        declarationKind: TsMorph.VariableDeclarationKind.Const,
        declarations : [
            {
                name: 'relations',
                type : 'string[]',
                initializer : `[]`
            }
        ]
    });

    array.addJsDoc(writer => {
        writer.writeLine(`@description allowed JSON-API includes relations`);
    });

    array.setIsExported(true);

    return file;
};