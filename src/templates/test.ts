import { capitalizeEntity } from "../actions/lib/utils";
import project = require('../utils/project');
import dashify = require('dashify');

export = (path: string) => {
    const file = project.createSourceFile(path,null,{
        overwrite : true
    });

    let importDeclaration = file.addImportDeclaration({moduleSpecifier: "chai"})
        .addNamedImport('expect');
    
    file.addImportDeclaration({moduleSpecifier: "supertest",namespaceImport : 'supertest'});

    return file;
};