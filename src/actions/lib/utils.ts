/**
 * @module utils
 * @description utilities for project
 * @author Deflorenne Amaury
 * @author Verliefden Romain
 * @author Sam Antoine
 */

// node modules
import FS = require('fs');
import readline = require('readline');
import snake= require('to-snake-case');
import removeAccent= require('remove-accents');
import reservedWords = require('reserved-words');

import project = require('../../utils/project');

import { SqlConnection , DatabaseEnv } from '../../database/sqlAdaptator';
import { ColumnList } from 'mysqldump';


//description : Count the lines of a file
export function countLines (path: string): Promise<number> {
    let count = 0;
    return new Promise((resolve, reject) => {
        try {
            FS.createReadStream(path)
                .on('data', function (chunk) {
                    let i: number;
                    for (i = 0; i < chunk.length; ++i)
                        if (chunk[i] === 10) count++; // 10 -> line ending in ASCII table
                })
                .on('end', function () {
                    resolve(count); // return promise
                });
        } catch (e) {
            reject(e.message);
        }
    });
};

//description : prompt a question and wait for a response
export function prompt (question: string): Promise<string>{
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((res) => {
        rl.question(question, (answer) => {
            res(answer);
            rl.close();
        });
    });
};

//description : Check if import is present in string
export function isImportPresent (string: string, importName: string): boolean {
    let match = string.match(new RegExp(`import\\s+{.*${importName}\\b.*}.*;`, 'gm'));
    return match !== null;
};

 //description : replace text to the first empty line of string
export function writeToFirstEmptyLine (string: string, by = ""): string {
    return string.replace(/^\s*$/m, by);
} 

//description : remove blank lines from text
export function removeEmptyLines (string: string): string {
    return string.replace(/\n?^\s*$/gm, "");
} 

//description : check if model file exists in projet
export function modelFileExists (entity: string): boolean {
    return exports.fileExists(`${process.cwd()}/src/api/models/${exports.lowercaseEntity(entity)}.model.ts`);
}

//description : capitalize first letter of String
export function capitalizeEntity (entity: string): string{
    return entity[0].toUpperCase() + entity.substr(1);
}

//description : lowercase first letter of string
export function lowercaseEntity (entity: string): string{
    return entity[0].toLowerCase() + entity.substr(1);
} 

//description : transform an sql type string to an object with type and length
export function sqlTypeData (type:string): object {
    return /(?<type>\w+)(?:\((?<length>.+)\))?/.exec(type).groups;
} 

//description : check if file exists
export function fileExists (filePath: string): boolean {
    try {
        return FS.statSync(filePath).isFile();
    } catch (err) {
        return false
    }
};

//description : Create a validation to a generated model
export function buildJoiFromColumn (column: any): object {
    let {length, type} = column.Type;
    let joiObject = {
        name: column.Field,
        baseType: "any",
        specificType: null,
        length,
        baseColumn: column,
    };

    if (type.match(/text|char/i))
        joiObject.baseType = "string";

    if (type.match(/time|date/i))
        joiObject.baseType = "date";

    if (type.match(/binary|image|blob/i))
        joiObject.baseType = "binary";

    if (type.match(/int|float|double|decimal/i)) {
        joiObject.baseType = "number";
        joiObject.length = null;

        if (type === "int") joiObject.specificType = "integer";
    }

    return joiObject;
};

//description Check if a table is a bridging table in a many to many relationship
export function isBridgindTable (entity: any): boolean {
    let {columns, foreignKeys} = entity;
    columns = columns.filter((column: any) => {
        return foreignKeys.find((elem: any) => elem.COLUMN_NAME === column.Field) === undefined;
    });
    return columns.length === 0;
};

//description Check if a column exist in a database table
export function columnExist (model: string, column: string): boolean {
    let modelClass = project.getSourceFile(`src/api/models/${module.exports.lowercaseEntity(model)}.model.ts`).getClasses()[0];
    return modelClass.getInstanceProperty(column) !== undefined;
};

//Description : Check if relation exists in model
export function relationExist (model: string, column: string): boolean {
    let modelClass = project.getSourceFile(`src/api/models/${module.exports.lowercaseEntity(model)}.model.ts`).getClasses()[0];
    const relProp = modelClass.getInstanceMember(column);

    if(relProp) {
        relProp.getDecorator(declaration => {
            return declaration.getName().includes('To');
        })
    }

    return false;
};

//Description : Sanitize string : removes accents and transform to snake_case
export function format (name: string): string{
    return snake(removeAccent(name));
};

export function isAlphanumeric (string: string): string[]{
    return string.match(/(?:^|(?<= ))[a-zA-Z0-9]+(?= |$)/);
};

export function isValidVarname (string: string): string[]{
    return string.match(/^[a-zA-Z_$][a-zA-Z_$0-9]*$/);
};

export function isValidParam (string: string): boolean {
    return !exports.isValidVarname(string) || !reservedWords.check(string, 6);
} 

