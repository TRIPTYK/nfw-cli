"use strict";
var project = require("../utils/project");
var pascalcase = require("pascalcase");
var kebab_case_1 = require("@queso/kebab-case");
module.exports = function (path, entityName) {
    var file = project.createSourceFile(path, null, {
        overwrite: true
    });
    var entityClassName = pascalcase(entityName);
    file.addStatements(function (writer) { return writer.writeLine("import Boom from '@hapi/boom';"); });
    file.addStatements(function (writer) { return writer.writeLine("import { " + entityClassName + " } from \"../models/" + kebab_case_1.default(entityName) + ".model\";"); });
    var repoClass = file.addClass({
        name: entityClassName + "Repository"
    });
    repoClass.setIsExported(true);
    repoClass.setExtends("BaseRepository<" + entityClassName + ">");
    repoClass.addDecorator({
        name: 'EntityRepository',
        arguments: "" + entityClassName
    }).setIsDecoratorFactory(true);
    repoClass.addConstructor({
        statements: "super();"
    })
        .toggleModifier("public");
    return file;
};
