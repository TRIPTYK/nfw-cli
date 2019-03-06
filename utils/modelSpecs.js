const inquirer = require('../lib/inquirer');
const colors = require('colors/safe');
let column = [];

columnParams= async (entity) => {
    let paramsArray = [];
    paramsArray['columns'] = [];
    paramsArray['foreignKeys'] = [];
    let {columnName}= await inquirer.questionColumnName();
    if(columnName === ':exit') return null;
    if(column.includes(columnName)){
        console.log(colors.red('/!\\ You already added this column !'));
        return null;
    }else{
        let {constraintValue} = await inquirer.questionColumnKey();
        if(constraintValue === ':exit') return null;
        if (constraintValue !== 'foreign key'){
             if(constraintValue === 'no constraint' )var {uniqueValue} = await inquirer.questionUnique();
             else var uniqueValue = false;
             var {type} = await inquirer.questionType();
             if(type === ':exit') return null;
        }
        let length_enum = [];
        if(needLength.includes(type)){
            length_enum[0] = await inquirer.lengthQuestion();
            if(length_enum[0].enum === ':exit') return null;
        }else if(type === 'enum'){
            let arrayDone= false;
            while(!arrayDone){
                let enumTemp = await inquirer.enumQuestion();
                if(enumTemp.enum === ':exit') return null;
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
            length_enum[0]=10111998
        }
        if(type.includes('blob') || type.includes('json') || type.includes('text') || constraintValue !== 'no constraint') var defaultValue = ':no'; 
        else var {defaultValue} = await inquirer.questionDefault();
        if(defaultValue === ':exit') return null;
        console.log(defaultValue);
        let tempParanthesis = '';
        if(length_enum[0] !== 10111998){
            tempParanthesis += '('
            length_enum[length_enum.length-1].enum=length_enum[length_enum.length-1].enum.replace(',','');
            length_enum.forEach(elem => {
                tempParanthesis += elem.enum;
            });
            tempParanthesis += ')'
        }
        if(['text','varchar','enum'].includes(type) && defaultValue !=='null' && defaultValue!==':no' ){
            defaultValue=`'${defaultValue}'`;
        }
        if(constraintValue !== 'foreign key'){
            let paramsTemp = {
                Field : columnName.trim(),
                Type : type.trim()+tempParanthesis.trim(),
                Default : defaultValue.trim(),
                Null : uniqueValue  ? 'YES' : 'NO',
                Key : constraintValue
            };
            console.clear();
            console.log(paramsTemp);
            let lastConfirm = await inquirer.askForConfirmation();
            if(lastConfirm.confirmation){
                column[column.length] = columnName;
                paramsArray['columns'].push(paramsTemp);
            } 
        }    
        else{
            let {referencedTable} = await inquirer.questionRelation();
            if(referencedTable === ':exit') return null;
            let { referencedColumn} = await inquirer.questionReferencedColumn();
            if(referencedColumn=== ':exit') return null;
            let relationTemp = {
                TABLE_NAME : entity,
                COLUMN_NAME : columnName,
                REFERENCED_TABLE_NAME : referencedTable.trim(),
                REFERENCED_COLUMN_NAME : referencedColumn,
            };
            let {response } = await inquirer.askForeignKeyRelation(relationTemp);
            relationTemp2 = {
                TABLE_NAME : entity,
                COLUMN_NAME : columnName,
                REFERENCED_TABLE_NAME : referencedTable.trim(),
                REFERENCED_COLUMN_NAME : referencedColumn,
                type: response
            };
            console.log(relationTemp2);
            let {confirmation} = await inquirer.askForConfirmation();
            let paramsTemp = {
                Field : columnName.trim(),
                Key : constraintValue
            };
            if(confirmation){
                paramsArray['foreignKeys'].push(relationTemp2);
                paramsArray['columns'].push(paramsTemp);
            } 
        }
        
    }
    return paramsArray;
}

/**
 * @author Romain Verliefden
 */
const needLength =  ['int','varchar','tinyint','smallint','mediumint','bigint','float','double','decimal','char','binary','varbinary'];
exports.dbParams = async (entity) => {
    let isDoneColumn = false;
    let paramsArray = [];
    paramsArray['columns'] = [];
    paramsArray['foreignKeys'] = [];
    console.log(colors.green(`Let's create a table for ${entity}`));
    console.log(colors.green('/!\\ id is added by default .'));
    paramsArray['createUpdate'] = await inquirer.askForCreateUpdate();
    while(!isDoneColumn){
            try{
                let data = await columnParams(entity);
                if(data != null){
                    paramsArray['columns'].push(data.columns[0]);
                    if(data.foreignKeys[0] != undefined )paramsArray['foreignKeys'].push(data.foreignKeys[0]);
                }
            }catch(err){
                console.log(err);
            }
            //console.clear();
            let cont = await inquirer.lastConfirmation();
            if(!cont.continueValue){
                isDoneColumn = true;
            }    

    }
    return paramsArray;
}
