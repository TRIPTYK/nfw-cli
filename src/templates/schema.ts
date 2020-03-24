import project = require ('../utils/project');

export = (path: string, {className, entityName}) => {
    const file = project.createSourceFile(path,null,{
        overwrite : true
    });

    const schema = `${className}SerializerSchema`;

    const addedClass = file.addClass({
        name : schema,
        isDefaultExport : true
    });

    addedClass.addProperty({
        isStatic : true,
        type : "string",
        name : "type",
        initializer : entityName
    });

    addedClass.addProperty({
        isStatic : true,
        type : "string[]",
        name : "serialize"
    });

    addedClass.addProperty({
        isStatic : true,
        type : "string[]",
        name : "deserialize"
    });

    addedClass.addGetAccessor({
        isStatic : true,
        returnType : "Readonly<JSONAPISerializerSchema>",
        name : "schema"
    }).setBodyText(`
return {
    relationships : {},
    type: ${schema}.type,
    whitelist: ${schema}.serialize,
    whitelistOnDeserialize : ${schema}.deserialize
};
    `);

    return file;
}