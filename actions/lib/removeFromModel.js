/**
 *  @module removeFromModel
 *  @description Remove relation from model
 *  @author Verliefden Romain
 */

// node modules
const Util = require('util');
const FS = require('fs');
const {plural} = require('pluralize');
const chalk = require('chalk');

// promisify
const ReadFile = Util.promisify(FS.readFile);
const WriteFile = Util.promisify(FS.writeFile);

//project modules
const Log = require('../../utils/log');
const project = require('../../utils/project');


/**
 * @description  Remove relationship from serializer and controller
 * @param {string} entity
 * @param {string} column relation name
 */
const removeFromRelationTable = (entity, column) => {
    const relationFile = project.getSourceFile(`src/api/enums/relations/${entity}.relations.ts`);

    const relationsArrayDeclaration = relationFile.getVariableDeclaration('relations').getInitializer();

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
 * @param model
 * @param isRelation
 */
const removeFromSerializer = (entity, column,model,isRelation) => {
    const serializerFile = project.getSourceFile(`src/api/serializers/${entity}.serializer.ts`);
    const serializerClass = serializerFile.getClasses()[0];
    const constructor = serializerClass.getConstructors()[0];
    const relationshipsInitializer = constructor.getVariableDeclaration("data").getInitializer().getProperty("relationships").getInitializer();

    const line = constructor.getStructure().statements.findIndex((e) => {
        if (typeof e === 'string')
            return e.match(new RegExp(`this.serializer.register.*${model}`)) !== null;
        else
            return false;
    });

    if (line !== -1) constructor.removeStatement(line);
    if (relationshipsInitializer.getProperty(column)) relationshipsInitializer.getProperty(column).remove();

    if (!isRelation) {
        serializerClass.getStaticProperty('whitelist').getInitializer().removeElement(`'${column}'`);
    }

    serializerFile.fixMissingImports();
    serializerFile.fixUnusedIdentifiers();
};

/**
 *
 * @param model
 * @param column
 * @returns {Promise<void>}
 */
const removeFromTest = async (model, column) => {
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
const removeFromValidation = (model, column) => {
    const relationFile = project.getSourceFile(`src/api/validations/${model}.validation.ts`);

    // all exported const should be validation schema
    const validationDeclarations = relationFile.getVariableDeclarations().filter((v) => v.getVariableStatement().getDeclarationKind() === 'const' && v.getVariableStatement().hasExportKeyword());

    validationDeclarations.forEach((declaration) => {
        const prop = declaration.getInitializer().getProperty(column);
        if (prop) prop.remove();
    });

    relationFile.fixMissingImports();
    relationFile.fixUnusedIdentifiers();
};

const removeRelationFromModelFile = (model,column) => {
    let modelFile = project.getSourceFile(`src/api/models/${model}.model.ts`);
    const modelClass = modelFile.getClasses()[0];

    const prop = modelClass.getInstanceProperty((p) => {
        return p.getName() === column || p.getName() === plural(column)
    });

    if (prop) prop.remove();

    modelFile.fixUnusedIdentifiers();
};

/**
 * @description  Remove a column in a model
 * @param {string} model Model name
 * @param {string} column Column name
 * @param isRelation
 * @param model2
 */
module.exports = async (model, column, isRelation,model2=' ') => {
    if (isRelation) {
        removeFromRelationTable(model, column);
    }

    removeFromSerializer(model, column, model2,isRelation);
    removeRelationFromModelFile(model, column);

    if (!isRelation) {
        await removeFromTest(model, column);
        removeFromValidation(model, column);
    }

    await project.save();
};
  
