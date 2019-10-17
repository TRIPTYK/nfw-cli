const { capitalizeEntity } = require("../actions/lib/utils");
const project = require('../utils/project');
const dashify = require('dashify');

module.exports = (path) => {
    const file = project.createSourceFile(path,null,{
        overwrite : true
    });

    let importDeclaration = file.addImportDeclaration({moduleSpecifier: "chai"})
        .addNamedImport('expect');
    
    file.addImportDeclaration({moduleSpecifier: "supertest",namespaceImport : 'supertest'});

    return file;
};