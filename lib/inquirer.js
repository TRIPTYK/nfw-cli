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
            filter: data => {
              if(data !== ':exit') return `'${data}',`;
              else return data;
            }
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
                if(value === ':exit') return true;
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
    questionColumnName: () => {
        const questionsParams = [
            {
              type : 'input' ,
              name : 'columnName',
              message : "What's the new column name ?",
              validate : data => {
                if(data === "")                       return "Name must contains at least one letter";
                else if(data.toLowerCase() === 'id')  return 'id is added by default';
                else                                  return true;
              },
              filter: data => data.replace(" ","_")
            }]
        return inquirer.prompt(questionsParams);
    },
    questionColumnKey: () =>{
      const questionsParams = [
        {
          type:'list',
          name:'constraintValue',
          message:'CONSTRAINT',
          default : ' ',
          choices: ['no constraint','foreign key','primary','unique','Cancel current column'],
          filter : data => {
            if(data === 'primary') return 'PRI';
            else if ( data === 'unique') return 'UNI';
            else if ( data === 'Cancel current column') return ':exit';
            else return data;
          }
        }
    ];
    return inquirer.prompt(questionsParams);

    },
    questionUnique : () => {
      const questionsParams = [
        {
          type:'confirm',
          name:'uniqueValue',
          message:'can be null ?',
          default : true,
          filter : data =>{
            if ( data === ':exit') return null;
            else return data;
          }
        }
    ];
    return inquirer.prompt(questionsParams);
    },
    questionDefault : () => {
      const questionsParams = [
        {
          type : 'input',
          name : 'defaultValue',
          message : "What's the column default value ?(type :no if you don't want a default)",
          default: "null"
        },];
    return inquirer.prompt(questionsParams);
    },
    questionType : () => {
      const questionsParams = [
        {
          type : 'list',
          name: 'type',
          message : "What's the column type ?",
          choices : ['char','varchar','datetime','date','time','timestamp','year','tinyint','smallint','mediumint','binary','varbinary','int','bigint','float','double','decimal','tinytext','mediumtext','text','enum','json','tinyblob','smallblob','mediumblob','blob','bigblob','binary','Cancel current column'],
          filter : data =>{
            if ( data === 'Cancel current column') return ':exit';
            else return data;
          }
        },];
    return inquirer.prompt(questionsParams);
    },
    questionRelation: () => {
        const questionRelation = [
            {
              type:'input',
              name:'referencedTable',
              message:'Which table is related to this table ?',
              validate: async (data) =>{
                path = require ('path');
                const utils = require(path.resolve(process.cwd()+"/cli/generate/utils"));
                data = data.trim();
                if(data ==null || data ==='' || data == undefined){
                  return "you must enter a value";
                }else if(await utils.modelFileExists(data) || data === ':exit'){
                  return true;
                }else{
                  return "Model doesn't exist. type :exit if you want to cancel current column";
                }
              }
            }
          ];
        return inquirer.prompt(questionRelation);
    },
    questionReferencedColumn: () =>{
      const questionRelation = [
        {
          type:'input',
          name:'referencedColumn',
          message:'Which column is the referenced column ?',
          validate : data =>{
           if(data ==null || data === '' || data == undefined) return "you must enter a value";
           else return true;
          }
      }
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
