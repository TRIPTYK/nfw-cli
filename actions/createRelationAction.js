/**
 * @module createRelationAction
 * @author Verliefden Romain
 * @description creates relationship between 2 models
 */

// node modules
const Util = require('util');
const FS = require('fs');
const {plural, isPlural} = require('pluralize');
const chalk = require('chalk');

// project modules
const {modelFileExists, columnExist, relationExist, capitalizeEntity, writeToFirstEmptyLine, isImportPresent} = require('./lib/utils');
const Log = require('../utils/log');


const ReadFile = FS.readFileSync;
const WriteFile = Util.promisify(FS.writeFile);


const _addToController = async (entity,column,model) =>{
    let controllerPath = `${process.cwd()}/src/api/controllers/${entity}.controller.ts`;
    let controller = await ReadFile(controllerPath, 'utf-8');

    let regex = new RegExp(`.*merge[\\s\\S]*?\\.save\\(${entity}\\);|.+\\.save.*?;`,'gm')

    toPut=`      if(req.body.${column}){\n`
    if(isPlural(column)) toPut += `              ${entity}.${column} = await getRepository(${capitalizeEntity(model)}).findByIds(req.body.${column})\n      }`;
    else toPut += `              ${entity}.${column} = await getRepository(${capitalizeEntity(model)}).findOne(req.body.${column})\n      }`;
     


    controller = controller.replace(regex,`${toPut}\n$& `);
    if(!isImportPresent(controller,capitalizeEntity(model))) controller = writeToFirstEmptyLine(controller,`import { ${capitalizeEntity(model)} } from "../models/${model}.model";\n`)

    await WriteFile(controllerPath,controller).then(() => Log.info(`${chalk.cyan(`src/api/controllers/${entity}.controller.ts`)} updated`));

}



/**
 * @description add relationship in the serializer of an entity
 * @param {string} entity
 * @param {string} column
 * @returns {Promise<void>}
 */
const _addToSerializer = async (entity, column,model) => {
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
    if ( isPlural(column)) toPut = `   ${column} : {\n     ref : 'id', \n     attributes : ${capitalizeEntity( model)}Serializer.withelist,\n     valueForRelationship: async function (relationship) {\n     return await getRepository(${capitalizeEntity(model)}).findOne(relationship.id);\n     }\n    },`;
    else toPut = `   ${column} : {\n     ref : 'id', \n     attributes : ${capitalizeEntity(model)}Serializer.withelist,\n    },\n    ${ plural(column)} : {\n    valueForRelationship: async function (relationship) {\n     return await getRepository(${capitalizeEntity(model)}).findOne(relationship.id);\n     }\n    },`;
    if (!fileContent.match(regexAddRel)) fileContent = fileContent.replace(regexsetRel, `$&\n ${toPut}`);
    
    //code to add the relation in the whitelist if it isn't already added
    let newValue;
    if (regexArray[3].includes("'")) newValue = `,'${column}'`;
    else newValue = `'${column}'`;
    if (!fileContent.match(regexArrayCheck)) fileContent = fileContent.replace(regexWhitelist, `$1$2$3${newValue}`);
    
    //Add the import if they're not already there the write in the serializer
    if (!isImportPresent(fileContent, `${capitalizeEntity(model)}Serializer`)) fileContent = writeToFirstEmptyLine(fileContent, `import { ${capitalizeEntity(model)}Serializer } from "./${model}.serializer";\n`);
    if (!isImportPresent(fileContent, `${capitalizeEntity(model)}`)) fileContent = writeToFirstEmptyLine(fileContent, `import { ${capitalizeEntity(model)} } from "../models/${model}.model";\n`);
    await WriteFile(serializer, fileContent).then(() => Log.info(`${chalk.cyan(`src/api/serializers/${entity}.serializer.ts`)} updated`));
};

/**
 * @description add relationship in the controller of an entity
 * @param {string} entity
 * @param {string} column
 * @returns {Promise<void>}
 */
const _addToRelation = async (entity, column) => {
    let relation = `${process.cwd()}/src/api/enums/relations/${entity}.relations.ts`;
    let fileContent = await ReadFile(relation, 'utf-8');
    let regex = new RegExp(`(];)`, 'gm');
    let regexArray = new RegExp(`'${column}'`, 'm');
    let toPut = `,'${column}'`;
    if (!fileContent.match(regexArray)) fileContent = fileContent.replace(regex, `${toPut}\n$1`);
    await WriteFile(relation, fileContent).then(() => Log.info(`${chalk.cyan(`src/api/enums/relations/${entity}.relations.ts`)} updated`));
};


/**
 * @description  built string to write for name option in a JoinColumn/JoinTable decorator
 * @param {String} name name of the bridging table/referenced column ina foreign key
 * @returns {string}
 */
const _Name = (name) => {
    if (name != null) return `name:"${name}"`;
    else return ''
};


/**
 * @description  Build the string to write for referencedColumn option in a JoinColumn/JoinTable decorator
 * @param {String} name name of the bridging table/name of the foreign key
 * @param {String} refCol referenced column in a foreign key
 * @returns {string} referencedColumnName option ready to be written
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
 * @return {array} to write in a model for many to many relationship
 */
