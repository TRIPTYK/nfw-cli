/**
 * @author Samuel Antoine
 * @module commands
 */
module.exports = {
    getNPMCommandsUnix: {
        currentDirectory: "cd ",
        kickstart: "mkdir -p ./dist/logs ./dist/migration/dump ./dist/uploads/documents/xs ./dist/uploads/documents/md ./dist/uploads/documents/xl && npm i bcrypt --save && npm i typescript -g && npm i typeorm -g && npm i && tsc",
        compileTypeScript: "tsc",
        test: "npm run testUnix"
    },
    getNPMCommandsWindows: {
        currentDirectory: "cd ",
        kickstart: "init_scripts\\windowsnpm.bat",
        compileTypeScript: "tsc",
        test: "npm run testWin"
    },
    getYarnCommandsUnix: {
        currentDirectory: "cd ",
        kickstart: "mkdir -p ./dist/logs ./dist/migration/dump ./dist/uploads/documents/xs ./dist/uploads/documents/md ./dist/uploads/documents/xl && yarn add bcrypt --dev && yarn global add typescript --dev && yarn global add typeorm --dev && yarn && tsc",
        compileTypeScript: "tsc",
        test: "yarn run testUnix"
    },
    getYarnCommandsWindows: {
        currentDirectory: "cd ",
        kickstart: "init_scripts\\windowsyarn.bat",
        compileTypeScript: "tsc",
        test: "yarn run testWin"
    }
};
