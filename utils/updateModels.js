// TODO : is this module used ? Documentation ?

const Log = require('../utils/log');
const Util = require('util');
const FS = require('fs');
const ReadFile = Util.promisify(FS.readFile);
const WriteFile = Util.promisify(FS.writeFile);
const { modelFileExists,columnExist ,capitalizeEntity, writeToFirstEmptyLine , isImportPresent , lowercaseEntity} = require('../generate/utils');
const pluralize = require('pluralize');


const addToValidations = () =>{

};

const addToTest = async (model, column) => {
    //Path to .test.js file and read it
    let testPath = `${process.cwd()}/test/${model}.test.js`;
    let testFile = await ReadFile(testPath,'utf-8');


    //regex to put fixtures.randomType(length) in the .test.js file and string to write
    let rgxRandomType = new RegExp(`(.send\\({[\\s\\S]*?)()(})`);
    if (column.Type.length === undefined) column.Type.length = '';
    let toPutRandType = `${column.Field} : fixtures.random${column.Type.type}(${column.Type.length})`;


    //regex to hand 'column' in the .body to include all keys
    //write 'column' or ,'column' if there is already columns in the list
    let rgxList = new RegExp(`(expect\\(res.body[\\s\\S]*?\\()()([^);]*)`);
    let regexMatch = newSer.match(rgxList);
    let toPutInList;
    if (regexMatch[2].includes('\'')) toPutInList = `,'${column}'`;
    else toPutInList = `${column}`;


    //put the string in the file then write
    testFile = testFile.replace(rgxRandomType,`$1 \n ${toPutRandType} \n $3`).replace(rgxList,`$1$2${toPutInList}`);
    await WriteFile(testPath,testFile);

};
