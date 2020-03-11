export interface AdaptatorStrategy {
    connect(env: any): Promise<void>
    insertAdmin({username, mail, role, password}:{username: string, mail: string, role: string, password: string}): Promise<{login: string, password: (string|string)}>
    getConnectionFromNFW();
    createDatabase(dbName: string): Promise<any>;
    tableExists(tableName: string): Promise<boolean>;
    getTableInfo(tableName: string): Promise<any>;
    getTables(): Promise<any>;
    dropTable(tableName: string):Promise<void>;
}