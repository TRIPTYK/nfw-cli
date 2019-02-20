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
    }
}