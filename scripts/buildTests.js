const { writeFileSync, readdirSync, readFileSync, existsSync } = require("fs");
const { join } = require("path");

try {
	const commands = readdirSync(join(process.cwd(), "./dist/commands"))
		.filter((command) => command.match(/.+\.js/gm) && command !== "index.js")
		.map((command) => command.replace(/\.js/gm, ""));

	for (const command of commands) {
		const testPath = join(process.cwd(), "src/test", `${command}.test.ts`);
		let content = 'import * as global from "./global"\n\n';
		content += `describe("${command}", function() {\n`;
		content += `\tbefore(global.createSimpleProject);\n`;
		content += `\t//Your test here :)\n`;
		content += `\tafter(global.cleanProject);\n`;
		content += `});`;

		if (!existsSync(testPath)) {
			writeFileSync(testPath, content);
		}
	}
} catch (error) {
	console.log(error.message);
}
