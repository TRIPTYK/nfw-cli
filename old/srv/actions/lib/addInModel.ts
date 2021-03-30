import Util = require('util');
import Log = require('../../utils/log');
import FS = require('fs');
import chalk from 'chalk';
import kebab = require('dashify');
import stringifyObject = require('stringify-object');

const ReadFile = Util.promisify(FS.readFile);
const WriteFile = Util.promisify(FS.writeFile);
import {  buildValidationArgumentsFromObject} from './utils';
import project = require('../../utils/project');

export function addToValidations (model: string, column: any) {
    let file = project.getSourceFile(`src/api/validations/${model}.validation.ts`);

    // all exported const should be validation schema
    const validationDeclarations = file.getVariableDeclarations().filter((v) => v.getVariableStatement().getDeclarationKind() === 'const' && v.getVariableStatement().hasExportKeyword());

    validationDeclarations.forEach((declaration:  any) => {
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

export async function addToTest (model: string, column: any) {
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

export function writeSerializer (model: string, column: any) {
    const relationFile: any = project.getSourceFile(`src/api/enums/json-api/${model}.enum.ts`);

    relationFile.getVariableDeclaration(`${model}Serialize`).getInitializer().addElement(`'${column}'`);
    relationFile.getVariableDeclaration(`${model}Deserialize`).getInitializer().addElement(`'${column}'`);

    relationFile.fixMissingImports();
    relationFile.fixUnusedIdentifiers();
};
