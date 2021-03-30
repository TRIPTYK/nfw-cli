/**
 * @module infoCommand
 * @description Command module to display project information
 * @author Deflorenne Amaury
 */

// Node modules
import chalk from 'chalk';

//yargs command
export const command: string = 'info';

//yargs command aliases
export const aliases: string[] = ['i'];


//yargs command desc
export const describe: string = 'Show the information about the developers';

//yargs command builder
export function builder () {

};

//main function
export function handler (): void {
    console.log(
        chalk.bgGreen('Made by :') +
        "\n Amaury Deflorenne <https://github.com/AmauryD>" +
        "\n Romain Verliefden <https://github.com/DramixDW>" +
        "\n Samuel Antoine <https://github.com/Snorkell>"
    );
};
