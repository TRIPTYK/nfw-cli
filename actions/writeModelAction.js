/**
 * @module writeModelAction
 * @author Verliefden Romain
 * @author Deflorenne Amaury
 * @description this module write the model.ts based on columns of the database
 * if the table exist. If the table doesn't exist , the user enter the columns of
 * the future table and the table is created in the database.
 */
const {capitalizeEntity, lowercaseEntity , addToConfig} = require('./lib/utils');
const project = require('../utils/project');
const modelTemplateFile = require(`../templates/model`);

/**
 * @param {string} action Model name
 * @param {array} data Data describing the model
 * @description write a typeorm model from an array of info about an entity
 * @returns {Promise<void>}
 */
exports.writeModel = async (action, data = null) => {
    let lowercase = lowercaseEntity(action);
    let capitalize = capitalizeEntity(lowercase);
    let {columns, foreignKeys} = data;

    /*
         filter the foreign keys from columns , they are not needed anymore
         Only when imported by database
    */
    columns = columns.filter(column => {
        return foreignKeys.find(elem => elem.COLUMN_NAME === column.Field) === undefined;
    }).filter(col => col.Field !== "id");

    modelTemplateFile(`src/api/models/${lowercase}.model.ts`,{
        entities : columns,
        className : capitalize,
        createUpdate: data.createUpdate
    });

    addToConfig(capitalize);

    await project.save();
};

/**
 *  @description creates a basic model , with no entites , imports or foreign keys
 *  @param {string} action
 */
exports.basicModel = async (action) => {
    let lowercase = lowercaseEntity(action);
    let capitalize = capitalizeEntity(lowercase);

    modelTemplateFile(`src/api/models/${lowercase}.model.ts`,{
        entities : [],
        className : `${capitalize}Model`,
        createUpdate : {
            createAt: true,
            updateAt: true
        }
    });

    addToConfig(capitalize);

    await project.save();
};