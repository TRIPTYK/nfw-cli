import { MongoConnection } from "./mongoAdaptator";
import { SqlConnection } from "./sqlAdaptator";

interface SqlStructureDataPacket {
    Field: string,
    Type: string,
    Null: "NO" | "YES",
    Key:  "" | "UNI" | "PRI",
    Default: string,
    Extra: string,
}

export interface AdaptatorStrategy {
    connect(env: any): Promise<void>
    insertAdmin({username, mail, role, password}:{username: string, mail: string, role: string, password: string}): Promise<{login: string, password: string}>
    getConnectionFromNFW() : Promise<MongoConnection | SqlConnection>;
    createDatabase(dbName: string): Promise<any>;
    tableExists(tableName: string): Promise<boolean>;
    getTableInfo(tableName: string): Promise<{columns : SqlStructureDataPacket[],foreignKeys : any[]}>;
    getTables(): Promise<any>;
    dropTable(tableName: string): Promise<void>;
    truncateTable(tableName: string): Promise<void>;
    insertIntoTable(tableName: string, columns, values): Promise<void>;
    selectFromTable(tableName: string, colName: string): Promise<any>;
}