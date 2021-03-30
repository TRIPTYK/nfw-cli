import project = require("../utils/project");
import TsMorph = require("ts-morph");
import stringifyObject = require("stringify-object");
import { buildValidationArgumentsFromObject , capitalizeEntity } from "../actions/lib/utils";
import * as pascalcase from "pascalcase";
import kebab from '@queso/kebab-case'

export = (path: string,entityName: string,{entities,options}) => {
    const file = project.createSourceFile(path,null,{
        overwrite : true
    });
    const entityClassName = pascalcase(entityName);

    // filter special columns
    entities = entities.filter(entity => entity.Key !== "MUL");

    file.addStatements(writer => writer.writeLine(`import * as Joi from "@hapi/joi";`));
    file.addStatements(writer => writer.writeLine(`import Boom from "@hapi/boom";`));
    file.addStatements(writer => writer.writeLine(`import * as Moment from "moment-timezone";`));
    file.addStatements(writer => writer.writeLine(`import { ValidationSchema } from "../../core/types/validation";`))
    file.addStatements(writer => writer.writeLine(`import { ${entityClassName} } from "../models/${kebab(entityName)}.model";`))

    if (options.read) {
        let variableStatement = file.addVariableStatement({
            declarationKind: TsMorph.VariableDeclarationKind.Const,
            declarations: [
                {
                    name: `get${entityClassName}`,
                    type: `ValidationSchema<${entityClassName}>`,
                    initializer: stringifyObject({
                        id : {
                            in: ["params"],
                            errorMessage: "Please provide a valid id",
                            isInt: true,
                            toInt: true
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
                    name: `list${entityClassName}`,
                    type: `ValidationSchema<${entityClassName}>`,
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
                    name: `create${entityClassName}`,
                    type: `ValidationSchema<${entityClassName}>`,
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
                    name: `replace${entityClassName}`,
                    type: `ValidationSchema<${entityClassName}>`,
                    initializer: writer => {
                        writer.block(() => {
                            writer.writeLine(`...exports.get${entityClassName},`);
                            writer.writeLine(`...exports.create${entityClassName}`);
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
                    name: `update${entityClassName}`,
                    type: `ValidationSchema<${entityClassName}>`,
                    initializer: writer => {
                        writer.block(() => {
                            writer.writeLine(`...exports.get${entityClassName},`);
                            writer.write("..." + stringifyObject(objectsToInsert))
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