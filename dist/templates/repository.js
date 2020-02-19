"use strict";
var utils_1 = require("../actions/lib/utils");
var project = require("../utils/project");
module.exports = function (path, _a) {
    var className = _a.className, entityName = _a.entityName;
    var file = project.createSourceFile(path, null, {
        overwrite: true
    });
    var entityNameCapitalized = utils_1.capitalizeEntity(entityName);
    file.addStatements(function (writer) { return writer.writeLine("import Boom from '@hapi/boom';"); });
    var repoClass = file.addClass({
        name: className
    });
    repoClass.setIsExported(true);
    repoClass.setExtends("BaseRepository<" + entityNameCapitalized + ">");
    repoClass.addDecorator({
        name: 'EntityRepository',
        arguments: entityNameCapitalized
    }).setIsDecoratorFactory(true);
    repoClass.addConstructor({
        statements: "super();"
    });
    return file;
};
