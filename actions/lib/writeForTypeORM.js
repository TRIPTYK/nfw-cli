//node modules
const Util = require('util');
const FS = require('fs');

//project modules
const { writeToFirstEmptyLine, isImportPresent} = require('./utils');
const Log = require('../../utils/log');

//promisy
const ReadFile = Util.promisify(FS.readFile);
const WriteFile = Util.promisify(FS.writeFile);

/**
 *
 * @param {array} col
 * @description set default value for the column and check that default is not null when value can't be null
 * @returns {string} default
 */
exports.getDefault = (col) => {
    let sqlFunction = ['CURRENT_TIMESTAMP', 'GETDATE', 'GETUTCDATE', 'SYSDATETIME'];
    if (col.Default === ':no' || col.Type.type.includes('blob') || col.Type.type.includes('json') || col.Type.type.includes('text')) return '';
    else if (col.Default === 'null'  || col.Default === null && !(col.key === 'UNI' || col.Key === 'PRI')) {
        if (col.Null !== 'nullable:false,') return 'default : null';
        else return ''
    } else if (col.Type.type.includes('int') || col.Type.type === 'float' || col.Type.type === 'double' || col.Type.type === 'decimal' || col.Type.type === 'enum') return `default : ${col.Default}`;
    else if ((col.Type.type === 'timestamp' || col.Type.type === 'datetime') && (col.Default != null || col.Default.includes('(') || sqlFunction.includes(col.Default))) return ` default : () => "${col.Default}"`;
    else return `default :\`${col.Default}\``;

};


/**
 * @param {String} data
 * @param {String} key
 * @description  check if column can be null or not and check if key is primay. if key is primary , there's no need to check if column can be null
 * because primary imply that value can't be null
 * @returns {string}
 */
exports.getNull = (data, key) => {
    if (key === 'PRI' || key === 'UNI') return '';
    if (data === 'YES') return 'nullable:true,';
    return 'nullable:false,';
};

/**
 * @param {String} lowercase
 * @param {String} capitalize
 * @description add and import generated class names to the typeorm config file
 * @returns {Promise<void>}
 **/
exports.addToConfig = async (lowercase, capitalize) => {
    let configFileName = `${process.cwd()}/src/config/typeorm.config.ts`;
    let fileContent = await ReadFile(configFileName, 'utf-8');

    if (!isImportPresent(fileContent, capitalize)) {
        let imprt = writeToFirstEmptyLine(fileContent, `import { ${capitalize} } from "../api/models/${lowercase}.model";\n`)
            .replace(/(.*entities.*)(?=])(.*)/, `$1,${capitalize}$2`);

        await WriteFile(configFileName, imprt).catch(() => {
            Log.error(`Failed to write to : ${configFileName}`);
        });
    }
};


/**
 * @param {string} data
 * @description  mysql send key value as PRI , UNI. but a column written for a typeorm model primary or unique as parameter
 * @returns {string} primary or unique
 */
exports.getKey = data => {
    if (data === 'PRI') return ' primary : true,';
    if (data === 'UNI') return ' unique : true,';
    return '';
};

/**
 * @description  Format to typeorm format
 * @returns {string} data lenght/enum
 * @param info
 */
exports.getLength = (info) => {
    if (info.type === "enum") return `enum  :  [${info.length}],`;
    if (info.type === 'decimal') {
        let values = info.length.split(',');
        return `precision :${values[0]},\n    scale:${values[1]},`
    }
    if (info.length !== undefined && info.length !== '') {
        if (info.type.includes('int')) return `width : ${info.length},`;
        if (info.type.includes('date') || info.type.includes('time') || info.type === 'year') return `precision : ${info.length},`;
        return `length : ${info.length},`;
    }
    return "";
};