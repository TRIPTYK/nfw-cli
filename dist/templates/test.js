"use strict";
var project = require("../utils/project");
module.exports = function (path) {
    var file = project.createSourceFile(path, null, {
        overwrite: true
    });
    var importDeclaration = file.addImportDeclaration({ moduleSpecifier: "chai" })
        .addNamedImport('expect');
    file.addImportDeclaration({ moduleSpecifier: "supertest", namespaceImport: 'supertest' });
    return file;
};
