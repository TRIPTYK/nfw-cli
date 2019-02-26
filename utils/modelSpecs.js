const inquirer = require('../lib/inquirer');
const colors = require('colors/safe');

const needLength =  ['int','varchar','tinyint','smallint','mediumint','bigint','float','double','decimal','char','binary','varbinary'];
exports.dbParams = async (entity) => {
    var isDoneColumn = false;
    var paramsArray = [];
    paramsArray['columns'] = [];
    paramsArray['foreignKeys'] = [];
    var column = [];
    console.log(colors.green(`Let's create a table for ${entity}`));
    console.log(colors.green('/!\\ id is added by default .'));
    while(!isDoneColumn){
        let value = await inquirer.paramsQuestion();
        if(column.includes(value.column)){
            console.log(colors.red('/!\\ You already added this column !'));
        }else{
            let length_enum = [];
            if(needLength.includes(value.type)){
                length_enum[0] = await inquirer.lengthQuestion();
            }else if(value.type === 'enum'){
                let arrayDone= false;
                while(!arrayDone){
                    let enumTemp = await inquirer.enumQuestion();
                    let confirm = await inquirer.askForConfirmation();
                    if(confirm.confirmation){
                        length_enum[length_enum.length]=enumTemp;
                    }
                    let more = await inquirer.askForMore();
                    if(!more.continueValue){
                        arrayDone = true ;
                    }
                }
            }else{
                length_enum[0]='NOTHING TO ADD'
            }
            let tempParanthesis = '';
            if(length_enum[0] !== 'NOTHING TO ADD'){
                tempParanthesis += '('
                length_enum[length_enum.length-1].enum=length_enum[length_enum.length-1].enum.replace(',','');
                length_enum.forEach(elem => {
                    tempParanthesis += elem.enum;
                });
                tempParanthesis += ')'
            }
            if(['text','varchar','enum'].includes(value.type) && value.defaultValue!=='null'){
                value.defaultValue=`'${value.defaultValue}'`;
            }
            let paramsTemp = {
                Field : value.column.trim(),
                Type : value.type.trim()+tempParanthesis.trim(),
                Default : value.defaultValue.trim(),
                Null : value.uniqueValue === true ? 'YES' : 'NO',
                Key : value.constraintValue
            };
            console.clear();
            console.log(paramsTemp);
            let lastConfirm = await inquirer.askForConfirmation();
            if(value.constraintValue === 'foreign key'){
                let {referencedTable, referencedColumn} = await inquirer.questionRelation();
                let relationTemp = {
                    TABLE_NAME : entity,
                    COLUMN_NAME : value.column,
                    REFERENCED_TABLE_NAME : referencedTable.trim(),
                    REFERENCED_COLUMN_NAME : referencedColumn,
                };
                let {response } = await inquirer.askForeignKeyRelation(relationTemp);
                relationTemp2 = {
                    TABLE_NAME : entity,
                    COLUMN_NAME : value.column,
                    REFERENCED_TABLE_NAME : referencedTable.trim(),
                    REFERENCED_COLUMN_NAME : referencedColumn,
                    type: response
                };
                console.log(relationTemp2);
                let {confirmation} = await inquirer.askForConfirmation();
                if(confirmation) paramsArray['foreignKeys'].push(relationTemp2);
            }
            if(lastConfirm.confirmation){
                column[column.length] = value.column;
                paramsArray['columns'].push(paramsTemp);
            }
            let cont = await inquirer.lastConfirmation();
            if(!cont.continueValue){
                isDoneColumn = true;
            }
        }
    }
    return paramsArray;
}