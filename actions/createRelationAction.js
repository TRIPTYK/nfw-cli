/**
 * @module createRelationAction
 * @author Verliefden Romain
 * @description creates relationship between 2 models
 */

// node modules
const {plural} = require('pluralize');
const stringifyObject = require('stringify-object');

// project object
const project = require('../utils/project');
const Log = require('../utils/log');

// project modules
const {modelFileExists, columnExist, relationExist, capitalizeEntity} = require('./lib/utils');

/**
 * @description add relationship in the serializer of an entity
 * @param {string} entity
 * @param {string} column
 */
exports.addToSerializer = (entity, column,model,m1Name,m2Name) => {
    const serializerFile = project.getSourceFile(`src/api/serializers/${entity}.serializer.ts`);
    const serializerClass = serializerFile.getClasses()[0];
    const constructor = serializerClass.getConstructors()[0];
    const relationshipsInitializer = constructor.getVariableDeclaration("data").getInitializer().getProperty("relationships").getInitializer();

    if (!relationshipsInitializer.getProperty(column)) {
        relationshipsInitializer.addPropertyAssignment({
            name: column,
            initializer: `{type : '${model}'}`
        });
    }

    constructor.addStatements(writer => {
        writer.write(`this.serializer.register("${model}",`).block(() => {
            writer.write(`whitelist : ${capitalizeEntity(model)}Serializer.whitelist`);
        }).write(");");
    });

    serializerFile.fixMissingImports();
    serializerFile.fixUnusedIdentifiers();

    Log.info(`Updated ${serializerFile.getFilePath()}`);
};

/**
 * @description add relationship in the controller of an entity
 * @param {string} entity
 * @param {string} column
 */
exports.addToRelation = (entity, column , otherModel) => {
    const relationFile = project.getSourceFile(`src/api/enums/relations/${entity}.relations.ts`);

    relationFile.getVariableDeclaration('relations').getInitializer().addElement(`'${column}'`);

    relationFile.fixMissingImports();
    relationFile.fixUnusedIdentifiers();

    Log.info(`Updated ${relationFile.getFilePath()}`);
};

/**
 * @description build the string to write in a model for many to many relationship
 * @param modelClass
 * @param {string} model2 model related to the model you want to write in
 * @param {boolean} isFirst First in the relationship
 * @param {string} name name of the bridging table
 * @param m1Name
 * @param m2Name
 * @return {array} to write in a model for many to many relationship
 */
const _Mtm = (modelClass, model1 , model2, isFirst, name, m1Name,m2Name) => {
    const prop = modelClass.addProperty({ name: plural(m1Name), type: capitalizeEntity(model2) });
    const args = {};

    prop.addDecorator({name : "ManyToMany" , arguments : [`type => ${capitalizeEntity(model2)}`,`${model2} => ${model2}.${ plural(m2Name)}`]}).setIsDecoratorFactory(true);

    if (name) args['name'] = name;

    if (isFirst) prop.addDecorator({name : "JoinTable",arguments : [stringifyObject(args)]}).setIsDecoratorFactory(true);

    return prop.getName();
};

/**
 * @description build the string to write in a model for one to one relationship
 * @param modelClass
 * @param model1
 * @param {string} model2 model related to the model you want to write in
 * @param {boolean} isFirst First in the relationship
 * @param {string} name name of the foreignKey in the table
 * @param {string} refCol the column referenced in the foreign key
 * @param m1Name
 * @param m2Name
 * @return {array} to write in a model for one to one relationship
 */
const _Oto = (modelClass, model1 , model2, isFirst, name, refCol, m1Name, m2Name) => {
    const prop = modelClass.addProperty({ name: m2Name, type: capitalizeEntity(model2) });
    const args = {};

    if (name) args['name'] = name;
    if (refCol) args['referencedColumnName'] = refCol;

    prop.addDecorator({name : "OneToOne" , arguments : [`type => ${capitalizeEntity(model2)}`,`${model2} => ${model2}.${m1Name}`]}).setIsDecoratorFactory(true);
    if (isFirst) prop.addDecorator({name : "JoinColumn",arguments : [stringifyObject(args)]}).setIsDecoratorFactory(true);

    return prop.getName();
};

/**
 * @description build the string to write in a model for one to many relationship
 * @param modelClass
 * @param modelClass
 * @param {string} model1 model you want to write in
 * @param {string} model2 model related to the model you want to write in
 * @param m1Name
 * @param m2Name
 * @param {boolean} isFirst First in the relationship
 * @return {array} string to write in a model for one to many relationship
 */
