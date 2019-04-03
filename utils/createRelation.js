const Log = require('../generate/log');
const Util = require('util');
const FS = require('fs');
const ReadFile = Util.promisify(FS.readFile);
const WriteFile = Util.promisify(FS.writeFile);
const { modelFileExists,columnExist ,capitalizeEntity, writeToFirstEmptyLine , isImportPresent , lowercaseEntity} = require('../generate/utils');
const pluralize = require('pluralize');

/**
 * @description write the serializer to the generated model
 * @param {string} entity 
 * @param {string} column 
 */
const _addToSerializer = async(entity,column) =>{
  let serializer = `${process.cwd()}/src/api/serializers/${entity}.serializer.ts`;
  let fileContent = await ReadFile(serializer, 'utf-8');
  let regexsetRel = new RegExp(`(.*setAttributes.*[^)])()`);
  let regexWhitelist = new RegExp('(.+withelist.+=.+)(\\[)([^\\]]*)');
  let toPut = `   .addRelation('${column}', {     \n     ref : 'id', \n     attributes : ${capitalizeEntity( pluralize.singular(column))}Serializer.withelist, \n     }\n    )`
  let newSer = fileContent.replace(regexsetRel,`$1\n ${toPut}`);
  let newValue;
  let regexArray = newSer.match(/(.+withelist.+=.+)(\[)([^\]]*)/);
  if(regexArray[3].includes("'")) newValue = `,'${column}'`
  else newValue = `'${column}'`
  newSer = newSer.replace(regexWhitelist,`$1$2$3${newValue}`);
  if (!isImportPresent(fileContent,`${capitalizeEntity(pluralize.singular(column))}Serializer`) )newSer = writeToFirstEmptyLine(newSer,`import { ${capitalizeEntity(pluralize.singular(column))}Serializer } from "../serializers/${pluralize.singular(column)}.serializer";\n`)
  await WriteFile(serializer,newSer).then(Log.success(`${entity} serializer updated`));
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

const _Name = (name) =>{
  if(name != null) return `name:"${name}"`
  else return ''
}

const _RefCol = (name,refCol) =>{
  let ref =''
  if(refCol == null) return ''
  if(name != null) ref +=','
  return ref += ` referencedColumnName: "${refCol}"`
}

/**
 * @description Write many to many relationships into the model
 * @param {string} model1 First model
 * @param {string} model2 Second model
 * @param {boolean} isFirst First in the relationship
 */
const _Mtm = (model1,model2,isFirst,name) =>{
  let toPut = `\n  @ManyToMany(type => ${capitalizeEntity(model2)}, ${lowercaseEntity(model2)} => ${lowercaseEntity(model2)}.${pluralize.plural(model1)})\n`;
  if(isFirst) toPut += `  @JoinTable({${_Name(name)}})\n`;
  return [toPut += `  ${pluralize.plural(model2)} : ${capitalizeEntity(model2)}[];\n\n`,pluralize.plural(model2)];
}

/**
 * @description Write one to one relationships into the model
 * @param {string} model1 First model
 * @param {string} model2 Second model
 * @param {boolean} isFirst First in the relationship
 */
const _Oto = (model1,model2,isFirst,name,refCol) =>{
  let toPut = ` @OneToOne(type => ${capitalizeEntity(model2)}, ${lowercaseEntity(model2)} => ${lowercaseEntity(model2)}.${lowercaseEntity(model1)})\n`;
  if(isFirst) toPut += `@JoinColumn({${_Name(name)}${_RefCol(name,refCol)}})\n`;
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
const _addRelation = async (model1,model2,isFirst,relation,name,refCol) =>{
  let pathModel = `${process.cwd()}/src/api/models/${lowercaseEntity(model1)}.model.ts`;
  let modelFile = await ReadFile(pathModel,'utf-8');
  let toPut;
  if(relation=='mtm') toPut = _Mtm(model1,model2,isFirst,name); 
  if(relation=='oto') toPut = _Oto(model1,model2,isFirst,name,refCol); 
  if(relation=='otm') toPut = _Otm(model1,model2,isFirst); 
  if(relation=='mto') toPut = _Otm(model2,model1,isFirst); 
  let pos = modelFile.lastIndexOf('}');
  let newModel= `${modelFile.toString().substring(0,pos)}${toPut[0]}\n\n}`;
  if(!isImportPresent(modelFile,capitalizeEntity(model2))) newModel = writeToFirstEmptyLine( newModel.toString(),`import { ${capitalizeEntity(model2)} } from "./${lowercaseEntity(model2)}.model";\n`)
  await Promise.all([WriteFile(pathModel,newModel),_addToSerializer(model1,toPut[1]),_addToController(model1,toPut[1])]);
}


exports.createRelation = async (model1, model2, relation,name,refCol) => {
model1 = lowercaseEntity(model1);
model2 = lowercaseEntity(model2)
  if (!modelFileExists(model1) || !modelFileExists(model2)) throw new Error("Both model should exist in order to create a many to many relationship");
  if(await columnExist(model1,pluralize.plural(model2)) || await columnExist(model2,pluralize.plural(model1)) || await columnExist(model1,model2) ||await  columnExist(model2,model1)) throw new Error("A column with the name of the other model exist in one or both model");
  await _addRelation(model1, model2, true, relation,name,refCol)
    .catch(err => Log.error(err.message));
  await _addRelation(model2, model1, false, relation,name,refCol)
    .then(() => Log.success(`reliatonship between ${model1} and  ${model2} added in models`))
    .catch(err => Log.error(err.message));
}