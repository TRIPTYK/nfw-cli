/**
 * @module createSuperAction
 * @description creates a super user
 * @author Deflorenne Amaury
 */

// node modules
import * as fs from 'fs';
import * as ejs from 'ejs';


import { AdaptatorStrategy } from '../database/AdaptatorStrategy';

export class CreateSuperUserActionClass {

    strategy: AdaptatorStrategy;
    username: string;
    mail?: string;
    role?: string;
    password?: string;

    constructor(strategy: AdaptatorStrategy, username: string, mail?: string, role?: string, password?: string){
        this.strategy = strategy;
        this.username = username;
        this.mail = mail;
        this.role = role;
        this.password = password;
    }

    public setStrategy(strategy: AdaptatorStrategy){
        this.strategy = strategy; 
    }

    //description: create super user
    async main(){

        const databaseConnection = await this.strategy.getConnectionFromNFW();

        let credentials = await databaseConnection.insertAdmin({
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