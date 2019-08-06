
const ejs = require('ejs');
const Util = require('util');
const Log = require('../../utils/log');
const FS = require('fs');
const chalk = require('chalk');
const kebab = require('dashify');
const stringifyObject = require('stringify-object');

const ReadFile = Util.promisify(FS.readFile);
const WriteFile = Util.promisify(FS.writeFile);
const { columnExist, lowercaseEntity , buildModelColumnArgumentsFromObject , buildValidationArgumentsFromObject} = require('./utils');
const project = require('../../utils/project');

const addToValidations = (model,column) =>{
    let file = project.getSourceFile(`src/api/validations/${model}.validation.ts`);

    // all exported const should be validation schema
    const validationDeclarations = file.getVariableDeclarations().filter((v) => v.getVariableStatement().getDeclarationKind() === 'const' && v.getVariableStatement().hasExportKeyword());

    validationDeclarations.forEach((declaration) => {
        if (declaration.getName().includes('update'))
            declaration.getInitializer().addPropertyAssignment({
                name: column.Field,
                initializer: stringifyObject(buildValidationArgumentsFromObject(column,true))
            });

        if (declaration.getName().includes('create') || declaration.getName().includes('replace'))
            declaration.getInitializer().addPropertyAssignment({
                name: column.Field,
                initializer: stringifyObject(buildValidationArgumentsFromObject(column))
            });
    });
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
    let rgxList = new RegExp(`(expect\\(res.body[\\s\\S]*?')([\\s\\n\\r])`,'gm');
    let regexMatch = testFile.match(rgxList);
    let toPutInList;
    if (regexMatch[2].includes('\'')) toPutInList = `,'${kebab(column.Field)}'\n`;
    else toPutInList = `${kebab(column.Field)}`;


    //put the string in the file if not already present then write
    let regexRandom = new RegExp(`[\\s]${column.Field}.*?,`, 'gm');
    let regexArray = new RegExp(`,'${column.Field}'|'${column.Field}',|'${column.Field}'`, 'gm');
    if(!testFile.match(regexRandom))testFile = testFile.replace(rgxRandomType,`$1${toPutRandType}\n$3`);
    if(!testFile.match(regexArray))testFile = testFile.replace(rgxList,`$1${toPutInList}`);
    await WriteFile(testPath,testFile).then(() => Log.info(`${chalk.cyan(`test/${model}.test.ts`)} updated`));

};

const writeSerializer = (model, column) => {
    const file = project.getSourceFile(`src/api/serializers/${model}.serializer.ts`);
    const serializerClass = file.getClasses()[0];

    serializerClass.getStaticProperty('whitelist').getInitializer().addElement(`'${column}'`);
};

/**
 * @description  Add a column in a model
 * @param {string} model Model name
 * @param data
 */
module.exports = async (model, data) => {
    let pathModel = `src/api/models/${lowercaseEntity(model)}.model.ts`;
    if (data === null) throw  new Error('Column cancelled');
    if (columnExist(model, data.columns.Field)) throw  new Error('Column already exist');

    let entity = data.columns;

    project.getSourceFile(pathModel).getClasses()[0].addProperty({name : data.columns.Field }).addDecorator({
        name : 'Column' , arguments : stringifyObject(buildModelColumnArgumentsFromObject(entity))
    }).setIsDecoratorFactory(true);

    writeSerializer(model, data.columns.Field);
    addToValidations(model, data.columns);
    await addToTest(model,data.columns);

    Log.info(`Column generated in ${chalk.cyan(`src/api/models/${lowercaseEntity(model)}.model.ts`)}`);
    await project.save();
};
