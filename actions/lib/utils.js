/**
 * @module utils
 * @description utilities for project
 * @author Deflorenne Amaury
 * @author Verliefden Romain
 * @author Sam Antoine
 */

// node modules
const FS = require('fs');
const readline = require('readline');
const snake= require('to-snake-case');
const removeAccent= require('remove-accents');
const reservedWords = require('reserved-words');

const project = require('../../utils/project');

const { SqlConnection , DatabaseEnv } = require('../../database/sqlAdaptator');

/**
 * @description : Count the lines of a file
 * @param {string} path File path
 * @returns {Promise<number>}
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
 * @param {string} question
 * @returns {Promise<string>}
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
 * @description Check if import is present in string
 * @param {string} string
 * @param {string} importName import name
 * @returns {boolean}
 */
exports.isImportPresent = (string, importName) => {
    let match = string.match(new RegExp(`import\\s+{.*${importName}\\b.*}.*;`, 'gm'));
    return match !== null;
};

/**
 * @description remove import from string
 * @param {string} string
 * @param {string} imprt import name
 * @return {string}
 */
exports.removeImport = (string, imprt) => string.replace(new RegExp(`\n?import\\s+{.*${imprt}\\b.*}.*;`, "g"), "");

/**
 * @description replace text to the first empty line of string
 * @param {string} string
 * @param {string} by text to replace by
 * @returns {string}
 */
exports.writeToFirstEmptyLine = (string, by = "") => string.replace(/^\s*$/m, by);

/**
 * @description remove blank lines from text
 * @param {string} string
 * @returns {string}
 */
exports.removeEmptyLines = (string) => string.replace(/\n?^\s*$/gm, "");


/**
 * @description check if model file exists in projet
 * @param {string} entity
 * @returns {boolean}
 */
exports.modelFileExists = (entity) => exports.fileExists(`${process.cwd()}/src/api/models/${exports.lowercaseEntity(entity)}.model.ts`);

/**
 * @description capitalize first letter of String
 * @param {string} entity
 * @returns {string}
 */
exports.capitalizeEntity = (entity) => entity[0].toUpperCase() + entity.substr(1);

/**
 * @description lowercase first letter of string
 * @param {string} entity
 * @returns {string}
 */
exports.lowercaseEntity = (entity) => entity[0].toLowerCase() + entity.substr(1);

/**
 * @description transform an sql type string to an object with type and length
 * @param {string} type
 * @returns {object}
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
 * @param {string} entity
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
    let modelClass = project.getSourceFile(`src/api/models/${module.exports.lowercaseEntity(model)}.model.ts`).getClasses()[0];
    return modelClass.getInstanceProperty(column) !== undefined;
};

/**
 * Check if relation exists in model
 * @param {string} model
 * @param {string} column
 * @returns {boolean}
 */
exports.relationExist=  (model, column) =>{
    let modelClass = project.getSourceFile(`src/api/models/${module.exports.lowercaseEntity(model)}.model.ts`).getClasses()[0];
    const relProp = modelClass.getInstanceMember(column);

    if(relProp !== null) {
        relProp.getDecorator(declaration => {
            return declaration.getName().includes('To');
        })
    }

    return false;
};

/**
 * Sanitize string : removes accents and transform to snake_case
 * @param name
 * @returns {String}
 */
exports.format = (name) =>{
    return snake(removeAccent(name));
};

/**
 *
 * @param string
 * @returns {Promise<Response | undefined> | *}
 */
exports.isAlphanumeric = (string) => {
    return string.match(/(?:^|(?<= ))[a-zA-Z0-9]+(?= |$)/);
};

/**
 *
 * @param string
 * @returns {Promise<Response | undefined> | *}
 */
exports.isValidVarname = (string) => {
    return string.match(/^[a-zA-Z_$][a-zA-Z_$0-9]*$/);
};

/**
 *
 * @param string
 * @returns {boolean}
 */
exports.isValidParam = (string) => !exports.isValidVarname(string) || !reservedWords.check(string, 6);



exports.createDataBaseIfNotExists = async (setupEnv) => {
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

/**
 *
 * @param dbColumnaData
 */
exports.buildModelColumnArgumentsFromObject = (dbColumnaData) => {
    const columnArgument = {};

    columnArgument['type'] = dbColumnaData.Type.type;

    //handle default
    if (dbColumnaData.Default !== ":no")
        columnArgument['default'] = dbColumnaData.Default;

    //handle nullable
    if (dbColumnaData.Key !== 'PRI' && dbColumnaData.Key !== 'UNI')
        columnArgument['nullable'] = dbColumnaData.Null === 'YES';
    else if (dbColumnaData.Key === 'UNI')
        columnArgument['unique'] = true;
    else if (dbColumnaData.Key === 'PRI')
        columnArgument['primary'] = true;

    //handle length
    if (dbColumnaData.Type.type === "enum")
        columnArgument['enum'] = dbColumnaData.Type.length;

    if (dbColumnaData.Type.type === 'decimal') {
        let [precision,scale] = dbColumnaData.Type.length.split(',');
        columnArgument['precision'] = precision;
        columnArgument['scale'] = scale;
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

/**
 *
 * @param modelClass
 * @return
 */
exports.addToConfig = async (modelClass) => {
    const relativePath = 'src/config/typeorm.config.ts';
    const file = project.getSourceFile(relativePath);

    const entitiesArray = file.getClass('TypeORMConfiguration')
        .getStaticMethod('connect')
        .getVariableDeclaration("entities")
        .getInitializer();

    entitiesArray.addElement(modelClass);

    file.fixUnusedIdentifiers();

    await project.save();
};