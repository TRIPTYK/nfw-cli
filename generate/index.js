/**
 * Requirement of the library FS
 * @description Handle read/write stream I/O
 */
const FS = require('fs');
const ejs = require('ejs');
/**
 * Requirement of the library Utils
 * @description Needed to promisify async methods
 */
const Util = require('util');
/**
 * Get the informations about the templates generation
 * @returns {Array.<JSON>} Return an array of json object
 */
const { items } = require('./resources');
/**
 * Requirement of the logs library
 *@description Define function to simplify console logging
 */
const Log = require('./log');
/**
 * Requirement of the functions "countLine" and "capitalizeEntity" from the local file utils
 */
const { countLines , capitalizeEntity , prompt , sqlTypeData , lowercaseEntity , fileExists , buildJoiFromColumn} = require('./utils');
/**
 * Transform a async method to a promise
 * @returns {Promise} returns FS.exists async function as a promise
 */
const ReadFile = Util.promisify(FS.readFile);
const WriteFile = Util.promisify(FS.writeFile);
/**
 * Requirement of the library readline
 */
const readline = require('readline');
const routerWrite = require('./routerWrite');
const modelWrite = require('./modelWrite');
const databaseInfo = require('./databaseInfo');

const crudOptions = {
  create: false,
  read: false,
  update: false,
  delete: false
};

const processPath = process.cwd();

// false class properties
var capitalize;
var lowercase;

/**
 * @description : Check in a string if the letter C R U D are present and set the boolean of each Crud varable present in crudOption
 * @param  {string} arg - The thirs argument of 'npm run generate stringName {CRUD}'
 * @returns {Array.<boolean>} Return an array of boolean depending on the input string
 */
const _checkForCrud = (arg) => {
  let crudString = arg.toLowerCase();

  if((/^[crud]{1,4}$/).test(crudString)){
      if(crudString.includes('c')) crudOptions.create = true;
      if(crudString.includes('r')) crudOptions.read = true;
      if(crudString.includes('u')) crudOptions.update = true;
      if(crudString.includes('d')) crudOptions.delete = true;
  }
  else{
    return false;
  }
  return crudOptions;
};

/**
 * @description replace the vars in placeholder in file and creates them
 * @param {*} items
 */
const _write = async (data = null) => {
  let tableColumns , foreignKeys;
  try {
    let tmpData = await databaseInfo.getTableInfo("sql",lowercase);
    tableColumns = tmpData.columns;
    foreignKeys = tmpData.foreignKeys;
  }catch(err) {
    tableColumns = data ? data.columns : [];
    foreignKeys = data ? data.foreignKeys : [];
  };


  let index = tableColumns.findIndex(el => el.Field == 'id')
  // remove id key from array
  if(index !== -1)tableColumns.splice(tableColumns,1);
  const columnNames = tableColumns.map(elem => `'${elem.Field}'`);
  
  const allColumns = tableColumns // TODO: do this in view
    .map(elem => `'${elem.Field}'`)
    .concat(foreignKeys.map(e => `'${e.COLUMN_NAME}'`));

  let promises = items.map( async (item) => {
    // handle model template separately
    if (item.template == 'model') return;

    let file = await ReadFile(`${__dirname}/templates/${item.template}.ejs`, 'utf-8');

    let output = ejs.compile(file)({
      entityLowercase : lowercase,
      entityCapitalize : capitalize,
      options : crudOptions,
      tableColumns,
      allColumns,
      lowercaseEntity,
      capitalizeEntity,
      foreignKeys,
      validation : tableColumns.map(c => buildJoiFromColumn(c)).filter(c => !c.name.match(/create_at|update_at/) )
    });

    await WriteFile(`${processPath}/src/api/${item.dest}/${lowercase}.${item.template}.${item.ext}`, output)
      .then(() => {
        Log.success(`${capitalizeEntity(item.template)} generated.`)
      })
      .catch(e => {
        Log.error(`Error while ${item.template} file generating \n`);
        Log.warning(`Check the api/${item.dest}/${lowercase}.${item.template}.${item.ext} to update`);
      });
    });

    promises.push(routerWrite(lowercase)); // add the router write promise to the queue
    await Promise.all(promises); // wait for all async to finish
};

/**
 * Main function
 * Check entity existence, and write file or not according to the context
 *
 * @param {Array.<JSON>} items
 */
const build = async (modelName, crudArgs , data = null) => {
  if(!modelName.length)
  {
    Log.error('Nothing to generate. Please, get entity name parameter.');
    return;
  }

  if(!crudArgs.length){
    Log.rainbow('Warning : ','No CRUD options, set every option to true by default');
    crudOptions.create = true;
    crudOptions.update = true;
    crudOptions.read = true;
    crudOptions.delete = true;
  }else{
    if(!_checkForCrud(crudArgs)){
      Log.error('Error : Wrong CRUD arguments');
      return;
    }
  }

  // assign false class properties
  lowercase = lowercaseEntity(modelName);
  capitalize = capitalizeEntity(modelName);

  await _write(data);

  Log.success('Generating task done');
};


module.exports = build;
