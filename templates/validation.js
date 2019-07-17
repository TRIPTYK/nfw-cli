const project = require('../utils/project');
const TsMorph = require('ts-morph');
const stringifyObject = require('stringify-object');
const { buildValidationArgumentsFromObject , capitalizeEntity } = require("../actions/lib/utils");

module.exports = (path,{entities,options,entityName}) => {
    const file = project.createSourceFile(path,null,{
        overwrite : true
    });
    const entityNameCapitalized = capitalizeEntity(entityName);

    if (options.read) {
        let variableStatement = file.addVariableStatement({
            declarationKind: TsMorph.VariableDeclarationKind.Const,
            declarations: [
                {
                    name: `get${entityNameCapitalized}`,
                    type: `Schema`,
                    initializer: stringifyObject({
                        id : {
                            in: ['params'],
                            errorMessage: 'Please provide a valid id',
                            isInt: true
                        }
                    })
                }
            ]
        });
        variableStatement.setIsExported(true);

        variableStatement = file.addVariableStatement({
            declarationKind: TsMorph.VariableDeclarationKind.Const,
            declarations: [
                {
                    name: `list${entityNameCapitalized}`,
                    type: `Schema`,
                    initializer: stringifyObject({

                    })
                }
            ]
        });
        variableStatement.setIsExported(true);
    }

    if (options.create) {
        const objectsToInsert = {};

        for (entity of entities) objectsToInsert[entity.Field] = buildValidationArgumentsFromObject(entity);

        let variableStatement = file.addVariableStatement({
            declarationKind: TsMorph.VariableDeclarationKind.Const,
            declarations: [
                {
                    name: `create${entityNameCapitalized}`,
                    type: `Schema`,
                    initializer: stringifyObject(objectsToInsert)
                }
            ]
        });
        variableStatement.setIsExported(true);
    }

    if (options.update) {
        let variableStatement = file.addVariableStatement({
            declarationKind: TsMorph.VariableDeclarationKind.Const,
            declarations: [
                {
                    name: `replace${entityNameCapitalized}`,
                    type: `Schema`,
                    initializer: writer => {
                        writer.block(() => {
                            writer.writeLine('...exports.get,');
                            writer.writeLine('...exports.create');
                        })
                    }
                }
            ]
        });
        variableStatement.setIsExported(true);

        const objectsToInsert = {};

        for (entity of entities) objectsToInsert[entity.Field] = buildValidationArgumentsFromObject(entity,true);

        variableStatement = file.addVariableStatement({
            declarationKind: TsMorph.VariableDeclarationKind.Const,
            declarations: [
                {
                    name: `update${entityNameCapitalized}`,
                    type: `Schema`,
                    initializer: writer => {
                        writer.block(() => {
                            writer.writeLine('...exports.get,');
                            writer.write('...' + stringifyObject(objectsToInsert))
                        })
                    }
                }
            ]
        });
        variableStatement.setIsExported(true);
    }

    file.fixMissingImports();
};