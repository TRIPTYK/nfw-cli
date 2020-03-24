"use strict";
var utils_1 = require("../actions/lib/utils");
var project = require("../utils/project");
var stringifyObject = require("stringify-object");
module.exports = function (path, _a, dbType) {
    var className = _a.className, entities = _a.entities, createUpdate = _a.createUpdate;
    var file = project.createSourceFile(path, null, {
        overwrite: true
    });
    var modelClass = file.addClass({
        name: className
    });
    modelClass.setExtends("BaseModel");
    modelClass.addDecorator({ name: "Entity" }).setIsDecoratorFactory(true);
    modelClass.setIsExported(true);
    entities = entities.filter(function (entity) {
        if (entity.Field === "createdAt") {
            createUpdate['createAt'] = true;
            return false;
        }
        else if (entity.Field === "updatedAt") {
            createUpdate['updateAt'] = true;
            return false;
        }
        return true;
    });
    if (dbType === "other") {
        var propId = modelClass.addProperty({
            name: 'id: number'
        });
        propId.addDecorator({
            name: 'PrimaryGeneratedColumn',
            arguments: []
        }).setIsDecoratorFactory(true);
    }
    //in typeorm, ObjectID and ObjectIdColumn is used in models inseatd of "normal" column types (number, Long, ...) and PrimaryGeneratedColumn
    if (dbType === 'mongo') {
        var propId = modelClass.addProperty({
            name: 'id: ObjectID'
        });
        propId.addDecorator({
            name: 'ObjectIdColumn',
            arguments: []
        }).setIsDecoratorFactory(true);
    }
    entities.forEach(function (entity) {
        var prop = modelClass.addProperty({
            name: entity.Field
        });
        prop.addDecorator({
            name: 'Column',
            arguments: stringifyObject(utils_1.buildModelColumnArgumentsFromObject(entity))
        }).setIsDecoratorFactory(true);
    });
    if (createUpdate && createUpdate.createAt) {
        var prop = modelClass.addProperty({ name: 'createdAt' });
        prop.addDecorator({ name: 'CreateDateColumn' }).setIsDecoratorFactory(true);
        prop.addJsDoc("@description This column will store a creation date of the inserted object");
    }
    if (createUpdate && createUpdate.updateAt) {
        var prop = modelClass.addProperty({ name: 'updatedAt' });
        prop.addDecorator({ name: 'UpdateDateColumn' }).setIsDecoratorFactory(true);
        prop.addJsDoc("@description This column will store an update date when the entity is updated");
    }
    file.fixMissingImports();
    return file;
};
