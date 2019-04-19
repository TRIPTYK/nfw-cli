const Log = require('../utils/log');
const Util = require('util');
const FS = require('fs');
const ReadFile = FS.readFileSync;
const WriteFile = Util.promisify(FS.writeFile);
const {format,modelFileExists, columnExist, relationExist,capitalizeEntity, writeToFirstEmptyLine, isImportPresent} = require('./lib/utils');
const {plural,singular ,isPlural} = require('pluralize');


// documents : {
//   ref:'id',
//   attributes:DocumentSerializer.withelist,
//   valueForRelationship: async function (relationship) {
//      return await getRepository(Document).findOne(relationship.id);
//  }
// }
/**
 * @description add reliationship in the serializer of an entity
 * @param {string} entity
 * @param column
 */
const _addToSerializer = async (entity, column) => {
    let serializer = `${process.cwd()}/src/api/serializers/${entity}.serializer.ts`;
    let fileContent = await ReadFile(serializer, 'utf-8');
    //All regex needed
    let regexArrayCheck = new RegExp(`.*withelist.*?'${column}'`, 'm');
    let regexsetRel = new RegExp(`const data[\\s\\S]*?},`);
    let regexWhitelist = new RegExp('(.+withelist.+=.+)(\\[)([^\\]]*)');
    let regexAddRel = new RegExp(`${column} :[\\s\\S]*?},`);
    let regexArray = fileContent.match(/(.+withelist.+=.+)(\[)([^\]]*)/);

    //code to add the relation in the serializer if it isn't already added
    let toPut;
    if ( isPlural(column)) toPut = `   ${column} : {\n     ref : 'id', \n     attributes : ${capitalizeEntity( singular(column))}Serializer.withelist,\n     valueForRelationship: async function (relationship) {\n     return await getRepository(${capitalizeEntity( singular(column))}).findOne(relationship.id);\n     }\n    },`;
    else toPut = `   ${column} : {\n     ref : 'id', \n     attributes : ${capitalizeEntity( singular(column))}Serializer.withelist,\n    },\n    ${ plural(column)} : {\n    valueForRelationship: async function (relationship) {\n     return await getRepository(${capitalizeEntity( singular(column))}).findOne(relationship.id);\n     }\n    },`;
    if (!fileContent.match(regexAddRel)) fileContent = fileContent.replace(regexsetRel, `$&\n ${toPut}`);
    
    //code to add the relation in the whitelist if it isn't already added
    let newValue;
    if (regexArray[3].includes("'")) newValue = `,'${column}'`;
    else newValue = `'${column}'`;
    if (!fileContent.match(regexArrayCheck)) fileContent = fileContent.replace(regexWhitelist, `$1$2$3${newValue}`);
    
    //Add the import if they're not already there the write in the serializer
    if (!isImportPresent(fileContent, `${capitalizeEntity( singular(column))}Serializer`)) fileContent = writeToFirstEmptyLine(fileContent, `import { ${capitalizeEntity( singular(column))}Serializer } from "./${ singular(column)}.serializer";\n`);
    if (!isImportPresent(fileContent, `${capitalizeEntity( singular(column))}`)) fileContent = writeToFirstEmptyLine(fileContent, `import { ${capitalizeEntity( singular(column))} } from "../models/${ singular(column)}.model";\n`);
    await WriteFile(serializer, fileContent).then(() => Log.success(`${entity} serializer updated`));
};

/**
 * @description add reliationship in the controller of an entity
 * @param {string} entity
 * @param {string} column
 */
const _addToController = async (entity, column) => {
    let serializer = `${process.cwd()}/src/api/enums/relations/${entity}.relations.ts`;
    let fileContent = await ReadFile(serializer, 'utf-8');
    let regex = new RegExp(`(];)`, 'gm');
    let regexArray = new RegExp(`'${column}'`, 'm');
    let toPut = `,'${column}'`;
    if (!fileContent.match(regexArray)) fileContent = fileContent.replace(regex, `${toPut}\n$1`);
    await WriteFile(serializer, fileContent).then(Log.success(`${column} controller updated`));
};


/**
 * @description  built string to write for name option in a JoinColum/JoinTable decorator
 * @param {String} name name of the bridging table/refenrenced column ina foreign key
 * @returns {string}  '': 'name:<name>'
 */
const _Name = (name) => {
    if (name != null) return `name:"${name}"`;
    else return ''
};


/**
 * @description  Build the string to write for referencedColumn option in a JoinColum/JoinTable decorato
 * @param {String} name name of the bridging table/name of the foreign key
 * @param {String} refCol refenrenced column in a foreign key
 * @returns {string} referencedColumnName optin ready to be written
 */
const _RefCol = (name, refCol) => {
    let ref = '';
    if (refCol == null) return '';
    if (name != null) ref += ',';
    return ref += ` referencedColumnName: "${refCol}"`
};

/**
 * @description build the string to write in a model for many to many relationship
 * @param {string} model1 model you want to write in
 * @param {string} model2 model related to the model you want to write in
 * @param {boolean} isFirst First in the relationship
 * @param {string} name name of the bridging table
 * @return *[] to write in a model for many to many reliationship
 */
