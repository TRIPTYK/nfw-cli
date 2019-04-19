/**
 * @module utils
 * @exports countLines
 * @exports prompt
 * @exports isImportPresent
 * @exports removeImport
 * @exports writeToFirstEmptyLine
 * @exports removeEmptyLines
 * @exports modelFileExists
 * @exports capitalizeEntity
 * @exports lowercaseEntity
 * @exports sqlTypeData
 * @exports fileExists
 * @exports buildJoiFromColumn
 * @exports isBridgindTable
 * @exports columnExist
 */

/**
 * Requires
 */
const FS = require('fs');
const readline = require('readline');
const Util = require('util');
const ReadFile = FS.readFileSync;
const snake= require('to-snake-case');
const removeAccent= require('remove-accents');

/**
 * @description : count the lines of a file
 * @param {string} path
 */
exports.countLines = (path) => {
    let count = 0;
    return new Promise((resolve, reject) => {
        try {
            FS.createReadStream(path)
                .on('data', function (chunk) {
                    let i;
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

/**
 * @description prompt a question and wait for a response
 * @param {string} question the question to ask
 */
exports.prompt = (question) => {
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

/**
 * @description check if import is present in string
 * @param {string} string
 * @param {string} imprt import name
 * @returns {boolean} true/false
 */
exports.isImportPresent = (string, imprt) => {
    let match = string.match(new RegExp(`import\\s+{.*${imprt}\\b.*}.*;`, 'gm'));
    return match !== null;
};

/**
 * @description remove import from string
 * @param {string} string
 * @param {string} imprt import name
 */
exports.removeImport = (string, imprt) => string.replace(new RegExp(`\n?import\\s+{.*${imprt}\\b.*}.*;`, "g"), "");

/**
 * @description replace text to the first empty line of string
 * @param {string} string
 * @param {string} by text to replace by
 */
exports.writeToFirstEmptyLine = (string, by = "") => string.replace(/^\s*$/m, by);

/**
 * @description remove blank lines from text
 * @param {string} string
 */
exports.removeEmptyLines = (string) => string.replace(/\n?^\s*$/gm, "");


/**
 * @description check if model file exists in projet
 * @param entity
 */
exports.modelFileExists = (entity) => exports.fileExists(`${process.cwd()}/src/api/models/${exports.lowercaseEntity(entity)}.model.ts`);

/**
 * @description capitalize first letter of String
 * @param {string} entity
 */
exports.capitalizeEntity = (entity) => entity[0].toUpperCase() + entity.substr(1);

/**
 * @description lowercase first letter of string
 * @param {string} entity
 */
exports.lowercaseEntity = (entity) => entity[0].toLowerCase() + entity.substr(1);

/**
 * @description transform an sql type string to an object with type and length
 * @param {string} type
 */
exports.sqlTypeData = (type) => /(?<type>\w+)(?:\((?<length>.+)\))?/.exec(type).groups;

/**
 * @description check if file exists
 * @param {string} filePath
 * @returns {boolean}
 */
exports.fileExists = (filePath) => {
    try {
        return FS.statSync(filePath).isFile();
    } catch (err) {
        return false
    }
};
/**
 * @description Create a validation to a generated model
 * @param {column} column Column name
 * @returns {object}
 */
exports.buildJoiFromColumn = (column) => {
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


/**
 * @description Check if a table is a bridging table in a many to many relationship
 * @returns {boolean}
 * @param entity
 */
exports.isBridgindTable = (entity) => {
    let {columns, foreignKeys} = entity;
    columns = columns.filter(column => {
        return foreignKeys.find(elem => elem.COLUMN_NAME === column.Field) === undefined;
    });
    return columns.length === 0;
};
/**
 * @description Check if a column exist in a database table
 * @param {string} model Model name
 * @param {string} column Column name
 * @returns {boolean}
 */
exports.columnExist =  (model, column) => {
    let pathModel = `${process.cwd()}/src/api/models/${module.exports.lowercaseEntity(model)}.model.ts`;
    let modelFile =  ReadFile(pathModel, 'utf-8');
    let exist = false;
    let regexColumn = new RegExp(`@Column\\({[\\s\\S][^{]*?${column};`, 'm');
    if (modelFile.match(regexColumn)) exist = true;
    return exist
};

exports.relationExist=  (model,column) =>{
    let pathModel = `${process.cwd()}/src/api/models/${module.exports.lowercaseEntity(model)}.model.ts`;
    let modelFile =  ReadFile(pathModel, 'utf-8');
    let exist = false;
    let regexMany = new RegExp(`@Many[\\s\\S][^;]*?${column}.*`);
    let regexOne = new RegExp(`@One[\\s\\S][^;]*?${column}.*`);
    if (modelFile.match(regexMany)) exist = true;
    else if (modelFile.match(regexOne)) exist = true;
    return exist
} 

exports.format = (name) =>{
    return snake(removeAccent(name));
}
