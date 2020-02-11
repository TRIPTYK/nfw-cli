/**
 * @module startAction
 * @description start server and monitoring , also watch typescript files
 * @author Sam Antoine
 */

// Node modules
const spawn = require('cross-spawn');
const path = require('path');
const chalk = require('chalk');


/**
 * Main function
 * @param {string} environment
 * @param {boolean} monitoringEnabled
 * @returns {Promise<void>}
 */
module.exports = async (environment, monitoringEnabled) => {
    if (monitoringEnabled) {
        let monitoring = spawn(`node`, [`${path.resolve('monitoring', 'app.js')}`]);
        monitoring.stdout.on('data', (chunk) => {
            console.log(`Monitoring: ${chunk}`)
        });
        monitoring.stderr.on('data', (chunk) => {
            console.log(`Monitoring error : ${chunk}`)
        });
    }
    
    let executed = spawn(`${path.resolve(global.__baseDir,'node_modules','.bin','ts-node-dev')}`, ["--respawn","--transpileOnly","./src/app.bootstrap.ts","--env" ,`${environment}`]);
    executed.stderr.on('data',(chunk) =>{
        console.log(chunk.toString())
    });
    executed.stdout.on('data', (chunk) => {
        console.log(chunk.toString())
    });

    executed.on('close', (code) => {
        console.log(chalk.red(`Process exited with code ${code}`));
    });
};