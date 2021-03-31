import {DBEnvVariables} from '../utils/interfaces'

export interface DockerStrategy {

    createDockerContainer(name: string, port: string, version: string, password: string): {
        host: string, dbType: string, envDBType: string, password: string, port: string, version: string, name: string, complementaryEnvInfos: string
    }

}

//NOTE: envDBType is only used because when installing mongo container, only 'mongo' keyword is used, but when connecting to a mongo DB, 'mongodb' must be used
//So when the program reads the env file to connect to mongo DB, it needs to find 'mongodb' in type... however, when installing docker container,
//only 'docker pull mongo' will work (not 'docker pull mongodb').

export class MongoDBStrategy implements DockerStrategy {

    public createDockerContainer(name: string = 'nfw_server_mongo', port: string = '27017', version: string = '4.2', password: string) {

        const dbEnvVariables: DBEnvVariables = {
            host: 'localhost',
            dbType: 'mongo',
            envDBType: 'mongodb',
            password: password,
            port: port,
            version: version,
            name: name,
            complementaryEnvInfos: `MONGO_INITDB_ROOT_PASSWORD=${password} -e MONGO_INITDB_ROOT_USERNAME=root`   
        }

        return dbEnvVariables;
    }
}

export class MysqlStrategy implements DockerStrategy {

    public createDockerContainer(name: string = 'nfw_server_mysql', port: string = '3306', version: string = '5.7', password: string) {

        const dbEnvVariables: DBEnvVariables = {
            host: 'localhost',
            dbType: 'mysql',
            envDBType: 'mysql',
            password: password,
            port: port,
            version: version,
            name: name,
            complementaryEnvInfos: `MYSQL_ROOT_PASSWORD=${password}`
        }

        return dbEnvVariables;
    }
}