var capitalizeEntity = require("../actions/lib/utils").capitalizeEntity;
var project = require('../utils/project');
var dashify = require('dashify');
module.exports = function (path) {
    var file = project.createSourceFile(path, null, {
        overwrite: true
    });
    var importDeclaration = file.addImportDeclaration({ moduleSpecifier: "chai" })
        .addNamedImport('expect');
    file.addImportDeclaration({ moduleSpecifier: "supertest", namespaceImport: 'supertest' });
    return file;
};
