import {DBEnvVariables} from '../utils/interfaces'

export interface DockerStrategy {

    createDockerContainer(name: string, port: string, version: string, password: string): {
        host: string, dbType: string, password: string, port: string, version: string, name: string, complementaryEnvInfos: string
    }

}

export class MongoDBStrategy implements DockerStrategy {

    public createDockerContainer(name: string = 'nfw_server_mongo', port: string = '27017', version: string = '4.2', password: string) {

        const dbEnvVariables: DBEnvVariables = {
            host: 'localhost',
            dbType: 'mongo',
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
            password: password,
            port: port,
            version: version,
            name: name,
            complementaryEnvInfos: `MYSQL_ROOT_PASSWORD=${password}`
        }

        return dbEnvVariables;
    }
}