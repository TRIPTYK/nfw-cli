const {buildModelColumnArgumentsFromObject} = require("../actions/lib/utils");
const project = require('../utils/project');
const stringifyObject = require('stringify-object');

module.exports = (path,{className,entities,createUpdate}) => {
    const file = project.createSourceFile(path,null,{
        overwrite : true
    });

    const modelClass = file.addClass({
        name: className
    });

    modelClass.setExtends("BaseModel");
    modelClass.addDecorator({name : "Entity"}).setIsDecoratorFactory(true);
    modelClass.setIsExported(true);

    modelClass.addProperty({
        name : 'id'
    })
    .addDecorator({
        name : 'PrimaryGeneratedColumn'
    }).setIsDecoratorFactory(true);

    entities.forEach((entity) => {
        modelClass.addProperty({
            name : entity.Field
        })
        .addDecorator({
            name : 'Column' ,
            arguments : stringifyObject(buildModelColumnArgumentsFromObject(entity))
        }).setIsDecoratorFactory(true);
    });

    if (createUpdate && createUpdate.createAt)
        modelClass.addProperty({name : 'createdAt'})
            .addDecorator({name : 'CreateDateColumn'}).setIsDecoratorFactory(true);

    if (createUpdate && createUpdate.updateAt)
        modelClass.addProperty({name : 'updatedAt'})
            .addDecorator({name : 'UpdateDateColumn'}).setIsDecoratorFactory(true);

    file.fixMissingImports();
};