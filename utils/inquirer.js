/**
 * @author Samuel Antoine
 */
const inquirer = require('inquirer');
const files = require('./files');
const utils = require("../generate/utils");

/**
 * @module inquirer
 * @returns {functions}
 * @description Inquirer questions
 */
module.exports = {
    askForNewPath: () => {
        const question = {
            name: 'path',
            type: 'input',
            message: "Please enter a path :",
            validate: function (value) {
                let directoryExists = files.directoryExists(value);
                if (value.length && directoryExists) {
                    return true;
                } else {
                    let newDir = files.createDirectory(value);
                    if (newDir === false) {
                        return "Can't create this directory"
                    } else return true;
                }
            }
        };
        return inquirer.prompt(question);
    },
    askForProjectName: () => {
        const question = {
            name: 'name',
            type: 'input',
            message: 'Please enter a name for your project :',
            validate: function (value) {
                if (value.length) {
                    return true;
                } else {
                    return 'Please enter a name for your project';
                }
            }
        };
        return inquirer.prompt(question);
    },
    askForDatabaseCreation: () => {
        const question = {
            name: 'canCreate',
            type: 'confirm',
            message: 'Database does not exists , do you want to create it ?',
        };
        return inquirer.prompt(question);
    },
    enumQuestion: () => {
        const question = {
            type: 'input',
            name: 'enum',
            message: 'add a value to enum array ?',
            filter: data => {
                if (data !== ':exit') return `'${data}',`;
                else return data;
            }
        };
        return inquirer.prompt(question);
    },
    askForConfirmation: (q) => {
        const question = {
            type: 'confirm',
            name: 'confirmation',
            message: q
        };
        return inquirer.prompt(question);
    },
    lengthQuestion: () => {
        const question = {
            type: 'input',
            name: 'enum',
            message: 'what\'s the data length ?',
            validate: value => {
                let pass = value.match(/[0-9]+$/);
                if (value === ':exit') return true;
                if (value < 0) return "length can't be negative";
                return pass ? true : "You must provide a number !";
            }
        };
        return inquirer.prompt(question);
    },
    relationQuestion: () => {
        const question = {
            type: 'confirm',
            name: 'addRelation',
            message: 'Do you want to add relation between tables ?',
            default: true
        };
        return inquirer.prompt(question);
    },
    questionColumnName: (columnWritten) => {
        const questionsParams = [
            {
                type: 'input',
                name: 'columnName',
                message: "What's the new column name ?",
                validate: data => {
                    if (data === "") return "Name must contains at least one letter";
                    else if (data.toLowerCase() === 'id') return 'id is added by default';
                    else if (columnWritten.includes(data)) return data + ' is already added';
                    else if (!data.match(/^[a-zA-Z]\w{0,30}$/) && data !== ':exit') return "Name contain fordibben charachter";
                    else return true;
                },
                filter: data => data.replace(" ", "_").trim()
            }];
        return inquirer.prompt(questionsParams);
    },
    questionColumnKey: () => {
        const questionsParams = [
            {
                type: 'list',
                name: 'constraintValue',
                message: 'CONSTRAINT',
                default: ' ',
                choices: ['no constraint', 'primary', 'unique', 'Cancel current column'],
                filter: data => {
                    if (data === 'primary') return 'PRI';
                    else if (data === 'unique') return 'UNI';
                    else if (data === 'Cancel current column') return ':exit';
                    else return data;
                }
            }
        ];
        return inquirer.prompt(questionsParams);

    },
    questionUnique: () => {
        const questionsParams = [
            {
                type: 'confirm',
                name: 'uniqueValue',
                message: 'can be null ?',
                default: true,
                filter: data => {
                    if (data === ':exit') return null;
                    else return data;
                }
            }
        ];
        return inquirer.prompt(questionsParams);
    },
    questionDefault: (type, enumArray, nullable) => {
        let questionType;
        enumArray.includes('[') ? questionType = 'list' : questionType = 'input';
        enumArray = enumArray.substr(1, enumArray.length - 2);
        enumArray = enumArray.split(',');
        if (Array.isArray(enumArray)) enumArray.push('Cancel current column');
        if (nullable) enumArray.unshift('null');
        const questionsParams = [
            {
                type: questionType,
                name: 'defaultValue',
                choices: enumArray,
                message: "What's the column default value ?(type :no if you don't want a default)",
                default: "null",
                filter: (data) => {
                    if (data === 'Cancel current column') return ':exit';
                    else return data
                },
                validate: (data) => {
                    numberType = ['tinyint', 'smallint', 'mediumint', 'int', 'bigint', 'float', 'double'];
                    if (data === ':no') return true;
                    if (data === ':exit') return true;
                    if (numberType.includes(type)) {
                        if (isNaN(data) || data === '') return "Type is numeric.Therefore, default should be a number :)";
                        else return true
                    } else if (type === 'year') {
                        if (!isNaN(data)) {
                            if ((data < 100 && data > 9) || (data > 1900 && data <= 2155)) return true;
                        }
                        return "not a valid year";
                    } else if (type === 'time') {
                        let regex = /^(00|[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])$/;
                        if (!data.match(regex)) return "not a valid time";
                        return true;
                    } else if (type === 'datetime' || type === 'timestamp') {
                        let sqlFunction = ['CURRENT_TIMESTAMP', 'GETDATE', 'GETUTCDATE', 'SYSDATETIME'];
                        regex = /^\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01]) (00|[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])$/;
                        if (data.match(regex) && type !== 'timestamp') return true;
                        if (!isNaN(data)) return true;
                        if (sqlFunction.includes(data)) return true;
                        else return "not a valid datetime";
                    } else return true;
                }
            },];
        return inquirer.prompt(questionsParams);
    },
    questionType: () => {
        const questionsParams = [
            {
                type: 'list',
                name: 'type',
                message: "What's the column type ?",
                choices: ['char', 'varchar', 'datetime', 'date', 'time', 'timestamp', 'year', 'tinyint', 'smallint', 'mediumint', 'int', 'bigint', 'float', 'double', 'binary', 'varbinary', 'decimal', 'tinytext', 'mediumtext', 'text', 'enum', 'json', 'tinyblob', 'smallblob', 'mediumblob', 'blob', 'longblob', 'Cancel current column'],
                filter: data => {
                    if (data === 'Cancel current column') return ':exit';
                    else return data;
                }
            },];
        return inquirer.prompt(questionsParams);
    },
    questionRelation: () => {
        const questionRelation = [
            {
                type: 'input',
                name: 'referencedTable',
                message: 'Which table is related to this table ?',
                validate: async (data) => {
                    path = require('path');
                    // MARK : path to cli/generate/utils
                    data = data.trim();
                    if (data == null || data === '' || data === undefined) {
                        return "you must enter a value";
                    } else if (await utils.modelFileExists(data) || data === ':exit') {
                        return true;
                    } else {
                        return "Model doesn't exist. type :exit if you want to cancel current column";
                    }
                }
            }
        ];
        return inquirer.prompt(questionRelation);
    },
    questionReferencedColumn: () => {
        const questionRelation = [
            {
                type: 'input',
                name: 'referencedColumn',
                message: 'Which column is the referenced column ?',
                validate: data => {
                    if (data == null || data === '' || data === undefined) return "you must enter a value";
                    else return true;
                }
            }
        ];
        return inquirer.prompt(questionRelation);
    },
    askForChoice: (exist) => {
        let create = ['create an entity', 'create a basic model', 'nothing'];
        if (exist) create.unshift('create from db');
        const options = [
            {
                type: 'list',
                name: 'value',
                message: 'Entity doesn\'t exist. What must be done ',
                default: 'create an entity',
                choices: create
            }
        ];
        return inquirer.prompt(options);
    },
    askForeignKeyRelation: (tmpKey) => {
        const question = [
            {
                type: 'list',
                name: 'response',
                message: `A relationship has been detected with table ${tmpKey.REFERENCED_TABLE_NAME} with the key ${tmpKey.TABLE_NAME}.${tmpKey.COLUMN_NAME} to ${tmpKey.REFERENCED_TABLE_NAME}.${tmpKey.REFERENCED_COLUMN_NAME}\nWhat kind of relationship is this ?`,
                choices: ['OneToOne', 'ManyToOne', 'OneToMany'],
                filter: (data) => {
                    if (data === 'OneToOne') return 'oto';
                    if (data === 'OneToMany') return 'otm';
                    if (data === 'ManyToOne') return 'mto';
                }
            }
        ];
        return inquirer.prompt(question);
    },
    askForEnvVariable: () => {
        const envQuestion = [
            {
                type: 'list',
                name: "env",
                message: "Which environnement will you work in ?",
                default: 'Development',
                choices: ['Production', 'Development', 'Staging', 'Test']
            },
            {
                type: 'input',
                name: 'PORT',
                message: 'Which port will the app use ?',
                default: 8001,
                validate: (data) => {
                    if ((/^[0-9]+$/).test(data)) {
                        return true;
                    } else {
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
                    if ((/^[0-9]+$/).test(data)) {
                        return true;
                    } else {
                        return "Please, insert numbers only !"
                    }
                }
            },
        ];
        return inquirer.prompt(envQuestion);
    },
    askForCreateUpdate: () => {
        const question = [{
            type: 'confirm',
            name: 'createAt',
            message: 'Do you want to add a createAt Column ?',
            default: true
        }, {
            type: 'confirm',
            name: 'updateAt',
            message: 'Do you want to add a updateAt Column ?',
            default: true
        }];

        return inquirer.prompt(question)
    },
    askForDockerVars: () => {
        const dockerQuestion = [
            {
                type: 'input',
                name: 'EXPOSE',
                message: 'Container exposed port ?',
                default: 3306,
                validate: (data) => {
                    if ((/^[0-9]+$/).test(data)) {
                        return true;
                    } else {
                        return "Please, insert numbers only !"
                    }
                }
            },
            {
                type: 'input',
                name: "Container_name",
                message: "Please enter a name for the docker image and container :",
                default: "3rd_party_trs_boilerplate"
            },
            {
                type: 'input',
                name: 'MYSQL_DATABASE',
                message: "Database name ?",
                default: "3rd_party_ts_boilerplate"
            },
            {
                type: "input",
                name: "MYSQL_ROOT_PASSWORD",
                message: "Enter a password for \"root\" user : ",
                default: 'root'
            }
        ];
        return inquirer.prompt(dockerQuestion);
    },
    ChoseEnvFile: (envFiles) => {
        const question = {
            type: "list",
            name: "env",
            message: "Which environement would you like to edit ?",
            choices: envFiles,
        };
        return inquirer.prompt(question);
    },
    EditEnvFile: (envData) => {
        const questions = [
            {
                type: "input",
                name: "PORT",
                message: "API port :",
                default: envData.PORT,
                validate: (data) => {
                    if ((/^[0-9]+$/).test(data)) {
                        return true;
                    } else {
                        return "Please, insert numbers only !"
                    }
                }
            },
            {
                type: "input",
                name: "URL",
                message: "API url:",
                default: envData.URL
            },
            {
                type: "input",
                name: "AUTHORIZED",
                message: "CORS authorized domais, (If multiple, separate them with coma and no spacing !!",
                default: envData.AUTHORIZED,
                validate: (data) => {
                    if (data.includes(' ')) {
                        return "You string contains spacing. Please enter it again without spacing";
                    } else {
                        return true;
                    }
                }
            },
            {
                type: "confirm",
                name: "HTTPS_IS_ACTIVE",
                message: "Activate HTTPS ?",
                default: () => {
                    return envData.HTTPS_IS_ACTIVE === "1";
                },
            },
            {
                type: "input",
                name: "HTTPS_CERT",
                message: "Https certificate :",
                default: envData.HTTPS_CERT,
            },
            {
                type: "input",
                name: "HTTPS_KEY",
                message: "Https key: ",
                default: envData.HTTPS_KEY,

            },
            {
                type: "input",
                name: "JWT_SECRET",
                message: "JWT secret: ",
                default: envData.JWT_SECRET
            },
            {
                type: "input",
                name: "JWT_EXPIRATION_MINUTES",
                message: "JWT expiration time (min): ",
                default: envData.JWT_EXPIRATION_MINUTES,
                validate: (data) => {
                    if ((/^[0-9]+$/).test(data)) {
                        return true;
                    } else {
                        return "Please, insert numbers only !"
                    }
                }
            },
            {
                type: 'input',
                name: 'TYPEORM_TYPE',
                message: 'DataBase type ?',
                default: envData.TYPEORM_TYPE,
            },
            {
                type: 'input',
                name: 'TYPEORM_NAME',
                message: 'DataBase connection name ?',
                default: envData.TYPEORM_NAME,
            },
            {
                type: 'input',
                name: 'TYPEORM_HOST',
                message: 'DataBase host ?',
                default: envData.TYPEORM_HOST,
            },
            {
                type: 'input',
                name: 'TYPEORM_DB',
                message: 'Database name ?',
                default: envData.TYPEORM_DB,
            },
            {
                type: 'input',
                name: 'TYPEORM_USER',
                message: 'Database username ?',
                default: envData.TYPEORM_USER,
            },
            {
                type: 'input',
                name: 'TYPEORM_PWD',
                message: 'Database password ?',
                default: envData.TYPEORM_PWD,
            },
            {
                type: 'input',
                name: 'TYPEORM_PORT',
                message: 'Database port ?',
                default: envData.TYPEORM_PORT,
                validate: (data) => {
                    if ((/^[0-9]+$/).test(data)) {
                        return true;
                    } else {
                        return "Please, insert numbers only !"
                    }
                }
            },
            {
                type: "confirm",
                name: "JIMP_IS_ACTIVE",
                message: "Activate jimp ?",
                default: () => {
                    return envData.JIMP_IS_ACTIVE === "1";
                },
            },
            {
                type: "input",
                name: "JIMP_SIZE_XS",
                message: "Jimp xs size :",
                default: envData.JIMP_SIZE_XS,
                validate: (data) => {
                    if ((/^[0-9]+$/).test(data)) {
                        return true;
                    } else {
                        return "Please, insert numbers only !"
                    }
                }
            },
            {
                type: "input",
                name: "JIMP_SIZE_MD",
                message: "Jimp xs size :",
                default: envData.JIMP_SIZE_MD,
                validate: (data) => {
                    if ((/^[0-9]+$/).test(data)) {
                        return true;
                    } else {
                        return "Please, insert numbers only !"
                    }
                }
            },
            {
                type: "input",
                name: "JIMP_SIZE_XL",
                message: "Jimp xs size :",
                default: envData.JIMP_SIZE_XL,
                validate: (data) => {
                    if ((/^[0-9]+$/).test(data)) {
                        return true;
                    } else {
                        return "Please, insert numbers only !"
                    }
                }
            },
            {
                type: "input",
                name: "MAIL_API_ID",
                message: "Mail API ID: ",
                default: envData.MAIL_API_ID,
            },
            {
                type: "input",
                name: "MAIL_API_ROUTE",
                message: "Mail API route: ",
                default: envData.MAIL_API_ROUTE,
            },
            {
                type: "input",
                name: "MAILGUN_API_KEY",
                message: "Mailgun API Key: ",
                default: envData.MAILGUN_API_KEY,
            },
            {
                type: "input",
                name: "MAILGUN_PUBLIC_KEY",
                message: "Mailgun public key: ",
                default: envData.MAILGUN_PUBLIC_KEY,
            },
            {
                type: "input",
                name: "MAILGUN_DOMAIN",
                message: "Mailgun domain: ",
                default: envData.MAILGUN_DOMAIN,
            },
            {
                type: "input",
                name: "MAILGUN_HOST",
                message: "Mailgun host: ",
                default: envData.MAILGUN_HOST,
            },

        ];
        return inquirer.prompt(questions);
    }
};