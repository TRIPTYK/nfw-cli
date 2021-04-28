const { writeFileSync, readdirSync, readFileSync, existsSync } = require("fs");
const { join } = require("path");

try {

    const commands = readdirSync(join(process.cwd(), "./dist/commands"))
        .filter((command) => command.match(/.+\.js/gm) && command !== "index.js")
        .map((command) => command.replace(/\.js/gm, ''));

    for (const command of commands) {
        const testPath = join(process.cwd(), "src/test", `${command}.test.ts`);

        if(!existsSync(testPath)) {
            writeFileSync(
                testPath,
                `describe("${command}", function() {\n\t//your tests here :)\n});`
            );
        }
    }
} catch (error) {
    console.log(error.message);
}