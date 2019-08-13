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
        const nodes = node.split('.');
        const last = nodes.pop();
        let content = this.jsonContent;

        for (const node1 of nodes) {
            content = content[node1];
            if (content === undefined) return false;
        }

        return content[last] !== undefined;
    }

    /**
     *
     * @param node
     * @param defaultValue
     * @return {undefined|*}
     */
    getNodeValue(node,defaultValue = undefined) {
        const nodes = node.split('.');
        const last = nodes.pop();
        let content = this.jsonContent;

        for (const node1 of nodes) {
            content = content[node1];
            if (content === undefined) return false;
        }

        let exists = content[last] !== undefined;

        if (!exists && defaultValue !== undefined)
            return defaultValue;
        return content[last];
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
     * @param {*} value
     */
    setNodeValue(node,value) {
        const nodes = node.split('.');
        const last = nodes.pop();
        let content = this.jsonContent;
        for (const node1 of nodes) content = content[node1] === undefined ? content[node1] = {} : content[node1];
        content[last] = value;
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