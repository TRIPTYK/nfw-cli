/**
 * @author Samuel Antoine
 */
const inquirer = require('inquirer');
const files = require('./files');
const chalk = require('chalk');
module.exports = {
    askPathValidation: () => {
        const questions ={
                name: 'pathCorrect',
                type: 'confirm',
                default: true,
                message: `Is this PATH correct \"${process.cwd()}\" ?`,
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
            message: `${chalk.bgYellow(chalk.black('Warning :'))} generate model from the database will oveeride existing models with the same name ! dou you want to continue ?`,
            default : false
        }
        return inquirer.prompt(question);
    },
    askForOverride: (modelName) => {
        const question = {
            type: 'confirm',
            name: 'override',
            message: `${chalk.magenta(modelName)} already exists, will you overwrite it ?` ,
            default: false
        }
        return inquirer.prompt(question);
    },
    askForeignKeyRelation : (tmpKey) => {
        const question = [
          {
            type : 'list',
            name: 'response',
            message : `A relationship has been detected with table ${tmpKey.REFERENCED_TABLE_NAME} with the key ${tmpKey.TABLE_NAME}.${tmpKey.COLUMN_NAME} to ${tmpKey.REFERENCED_TABLE_NAME}.${tmpKey.REFERENCED_COLUMN_NAME}\nWhat kind of relationship is this ?`,
            choices : ['OneToOne','ManyToMany','ManyToOne','OneToMany']
          }
        ];
        return inquirer.prompt(question);
    },
    askForEnvVariable : () => {
        const envQuestion = [
            {
                type: 'list',
                name: "env",
                message: "Which environnement will you work in ?",
                default:'Development',
                choices:['Production','Development','Staging','Test']
            },
            {
                type: 'input',
                name: 'PORT',
                message: 'Which port will the app use ?',
                default: 8001,
                validate: (data) => {
                    if((/^[0-9]+$/).test(data)){
                        return true;
                    }else{
                        return "Please, insert numbers only !"
                    }
                }
            },
            {
                type: 'input',
                name: 'TYPEORM_HOST',
                message: 'DataBase host ?',
                default: "localhost",
            },
            {
                type: 'input',
                name: 'TYPEORM_DB',
                message: 'Database name ?',
                default: "3rd_party_ts_boilerplate"
            },
            {
                type: 'input',
                name: 'TYPEORM_USER',
                message: 'Database username ?',
                default: 'root'
            },
            {
                type: 'password',
                name: 'TYPEORM_PWD',
                message: 'Database password ?'
            },
            {
                type: 'input',
                name: 'TYPEORM_PORT',
                message: 'Database port ?',
                default: 3306,
                validate: (data) => {
                    if((/^[0-9]+$/).test(data)){
                        return true;
                    }else{
                        return "Please, insert numbers only !"
                    }
                }
            }
        ]
        return inquirer.prompt(envQuestion);
    },
    askForCreateUpdate : () => {
        const question= [{
            type :'confirm',
            name :'createAt',
            message : 'Do you want to add a createAt Column ?',
            default: true
        },{
            type :'confirm',
            name :'updateAt',
            message : 'Do you want to add a updateAt Column ?',
            default: true
        }];

        return inquirer.prompt(question)
    }
}
