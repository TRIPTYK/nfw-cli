/**
 * @module createSuperAction
 * @description creates a super user
 * @author Deflorenne Amaury
 */

// node modules
import * as fs from 'fs';
import * as ejs from 'ejs';

import { getSqlConnectionFromNFW } from '../database/sqlAdaptator';

/**
 * Main function
 * @param username
 * @returns {Promise<string[]>}
 */
export class CreateSuperUSerActionClass {

    username: string;
    mail?: string;
    role?: string;
    password?: string;

    constructor(username: string, mail?: string, role?: string, password?: string){
        this.username = username;
        this.mail = mail;
        this.role = role;
        this.password = password;
    }

    async Main(){

        const sqlConnection = await getSqlConnectionFromNFW();

        let credentials = await sqlConnection.insertAdmin({
            username: this.username,
            mail: this.mail,
            role: this.role,
            password: this.password
        });

        const credentialsFileName = `${credentials.login}-credentials.json`;
        const credentialsTemplate = fs.readFileSync(`${__baseDir}/src/templates/custom/userCredentials.ejs`,'utf-8');
    
        const compiled = ejs.compile(credentialsTemplate)({
            login: credentials.login,
            password: credentials.password
        });

        fs.writeFileSync(credentialsFileName, compiled);
    
        return [credentialsFileName];
    }    
};