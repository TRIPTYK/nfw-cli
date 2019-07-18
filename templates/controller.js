const { capitalizeEntity } = require("../actions/lib/utils");
const project = require('../utils/project');

/**
 *
 * @param path
 * @param className
 * @param options
 * @param entityName
 */
module.exports = (path,{className,options,entityName}) => {
    const file = project.createSourceFile(path,null,{
        overwrite : true
    });
    const entityNameCapitalized = capitalizeEntity(entityName);

    file.addImportDeclaration({ moduleSpecifier : "express" , defaultImport : "{Request,Response}"  });

    file.addStatements(writer => writer.writeLine(`import {relations as ${entityName}Relations} from "../enums/relations/${entityName}.relations";`));
    file.addStatements(writer => writer.writeLine(`import * as Boom from 'boom';`));
    file.addStatements(writer => writer.writeLine(`import * as HttpStatus from 'http-status';`));

    const controllerClass = file.addClass({
        name: className
    });

    controllerClass.setExtends('BaseController');
    controllerClass.setIsExported(true);

    controllerClass.addConstructor({
        statements : `super();`
    });

    controllerClass.addMethod({
        name : 'beforeMethod',
        returnType : 'void',
        statements : `this.repository = getCustomRepository(${entityNameCapitalized}Repository);`
    }).toggleModifier("protected");

    const middlewareFunctionParameters = [
        { type : 'Request' , name : 'req' },
        { type : 'Response' , name : 'res' },
        { type : 'Function' , name : 'next' }
    ];

    if (options.read) {

        const getMethod = controllerClass.addMethod({
            name : 'get',
            parameters : middlewareFunctionParameters
        });

        getMethod.addJsDoc(writer => {
            writer.writeLine(`@description GET ${entityName} by id`);
            writer.writeLine(`@throws {Boom.notFound}`);
            writer.writeLine(`@return {any} result to send to client`);
        });

        getMethod.toggleModifier("public").toggleModifier("async")
        .addStatements([
            `const ${entityName} = await this.repository.jsonApiFindOne(req,req.params.id,${entityName}Relations);`,
            `if (!${entityName}) throw Boom.notFound();`,
            `return new ${entityNameCapitalized}Serializer().serialize(${entityName});`,
        ]);

        const listMethod = controllerClass.addMethod({
            name : 'list',
            parameters : middlewareFunctionParameters
        });

        listMethod.toggleModifier("public").toggleModifier("async")
        listMethod.addStatements([
            `const [${entityName}s,total] = await this.repository.jsonApiRequest(req.query,${entityName}Relations).getManyAndCount();`,
            `return new ${entityNameCapitalized}Serializer( new SerializerParams().enablePagination(req,total) ).serialize(${entityName}s);`
        ]);

        listMethod.addJsDoc(writer => {
            writer.writeLine(`@description LIST ${entityName}`);
            writer.writeLine(`@return {any} result to send to client`);
        });
    }

    if (options.create) {
        const createMethod = controllerClass.addMethod({
            name : 'create',
            parameters : middlewareFunctionParameters
        });

        createMethod.toggleModifier("public").toggleModifier("async")
        .addStatements([
            `const ${entityName} = new ${entityNameCapitalized}(req.body);`,
            `const saved = await this.repository.save(${entityName});`,
            `res.status( HttpStatus.CREATED );`,
            `return new ${entityNameCapitalized}Serializer().serialize(saved);`
        ]);

        createMethod.addJsDoc(writer => {
            writer.writeLine(`@description CREATE ${entityName}`);
            writer.writeLine(`@return {any} result to send to client`);
        });
    }

    if (options.update) {
        const updateMethod = controllerClass.addMethod({
            name : 'update',
            parameters : middlewareFunctionParameters
        });

        updateMethod.toggleModifier("public").toggleModifier("async")
        .addStatements([
            `const ${entityName} = await this.repository.findOne(req.params.id);`,
            `if (!${entityName}) throw Boom.notFound();`,
            `this.repository.merge(${entityName}, req.body);`,
            `const saved = await this.repository.save(${entityName});`,
            `return new ${entityNameCapitalized}Serializer().serialize(saved);`
        ]);

        updateMethod.addJsDoc(writer => {
            writer.writeLine(`@description UPDATE ${entityName}`);
            writer.writeLine(`@throws {Boom.notFound}`);
            writer.writeLine(`@return {any} result to send to client`);
        });
    }

    if (options.delete) {
        const deleteMethod = controllerClass.addMethod({
            name : 'remove',
            parameters : middlewareFunctionParameters
        });

        deleteMethod.toggleModifier("public").toggleModifier("async")
        .addStatements([
            `const ${entityName} = await this.repository.findOne(req.params.id);`,
            `if (!${entityName}) throw Boom.notFound();`,
            `await this.repository.remove(${entityName});`,
            `res.sendStatus(HttpStatus.NO_CONTENT).end();`
        ]);

        deleteMethod.addJsDoc(writer => {
            writer.writeLine(`@description DELETE ${entityName}`);
            writer.writeLine(`@throws {Boom.notFound}`);
            writer.writeLine(`@return {any} result to send to client`);
        });
    }

    return file;
};