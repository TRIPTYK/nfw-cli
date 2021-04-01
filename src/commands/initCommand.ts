import { BaseCommand } from "./template";
import * as fs from "fs";
import * as inquirer from "inquirer";
import * as chalk from "chalk";
import { EnvFileWriter } from "../utils/env-file-rw";
import { strRandom } from "../utils/strRandom";
import { Logger as log } from "../utils/log";

export class InitCommand extends BaseCommand {
	public command = "init";
	public aliases = ["ini"];

	async handler(argv: any) {
		let files = fs.readdirSync("./");

		// select only development.env files
		let envFiles = files
			.filter((file) => file.includes("development.env"))
			.join();

		const rw = new EnvFileWriter(envFiles);

		log.info("You are editing the development.env file");

		const arrayOfQuestions = {
			TYPEORM_HOST: "host name",
			TYPEORM_DB: "database name",
			TYPEORM_USER: "user name",
			TYPEORM_PWD: "password",
			TYPEORM_PORT: "port number",
			TYPEORM_SYNCHRONIZE: "synchronize",
			TYPEORM_LOGGING: "logging",
		};
		const questions = [];

		for (const key in arrayOfQuestions) {
			if (key === "TYPEORM_SYNCHRONIZE" || key === "TYPEORM_LOGGING") {
				questions.push({
					name: key,
					type: "confirm",
					message: `Do you want to enable ${arrayOfQuestions[key]}`,
					default: rw.getNodeValue(key),
				});
			} else {
				questions.push({
					name: key,
					type: "input",
					message: `Insert a value for the ${arrayOfQuestions[key]}`,
					default: rw.getNodeValue(key),
				});
			}
		}

		inquirer.prompt(questions).then((answer) => {
			for (const key in answer) {
				rw.setNodeValue(key, answer[key]);
			}
			rw.setNodeValue(
				"JWT_SECRET",
				strRandom({
					includeUpperCase: true,
					includeNumbers: true,
					length: 80,
					startsWithLowerCase: true,
				})
			);
			rw.setNodeValue(
				"OAUTH_SALT",
				strRandom({
					includeUpperCase: true,
					includeNumbers: true,
					length: 32,
					startsWithLowerCase: true,
				})
			);
			rw.save();
		});
	}
}
