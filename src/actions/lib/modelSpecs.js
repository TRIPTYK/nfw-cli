/**
 * @author Verliefden Romain
 * @module modelSpecs
 * @description TODO
 */

// node modules
const colors = require('colors/safe');

//project modules
const inquirer = require('../../utils/inquirer');
const Log = require('../../utils/log');

let columnWritten = [];

/**
 * @description Ask every questions about the column
 * @returns {Promise<null|Array>}
 */
exports.newColumn = async (columnName=null) => {
    Log.info('You can cancel the column at anytime if you write :exit  in an input or choose cancel current column in a choice.')
    //if any answer of the question is :exit , cancel current column
    let length = '', def, uni, paramsTemp, paramsArray = [], length_enum, arrayDone = false;
    if(!columnName) {
        let name = await inquirer.questionColumnName(columnWritten);
        columnName = name.columnName;  
    } 
    if (columnName === ':exit') return null;
    let {constraintValue} = await inquirer.questionColumnKey();
    if (constraintValue === ':exit') return null;
    //if there's no constraint, ask if value should be unique or not.because primary/unique key must be unique anyway
    if (constraintValue === 'no constraint') {
        let {uniqueValue} = await inquirer.questionUnique();
        uni = uniqueValue;
    } else uni = true;
    let {type} = await inquirer.questionType(constraintValue);
    if (type === ':exit') return null;
    //if type need a length/width or is enum and need an array . Ask the user
    if (needLength.includes(type)) {
        length_enum = await inquirer.lengthQuestion(type);
        if (length_enum.enum === ':exit') return null;
        else length = length_enum.enum
    } else if (type === 'enum') {
        //add value to array until user is done
        while (!arrayDone) {
            let enumTemp = await inquirer.enumQuestion();
            if (enumTemp.enum === ':exit') return null;
            let confirm = await inquirer.askForConfirmation('add this data ?');
            if (confirm.confirmation) length += enumTemp.enum;
            let more = await inquirer.askForConfirmation('add more Value ?');
            if (!more.confirmation) arrayDone = true;
        }
        length = length.substr(0, length.length - 1);
    }
    //certain type can't have a default + unique and primary don't have a default.
    if (constraintValue !== 'no constraint' || type.includes('blob') || type.includes('json') || type.includes('text')) def = ':no';
    else {
        let {defaultValue} = await inquirer.questionDefault(type, length);
        def = defaultValue
    }
    if (def === ':exit') return null;
    console.clear();
    //Same format as the one send by mysql with a describe query
    paramsTemp = {
        Field: columnName,
        Type: {type, length},
        Null: uni ? 'YES' : 'NO',
        Key: constraintValue,
        Default: def
    };
    console.log(paramsTemp);
    //ask for a confirmation then add the column and the name to an array with already added column
    let lastConfirm = await inquirer.askForConfirmation();
    if (lastConfirm.confirmation) {
        paramsArray['columns'] = paramsTemp;
        columnWritten[columnWritten.length] = paramsTemp.Field;
    }
    return paramsArray;
};

// TODO : move to resources
const needLength = ['int', 'varchar', 'tinyint', 'smallint', 'mediumint', 'bigint', 'char', 'binary', 'varbinary','decimal'];

/**
 * @description Ask for createAt,updateAt column then for a new column until user is done
 * @param {string} entity Model name
 * @param entity
 * @returns {Promise<Array>}
 */
exports.dbParams = async (entity) => {
    let isDoneColumn = false, paramsArray = [];
    paramsArray['columns'] = [];
    paramsArray['foreignKeys'] = [];
    console.log(colors.green(`Let's create a table for ${entity}`));
    console.log(colors.green('/!\\ id is added by default .'));
    paramsArray['createUpdate'] = await inquirer.askForCreateUpdate();
    while (!isDoneColumn) {
        //ask the user the column to add to his entity until user is done
        let data = await module.exports.newColumn().catch(e => console.log(e.message));
        //add value to array that will be returned if value is not null
        if (data != null && data.columns !== undefined) paramsArray['columns'].push(data.columns);
        if (data != null && data.foreignKeys !== undefined) paramsArray['foreignKeys'].push(data.foreignKeys);
        console.clear();
        let {confirmation} = await inquirer.askForConfirmation("Want to add more column ? ");
        if (!confirmation) isDoneColumn = true;
    }
    return paramsArray;
};
