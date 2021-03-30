import project = require('../utils/project');

export = (path: string) => {
    const file = project.createSourceFile(path,null,{
        overwrite : true
    });

    let importDeclaration = file.addImportDeclaration({moduleSpecifier: "chai"})
        .addNamedImport('expect');
    
    file.addImportDeclaration({moduleSpecifier: "supertest",namespaceImport : 'supertest'});

    return file;
};