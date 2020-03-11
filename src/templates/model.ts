import {buildModelColumnArgumentsFromObject} from "../actions/lib/utils";
import project = require('../utils/project');
import stringifyObject = require('stringify-object');
import { SourceFile, PropertyDeclaration, WriterFunction } from "ts-morph";

/**
 *
 * @param path
 * @param className
 * @param {array} entities
 * @param createUpdate
 * @return {SourceFile}
 */
export = (path: string, {className,entities,createUpdate}, dbType: string): SourceFile => {
    
    const file = project.createSourceFile(path,null,{
        overwrite : true
    });

    const modelClass = file.addClass({
        name: className
    });

    modelClass.setExtends("BaseModel");
    modelClass.addDecorator({name : "Entity"}).setIsDecoratorFactory(true);
    modelClass.setIsExported(true);

    entities = entities.filter(
        (entity) => {
            if(entity.Field === "createdAt") {
                createUpdate['createAt'] = true;
                return false;
            }else if (entity.Field === "updatedAt") {
                createUpdate['updateAt'] = true;
                return false;
            }
            return true;
        });

    if(dbType === "other"){
        const propId = modelClass.addProperty({
            name: 'id: number'
        });
        propId.addDecorator({
            name: 'PrimaryGeneratedColumn',
            arguments: []
        }).setIsDecoratorFactory(true);
    }

    if(dbType === 'mongo'){
        const propId = modelClass.addProperty({
            name: 'id: ObjectID'
        });
        propId.addDecorator({
            name: 'ObjectIdColumn',
            arguments: []
        }).setIsDecoratorFactory(true);
    }

    entities.forEach((entity) => {

        const prop = modelClass.addProperty({
            name : entity.Field
        });

        prop.addDecorator({
            name : 'Column' ,
            arguments : stringifyObject(buildModelColumnArgumentsFromObject(entity)) as any
        }).setIsDecoratorFactory(true);
    });

    if (createUpdate && createUpdate.createAt) {
        const prop = modelClass.addProperty({name: 'createdAt'});
        prop.addDecorator({name: 'CreateDateColumn'}).setIsDecoratorFactory(true);
        prop.addJsDoc(`@description This column will store a creation date of the inserted object`);
    }

    if (createUpdate && createUpdate.updateAt) {
        const prop = modelClass.addProperty({name: 'updatedAt'});
        prop.addDecorator({name: 'UpdateDateColumn'}).setIsDecoratorFactory(true);
        prop.addJsDoc(`@description This column will store an update date when the entity is updated`);
    }

    file.fixMissingImports();

    return file;
};