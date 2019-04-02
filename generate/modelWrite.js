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
const {  capitalizeEntity ,columnExist ,fileExists, removeEmptyLines , writeToFirstEmptyLine , isImportPresent , lowercaseEntity , sqlTypeData } = require('./utils');
const pluralize = require('pluralize');


/**
 *
 * @param {Array} col
 * @description set default value for the column and check that default is not null when value can't be null
 * @returns {string} default
 */
const _getDefault = (col) =>{
  let sqlFunction = ['CURRENT_TIMESTAMP','GETDATE','GETUTCDATE','SYSDATETIME'];
  if (col.Default === 'null' || col.Default === null && !(col.key ==='UNI' || col.Key=== 'PRI') ){
    if(col.Null !== 'nullable:false,') return 'default : null'
    else return ''
  }else if (col.Type.type.includes('int') || col.Type.type === 'float' || col.Type.type ==='double') return `default : ${col.Default}`
  else if (col.Default === ':no' || col.Type.type.includes('blob') || col.Type.type.includes('json') || col.Type.type.includes('text'))  return '';
  else if(col.key ==='UNI' || col.Key=== 'PRI')  return '';
  else if((col.Type.type === 'timestamp' || col.Type.type === 'datetime') && ( col.Default != null || col.Default.includes('(') || sqlFunction.includes(col.Default))) return ` default : () => "${col.Default}"`;
  else return `default :\`${col.Default}\``;

}


/**
 *
 * @param {String} data
 * @param {String} key
 * @description  check if column can be null or not and check if key is primay. if key is primary , there's no need to check if column can be null
 * because primary imply that value can't be null
 * @returns {string} empty : property
 */
const _getNull = (data,key) => {
    if(key === 'PRI' || key === 'UNI') return '';
    if(data === 'YES') return 'nullable:true,';
    return 'nullable:false,';
}

/**
*  @param {String} lowercase
*  @param {String} capitalize
 * @description add and import generated class names to the typeorm config file
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
 * @description write the serializer to the generated model
 * @param {string} entity 
 * @param {string} column 
 */
const _addToSerializer = async(entity,column) =>{
  let serializer = `${process.cwd()}/src/api/serializers/${entity}.serializer.ts`;
  let fileContent = await ReadFile(serializer, 'utf-8');
  let regexsetRel = new RegExp(`(.*setAttributes.*[^)])()`);
  let regexWhitelist = new RegExp('(.+withelist.+=.+)()(])');
  let toPut = `   .addRelation('${column}', {     \n     ref : 'id', \n     attributes : ${capitalizeEntity( pluralize.singular(column))}Serializer.withelist, \n     }\n    )`
  let newSer = fileContent.replace(regexsetRel,`$1\n ${toPut}`);
  newSer = newSer.replace(regexWhitelist,`$1,'${column}'$3`);
  if (!isImportPresent(fileContent,`${capitalizeEntity(pluralize.singular(column))}Serializer`) )newSer = writeToFirstEmptyLine(newSer,`import { ${capitalizeEntity(pluralize.singular(column))}Serializer } from "../serializers/${pluralize.singular(column)}.serializer";\n`)
  await WriteFile(serializer,newSer).then(Log.success(`${column} serializer updated`));
}

/**
 * @description write the controller to the generated model
 * @param {string} entity 
 * @param {string} column 
 */
const _addToController = async(entity,column,) =>{
  let serializer = `${process.cwd()}/src/api/enums/relations/${entity}.relations.ts`;
  let fileContent = await ReadFile(serializer, 'utf-8');
  let regex = new RegExp(`(];)`,'gm');
  let toPut = `,'${column}'`;
  let newSer = fileContent.replace(regex,`${toPut}\n$1`);
  await WriteFile(serializer,newSer).then(Log.success(`${column} controller updated`));
}

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
}

/**
 *
 * @param {String} data
 * @description  Format to typeorm format
 * @returns {string} data lenght/enum
 */
