const {buildModelColumnArgumentsFromObject} = require("../actions/lib/utils");
const project = require('../utils/project');
const stringifyObject = require('stringify-object');

/**
 *
 * @param path
 * @param className
 * @param {array} entities
 * @param createUpdate
 * @return {SourceFile}
 */
module.exports = (path,{className,entities,createUpdate = {}}) => {
    const file = project.createSourceFile(path,null,{
        overwrite : true
    });

    const modelClass = file.addClass({
        name: className
    });

    modelClass.setExtends("BaseModel");
    modelClass.addDecorator({name : "Entity"}).setIsDecoratorFactory(true);
    modelClass.setIsExported(true);

    const idProperty = modelClass.addProperty({
        name : 'id'
    });

    idProperty.toggleModifier('public');
    idProperty.addDecorator({
        name : 'PrimaryGeneratedColumn'
    }).setIsDecoratorFactory(true);

    idProperty.addJsDoc(writer => {
        writer.writeLine(`@description primary key of model`);
    });

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

    entities.forEach((entity) => {
        const prop = modelClass.addProperty({
            name : entity.Field
        });

        prop.addDecorator({
            name : 'Column' ,
            arguments : stringifyObject(buildModelColumnArgumentsFromObject(entity))
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