export async function createDataBaseIfNotExists (setupEnv: DatabaseEnv) {
    const env = new DatabaseEnv(`${setupEnv}.env`);
    const sqlConnection = new SqlConnection();
    const currentEnvData = env.getEnvironment();
    try {
        await sqlConnection.connect(env.getEnvironment());
    } catch (e) {
        let clonedEnv = { ... currentEnvData };
        delete clonedEnv.TYPEORM_DB;
        await sqlConnection.connect(clonedEnv);

        if (e.code === 'ER_BAD_DB_ERROR') {
            await sqlConnection.createDatabase(env.getEnvironment().TYPEORM_DB);
        }
        else
            throw new Error(`Unhandled database connection error (${e.code}) : exiting ...`);
    }
};

export function buildModelColumnArgumentsFromObject (dbColumnaData: any) {
    const columnArgument = {};

    columnArgument['type'] = dbColumnaData.Type.type;

    //handle default
    if (dbColumnaData.Default !== ":no")
        columnArgument['default'] = dbColumnaData.Default;

    if (dbColumnaData.Default === null && dbColumnaData.Null === 'NO')
        delete columnArgument['default'];

    //handle nullable
    if (dbColumnaData.Key !== 'PRI' && dbColumnaData.Key !== 'UNI') {
        columnArgument['nullable'] = dbColumnaData.Null === 'YES';
    }else if (dbColumnaData.Key === 'UNI')
        columnArgument['unique'] = true;
    else if (dbColumnaData.Key === 'PRI')
        columnArgument['primary'] = true;

    //handle length
    if (dbColumnaData.Type.type === "enum") {
        columnArgument['enum'] = dbColumnaData.Type.length.split(',').map(e => e.replace(/'|\\'/g,""));
        return columnArgument;
    }

    if (dbColumnaData.Type.type === 'decimal') {
        let [precision,scale] = dbColumnaData.Type.length.split(',');
        columnArgument['precision'] = parseInt(precision);
        columnArgument['scale'] = parseInt(scale);
        return columnArgument;
    }

    if (dbColumnaData.Type.length !== undefined && dbColumnaData.Type.length !== '') {
        const length = parseInt(dbColumnaData.Type.length);

        if (dbColumnaData.Type.type.includes('int'))
            columnArgument['width'] = length;
        else if (dbColumnaData.Type.type.includes('date') || dbColumnaData.Type.type.includes('time') || dbColumnaData.Type.type === 'year')
            columnArgument['precision'] = length;
        else
            columnArgument['length'] = length;
    }

    return columnArgument;
};

export function buildValidationArgumentsFromObject (dbColumnaData: any,isUpdate = false) {
    const validationArguments = {};

    if (!isUpdate && dbColumnaData.Null !== 'NO' && dbColumnaData.Default !== 'NULL' && !(['createdAt','updatedAt'].includes(dbColumnaData.Field)))
        validationArguments['exists'] = true;
    else
        validationArguments['optional'] = {
            options : {
                nullable: true,
                checkFalsy: true
            }
        };

    if (dbColumnaData.Type.length)
        validationArguments['isLength'] = {
            errorMessage : `Maximum length is ${dbColumnaData.Type.length}`,
            options: { min: 0 , max: parseInt(dbColumnaData.Type.length) }
        };
    else
        validationArguments['optional'] = true;

    if (dbColumnaData.Field === 'email')
        validationArguments['isEmail'] = {
            errorMessage : 'Email is not valid'
        };

    if (dbColumnaData.Type.type.includes('text') || dbColumnaData.Type.type.includes('char')) {
        validationArguments['isString'] = {
            errorMessage : 'This field must be a string'
        };
    }

    if (dbColumnaData.Type.type === 'decimal') {
        validationArguments['isDecimal'] = {
            errorMessage : 'This field must be decimal'
        };
    }

    if (dbColumnaData.Type.type === 'int') {
        if (dbColumnaData.Type.length !== 1) {
            validationArguments['isInt'] = {
                errorMessage : 'This field must be an integer'
            };
        }else{
            delete validationArguments['isLength'];
            validationArguments['isBoolean'] = {
                errorMessage : 'This field must be a boolean'
            };
        }
    }

    if (dbColumnaData.Type.type.includes('time') || dbColumnaData.Type.type.includes('date')) {
        delete validationArguments['isLength'];
        validationArguments['custom'] = {
            errorMessage : 'This field is not a valid date',
            options : (date) => {
                // @ts-ignore
                return Moment(date, true).isValid()
            }
        }
    }

    if (dbColumnaData.Type.type === 'enum') {
        delete validationArguments['isLength'];
        validationArguments['isIn'] = {
            errorMessage : `Must be in these values : ${dbColumnaData.Type.length}`,
            options : [dbColumnaData.Type.length.split(',').map((e: string) => e.replace(/'|\\'/g,""))]
        };
    }

    return validationArguments;
};

//Description : Get env files in directory
export function getEnvFilesNames (directory: string = '.'): string[] {
    let files = FS.readdirSync(directory);

    // select only env files
    return files
        .filter((file) => file.includes('.env'))
        .map((fileName) => fileName.substr(0, fileName.lastIndexOf('.')));
}