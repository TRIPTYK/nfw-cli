/**
 * @module writeModelAction
 * @author Verliefden Romain
 * @author Deflorenne Amaury
 * @description this module write the model.ts based on columns of the database
 * if the table exist. If the table doesn't exist , the user enter the columns of
 * the future table and the table is created in the database.
 */
const ejs = require('ejs');
const Util = require('util');
const Log = require('../utils/log');
const FS = require('fs');
const ReadFile = Util.promisify(FS.readFile);
const WriteFile = Util.promisify(FS.writeFile);
const path = require('path');
const {capitalizeEntity, columnExist, writeToFirstEmptyLine, isImportPresent, lowercaseEntity} = require('./lib/utils');
const {getKey,getDefault,getNull,getLength,addToConfig} = require('./lib/writeForTypeORM');


/**
 * @param {string} action Model name
 * @param {array} data Data describing the model
 * @description write a typeorm model from an array of info about an entity
 * @returns {Promise<void>}
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

        col.Null = getNull(col.Null, col.Key);
        col.Key = getKey(col.Key);
        col.Default = getDefault(col);
        col.length = getLength(col.Type);
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

    await Promise.all([WriteFile(pathModel, output), addToConfig(lowercase, capitalize)]).catch(e => Log.error(e.message));
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

    await Promise.all([addToConfig(lowercase, capitalize), p_write])
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

 

