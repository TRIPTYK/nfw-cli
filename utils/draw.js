const figlet = require('figlet');
const chalk = require('chalk');
/**
 * @author Samuel Antoine
 */
module.exports = {
    /**
     * @description Display app name in huge letter in the command prompt
     */
    header : () => {
        console.log(
            chalk.blue(
                figlet.textSync('NFW',{horizontalLayout: 'full', kerning: "fitted"})
            )
        );
    }
}