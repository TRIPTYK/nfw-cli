import { Document } from 'mongoose';

export interface DBEnvVariables {
    host: string, 
    dbType: string, 
    envDBType: string,
    password: string, 
    port: string, 
    version: string, 
    name: string, 
    complementaryEnvInfos: string
}

export interface IUser extends Document {
    createdAt: Date,
    username: string,
    email: string,
    firstname: string,
    lastname: string,
    role: string,
    password: string
}