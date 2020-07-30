"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../actions/lib/utils");
var project = require("../utils/project");
var stringifyObject = require("stringify-object");
var pascalcase = require("pascalcase");
/**
 *
 * @param path
 * @param className
 * @param {array} entities
 * @return {SourceFile}
 */
exports.default = (function (path, modelName, _a, dbType) {
    var entities = _a.entities;
    var file = project.createSourceFile(path, null, {
        overwrite: true
    });
    var className = pascalcase(modelName);
    var modelClass = file.addClass({
        name: className
    });
    modelClass.setExtends("BaseModel");
    modelClass.addDecorator({ name: "Entity" }).setIsDecoratorFactory(true);
    modelClass.setIsExported(true);
    if (dbType === "other") {
        var propId = modelClass.addProperty({
            name: 'id: number'
        });
        propId.toggleModifier("public");
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
        })
            .toggleModifier("public");
        prop.addDecorator({
            name: 'Column',
            arguments: stringifyObject(utils_1.buildModelColumnArgumentsFromObject(entity))
        }).setIsDecoratorFactory(true);
    });
    file.fixMissingImports();
    return file;
});
