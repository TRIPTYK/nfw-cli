import project = require ('../utils/project');
import * as pascalcase from 'pascalcase';

export = (path: string, modelName:string) => {
    const file = project.createSourceFile(path,null,{
        overwrite : true
    });
;
    const className = pascalcase(modelName);

    const addedClass = file.addClass({
        name : `${className}SerializerSchema`,
        isDefaultExport : true
    });

    addedClass.addProperty({
        isStatic : true,
        type : "string",
        name : "type",
        initializer : `"${modelName}"`
    })
    .toggleModifier("public");

    addedClass.addProperty({
        isStatic : true,
        type : "string[]",
        name : "serialize"
    })
    .toggleModifier("public");

    addedClass.addProperty({
        isStatic : true,
        type : "string[]",
        name : "deserialize"
    })
    .toggleModifier("public");

    addedClass.addGetAccessor({
        isStatic : true,
        returnType : "Readonly<JSONAPISerializerSchema>",
        name : "schema"
    }).setBodyText(`
return {
    relationships : {},
    type: ${className}SerializerSchema.type,
    whitelist: ${className}SerializerSchema.serialize,
    whitelistOnDeserialize : ${className}SerializerSchema.deserialize
};
    `)
    .toggleModifier("public");

    return file;
}