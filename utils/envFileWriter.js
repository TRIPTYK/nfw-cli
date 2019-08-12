const fs = require('fs');
const dotenv = require('dotenv');

module.exports = class EnvFileWriter {
    constructor(fileName) {
        this.fileName = fileName;
        try {
            fs.accessSync(fileName,fs.F_OK);
            const content = fs.readFileSync(fileName);
            this.dotenvContent = dotenv.parse(content);
        }catch(err) {
            this.dotenvContent = {};
        }
    }

    nodeExists(node) {
        return this.dotenvContent[node] !== undefined;
    }

    getNodeValue(node,defaultValue = undefined) {
        if (!this.nodeExists(node) && !defaultValue)
            return defaultValue;
        return this.dotenvContent[node];
    }

    getFileName() {
        return this.fileName;
    }

    setNodeValue(node,value) {
        this.dotenvContent[node] = value;
    }

    write(data) {
        fs.writeFileSync(this.fileName,data);
    }

    save() {
        let finalContent = '';

        for (let key in this.dotenvContent)
        {
            finalContent += `${key} = ${this.dotenvContent[key]}\n`;
        }

        fs.writeFileSync(this.fileName,finalContent);
    }
};