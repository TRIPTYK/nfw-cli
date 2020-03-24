import project = require ('../utils/project');

export = (path: string, {className, entityName}) => {
    const file = project.createSourceFile(path,null,{
        overwrite : true
    });

    const addedClass = file.addClass({
        name : className,
        isDefaultExport : true
    });

    addedClass.addProperty({
        isStatic : true,
        type : "string",
        name : "type",
        initializer : `"${entityName}"`
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
    type: ${className}.type,
    whitelist: ${className}.serialize,
    whitelistOnDeserialize : ${className}.deserialize
};
    `);

    return file;
}