const _getLength = (info) => {
  if(info.type == "enum") return `enum  : [${info.length}],`;
  if(info.length != undefined && info.length !== '') {
      if(info.type.includes('int')) return `width : ${info.length},`;
      if((info.type.includes('date') || info.type.includes('time') )) return `precision : ${info.length},` 
      return `length : ${info.length},`;
  }
  return "";
}

/**
 * @param {string} action Model name
 * @param {Array} data Data describing the model
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
      createUpdate : data.createUpdate,
      capitalizeEntity,
      lowercaseEntity
    });

    await Promise.all([WriteFile(pathModel, output),_addToConfig(lowercase,capitalize)]).catch(e => Log.error(e.message));
    Log.success("Model created in :" + pathModel);
}

/**
 *  @description creates a basic model , with no entites , imports or foreign keys
 *  @param {string} action
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

/**
 * @description Write many to many relationships into the model
 * @param {string} model1 First model
 * @param {string} model2 Second model
 * @param {boolean} isFirst First in the relationship
 */
const _Mtm = (model1,model2,isFirst) =>{
  let toPut = `\n  @ManyToMany(type => ${capitalizeEntity(model2)}, ${lowercaseEntity(model2)} => ${lowercaseEntity(model2)}.${pluralize.plural(model1)})\n`;
  if(isFirst) toPut += '  @JoinTable()\n';
  return [toPut += `  ${pluralize.plural(model2)} : ${capitalizeEntity(model2)}[];\n\n`,pluralize.plural(model2)];
}
/**
 * @description Write one to one relationships into the model
 * @param {string} model1 First model
 * @param {string} model2 Second model
 * @param {boolean} isFirst First in the relationship
 */
const _Oto = (model1,model2,isFirst) =>{
  let toPut = ` @OneToOne(type => ${capitalizeEntity(model2)}, ${lowercaseEntity(model2)} => ${lowercaseEntity(model2)}.${lowercaseEntity(model1)})\n`;
  if(isFirst) toPut += '  @JoinColumn()\n';
  return [toPut += `  ${lowercaseEntity(model2)} : ${capitalizeEntity(model2)};`,lowercaseEntity(model2)];
}
/**
 * @description Write one to many relationships into the model
 * @param {string} model1 First model
 * @param {string} model2 Second model
 * @param {boolean} isFirst First in the relationship
 */
const _Otm = (model1,model2,isFirst) =>{
  let toPut
  if(isFirst)  toPut=`@OneToMany(type => ${capitalizeEntity(model2)}, ${lowercaseEntity(model2)} => ${lowercaseEntity(model2)}.${lowercaseEntity(model1)})\n ${pluralize.plural(model2)} : ${capitalizeEntity(model2)}[]`
  else  toPut=`@ManyToOne(type => ${capitalizeEntity(model2)}, ${lowercaseEntity(model2)} => ${lowercaseEntity(model2)}.${pluralize.plural(model1)})\n ${lowercaseEntity(model2)} : ${capitalizeEntity(model2)}`
  return [toPut, isFirst? pluralize.plural(model2): lowercaseEntity(model2)]
}
/**
 * @description Define which relation need to be written in the model
 * @param {string} model1 First model
 * @param {string} model2 Second model
 * @param {boolean} isFirst First in the relationship
 * @param {string} isFirst Relation type
 */
