import project = require('../utils/project');
import TsMorph = require('ts-morph');
import stringifyObject = require('stringify-object');
import { buildValidationArgumentsFromObject , capitalizeEntity } from "../actions/lib/utils";

export = (path: string,{entities,options,entityName}) => {
    const file = project.createSourceFile(path,null,{
        overwrite : true
    });
    const entityNameCapitalized = capitalizeEntity(entityName);

    // filter special columns
    entities = entities.filter(entity => !['createdAt','updatedAt'].includes(entity.Field));
    entities = entities.filter(entity => entity.Key !== 'MUL');

    file.addStatements(writer => writer.writeLine(`import * as Joi from '@hapi/joi';`));
    file.addStatements(writer => writer.writeLine(`import Boom from '@hapi/boom';`));
    file.addStatements(writer => writer.writeLine(`import * as Moment from "moment-timezone";`));

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

        variableStatement.addJsDoc({
            description : `Get validation for ${entityName}`
        });
    }

    if (options.create) {
        const objectsToInsert = {};

        for (let entity of entities) objectsToInsert[entity.Field] = buildValidationArgumentsFromObject(entity);

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
        variableStatement.addJsDoc({
            description : `Create validation for ${entityName}`
        });
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
        variableStatement.addJsDoc({
            description : `Replace validation for ${entityName}`
        });

        const objectsToInsert = {};

        for (let entity of entities) objectsToInsert[entity.Field] = buildValidationArgumentsFromObject(entity,true);

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
        variableStatement.addJsDoc({
            description : `Update validation for ${entityName}`
        });
    }

    file.fixMissingImports();

    return file;
};