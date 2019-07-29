/**
 * @module routerWrite
 * @description Append router link to router index.ts
 * @author Deflorenne Amaury
 */

// node modules
const {plural} = require('pluralize');
const dashify  = require('dashify');

// project modules
const {capitalizeEntity, lowercaseEntity} = require('./utils');
const project = require('../../utils/project');

/**
 * Main function
 * @param {string} entityName
 * @param pluralizeRoute
 * @returns {Promise<void>}
 */
module.exports = async (entityName,pluralizeRoute = true) => {
    const lowercase = lowercaseEntity(entityName);
    const capitalize = capitalizeEntity(entityName);

    const file = project.getSourceFile(`src/api/routes/v1/index.ts`);

    const importDeclaration = file.getImportDeclaration(i => i.getModuleSpecifier().getLiteralValue().includes(`${lowercase}.route`));

    if (importDeclaration !== undefined) return;

    file.addImportDeclaration({
         moduleSpecifier : `./${lowercase}.route`,
         defaultImport : `{router as ${capitalize}Router}`
    });

    file.addStatements([
        `/**`,
        ` * ${capitalize} routes`,
        `**/`,
        `router.use('/${dashify(plural(entityName))}', ${capitalize}Router);`
    ]);

    file.fixMissingImports();
};