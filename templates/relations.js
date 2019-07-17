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

    array.setIsExported(true);

    file.fixMissingImports();
};