const _Mtm = ( model2, isFirst, name, m1Name,m2Name) => {
    let toPut = `\n  @ManyToMany(type => ${capitalizeEntity(model2)}, ${model2} => ${model2}.${ plural(m1Name)})\n`;
    if (isFirst) toPut += `  @JoinTable({${_Name(name)}})\n`;
    toPut += `  ${ plural(m2Name)} : ${capitalizeEntity(model2)}[];\n\n`;
    return [toPut ,  plural(m2Name)];
};

/**
 * @description build the string to write in a model for one to one relationship
 * @param {string} model1 model you want to write in
 * @param {string} model2 model related to the model you want to write in
 * @param {boolean} isFirst First in the relationship
 * @param {string} name name of the foreignKey in the table
 * @param {string} refCol the column referenced in the foreign key
 * @return {array} to write in a model for one to one relationship
 */
const _Oto = (model2, isFirst, name, refCol, m1Name, m2Name) => {
    let toPut = ` @OneToOne(type => ${capitalizeEntity(model2)}, ${model2} => ${model2}.${m1Name})\n`;
    if (isFirst) toPut += `@JoinColumn({${_Name(name)}${_RefCol(name, refCol)}})\n`;
    toPut += `  ${m2Name} : ${capitalizeEntity(model2)};`;
    return [toPut, m2Name];
};

/**
 * @description build the string to write in a model for one to many relationship
 * @param {string} model1 model you want to write in
 * @param {string} model2 model related to the model you want to write in
 * @param {boolean} isFirst First in the relationship
 * @return {array} string to write in a model for one to many relationship
 */
const _Otm = (model2, isFirst, m1Name, m2Name) => {
    let toPut;
    if (isFirst) toPut = `@OneToMany(type => ${capitalizeEntity(model2)}, ${model2} => ${model2}.${m1Name})\n ${ plural(m2Name)} : ${capitalizeEntity(model2)}[];`;
    else toPut = `@ManyToOne(type => ${capitalizeEntity(model2)}, ${model2} => ${model2}.${ plural(m1Name)})\n ${m2Name} : ${capitalizeEntity(model2)};`;
    return [toPut, isFirst ?  plural(m2Name) : m2Name]
};

/**
 * @description Define which relation need to be written in the model
 * @param {string} model1 the model you want to write in
 * @param {string} model2 the model that need to be included in the first model
 * @param {boolean} isFirst Does he carry the foreignKey (Oto) or assure that you write JoinTable only in one side of the relation for mtm
 * @param {string} relation Relation type
 * @param {string} name either the name of the foreign key (for oto) or the name of the bridging table (for mtm)
 * @param {string} refCol  for Oto only , name of the referenced column in the foreign key (must be primary or unique)
 * @returns {Promise<void>}
 */
const _addRelation = async (model1, model2, isFirst, relation, name, refCol, m1Name, m2Name) => {
    // Get the string to write in modelFile
    // in case of many to one , exchange model1 and model2 because the logic is reversed 
    let toPut;

    if (relation === 'mtm') toPut = _Mtm(model2, isFirst, name,m1Name,m2Name);
    if (relation === 'oto') toPut = _Oto(model2, isFirst, name, refCol,m1Name,m2Name);
    if (relation === 'otm') toPut = _Otm(model2, isFirst,m1Name,m2Name);
    if (relation === 'mto') {
        toPut = _Otm(model1, isFirst,m2Name,m1Name);
        let temp= model1; 
        model1= model2;
        model2 = temp;
    }


    //Get the file to write in
    let pathModel = `${process.cwd()}/src/api/models/${model1}.model.ts`;
    let modelFile = ReadFile(pathModel, 'utf-8');

    //Get the last { and write the relation before the last { if the relation isn't already written
    let pos = modelFile.lastIndexOf('}');
    if(!relationExist(model1,toPut[1])) modelFile = `${modelFile.substring(0, pos)}${toPut[0]}\n\n}`;

    //import the model of the second entity if it is not already present then write process to update serializer and controller
    if (!isImportPresent(modelFile, capitalizeEntity(model2))) modelFile = writeToFirstEmptyLine(modelFile, `import { ${capitalizeEntity(model2)} } from "./${model2}.model";\n`);
    await Promise.all([WriteFile(pathModel, modelFile), _addToSerializer(model1, toPut[1],model2), _addToRelation(model1, toPut[1],model2), _addToController(model1,toPut[1],model2)]);
};


/**
 *
 * @param {String} model1 one of the model of the relationship
 * @param {String} model2 the second model of the relationship
 * @param {String} relation the relation you want between the two models
 * @param {String} name either the name of the foreign key (for oto) or the name of the bridging table (for mtm)
 * @param {String} refCol for Oto only , name of the referenced column in the foreign key (must be primary or unique)
 * @description  Create a relationship between 2 models
 * @returns {Promise<void>}
 */
module.exports = async (model1, model2, relation, name, refCol, m1Name, m2Name) => {
    if (!modelFileExists(model1) || !modelFileExists(model2)) throw new Error("Both model should exist in order to create a many to many relationship");
    if (columnExist(model1, m2Name) || columnExist(model2, m1Name) || relationExist(model1, m2Name) || relationExist(model2, m1Name)) throw new Error("A Column have a name that conflicts with the creation of the relationship in one or both models \n Please use m1Name and m2Name option");
    await _addRelation(model1, model2, true, relation, name, refCol, m1Name, m2Name)
        .catch(err => Log.error(err.message));
    await _addRelation(model2, model1, false, relation, name, refCol, m2Name, m1Name)
        .catch((err) => Log.error(err.message));
};