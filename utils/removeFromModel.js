
const Util = require('util');
const FS = require('fs');
const ReadFile = Util.promisify(FS.readFile);
const WriteFile = Util.promisify(FS.writeFile);
const { lowercaseEntity} = require('../generate/utils');
const pluralize = require('pluralize');

 /**
   * @description  Remove relationship from serializer and controller
   * @param {string} model Model name
   * @param {string} column relation name
   */
exports._removefromSandC =async  (entity,column) =>{
    let regexAddRel = new RegExp(`.addRelation\\('${column}[\\s\\S]*?\\)`);
    let regexArray = new RegExp(`,'${column}'|'${column}',|'${column}'`,'m');
    let serializer = `${process.cwd()}/src/api/serializers/${pluralize.singular(entity)}.serializer.ts`;
    let serializerContent = await ReadFile(serializer, 'utf-8');
    let relation= `${process.cwd()}/src/api/enums/relations/${pluralize.singular(entity)}.relations.ts`;
    let relationContent = await ReadFile(relation, 'utf-8');
    let newSer= serializerContent.replace(regexAddRel,'');
    newSer = newSer.replace(regexArray,'');
    newRel = relationContent.replace(regexArray,'');
    await Promise.all([WriteFile(serializer,newSer),WriteFile(relation,newRel)]);
  }

  const removeFromTest = async (model,column) =>{
    let testPath = `${process.cwd()}/test/${model}.test.js`;
    let regexRandom = new RegExp(`[^']${column}.*?,`,'gm'); 
    let regexArray = new RegExp(`,'${column}'|'${column}',|'${column}'`,'gm');
    let testFile = await ReadFile(testPath,'utf-8');
    testFile = testFile.replace(regexRandom,'').replace(regexArray,'');
    await WriteFile(testPath,testFile);
  }


  const removeFromValidation = async (model,column) =>{
    let valPath = `${process.cwd()}/src/api/validations/${model}.validation.ts`;
    let regexRandom = new RegExp(`${column}.*?,`,'gm'); 
    let valFile = await ReadFile(valPath,'utf-8');
    valFile = valFile.replace(regexRandom,'')
    await WriteFile(valPath,valFile);
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
    let pathModel = `${process.cwd()}/src/api/models/${pluralize.singular(model)}.model.ts`;
    let modelFile = await ReadFile(pathModel);
    let newModel;
    if(modelFile.toString().match(regexColumn)) newModel=modelFile.toString().replace(regexColumn,'');
    else if(modelFile.toString().match(regexMany))newModel=modelFile.toString().replace(regexMany,'');
    else if(modelFile.toString().match(regexOne)) newModel=modelFile.toString().replace(regexOne,'');
    else throw new Error('Column doesn\'t exist');
    await Promise.all([WriteFile(pathModel,newModel),removeFromTest(model,column),removeFromValidation(model,column)])
  }
  
