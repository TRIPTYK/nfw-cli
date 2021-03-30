/**
 * @module startAction
 * @description start server and monitoring , also watch typescript files
 * @author Sam Antoine
 */

// Node modules
import spawn = require('cross-spawn');
import path = require('path');
import chalk from 'chalk';


export class StartActionClass {

    environment: string;
    monitoringEnabled: boolean;

    constructor(environment: string, monitoringEnabled: boolean){
        this.environment = environment;
        this.monitoringEnabled = monitoringEnabled;
    }

    //Main function
    async main () {

        if (this.monitoringEnabled) {
            let monitoring = spawn(`node`, [`${path.resolve('monitoring', 'app.js')}`]);
            monitoring.stdout.on('data', (chunk: any) => {
                console.log(`Monitoring: ${chunk}`)
            });
            monitoring.stderr.on('data', (chunk: any) => {
                console.log(`Monitoring error : ${chunk}`)
            });
        }
        
        let executed = spawn(`${path.resolve('node_modules','.bin','ts-node-dev')}`, ["--respawn","--transpileOnly","./src/app.bootstrap.ts","--env" ,`${this.environment}`]);
        executed.stderr.on('data',(chunk: any) =>{
            console.log(chunk.toString())
        });
        executed.stdout.on('data', (chunk: any) => {
            console.log(chunk.toString())
        });

        executed.on('close', (code: string) => {
            console.log(chalk.red(`Process exited with code ${code}`));
        });
    }
}
