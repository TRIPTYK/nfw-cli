/**
 *  @module removeFromModel
 *  @description Remove relation from model
 *  @author Verliefden Romain
 */

// node modules
import Util = require('util');
import FS = require('fs');
import {plural} from 'pluralize';
import chalk from 'chalk';

// promisify
const ReadFile = Util.promisify(FS.readFile);
const WriteFile = Util.promisify(FS.writeFile);

//project modules
import Log = require('../../utils/log');
import project = require('../../utils/project');


//description :  Remove relationship from serializer and controller
export function removeFromRelationTable (entity: string, column: string) {
    const relationFile = project.getSourceFile(`src/api/enums/json-api/${entity}.enum.ts`);

    const relationsArrayDeclaration: any = relationFile.getVariableDeclaration(`${entity}Relations`).getInitializer();

    // search by Text value
    const index = relationsArrayDeclaration.getElements().findIndex((value) => {
        return value.getText() === `'${column}'` || value.getText() === `'${plural(column)}'`;
    });

    if (index !== -1)
        relationsArrayDeclaration.removeElement(index);

    relationFile.fixMissingImports();
    relationFile.fixUnusedIdentifiers();
};

/**
 *
 * @param entity
 * @param column
 * @param otherModel
 * @param isRelation
 */
export function removeFromSerializer (entity: string, column: string, otherModel, isRelation: boolean) {
    const serializerFile = project.getSourceFile(`src/api/serializers/${entity}.serializer.ts`);
    const serializerClass = serializerFile.getClasses()[0];
    const constructor: any = serializerClass.getConstructors()[0];
    const relationshipsInitializer = constructor.getVariableDeclaration("data").getInitializer().getProperty("relationships").getInitializer();

    const line = constructor.getStructure().statements.findIndex((e) => {
        if (typeof e === 'string')
            return e.match(new RegExp(`this.serializer.register.*${otherModel}`)) !== null;
        else
            return false;
    });

    if (line !== -1) constructor.removeStatement(line);
    if (relationshipsInitializer.getProperty(column)) relationshipsInitializer.getProperty(column).remove();

    if (!isRelation) {
        const relationFile = project.getSourceFile(`src/api/enums/json-api/${entity}.enum.ts`);

        const deserializeDeclaration: any = relationFile.getVariableDeclaration(`${entity}Deserialize`).getInitializer();
        const serializeDeclaration: any = relationFile.getVariableDeclaration(`${entity}Serialize`).getInitializer();

        // search by Text value
        let index = deserializeDeclaration.getElements().findIndex((value) => {
            return value.getText() === `'${column}'` || value.getText() === `'${plural(column)}'`;
        });

        if (index !== -1) deserializeDeclaration.removeElement(index);

        // search by Text value
        let index2 = serializeDeclaration.getElements().findIndex((value) => {
            return value.getText() === `'${column}'` || value.getText() === `'${plural(column)}'`;
        });

        if (index2 !== -1) serializeDeclaration.removeElement(index);

        relationFile.fixMissingImports();
        relationFile.fixUnusedIdentifiers();
    }

    serializerFile.fixMissingImports();
    serializerFile.fixUnusedIdentifiers();
};

export async function removeFromTest (model, column: string): Promise<void> {
    let testPath = `${process.cwd()}/test/${model}.test.ts`;
    let regexRandom = new RegExp(`[\\s]${column}.*?\\),`, 'gm');
    let regexArray = new RegExp(`,'${column}'|'${column}',|'${column}'`, 'gm');
    let testFile = await ReadFile(testPath, 'utf-8');
    testFile = testFile.replace(regexRandom, '').replace(regexArray, '');
    await WriteFile(testPath, testFile).then(() => Log.info(`${chalk.cyan(`test/${model}.test.js`)} updated`));
};

/**
 *
 * @param model
 * @param column
 */
export function removeFromValidation (model, column: string) {
    const relationFile = project.getSourceFile(`src/api/validations/${model}.validation.ts`);

    // all exported const should be validation schema
    const validationDeclarations = relationFile.getVariableDeclarations().filter((v) => v.getVariableStatement().getDeclarationKind() === 'const' && v.getVariableStatement().hasExportKeyword());

    validationDeclarations.forEach((declaration: any) => {
        const prop = declaration.getInitializer().getProperty(column);
        if (prop) prop.remove();
    });

    relationFile.fixMissingImports();
    relationFile.fixUnusedIdentifiers();
};

export function removeRelationFromModelFile (model,column: string) {
    let modelFile = project.getSourceFile(`src/api/models/${model}.model.ts`);
    const modelClass = modelFile.getClasses()[0];

    const prop = modelClass.getInstanceProperty((p) => {
        return p.getName() === column || p.getName() === plural(column)
    });

    if (prop) prop.remove();

    modelFile.fixUnusedIdentifiers();
};
  