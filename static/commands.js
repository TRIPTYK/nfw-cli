const path = require('path');

/**
 * @author Samuel Antoine
 * @module commands
 * @description store OS specific commands
 */
module.exports = {
    unitTests: `${path.normalize('./node_modules/.bin/mocha')} --require ts-node/register/transpile-only ./test/*.ts --reporter spec --timeout 10000 --colors --exit`,
    generateDoc : `${path.normalize('./node_modules/.bin/typedoc')} --out ./docs --ignoreCompilerErrors`
};
