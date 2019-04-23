/**
 * @author Samuel Antoine
 * @module commands
 * @description store OS specific commands
 */
module.exports = {
    getNPMCommandsUnix: {
        currentDirectory: "cd ",
        kickstart: "mkdir -p ./dist/logs ./dist/migration/dump ./dist/uploads/documents/xs ./dist/uploads/documents/md ./dist/uploads/documents/xl && npm i bcrypt --save && npm i typescript && npm i typeorm && npm i && ./node_modules/.bin/tsc",
        compileTypeScript: "./node_modules/.bin/tsc",
        test: "npm run testUnix"
    },
    getNPMCommandsWindows: {
        currentDirectory: "cd ",
        kickstart: "init_scripts\\windowsnpm.bat",
        compileTypeScript: "node_modules\\.bin\\tsc",
        test: "npm run testWin"
    },
    getYarnCommandsUnix: {
        currentDirectory: "cd ",
        kickstart: "mkdir -p ./dist/logs ./dist/migration/dump ./dist/uploads/documents/xs ./dist/uploads/documents/md ./dist/uploads/documents/xl && yarn add bcrypt --dev && yarn add typescript --dev && yarn add typeorm --dev && yarn && ./node_modules/.bin/tsc",
        compileTypeScript: "./node_modules/.bin/tsc",
        test: "yarn run testUnix"
    },
    getYarnCommandsWindows: {
        currentDirectory: "cd ",
        kickstart: "init_scripts\\windowsyarn.bat",
        compileTypeScript: "node_modules\\.bin\\tsc",        
        test: "yarn run testWin"
    }
};
