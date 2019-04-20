const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = async () => {
    return await exec('typedoc --out ./docs --ignoreCompilerErrors');
};