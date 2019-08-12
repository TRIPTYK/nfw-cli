const fs = require('fs');

module.exports = class JsonFileWriter {
    /**
     *
     * @param fileName
     */
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

    /**
     *
     * @param node
     * @return {boolean}
     */
    nodeExists(node) {
        return this.jsonContent[node] !== undefined;
    }

    /**
     *
     * @param node
     * @param defaultValue
     * @return {undefined|*}
     */
    getNodeValue(node,defaultValue = undefined) {
        if (!this.nodeExists(node) && !defaultValue)
            return defaultValue;
        return this.jsonContent[node];
    }

    /**
     *
     * @return {*}
     */
    getFileName() {
        return this.fileName;
    }

    /**
     *
     * @param node
     * @param value
     */
    setNodeValue(node,value) {
        this.jsonContent[node] = value;
    }

    /**
     *
     * @param json
     */
    write(json) {
        return fs.write(this.fileName,json);
    }

    /**
     *
     * @param json
     */
    writeSync(json) {
        fs.writeFileSync(this.fileName,json);
    }

    /**
     *
     * @param line_spacing
     */
    save(line_spacing = 4) {
        return fs.writeFile(this.fileName,JSON.stringify(this.jsonContent,null,line_spacing));
    }

    /**
     *
     * @param line_spacing
     */
    saveSync(line_spacing = 4) {
        fs.writeFileSync(this.fileName,JSON.stringify(this.jsonContent,null,line_spacing));
    }
};