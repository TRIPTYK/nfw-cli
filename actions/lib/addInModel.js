const ejs = require('ejs');
const Util = require('util');
const Log = require('../../utils/log');
const FS = require('fs');
const chalk = require('chalk');
const kebab = require('kebab-case')

const ReadFile = Util.promisify(FS.readFile);
const WriteFile = Util.promisify(FS.writeFile);
const { columnExist, lowercaseEntity, buildJoiFromColumn} = require('./utils');
const {getKey,getDefault,getNull,getLength} = require('./writeForTypeORM');


const addToValidations = async (model,column) =>{
    //path to validations.ts file and read it
    let valPath = `${process.cwd()}/src/api/validations/${model}.validation.ts`;
    let valFile = await ReadFile(valPath, 'utf-8');

    //regex 
    let regexVal = new RegExp('(attributes[\\s\\S]*?)(})','gm');
    let regexRandom = new RegExp(`[\\s]${column.Field} :.*?,`, 'gm');

    //build string based on Joi object
    let col = await buildJoiFromColumn(column);
    let toPut = `   ${col.name} : Joi.${col.baseType}()`;
    if(col.specificType) toPut+= `.${col.specificType}()`;
    if(col.length && col.baseType !== 'any') toPut += `.max(${col.length})`;
    col.baseColumn.Null !== 'NO' && col.baseColumn.Default !== 'NULL' ? toPut+='.required(),' : toPut+='.optional(),';

    if(!valFile.match(regexRandom))valFile = valFile.replace(regexVal,`$1 ${toPut}$2 `);
    await WriteFile(valPath,valFile).then(() => Log.info(`${chalk.cyan(`src/api/validations/${model}.validation.ts`)} updated`))
};

const addToTest = async (model, column) => {
    //Path to .test.js file and read it
    let testPath = `${process.cwd()}/test/${model}.test.ts`;
    let testFile = await ReadFile(testPath,'utf-8');


    //regex to put fixtures.randomType(length) in the .test.js file and string to write
    let rgxRandomType = new RegExp(`(.send\\({[\\s\\S]*?)()(})`,'gm');
    if (column.Type.length === undefined) column.Type.length = '';
    if (column.Type.type ==='enum') column.Type.length = `[${column.Type.length}]`
    let toPutRandType = `       ${column.Field} : fixtures.random${column.Type.type}(${column.Type.length}),`;


    //regex to hand 'column' in the .body to include all keys
    //write 'column' or ,'column' if there is already columns in the list
    let rgxList = new RegExp(`(expect\\(res.body[\\s\\S]*?')(\\n||\\r)`,'gm');
    let regexMatch = testFile.match(rgxList);
    let toPutInList;
    if (regexMatch[2].includes('\'')) toPutInList = `,'${kebab(column.Field)}'`;
    else toPutInList = `${kebab(column.Field)}`;


    //put the string in the file if not already present then write
    let regexRandom = new RegExp(`[\\s]${column.Field}.*?,`, 'gm');
    let regexArray = new RegExp(`,'${column.Field}'|'${column.Field}',|'${column.Field}'`, 'gm');
    if(!testFile.match(regexRandom))testFile = testFile.replace(rgxRandomType,`$1${toPutRandType}\n$3`);
    if(!testFile.match(regexArray))testFile = testFile.replace(rgxList,`$1${toPutInList}\n`);
    await WriteFile(testPath,testFile).then(() => Log.info(`${chalk.cyan(`test/${model}.test.ts`)} updated`));

};

const writeSerializer = async (model, column) => {
    let serializerPath = `${process.cwd()}/src/api/serializers/${lowercaseEntity(model)}.serializer.ts`;
    let regexWhitelist = new RegExp('(.+withelist.+=.+)(\\[)([^\\]]*)');
    let regexArrayCheck = new RegExp(`.*withelist.*?'${column}'`, 'm');
    let newSer = await ReadFile(serializerPath, 'utf-8');
    let regexArray = newSer.match(/(.+withelist.+=.+)(\[)([^\]]*)/);
    if (regexArray[3].includes("'")) newValue = `,'${column}'`;
    else newValue = `'${column}'`;
    if (!newSer.match(regexArrayCheck)) newSer = newSer.replace(regexWhitelist, `$1$2$3${newValue}`);
    await WriteFile(serializerPath, newSer).then(
        () => Log.info(`${chalk.cyan(`src/api/serializers/${lowercaseEntity(model)}.serializer.ts`)} updated`)
    );
};

/**
 * @description  Add a column in a model
 * @param {string} model Model name
 * @param data
 */
module.exports = async (model, data) => {
    let pathModel = `${process.cwd()}/src/api/models/${lowercaseEntity(model)}.model.ts`;
    let [columnTemp, modelFile] = await Promise.all([ReadFile(`${__baseDir}/templates/model/_column.ejs`), ReadFile(pathModel)]);
    if (data == null) throw  new Error('Column cancelled');
    if (columnExist(model, data.columns.Field)) throw  new Error('Column already exist');
    let entity = data.columns;
    entity.Null = getNull(entity.Null, entity.Key);
    entity.Key = getKey(entity.Key);
    entity.Default = getDefault(entity);
    entity.length = getLength(entity.Type);
    let newCol = '  ' + ejs.compile(columnTemp.toString())({entity});
    let pos = modelFile.lastIndexOf('}'); let newModel = `${modelFile.toString().substring(0, pos)}\n${newCol}\n}`;
    Log.info(`Column generated in ${chalk.cyan(`src/api/models/${lowercaseEntity(model)}.model.ts`)}`);
    await Promise.all([WriteFile(pathModel, newModel), writeSerializer(model, data.columns.Field),addToTest(model, data.columns),addToValidations(model, data.columns)]);
};
