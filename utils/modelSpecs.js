const inquirer = require('../lib/inquirer');
const colors = require('colors/safe');
let columnWritten = [];


columnParams = async (entity) => {
    //if any answer of the question is :exit , cancel current column
    let length='',def,uni,paramsTemp ,paramsArray = [],length_enum,arrayDone = false ;
    let {columnName}  = await inquirer.questionColumnName(columnWritten);
    if (columnName  === ':exit') return null;
    let {constraintValue}  = await inquirer.questionColumnKey();
    if (constraintValue === ':exit') return null;
    //code than you must run trough except if column is a foreign key
    if (constraintValue !== 'foreign key') {
        //if there's no constraint, ask if value should be unique or not.because primary/unique key must be unique anyway
        if (constraintValue === 'no constraint') {
            let {uniqueValue}= await inquirer.questionUnique();
            uni = uniqueValue;
        }
        else uni = true;
        let {type} = await inquirer.questionType();
        if (type === ':exit') return null;
        //if type need a length/width or is enum and need an array . Ask the user
        if (needLength.includes(type)) {
            length_enum = await inquirer.lengthQuestion();
            if (length_enum.enum === ':exit') return null;
            else length = length_enum.enum       
        } else if (type === 'enum') {
            //add value to array until user is done
            while (!arrayDone) {
                let enumTemp = await inquirer.enumQuestion();
                if (enumTemp.enum === ':exit') return null;
                let confirm = await inquirer.askForConfirmation();
                if (confirm.confirmation) length += enumTemp.enum;
                let more = await inquirer.askForMore();
                if (!more.continueValue) arrayDone = true;
            }
            length = length.substr(0,length.length-1);
        } 
        //certain type can't have a default + unique and primary don't have a default.
        if (constraintValue !== 'no constraint' || type.includes('blob') || type.includes('json') || type.includes('text')) def = ':no';
        else{
            let {defaultValue} = await inquirer.questionDefault();
            def = defaultValue
        } 
        if (def === ':exit') return null;
        console.clear();
        //Same format as the one send by mysql with a describe query
        paramsTemp={
            Field : columnName,
            Type : { type , length },
            Null : uni ? 'YES' : 'NO',
            Key : constraintValue,
            Default : def
        }
        console.log(paramsTemp);
        //ask for a confirmation then add the column and the name to an array with already added column
        let lastConfirm = await inquirer.askForConfirmation();
        if (lastConfirm.confirmation) {
            paramsArray['columns'] = paramsTemp;
            columnWritten[columnWritten.length]= paramsTemp.Field;
        }
    }
    else {
        // part of the code to handle colum with foreign keys
        let { referencedTable } = await inquirer.questionRelation();
        if (referencedTable === ':exit') return null;
        let { referencedColumn } = await inquirer.questionReferencedColumn();
        if (referencedColumn === ':exit') return null;
        //Same format as the one send by mysql whith a describe query for the foreign keys
        let relationTemp = {
            TABLE_NAME: entity,
            COLUMN_NAME : paramsTemp.Field,
            REFERENCED_TABLE_NAME: referencedTable.trim(),
            REFERENCED_COLUMN_NAME: referencedColumn,
        };
        let { response } = await inquirer.askForeignKeyRelation(relationTemp);
        relationTemp.type = response
        //ask for a confirmation then add the column and the name to an array with already added column
        console.log(relationTemp);
        let { confirmation } = await inquirer.askForConfirmation();
        if (confirmation) {
            paramsArray['foreignKeys']=relationTemp2;
            columnWritten[columnWritten.length]= paramsTemp.Field;
        }    
    }
    return paramsArray;
}

/**
 * @author Romain Verliefden
 */
const needLength =  ['int','varchar','tinyint','smallint','mediumint','bigint','float','double','decimal','char','binary','varbinary'];
exports.dbParams = async (entity) => {
    let isDoneColumn = false ,paramsArray = [];
    paramsArray['columns'] = [];
    paramsArray['foreignKeys'] = [];
    console.log(colors.green(`Let's create a table for ${entity}`));
    console.log(colors.green('/!\\ id is added by default .'));
    paramsArray['createUpdate'] = await inquirer.askForCreateUpdate();
    while (!isDoneColumn) {
        //ask the user the column to add to his entity until user is done
        let data = await columnParams(entity).catch(e => console.log(e.message));
        //add value to array that will be returned if value is not null
        if (data.columns != undefined) paramsArray['columns'].push(data.columns);
        if (data.foreignKeys != undefined) paramsArray['foreignKeys'].push(data.foreignKeys);
        console.clear();
        let cont = await inquirer.lastConfirmation();
        if (!cont.continueValue) isDoneColumn = true;
    }
    return paramsArray;
}
