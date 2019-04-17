/**
 * @module modelWrite
 * @author Verliefden Romain , Deflorenne Amaury
 * @description this module write the model.ts based on columns of the database
 * if the table exist. If the table doesn't exist , the user enter the columns of
 * the futur table and the table is created in the database.
 * @exports writeModel
 * @exports addRelation
 * @exports removeColumn
 * @exports addColumn
 * @exports main
 */
const ejs = require('ejs');
const Util = require('util');
const Log = require('../utils/log');
const FS = require('fs');
const ReadFile = Util.promisify(FS.readFile);
const WriteFile = Util.promisify(FS.writeFile);
const path = require('path');
const {capitalizeEntity, columnExist, writeToFirstEmptyLine, isImportPresent, lowercaseEntity} = require('./lib/utils');


/**
 *
 * @param {Array} col
 * @description set default value for the column and check that default is not null when value can't be null
 * @returns {string} default
 */
const _getDefault = (col) => {
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
 *
 * @param {String} data
 * @param {String} key
 * @description  check if column can be null or not and check if key is primay. if key is primary , there's no need to check if column can be null
 * because primary imply that value can't be null
 * @returns {string} empty : property
 */
const _getNull = (data, key) => {
    if (key === 'PRI' || key === 'UNI') return '';
    if (data === 'YES') return 'nullable:true,';
    return 'nullable:false,';
};

/**
 *  @param {String} lowercase
 *  @param {String} capitalize
 * @description add and import generated class names to the typeorm config file
 **/
const _addToConfig = async (lowercase, capitalize) => {
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
 *
 * @param {string} data
 * @description  mysql send key value as PRI , UNI. but a column written for a typeorm model primary or unique as parameter
 * @returns {string} primary or unique
 */
const _getKey = data => {
    if (data === 'PRI') return ' primary : true,';
    if (data === 'UNI') return ' unique : true,';
    return '';
};

/**
 *
 * @description  Format to typeorm format
 * @returns {string} data lenght/enum
 * @param info
 */
const _getLength = (info) => {
    if (info.type === "enum")return `enum  :  [${info.length}],`;  
    if(info.type === 'decimal'){
      values = info.length.split(',');
      return `precision :${values[0]},\n    scale:${values[1]},`
    }
    if (info.length !== undefined && info.length !== '') {
        if (info.type.includes('int')) return `width : ${info.length},`;
        if (info.type.includes('date') || info.type.includes('time') || info.type === 'year') return `precision : ${info.length},`;
        return `length : ${info.length},`;
    }
    return "";
};

/**
 * @param {string} action Model name
 * @param {Array} data Data describing the model
 *
 * @description write a typeorm model from an array of info about an entity
 *
 */
exports.writeModel = async (action, data = null) => {
    let lowercase = lowercaseEntity(action);
    let capitalize = capitalizeEntity(lowercase);
    let p_file = await ReadFile(`${__baseDir}/templates/model/model.ejs`, 'utf-8');
    let pathModel = path.resolve(`${process.cwd()}/src/api/models/${lowercase}.model.ts`);
    let {columns, foreignKeys} = data;

    let entities = [];
    /*
     filter the foreign keys from columns , they are not needed anymore
     Only when imported by database
    */
    columns = columns.filter(column => {
        return foreignKeys.find(elem => elem.COLUMN_NAME === column.Field) === undefined;
    });


    columns.forEach(col => {
        if (col.Field === "id") return;

        col.Null = _getNull(col.Null, col.Key);
        col.Key = _getKey(col.Key);
        col.Default = _getDefault(col);
        col.length = _getLength(col.Type);
        entities.push(col);
    });
    let output = ejs.compile(p_file, {root: `${__baseDir}/templates/`})({
        entityLowercase: lowercase,
        entityCapitalize: capitalize,
        entities,
        createUpdate: data.createUpdate,
        capitalizeEntity,
        lowercaseEntity
    });

    await Promise.all([WriteFile(pathModel, output), _addToConfig(lowercase, capitalize)]).catch(e => Log.error(e.message));
    Log.success("Model created in :" + pathModel);
};

/**
 *  @description creates a basic model , with no entites , imports or foreign keys
 *  @param {string} action
 */
exports.basicModel = async (action) => {
    let lowercase = lowercaseEntity(action);
    let capitalize = capitalizeEntity(lowercase);
    let pathModel = path.resolve(`${process.cwd()}/src/api/models/${lowercase}.model.ts`);
    let modelTemp = await ReadFile(`${__baseDir}/templates/model/model.ejs`);
    let basicModel = ejs.compile(modelTemp.toString())({
        entityLowercase: lowercase,
        entityCapitalize: capitalize,
        entities: [],
        foreignKeys: [],
        createUpdate: {
            createAt: true,
            updateAt: true
        }
    });

    let p_write = WriteFile(pathModel, basicModel)
        .then(() => Log.success("Model created in :" + pathModel))
        .catch(() => Log.error("Failed generating model"));

    await Promise.all([_addToConfig(lowercase, capitalize), p_write])
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
        () => Log.success(`${model} serializer updated`)
    );
};

/**
 * @description  Add a column in a model
 * @param {string} model Model name
 * @param data
 */
exports.addColumn = async (model, data) => {
    let pathModel = `${process.cwd()}/src/api/models/${lowercaseEntity(model)}.model.ts`;
    let [columnTemp, modelFile] = await Promise.all([ReadFile(`${__baseDir}/templates/model/_column.ejs`), ReadFile(pathModel)]);
    if (data == null) throw  new Error('Column cancelled');
    if (await columnExist(model, data.columns.Field)) throw new Error('Column already added');
    let entity = data.columns;
    entity.Null = _getNull(entity.Null, entity.Key);
    entity.Key = _getKey(entity.Key);
    entity.Default = _getDefault(entity);
    entity.length = _getLength(entity.Type);
    let newCol = '  ' + ejs.compile(columnTemp.toString())({entity});
    var pos = modelFile.lastIndexOf('}');
    let newModel = `${modelFile.toString().substring(0, pos)}\n${newCol}\n}`;
    await Promise.all([WriteFile(pathModel, newModel), writeSerializer(model, data.columns.Field)]);
};

 

