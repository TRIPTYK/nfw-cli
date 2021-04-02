import { BaseCommand } from "./template";
import * as fs from "fs";
import * as inquirer from "inquirer";
import { EnvFileWriter } from "../utils/env-file-rw";
import { strRandom } from "../utils/strRandom";
import { Logger as log } from "../utils/log";
import { join, resolve } from "path";
import * as mysql from "mysql2/promise";
import { execSync } from "child_process";

export class InitCommand extends BaseCommand {
	public command = "init";
	public describe = "Initiation of environment variables and the database.";
	public aliases = ["ini"];

	public builder = {
		...this.builder,
        noInitDb : {
            desc: "Prohibits the initiation of the database.",
            type: "boolean",
            default: false
        }
    };

	async handler(argv: any) {

		const path: string = argv.path ?? process.cwd();
		const infos: {[key: string]: any} = {};
		let connection: mysql.Connection = null;

		try {
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

			await inquirer.prompt(questions).then(async (answer) => {
				for (const key in answer) {
					rw.setNodeValue(key, answer[key]);
					infos[key] = answer[key];
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
			log.success("Initiation done !");

			//Initiation of DB
			if(argv.noCreateDb) {
				connection = await mysql.createConnection({
					host: infos.TYPEORM_HOST,
					user: infos.TYPEORM_USER,
					password: infos.TYPEORM_PWD,
				});
				
				await connection.query(`CREATE DATABASE ${infos.TYPEORM_DB};`);
				log.success(`Database "${infos.TYPEORM_DB}" created successfully !`);

				log.loading("Creation of tables in the database... 📝");
				execSync(`cd ${path} && ./node_modules/.bin/ts-node ./node_modules/typeorm/cli.js schema:sync`);
				log.success(`Tables of "${infos.TYPEORM_DB}" created successfully !`);
			}

		} catch (error) {
			log.error("Something went wrong, here's a glimpse of the error:\n"+error);
		} finally {
			if(connection) await connection.end();
		}
	}
}
