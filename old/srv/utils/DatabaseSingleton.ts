import { AdaptatorStrategy } from "../database/AdaptatorStrategy";
import { SqlConnection } from "../database/sqlAdaptator";
import { MongoConnection } from "../database/mongoAdaptator";
import JsonFileWriter = require('json-file-rw');
import { getCurrentEnvironment } from "../commands/commandUtils";

export class Singleton {

    private static instance: Singleton;
    private _databaseStrategy: AdaptatorStrategy;

    private constructor() { }

    public static getInstance(): Singleton {
        if(!Singleton.instance) {
            Singleton.instance = new Singleton();
            Singleton.instance._databaseStrategy = new SqlConnection();
        }

        return Singleton.instance;
    }

    setDatabaseStrategy (): AdaptatorStrategy {
        const type = getCurrentEnvironment().envVariables.TYPEORM_TYPE;

        if(type === 'mongodb') {
            return this._databaseStrategy = new MongoConnection();
        } else {
            return this._databaseStrategy = new SqlConnection();
        }
    }
}

