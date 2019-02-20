const figlet = require('figlet');
const chalk = require('chalk');
module.exports = {
    header : () => {
        console.log(
            chalk.blue(
                figlet.textSync('Triptyk Portal',{horizontalLayout: 'full', kerning: "fitted"})
            )
        );
    }
}