const _Otm = (modelClass, model1 , model2, isFirst, m1Name, m2Name) => {
    let prop;

    if (isFirst) {
        prop = modelClass.addProperty({name: plural(m2Name), type: `${capitalizeEntity(model2)}[]`});
        prop.addDecorator({
            name: "OneToMany",
            arguments: [`type => ${capitalizeEntity(model2)}`, `${model2} => ${model2}.${m1Name}`]
        }).setIsDecoratorFactory(true);
    }else {
        prop = modelClass.addProperty({name: m2Name, type: capitalizeEntity(model2)});
        prop.addDecorator({
            name: "ManyToOne",
            arguments: [`type => ${capitalizeEntity(model2)}`, `${model2} => ${model2}.${plural(m1Name)}`]
        }).setIsDecoratorFactory(true);
    }

    return prop.getName();
};

/**
 * @description build the string to write in a model for one to many relationship
 * @param modelClass
 * @param {string} model1 model you want to write in
 * @param {string} model2 model related to the model you want to write in
 * @param {boolean} isFirst First in the relationship
 * @param m1Name
 * @param m2Name
 * @return {array} string to write in a model for one to many relationship
 */
const _Mto = (modelClass, model1 , model2, isFirst, m1Name, m2Name) => {
    let prop;

    if (isFirst) {
        prop = modelClass.addProperty({name: m2Name, type: capitalizeEntity(model2)});
        prop.addDecorator({
            name: "ManyToOne",
            arguments: [`type => ${capitalizeEntity(model2)}`, `${model2} => ${model2}.${plural(m1Name)}`]
        }).setIsDecoratorFactory(true);
    }else {
        prop = modelClass.addProperty({name: plural(m2Name), type: `${capitalizeEntity(model2)}[]`});
        prop.addDecorator({
            name: "OneToMany",
            arguments: [`type => ${capitalizeEntity(model2)}`, `${model2} => ${model2}.${m1Name}`]
        }).setIsDecoratorFactory(true);
    }

    return prop.getName();
};

/**
 * @description Define which relation need to be written in the model
 * @param {string} model1 the model you want to write in
 * @param {string} model2 the model that need to be included in the first model
 * @param {boolean} isFirst Does he carry the foreignKey (Oto) or assure that you write JoinTable only in one side of the relation for mtm
 * @param {string} relation Relation type
 * @param {string} name either the name of the foreign key (for oto) or the name of the bridging table (for mtm)
 * @param {string} refCol  for Oto only , name of the referenced column in the foreign key (must be primary or unique)
 * @param m1Name
 * @param m2Name
 */
const _addRelation = (model1, model2, isFirst, relation, name, refCol, m1Name, m2Name) => {
    let addedPropertyName;

    let modelFile = project.getSourceFile(`src/api/models/${model1}.model.ts`);
    const modelClass = modelFile.getClasses()[0];

    if (relation === 'mtm') addedPropertyName = _Mtm(modelClass, model1 , model2 ,isFirst, name,m1Name,m2Name);
    if (relation === 'oto') addedPropertyName = _Oto(modelClass, model1 , model2, isFirst, name, refCol,m1Name,m2Name);
    if (relation === 'otm') addedPropertyName = _Otm(modelClass, model1 , model2, isFirst,m1Name,m2Name);
    if (relation === 'mto') addedPropertyName = _Mto(modelClass, model1 , model2, isFirst,m1Name,m2Name);

    modelFile.fixMissingImports();

    Log.info(`Updated ${modelFile.getFilePath()}`);

    exports.addToSerializer(model1, addedPropertyName,model2,m1Name,m2Name);
    exports.addToRelation(model1, addedPropertyName,model2);
};


/**
 *
 * @param {String} model1 one of the model of the relationship
 * @param {String} model2 the second model of the relationship
 * @param {String} relation the relation you want between the two models
 * @param {String} name either the name of the foreign key (for oto) or the name of the bridging table (for mtm)
 * @param {String} refCol for Oto only , name of the referenced column in the foreign key (must be primary or unique)
 * @param m1Name
 * @param m2Name
 * @description  Create a relationship between 2 models
 * @returns {Promise<void>}
 */
module.exports = async (model1, model2, relation, name, refCol, m1Name, m2Name) => {
    if (!modelFileExists(model1) || !modelFileExists(model2))
        throw new Error("Both model should exist in order to create a many to many relationship");
    if (columnExist(model1, m2Name) || columnExist(model2, m1Name) || relationExist(model1, m2Name) || relationExist(model2, m1Name))
        throw new Error("A Column have a name that conflicts with the creation of the relationship in one or both models \n Please use m1Name and m2Name option");

    _addRelation(model1, model2, true, relation, name, refCol, m1Name, m2Name);
    _addRelation(model2, model1, false, relation, name, refCol, m2Name, m1Name);

    await project.save();
};