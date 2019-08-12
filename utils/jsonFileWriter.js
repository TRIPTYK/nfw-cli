const fs = require('fs');

module.exports = class JsonFileWriter {
    constructor(fileName) {
        this.fileName = fileName;
        try {
            fs.accessSync(fileName,fs.F_OK);
            const content = fs.readFileSync(fileName);
            this.jsonContent = JSON.parse(content);
        }catch(err) {
            this.jsonContent = {};
        }
    }

    nodeExists(node) {
        return this.jsonContent[node] !== undefined;
    }

    getNodeValue(node,defaultValue = undefined) {
        if (!this.nodeExists(node) && !defaultValue)
            return defaultValue;
        return this.jsonContent[node];
    }

    getFileName() {
        return this.fileName;
    }

    setNodeValue(node,value) {
        this.jsonContent[node] = value;
    }

    write(json) {
        fs.writeFileSync(this.fileName,json);
    }

    save() {
        fs.writeFileSync(this.fileName,JSON.stringify(this.jsonContent,null,4));
    }
};