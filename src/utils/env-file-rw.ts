import {
	constants as fs,
	accessSync,
	readFileSync,
	writeFileSync,
	writeFile as fsWriteFile,
} from "fs";
import { promisify } from "util";
import * as dotenv from "dotenv";

const writeFile = promisify(fsWriteFile);

export class EnvFileWriter {
	private fileName: string;
	private dotenvContent: any;

	/**
	 *
	 * @param fileName
	 */
	constructor(fileName: string) {
		this.fileName = fileName;
		try {
			accessSync(fileName, fs.F_OK);
			const content = readFileSync(fileName);
			this.dotenvContent = dotenv.parse(content);
		} catch (err) {
			this.dotenvContent = {};
		}
	}

	/**
	 *
	 * @param node
	 * @return {boolean}
	 */
	nodeExists(node: string) {
		return this.dotenvContent[node] !== undefined;
	}

	/**
	 *
	 * @param node
	 * @param defaultValue
	 * @return {undefined|*}
	 */
	getNodeValue(node: string, defaultValue = undefined) {
		if (!this.nodeExists(node) && defaultValue !== undefined)
			return defaultValue;
		return this.dotenvContent[node];
	}

	/**
	 *
	 * @return {*}
	 */
	get FileName() {
		return this.fileName;
	}

	/**
	 *
	 * @param node
	 * @param value
	 */
	setNodeValue(node: string, value: any) {
		this.dotenvContent[node] = value;
	}

	/**
	 *
	 * @param data
	 */
	write(data: any) {
		return writeFile(this.fileName, data);
	}

	/**
	 *
	 * @param data
	 */
	writeSync(data: any) {
		writeFileSync(this.fileName, data);
	}

	/**
	 *
	 * @param line_separator
	 */
	save(separator = "\n") {
		return writeFile(this.fileName, this.produceContent(separator));
	}

	/**
	 *
	 * @param line_separator
	 */
	saveSync(separator?: string) {
		writeFileSync(this.fileName, this.produceContent(separator));
	}

	private produceContent(separator = "\n") {
		return Object.entries(this.dotenvContent)
			.map((entry) => `${entry[0]}=${entry[1]}`)
			.join(separator);
	}
}
