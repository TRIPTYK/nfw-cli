const tsMorph = require("ts-morph");

let isInitialised = false;
const project = new tsMorph.Project({

});

/**
 * @return Project
 * @description Singleton like method
 */
module.exports = (() => {
    if (!isInitialised) {
        project.addExistingSourceFiles(["src/**/*.ts","test/**/*.ts"]);
        isInitialised = true;
    }

    return project;
})();