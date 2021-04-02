import { BaseCommand } from "./template";
import * as fs from "fs";
import * as inquirer from "inquirer";
import { EnvFileWriter } from "../utils/env-file-rw";
import { strRandom } from "../utils/strRandom";
import { Logger as log } from "../utils/log";
import { join, resolve } from "path";

export class InitCommand extends BaseCommand {
	public command = "init";
	public aliases = ["ini"];

	async handler(argv: any) {
		try {
			const path = argv.path ?? process.cwd();

			// select only development.env files
			const envFile = fs
				.readdirSync(path)
				.find((file) => file.includes("development.env"));

			if (!envFile) throw "No development.env file has been found.";

			const rw = new EnvFileWriter(join(path, envFile));

			log.warning("You are editing the development.env file");

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
		} catch (error) {
			log.error(
				"Something went wrong, here's a glimpse of the error:\n" + error
			);
		}
	}
}
