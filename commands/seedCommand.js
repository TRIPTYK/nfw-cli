// node modules 

const main = require('../actions/seedAction')
// variables



// 1) connexion à la bdd puis requete sql pour les champs colonne / type
// 2) formatage correcte pour le json + xlsx 
// 3) écriture du fichier json 
// 4) écriture xlsx 
// 5) connection finie

/**
 * Yargs command syntax
 * @type {string}
 */

exports.command = 'seed';
/**
 * Yargs command description
 * @type {string}
 */
exports.describe = '2 options :  read database and write json file or read json file and write in database';

/**
 *  Yargs command builder
 */

exports.builder = () => {

};


/**
 * Main function
 * 
 * @return {Promise<void>}
 */
exports.handler = async () => {
    await main();

}
