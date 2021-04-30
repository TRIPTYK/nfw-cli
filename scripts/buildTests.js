const { writeFileSync, readdirSync, readFileSync, existsSync } = require("fs");
const { join } = require("path");

try {
	const commands = readdirSync(join(process.cwd(), "./dist/commands"))
		.filter((command) => command.match(/.+\.js/gm) && command !== "index.js")
		.map((command) => command.replace(/\.js/gm, ""));

	for (const key in commands) {
		const command = commands[key];
		const testPath = join(process.cwd(), "src/test");
		const index = parseInt(key)+1;
		if(index<10) 
			index = "0"+index;
		const file = join(testPath, `${index}_${command}.test.ts`);

		let content = 'import { execInProject as exec } from "./global";\n\n';
		content += `describe("${command}", function() {\n`;
		content += `\t//Your test here :)\n`;
		content += `});`;

		
		if (!existsSync(file) && !readdirSync(testPath).some(v => v.includes(command)))
			writeFileSync(file, content);
	}
} catch (error) {
	console.log(error.message);
}
