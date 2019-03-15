/**
 * @module modelWrite
 * @author Verliefden Romain , Deflorenne Amaury
 * @description this module write the model.ts based on columns of the database
 * if the table exist. If the table doesn't exist , the user enter the columns of
 * the futur table and the table is created in the database.
 * @exports writeModel
 */
const ejs = require('ejs');
const sqlAdaptator = require('./database/sqlAdaptator');
//const mongoAdaptator = require('./database/mongoAdaptator');
const inquirer = require('inquirer');
const Util = require('util');
const Log = require('./log');
const FS = require('fs');
const databaseInfo = require('./databaseInfo');
const ReadFile = Util.promisify(FS.readFile);
const WriteFile = Util.promisify(FS.writeFile);
const path = require('path');
const {  capitalizeEntity , fileExists, removeEmptyLines , writeToFirstEmptyLine , isImportPresent , lowercaseEntity , sqlTypeData } = require('./utils');

var lowercase;
var capitalize;


/**
 *
 * @param {Array} col
 * @description set default value for the column and check that default is not null when value can't be null
 * @returns default : value or nothing
 */
const _getDefault = (col) =>{
  let sqlFunction = ['CURRENT_TIMESTAMP','GETDATE','GETUTCDATE','SYSDATETIME'];
  if (col.Default === 'null'){
    if(col.Null !== 'nullable:false,') return 'default : null'
    else return ''
  }else if (col.Type.type.includes('int') || col.Type.type === 'float' || col.Type.type ==='double'){
    return `default : ${col.Default}`;
  }else if (col.Default === ':no' || col.Type.type.includes('blob') || col.Type.type.includes('json') || col.Type.type.includes('text')){
    return '';
  }else if(col.key ==='UNI' || col.Key=== 'PRI'){
    return '';
  }else if((col.Type.type === 'timestamp' || col.Type.type === 'datetime') && (col.Default.includes('(') || sqlFunction.includes(col.Default))){
    return ` default : () => "${col.Default}"`;
  }else{
    return `default :\`${col.Default}\``;
  }
}


/**
 *
 * @param {String} data
 * @param {String} key
 * @description  check if column can be null or not and check if key is primay. if key is primary , there's no need to check if column can be null
 * because primary imply that value can't be null
 * @returns if column can be null or not
 */
const _getNull = (data,key) => {
    if(key === 'PRI' || key === 'UNI') return '';
    if(data === 'YES') return 'nullable:true,';
    return 'nullable:false,';
}

/**
*  @param {String} lowercase
*  @param {String} capitalize
 * @description
 * @returns {null}
 **/
const _addToConfig = async (lowercase,capitalize) => {
    let configFileName = `${process.cwd()}/src/config/typeorm.config.ts`;
    let fileContent = await ReadFile(configFileName, 'utf-8');

    if (!isImportPresent(fileContent,capitalize)) {
      let imprt = writeToFirstEmptyLine(fileContent,`import { ${capitalize} } from "../api/models/${lowercase}.model";\n`)
        .replace(/(.*entities.*)(?=])(.*)/,`$1,${capitalize}$2`);

      await WriteFile(configFileName,imprt).catch(e => {
        Log.error(`Failed to write to : ${configFileName}`);
      });
    }
};

/**
 *
 * @param {column key data} data
 * @description  mysql send key value as PRI , UNI. but a column written for a typeorm model primary or unique as parameter
 * @returns primary or unique
 */
const _getKey = data => {
    if (data === 'PRI') return ' primary : true,';
    if (data === 'UNI') return ' unique : true,';
    return '';
}

/**
 *
 * @param {String} data
 * @description  Format to typeorm format
 * @returns data lenght/enum
 */
const _getLength = (info) => {
  if(info.type == "enum") return `enum  : [${info.length}],`;
  if(info.length != undefined) {
      if(info.type.includes('int')) return `width : ${info.length},`;
      if(info.type.includes('date') || info.type.includes('date')) return `precision : ${info.length},` 
      return `length : ${info.length},`;
  }
  return "";
}

/**
 * @param {table to get data from/table to create} table
 * @param {techonlogy use for database} dbType
 *
 * @description write a typeorm model from an array of info about an entity
 *
 */
const writeModel = async (action,data=null) =>{
    let lowercase = lowercaseEntity(action);
    let capitalize  = capitalizeEntity(lowercase);
    let p_file = await ReadFile(`${__dirname}/templates/model/model.ejs`, 'utf-8');
    let pathModel = path.resolve(`${process.cwd()}/src/api/models/${lowercase}.model.ts`);
    let { columns , foreignKeys } = data;
    
    let entities = [] , f_keys = [] , imports = [];
    /*
     filter the foreign keys from columns , they are not needed anymore
     Only when imported by database
    */
    columns = columns.filter(column => {
        return foreignKeys.find(elem => elem.COLUMN_NAME == column.Field) === undefined;
    });
    columns.forEach(col => {
        if(col.Field === "id") return;
        
        col.Null = _getNull(col.Null,col.Key);
        col.Key = _getKey(col.Key);
        col.Default = _getDefault(col);
        col.length = _getLength(col.Type);
        entities.push(col);
    });
    let output = ejs.compile(p_file,{root : `${__dirname}/templates/`})({
      entityLowercase : lowercase,
      entityCapitalize : capitalize,
      entities,
      foreignKeys,
      createUpdate : data.createUpdate,
      capitalizeEntity,
      lowercaseEntity
    });

    await Promise.all([WriteFile(pathModel, output),_addToConfig(lowercase,capitalize)]);
    Log.success("Model created in :" + pathModel);
}

/**
 *  @description creates a basic model , with no entites , imports or foreign keys
 */
const basicModel = async (action) => {
  let lowercase = lowercaseEntity(action);
  let capitalize  = capitalizeEntity(lowercase);
  let pathModel = path.resolve(`${process.cwd()}/src/api/models/${lowercase}.model.ts`);
  let modelTemp = await ReadFile(`${__dirname}/templates/model/model.ejs`);
  let basicModel = ejs.compile(modelTemp.toString())({
    entityLowercase : lowercase,
    entityCapitalize : capitalize,
    entities : [],
    foreignKeys : [],
    createUpdate : {createAt : true,
                      updateAt : true}
  });

  let p_write = WriteFile(pathModel, basicModel)
    .then(() => Log.success("Model created in :" + pathModel))
    .catch(e => Log.error("Failed generating model"));

  await Promise.all([_addToConfig(lowercase,capitalize),p_write])
}

module.exports = async (action,name,data=undefined) => {
  if(action == 'basic'){
    basicModel(name);
  }else if (action=='write'){
    await writeModel(name,data);
  }else{
    console.log("Bad syntax");
  }
}
