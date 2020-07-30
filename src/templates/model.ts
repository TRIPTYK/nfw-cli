import {buildModelColumnArgumentsFromObject} from "../actions/lib/utils";
import project = require('../utils/project');
import stringifyObject = require('stringify-object');
import { SourceFile } from "ts-morph";
import * as pascalcase from 'pascalcase';

/**
 *
 * @param path
 * @param className
 * @param {array} entities
 * @return {SourceFile}
 */
export default (path: string,modelName: string, {entities}, dbType: string): SourceFile => {
    
    const file = project.createSourceFile(path,null,{
        overwrite : true
    });

    const className = pascalcase(modelName);

    const modelClass = file.addClass({
        name: className
    });

    modelClass.setExtends("BaseModel");
    modelClass.addDecorator({name : "Entity"}).setIsDecoratorFactory(true);
    modelClass.setIsExported(true);

    if(dbType === "other"){
        const propId = modelClass.addProperty({
            name: 'id: number'
        });
        propId.toggleModifier("public");

        propId.addDecorator({
            name: 'PrimaryGeneratedColumn',
            arguments: []
        }).setIsDecoratorFactory(true)
    }

    //in typeorm, ObjectID and ObjectIdColumn is used in models inseatd of "normal" column types (number, Long, ...) and PrimaryGeneratedColumn
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
        })
        .toggleModifier("public");

        prop.addDecorator({
            name : 'Column' ,
            arguments : stringifyObject(buildModelColumnArgumentsFromObject(entity)) as any
        }).setIsDecoratorFactory(true);
    });

    file.fixMissingImports();

    return file;
};