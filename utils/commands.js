/**
 * @author Samuel Antoine
 * @module commands
 */
module.exports = {
    getGitCommands: {
        init : "git init",
        clone: "git clone https://github.com/AmauryD/3rd-party-ts-boilerplate.git --branch develop",
        currentDirectory: "cd "
    },
    rmGitUnix:{
        rmGit: "rm -rf .git",
        rename:"mv 3rd-party-ts-boilerplate "
    },
    rmGitWin:{
        rmGit: "rmdir /Q /S .git",
        rename:"rename 3rd-party-ts-boilerplate "
    },
    getNPMCommandsUnix:{
        currentDirectory: "cd ",
        kickstart: "mkdir -p ./dist/logs ./dist/migration/dump ./dist/uploads/documents/xs ./dist/uploads/documents/md ./dist/uploads/documents/xl && npm i bcrypt --save && npm i typescript -g && npm i typeorm -g && npm i && tsc",
        compileTypeScript: "tsc",
        test: "npm run testUnix"
    },
    getNPMCommandsWindows:{
        currentDirectory: "cd ",
        kickstart : "init_scripts\\windows.bat",
        compileTypeScript: "tsc",
        test: "npm run testWin"
    },
    getYarnCommandsUnix:{
        currentDirectory: "cd ",
        kickstart: "mkdir -p ./dist/logs ./dist/migration/dump ./dist/uploads/documents/xs ./dist/uploads/documents/md ./dist/uploads/documents/xl && yarn add bcrypt --save && yarn global add typescript && yarn global add typeorm && yarn install && tsc",
        compileTypeScript: "tsc",
        test: "yarn run testUnix"
    },
    getYarnCommandsWindows:{
        currentDirectory: "cd ",
        kickstart : "init_scripts\\windows.bat",
        compileTypeScript: "tsc",
        test: "yarn run testWin"
    }
}