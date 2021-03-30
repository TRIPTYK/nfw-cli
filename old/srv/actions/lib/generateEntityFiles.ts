/**
 * @module generateEntityFiles
 * @description Generate entity files except model
 * @author Deflorenne Amaury
 * @author Verliefden Romain
 * @author Sam Antoine
 */

// node modules
import project = require('../../utils/project');

// project modules
import Log = require('../../utils/log');

import controllerTemplateFile from '../../templates/controller';
import relationsTemplateFile = require('../../templates/relations');
import repositoryTemplateFile = require('../../templates/repository');
import serializerTemplateFile = require('../../templates/serializer');
import validationTemplateFile = require('../../templates/validation');
import schemaTemplateFile = require('../../templates/schema');
import kebab from '@queso/kebab-case'


//Check entity existence, and write file or not according to the context
export async function main (modelName: string, crudOptions: object, data = null, part?: string): Promise<void> {

    if (!modelName.length) {
        Log.error('Nothing to generate. Please, get entity name parameter.');
        return;
    }

    let tableColumns, foreignKeys;
    tableColumns = data ? data.columns : [];
    foreignKeys = data ? data.foreignKeys : [];

    const filePrefixName = kebab(modelName);

    const files = [];
    const controllerPath = `src/api/controllers/${filePrefixName}.controller.ts`;
    const validationPath = `src/api/validations/${filePrefixName}.validation.ts`;
    const relationPath = `src/api/enums/json-api/${filePrefixName}.enum.ts`;
    const repositoryPath = `src/api/repositories/${filePrefixName}.repository.ts`;
    const serializerPath = `src/api/serializers/${filePrefixName}.serializer.ts`;
    const schemaPath = `src/api/serializers/schemas/${filePrefixName}.serializer.schema.ts`;

    if (!part || part === 'controller')
        files.push(controllerTemplateFile(controllerPath,modelName,{
            options : crudOptions
        }));

    if (!part || part === 'relation')
        files.push(relationsTemplateFile(relationPath,modelName,{
            columns: tableColumns
        }));

    if (!part || part === 'repository')
        files.push(repositoryTemplateFile(repositoryPath,modelName));

    if (!part || part === 'validation')
        files.push(validationTemplateFile(validationPath,modelName,{
            options : crudOptions,
            entities : tableColumns
        }));

    if(!part || part === 'schema')
        files.push(schemaTemplateFile(schemaPath,modelName));

    if (!part || part === 'serializer')
        files.push(serializerTemplateFile(serializerPath,modelName));

    // auto generate imports
    files.forEach(file => {
        file.fixMissingImports();
        Log.success(`Created ${file.getFilePath()}`);
    });

    /** 
    if (!part || part === 'test') {
        testTemplateFile(testPath);
    }**/

    await project.save();
};