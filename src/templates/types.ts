import project = require('../utils/project');
import { VariableDeclarationKind } from 'ts-morph';

export = (path: string, typeName: string) => {

    typeName.toLowerCase();

    const sourceFile = project.getSourceFileOrThrow(path);

    sourceFile.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [{
            name: `${typeName}Type`,
            type: 'string',
            initializer: `"${typeName}"`
        }]
    }).setIsExported(true);
}