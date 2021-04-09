const { readdirSync, writeFileSync } = require("fs");
const { join } = require("path");
const { CommandsRegistry } = require("../dist/application/CommandsRegistry");
const md = require("md-writer");

const commands = readdirSync(join(process.cwd(), "./dist/commands"))
    .filter((command) => command.match(/.+\.js/gm) && command !== "index.js")
    .map((command) => command.replace(/\.js/gm, ''));

CommandsRegistry.init();

for (const command of commands) {
    const current = CommandsRegistry.all[command];

    let content = `
        # ${command}

        ${current.describe}

        ## Usage:
        ${md.fencedCodeBlock(current.command)}

        ## Aliases:
        ${current.aliases.join(', ')}.
    `;

    if(Object.keys(current.builder).length) {
        content += "## Options";
        for (const key in current.builder) {
            content += `
                ### ${key}
                - Description: ${current.builder[key].desc}
                - Default: ${current.builder[key].default || "empty"}
            `
        }
    }
    
    content = content.replace(/^\s*/gm, '');
    
    writeFileSync(
        join(process.cwd(), "docs", command.replace(/Command/gm, ".md")), 
        content
    );
}
