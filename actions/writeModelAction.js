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
const {capitalizeEntity, lowercaseEntity , buildModelColumnArgumentsFromObject , addToConfig} = require('./lib/utils');
const stringifyObject = require('stringify-object');

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
        entities.push({
            column : col,
            decoratorParams : stringifyObject(buildModelColumnArgumentsFromObject(col))
        });
    });

    let output = ejs.compile(p_file, {root: `${__baseDir}/templates/`})({
        entityLowercase: lowercase,
        entityCapitalize: capitalize,
        entities,
        createUpdate: data.createUpdate,
        capitalizeEntity,
        lowercaseEntity
    });

    await Promise.all([WriteFile(pathModel, output), addToConfig(capitalize)]);
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

    await Promise.all([addToConfig(capitalize), p_write])
};