const _Mtm = (model1, model2, isFirst, name) => {
    let toPut = `\n  @ManyToMany(type => ${capitalizeEntity(model2)}, ${model2} => ${model2}.${ plural(model1)})\n`;
    if (isFirst) toPut += `  @JoinTable({${_Name(name)}})\n`;
    return [toPut += `  ${ plural(model2)} : ${capitalizeEntity(model2)}[];\n\n`,  plural(model2)];
};

/**
 * @description build the string to write in a model for one to one relationship
 * @param {string} model1 model you want to write in
 * @param {string} model2 model related to the model you want to write in
 * @param {boolean} isFirst First in the relationship
 * @param {string} name name of the foreignKey in the table
 * @param {string} refCol the column referenced in the foreign key
 * @return string to write in a model for one to one reliationship
 */
const _Oto = (model1, model2, isFirst, name, refCol) => {
    let toPut = ` @OneToOne(type => ${capitalizeEntity(model2)}, ${model2} => ${model2}.${model1})\n`;
    if (isFirst) toPut += `@JoinColumn({${_Name(name)}${_RefCol(name, refCol)}})\n`;
    return [toPut += `  ${model2} : ${capitalizeEntity(model2)};`, model2];
};

/**
 * @description build the string to write in a model for one to many relationship
 * @param {string} model1 model you want to write in
 * @param {string} model2 model related to the model you want to write in
 * @param {boolean} isFirst First in the relationship
 * @return []* string to write in a model for one to many reliationship
 */
const _Otm = (model1, model2, isFirst) => {
    let toPut;
    if (isFirst) toPut = `@OneToMany(type => ${capitalizeEntity(model2)}, ${model2} => ${model2}.${model1})\n ${ plural(model2)} : ${capitalizeEntity(model2)}[]`;
    else toPut = `@ManyToOne(type => ${capitalizeEntity(model2)}, ${model2} => ${model2}.${ plural(model1)})\n ${model2} : ${capitalizeEntity(model2)}`;
    return [toPut, isFirst ?  plural(model2) : model2]
};

/**
 * @description Define which relation need to be written in the model
 * @param {string} model1 the model you want to write in
 * @param {string} model2 the model that need to be included in the first model
 * @param {boolean} isFirst Does he carry the foreignKey (Oto) or assure that you write JoinTable only in one side of the relation for mtm
 * @param {string} relation Relation type
 * @param {string} name either the name of the foreign key (for oto) or the name of the bridging table (for mtm)
 * @param {string} refCol  for Oto only , name of the referenced column in the foreign key (must be primary or unique)
 */
const _addRelation = async (model1, model2, isFirst, relation, name, refCol) => {
    // Get the string to write in modelFile
    // in case of many to one , exchange model1 and model2 because the logic is reversed 
    let toPut;
    if (relation === 'mtm') toPut = _Mtm(model1, model2, isFirst, name);
    if (relation === 'oto') toPut = _Oto(model1, model2, isFirst, name, refCol);
    if (relation === 'otm') toPut = _Otm(model1, model2, isFirst);
    if (relation === 'mto') {
        toPut = _Otm(model2, model1, isFirst);
        let temp= model1; 
        model1= model2;
        model2 = temp
    }
    //Get the file to write in
    let pathModel = `${process.cwd()}/src/api/models/${model1}.model.ts`;
    let modelFile = ReadFile(pathModel, 'utf-8');
    //Get the last { and write the relation before the last { if the relation isn't already written
    let pos = modelFile.lastIndexOf('}');
    if(!relationExist(model1,toPut[1])) modelFile = `${modelFile.substring(0, pos)}${toPut[0]}\n\n}`;
    //import the model of the second entity if it is not already present then write process to update serializer and controller
    if (!isImportPresent(modelFile, capitalizeEntity(model2))) modelFile = writeToFirstEmptyLine(modelFile, `import { ${capitalizeEntity(model2)} } from "./${model2}.model";\n`);
    await Promise.all([WriteFile(pathModel, modelFile), _addToSerializer(model1, toPut[1]), _addToController(model1, toPut[1])]);
};


/**
 *
 * @param {String} model1 one of the model of the reliationship
 * @param {String} model2 the second model of the reliationship
 * @param {String} relation the relation you want between the two models
 * @param {String} name either the name of the foreign key (for oto) or the name of the bridging table (for mtm)
 * @param {String} refCol for Oto only , name of the referenced column in the foreign key (must be primary or unique)
 * @description  Create a reliationship between 2 models
 */
module.exports = async (model1, model2, relation, name, refCol) => {
    if (!modelFileExists(model1) || !modelFileExists(model2)) throw new Error("Both model should exist in order to create a many to many relationship");
    if (columnExist(model1, model2) || columnExist(model2, model1)) throw new Error("A Column have a name that conflicts with the creation of the relationship in one or both models");
    await _addRelation(model1, model2, true, relation, name, refCol)
        .catch(err => Log.error(err.message));
    await _addRelation(model2, model1, false, relation, name, refCol)
        .then(() => Log.success(`reliatonship between ${model1} and  ${model2} added in models`))
        .catch(err => Log.error(err.message));
};