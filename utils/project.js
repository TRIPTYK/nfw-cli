const tsMorph = require("ts-morph");

let isInitialised = false;
const project = new tsMorph.Project({

});

/**
 * @return Project
 */
module.exports = (() => {
    console.log(isInitialised);
    if (!isInitialised) {
        project.addExistingSourceFiles(["src/**/*.ts","test/**/*.ts"]);
        isInitialised = true;
    }

    return project;
})();