const inquirer = require('inquirer');
const files = require('./files');
module.exports = {
    askPathValidation: () => {
        const questions ={
                name: 'pathCorrect',
                type: 'input',
                message: `Is this PATH correct \"${process.cwd()}\" [Yes/No] ?`,
                validate: function(value) {
                    if(value.length && ((value.toLowerCase() === "y" || value.toLowerCase() === "yes") || (value.toLowerCase() === "n" || value.toLowerCase() === "no"))){
                        return true;
                    }else{
                        return 'Please enter yes or no !';
                    }
                }
            };
        return inquirer.prompt(questions);
    },
    askForNewPath: () =>{
        const question = {
            name: 'path',
            type: 'input',
            message: "Please enter a new path :",
            validate: function(value){
                let directoryExists = files.directoryExists(value);
                if(value.length && directoryExists){
                    return true;
                }else{
                    return 'Please enter a correct path';
                }
            }
        };
        return inquirer.prompt(question);
    },
    askForProjectName: () => {
        const question = {
            name : 'name',
            type : 'input',
            message : 'Please enter a name for your project :',
            validate: function(value){
                if(value.length){
                    return true;
                }else{
                    return 'Please enter a name for your project';
                }
            } 
        };
        return inquirer.prompt(question);
    },
    enumQuestion: () => {
        const question = {
            type: 'input',
            name: 'enum',
            message: 'add a value to enum array ?',
            filter: data => `'${data}',`
        }
        return inquirer.prompt(question);
    },
    askForConfirmation: () => {
        const question = {
            type: 'confirm',
            name: 'confirmation',
            message: 'Add this data ?'
        }
        return inquirer.prompt(question);
    },
    lengthQuestion: () => {
        const question = {
            type: 'input',
            name: 'enum',
            message: 'what\'s the data length ?',
            validate : value => {
                let pass = value.match(/[0-9]+$/);
                return pass ? true : "You must provide a number !";
            }
        }
        return inquirer.prompt(question);
    },
    relationQuestion: () => {
        const question  = {
            type:'confirm',
            name: 'addRelation',
            message: 'Do you want to add relation between tables ?',
            default: true
        }
        return inquirer.prompt(question);
    },
    paramsQuestion: () => {
        const questionsParams = [
            {
              type : 'input' ,
              name : 'column',
              message : "What's the new column name ?",
              validate : data => {
                if(data === "")                       return "Name must contains at least one letter";
                else if(data.toLowerCase() === 'id')  return 'id is added by default';
                else                                  return true;
              },
              filter: data => data.replace(" ","_")
            },
            {
              type : 'list',
              name: 'type',
              message : "What's the column type ?",
              choices : ['char','varchar','datetime','date','time','timestamp','year','tinyint','smallint','mediumint','binary','varbinary','int','bigint','float','double','decimal','tinytext','mediumtext','text','enum','json','tinyblob','smallblob','mediumblob','blob','bigblob','binary']
            },
            {
              type : 'input',
              name : 'defaultValue',
              message : "What's the column default value ?",
              default: "null"
            },
            {
              type:'list',
              name:'constraintValue',
              message:'CONSTRAINT',
              default : ' ',
              choices: ['primary','unique','foreign key','no constraint'],
              filter : data => {
                if(data === 'primary') return 'PRI';
                else if ( data === 'unique') return 'UNI';
                else return data;
              }
            },
            {
              type:'confirm',
              name:'uniqueValue',
              message:'can be null ?',
              default : true
            }
        ];
        return inquirer.prompt(questionsParams);
    },
    questionRelation: () => {
        const questionRelation = [
            {
              type:'input',
              name:'referencedTable',
              message:'Which table is related to this table ?',
              validate: (data) =>{
                data = data.trim();
                if(data ==null || data ==='' || data == undefined){
                  return "you must enter a value";
                }else{
                  return true;
                }
              }
            },
            {
              type:'input',
              name:'referencedColumn',
              message:'Which column is the referenced column ?',
              validate : data =>{
               if(data ==null || data === '' || data == undefined) return "you must enter a value";
               else return true;
            }}
          ];
        return inquirer.prompt(questionRelation);
    },
    askForMore: () => {
        const question = {
            type : 'confirm' ,
            name : 'continueValue',
            message : "Want to add more data to enum array ?",
            default: true
        }
        return inquirer.prompt(question);
    },
    askForChoice: () => {
        const options = [
            {
              type:'list',
              name:'value',
              message:'Entity doesn\'t exist. What must be done ',
              default:'create an entity',
              choices:['create an entity','create a basic model','nothing']
            }
          ];
          return inquirer.prompt(options);
    },
    lastConfirmation: () => {
        const question = {
            type : 'confirm' ,
            name : 'continueValue',
            message : "Want to add more column ?",
            default: true
        }
        return inquirer.prompt(question);
    },
    askForDBConfirmation: () => {
        const question = {
            type: 'confirm',
            name: 'confirmation',
            message: "Are you sure ?",
            default : false
        }
        return inquirer.prompt(question);
    }
    
}