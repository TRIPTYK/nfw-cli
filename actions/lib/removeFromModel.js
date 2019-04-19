const Util = require('util');
const FS = require('fs');
const ReadFile = Util.promisify(FS.readFile);
const WriteFile = Util.promisify(FS.writeFile);
const {singular, isSingular, plural} = require('pluralize');

/**
 * @description  Remove relationship from serializer and controller
 * @param entity
 * @param {string} column relation name
 */
const removefromRelationTable = async (entity, column) => {
    let regexArray = new RegExp(`,'${column}'|'${column}',|'${column}'`, 'm');
    let relation = `${process.cwd()}/src/api/enums/relations/${singular(entity)}.relations.ts`;
    let relationContent = await ReadFile(relation, 'utf-8');
    newRel = relationContent.replace(regexArray, '');
    await WriteFile(relation, newRel);
};

const removeFromSerializer = async (entity, column) => {
    let serializer = `${process.cwd()}/src/api/serializers/${singular(entity)}.serializer.ts`;
    let newSer = await ReadFile(serializer, 'utf-8');
    let regexAddRel = new RegExp(`${column} :[\\s\\S]*?},`);
    let regexArray = new RegExp(`,'${column}'|'${column}',|'${column}'`, 'm');
    if (isSingular(column) && newSer.match(regexAddRel)) newSer = newSer.replace(new RegExp(`${plural(column)} :[\\s\\S]*?},`), '');
    newSer = newSer.replace(regexAddRel, '');
    newSer = newSer.replace(regexArray, '');
    await WriteFile(serializer, newSer)
};

const removeFromTest = async (model, column) => {
    let testPath = `${process.cwd()}/test/${model}.test.js`;
    let regexRandom = new RegExp(`[^']${column}.*?,`, 'gm');
    let regexArray = new RegExp(`,'${column}'|'${column}',|'${column}'`, 'gm');
    let testFile = await ReadFile(testPath, 'utf-8');
    testFile = testFile.replace(regexRandom, '').replace(regexArray, '');
    await WriteFile(testPath, testFile);
};


const removeFromValidation = async (model, column) => {
    let valPath = `${process.cwd()}/src/api/validations/${model}.validation.ts`;
    let regexRandom = new RegExp(`${column} :.*?,`, 'gm');
    let valFile = await ReadFile(valPath, 'utf-8');
    valFile = valFile.replace(regexRandom, '');
    await WriteFile(valPath, valFile);
};


/**
 * @description  Remove a column in a model
 * @param {string} model Model name
 * @param {string} column Column name
 */
module.exports = async (model, column, isRelation) => {
    let regexColumn = new RegExp(`@Column\\({[\\s\\S][^{]*?${column};`, 'm');
    let regexMany = new RegExp(`@Many[\\s\\S][^;]*?${column} :.*`);
    let regexOne = new RegExp(`@One[\\s\\S][^;]*?${column} :.*`);
    let pathModel = `${process.cwd()}/src/api/models/${singular(model)}.model.ts`;
    let modelFile = await ReadFile(pathModel,'utf-8');
    if (modelFile.match(regexColumn) && !isRelation) modelFile = modelFile.toString().replace(regexColumn, '');
    else if (modelFile.match(regexMany) && isRelation)  modelFile = modelFile.replace(regexMany, '');
    else if (modelFile.match(regexOne) && isRelation) modelFile = modelFile.replace(regexOne, '');
    else throw new Error('Column doesn\'t exist');
    let toExec = [WriteFile(pathModel, modelFile), removeFromSerializer(model, column), removefromRelationTable(model, column)];
    if (!isRelation) toExec.push(removeFromTest(model, column), removeFromValidation(model, column));
    await Promise.all(toExec);
};
  
