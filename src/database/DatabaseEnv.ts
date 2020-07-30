import dotenv = require('dotenv');
import fs = require('fs');

export class DatabaseEnv {
    
    envVariables: any;

    constructor(path?: string | object)
    {
        dotenv.config();
        if (typeof path === "string"){
            this.loadFromFile(path);
        }
        if (typeof path === "object")
            this.envVariables = path;
    }

    loadFromFile(path: string)
    {
        this.envVariables = dotenv.config({path: path}).parsed;
    }

    getEnvironment()
    {
        return this.envVariables;
    }
}
