const ejs = require('ejs');
const util = require('util');
const fs = require('fs');
const processPath = process.cwd();
const ReadFile = util.promisify(fs.readFile);
const WriteFile = util.promisify(fs.writeFile);
const {plural} = require('pluralize');
const Log = require('../../utils/log');
const {capitalizeEntity, lowercaseEntity, writeToFirstEmptyLine, isImportPresent} = require('./utils');

module.exports = async (entityName) => {
    const lowercase = lowercaseEntity(entityName);
    const capitalize = capitalizeEntity(entityName);

    let proxyPath = `${processPath}/src/api/routes/v1/index.ts`;
    let routeUsePath = `${__baseDir}/templates/route/routerUse.ejs`;

    let p_proxy = ReadFile(proxyPath, 'utf-8');
    let p_route = ReadFile(routeUsePath, 'utf-8');
    let [proxy, route] = await Promise.all([p_proxy, p_route]); //wait for countlines and read to finish

    route = ejs.compile(route)({
        entityLowercase: lowercase,
        entityCapitalize: capitalize,
        plural
    });

    if (!isImportPresent(proxy, `${capitalize}Router`)) {
        let output = writeToFirstEmptyLine(proxy, `import { router as ${capitalize}Router } from "./${lowercase}.route";\n`)
            .replace(/^\s*(?=.*export.*)/m, `\n\n${route}\n\n`); // inserts route BEFORE the export statement , eliminaing some false-positive

        try {
            await WriteFile(proxyPath, output)
                .then(() => {
                    Log.success(`Proxy router file updated.`);
                    Log.success(`Files generating done.`);
                });
        } catch (e) { // try-catch block needed , otherwise we will need to launch an async function in catch()
            console.log(e.message);
            console.log('Original router file will be restored ...');
            await WriteFile(proxyPath, proxy)
                .catch(e => Log.error(e.message));
            Log.success(`Original router file restoring done.`);
            Log.success(`Files generating done.`);
            Log.warning(`Check the api/routes/v1/index.ts to update`);
        }
    } else {
        Log.info(`Proxy router already contains routes for this entity : routes/v1/index.ts generating ignored.`);
        Log.success(`Files generating done.`);
    }
};