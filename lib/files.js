const fs = require('fs');
const path = require('path');
module.exports = {
    getCurrentDirectoryBase : () => {
        return path.basename(process.cwd());
    },

    directoryExists : (filePath) => {
        try{
            return fs.statSync(filePath).isDirectory();
        }catch(err){
            return false;
        }
    },
    fileExists: (filePath) =>{
        try{
            return fs.statSync(filePath).isFile();
        }catch(err){
            return false
        }
    },
    isProjectDirectory: () =>{
        return module.exports.fileExists(path.resolve(process.cwd(), "cfg.tpf"));
    }
};