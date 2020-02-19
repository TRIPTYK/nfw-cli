"use strict";
var tsMorph = require("ts-morph");
var isInitialised = false;
var project = new tsMorph.Project({});
module.exports = (function () {
    if (!isInitialised) {
        project.addExistingSourceFiles(["src/**/*.ts", "test/**/*.ts"]);
        isInitialised = true;
    }
    return project;
})();
