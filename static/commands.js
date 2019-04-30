const path = require('path');

/**
 * @author Samuel Antoine
 * @module commands
 * @description store OS specific commands
 */
module.exports = {
    compileTypeScript: path.normalize("./node_modules/.bin/tsc --noEmit"),
    unitTests: path.normalize("./node_modules/.bin/mocha --require ts-node/register/transpile-only ./test/*.ts --reporter spec --timeout 10000 --exit"),
    generateDoc : path.normalize('./node_modules/.bin/typedoc --out ./docs --ignoreCompilerErrors'),


    getNPMCommandsUnix: {
        kickstart: "mkdir -p ./dist/logs ./dist/migration/dump ./dist/uploads/documents/xs ./dist/uploads/documents/md ./dist/uploads/documents/xl && npm i bcrypt --save && npm i typescript && npm i typeorm && npm i",
},
    getNPMCommandsWindows: {
        kickstart: "init_scripts\\windowsnpm.bat",
    },
    getYarnCommandsUnix: {
        kickstart: "mkdir -p ./dist/logs ./dist/migration/dump ./dist/uploads/documents/xs ./dist/uploads/documents/md ./dist/uploads/documents/xl && yarn add bcrypt --dev && yarn add typescript --dev && yarn add typeorm --dev && yarn",
    },
    getYarnCommandsWindows: {
        kickstart: "init_scripts\\windowsyarn.bat",
    }
};
