import { DatabaseEnv } from "./DatabaseEnv";
import mongoose = require('mongoose');
import fs = require('fs');
import bcrypt = require('bcryptjs');
import { AdaptatorStrategy } from "./AdaptatorStrategy";
import User from "./userModel";
import { IUser } from '../utils/interfaces'


export class MongoConnection implements AdaptatorStrategy{

    environement: any;
    db: any;

    constructor (env: DatabaseEnv = null) {
        if(env){
            this.environement = env.getEnvironment();
        }
    }

    //connection to mongo using mongoose
    async connect (env: {[key:string] : any} = null): Promise<void> {

        if(!env) {
            env = this.environement;
        }

        const uri = `mongodb://${env.TYPEORM_USER}:${env.TYPEORM_PWD}@${env.TYPEORM_HOST}:${env.TYPEORM_PORT}/${env.TYPEORM_DB}`;
        
        await mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true, authSource: 'admin'});
        this.db = mongoose.connection;
    }

    //Insert admin into user collection with 'userModel' stored in ./database
    async insertAdmin ({username, mail, role, password}:{username: string, mail: string, role: string, password: string}): Promise<{login: string, password: (string|string)}> {

        if(!mail) {
            mail = `${username}@localhost.com`;
        }

        if(!password) {
            password = "";
            let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (let i = 0; i < 24; i++)
                password += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        if(!role) {
            role = 'admin';
        }

        let hashed = await bcrypt.hash(password, 10);

        var user: IUser = new User({
            _id: new mongoose.Types.ObjectId(),
            firstname: username,
            lastname: username,
            email: mail,
            password: hashed,
            role: role,
            username: username
        });

        await user.save();

        return {
            login: mail,
            password
        }
    }

    //insert an object containing fields names associated with its value. Obj has the following format:
    //{field1 : value1, field2, value2}
    async insertIntoTable(collName: string, fields: any, values: any) {

        const obj = {
            _id: new mongoose.Types.ObjectId()
        };

        for (let index = 0; index < fields.length; index++) {
            const element = fields[index];
            const val = values[index];
            obj[element] = val;
        }

        await this.db.collection(collName).insertOne(obj);
    }

    //Select the first document from given collection to sample data (used to seed database)
    async selectFromTable(collName: string, fieldName: string) {

        let [results] = await this.db.collection(collName).aggregate([
            {"$project": { "res": fieldName, "_id": 0}}
        ]).toArray();

        return results.res;
    }

    async dropTable(collName: string): Promise<void>{

        return await this.db.db.dropCollection(collName);
    }

    async truncateTable(collName: string) {

        return await this.dropTable(collName);
    }

    async tableExists (collName: string): Promise<boolean> {

        const exists = await this.db.db.listCollections( {name: collName} ).hasNext();
        if(exists) {
            return true;
        }
        else return false;
    }

    //get collection fields names and type. If a collection is empty, throws and error
    //Remove _id and __v from results
    async getTableInfo(collName: string) {

        let [fields] = await this.db.collection(collName).aggregate([
            {"$project":{"arrayofkeyvalue":{"$objectToArray":"$$ROOT"}}},
            {"$unwind":"$arrayofkeyvalue"},
            {"$group":{"_id":null,"names":{"$addToSet":"$arrayofkeyvalue.k"}}}
        ]).toArray();

        const newColumn = [];

        try {
            for(const name of fields.names){
                if(name !== '__v' && name !== '_id'){
                    let colType = await this.getTableType(collName, name);
                    newColumn.push({Field: name, Type: colType});
                }
            }
        } catch(e) {
            if(!fields) {
                throw Error("One or more collection in you database is empty, please check you database");
            } else {
                console.log(e);
            }
        }
        
        return {columns: newColumn, foreignKeys: []}
    }

    async getTableType(collName: string, name: string){

        let [columnType] = await this.db.collection(collName).aggregate([
            {"$project":{"types":{"$type": name}}}
        ]).toArray();
        return columnType.types;
    }

    //list collections
    async getTables(){
        
        let collList = [];

        let collNames = await this.db.db.listCollections().toArray();

        for (const coll of collNames) {
            collList.push({Tables_in_nfw: coll.name});
        }

        return collList;
    }

    async getConnectionFromNFW () {

        const nfwFile = fs.readFileSync('.nfw','utf-8');
        let nfwEnv = JSON.parse(nfwFile).env;
    
        if (!nfwEnv)
            nfwEnv = 'development';
    
        const connection =  new MongoConnection(
            new DatabaseEnv(`${nfwEnv.toLowerCase()}.env`)
        );
        await connection.connect();
        return connection;
    }

    createDatabase(dbName: string): Promise<any> { 
        return null;
    }
}