exports.addRelation = async (model1,model2,isFirst,relation) =>{
  let pathModel = `${process.cwd()}/src/api/models/${lowercaseEntity(model1)}.model.ts`;
  let modelFile = await ReadFile(pathModel,'utf-8');
  let toPut;
  if(relation=='mtm') toPut = _Mtm(model1,model2,isFirst); 
  if(relation=='oto') toPut = _Oto(model1,model2,isFirst); 
  if(relation=='otm') toPut = _Otm(model1,model2,isFirst); 
  if(relation=='mto') toPut = _Otm(model2,model1,isFirst); 
  let pos = modelFile.lastIndexOf('}');
  let newModel= `${modelFile.toString().substring(0,pos)}${toPut[0]}\n\n}`;
  if(!isImportPresent(modelFile,capitalizeEntity(model2))) newModel = writeToFirstEmptyLine( newModel.toString(),`import { ${capitalizeEntity(model2)} } from "./${lowercaseEntity(model2)}.model";\n`)
  await Promise.all([WriteFile(pathModel,newModel),_addToSerializer(model1,toPut[1]),_addToController(model1,toPut[1])]);
}

const _removefromSandC =async  (entity,column) =>{
  let regexAddRel = new RegExp(`.addRelation\\('${column}[\\s\\S]*?\\)`);
  let regexArray = new RegExp(`,'${column}'|'${column}',`,'m');
  let serializer = `${process.cwd()}/src/api/serializers/${entity}.serializer.ts`;
  let serializerContent = await ReadFile(serializer, 'utf-8');
  console.log(regexAddRel);
  let relation= `${process.cwd()}/src/api/enums/relations/${entity}.relations.ts`;
  let relationContent = await ReadFile(relation, 'utf-8');
  console.log(regexArray);
  newSer= serializerContent.replace(regexAddRel,'').replace(regexArray,'');
  newRel = relationContent.replace(regexArray,'');
  await Promise.all([WriteFile(serializer,newSer),WriteFile(relation,newRel)]);
}

/**
 * @description  Remove a column in a model
 * @param {string} model Model name
 * @param {string} column Column name
 */
exports.removeColumn = async (model,column) =>{ 
  let regexColumn =  new RegExp(`@Column\\({[\\s\\S][^{]*?${column};`,'m');
  let regexMany = new RegExp(`@Many[\\s\\S][^;]*?${column} :.*`);
  let regexOne = new RegExp(`@One[\\s\\S][^;]*?${column} :.*`);
  let pathModel = `${process.cwd()}/src/api/models/${lowercaseEntity(model)}.model.ts`;
  let modelFile = await ReadFile(pathModel);
  let newModel;
  if(modelFile.toString().match(regexColumn)) newModel=modelFile.toString().replace(regexColumn,'');
  else if(modelFile.toString().match(regexMany))newModel=modelFile.toString().replace(regexMany,'');
  else if(modelFile.toString().match(regexOne)) newModel=modelFile.toString().replace(regexOne,'');
  else throw new Error('Column doesn\'t exist');
  await Promise.all([WriteFile(pathModel,newModel),_removefromSandC(model,column)])
}

/**
 * @description  Add a column in a model
 * @param {string} model Model name
 * @param {string} column Column name
 */
exports.addColumn = async (model,data ) =>{
  let pathModel = `${process.cwd()}/src/api/models/${lowercaseEntity(model)}.model.ts`;
  let [columnTemp, modelFile] = await  Promise.all([ReadFile(`${__dirname}/templates/model/_column.ejs`),ReadFile(pathModel)]);
  if (data == null)throw  new Error('Column cancelled');
  if(columnExist(modelFile,data.columns.Field)) throw new Error('Column already added'); 
  let entity = data.columns;
  entity.Null = _getNull(entity.Null, entity.Key);
  entity.Key = _getKey(entity.Key);
  entity.Default = _getDefault(entity);
  entity.length = _getLength(entity.Type);
  let newCol = '  ' + ejs.compile(columnTemp.toString())({ entity })
  var pos = modelFile.lastIndexOf('}');
  let newModel = `${modelFile.toString().substring(0, pos)}\n${newCol}\n}`
  await WriteFile(pathModel,newModel);
}


exports.main = async (action,name,data=undefined) => {
  if(action == 'basic'){
    basicModel(name);
  }else if (action=='write'){
    await writeModel(name,data);
  }else{
    console.log("Bad syntax");
  }
  
}
