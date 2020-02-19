/**
 * @module routerWrite
 * @description Append router link to router index.ts
 * @author Deflorenne Amaury
 */

// node modules
import {plural} from 'pluralize';
import dashify  = require('dashify');

// project modules
import {capitalizeEntity, lowercaseEntity} from  './utils';
import project = require('../../utils/project');


export async function main (entityName: string, pluralizeRoute = true): Promise<void> {

    /*
    const lowercase = lowercaseEntity(entityName);
    const capitalize = capitalizeEntity(entityName);

    const file = project.getSourceFile(`src/api/routes/v1/index.ts`);

    const importDeclaration = file.getImportDeclaration(i => i.getModuleSpecifier().getLiteralValue().includes(`${lowercase}.route`));

    if (importDeclaration !== undefined) return;

    file.addImportDeclaration({
         moduleSpecifier : `./${lowercase}.route`,
         defaultImport : `{router as ${capitalize}Router}`
    });

    file.fixMissingImports();
    */
};