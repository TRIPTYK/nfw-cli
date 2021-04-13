const { readdirSync, writeFileSync } = require("fs");
const { join } = require("path");
const { CommandsRegistry } = require("../dist/application/CommandsRegistry");
const md = require("md-writer");
const chalk = require("chalk");

const commands = readdirSync(join(process.cwd(), "./dist/commands"))
    .filter((command) => command.match(/.+\.js/gm) && command !== "index.js")
    .map((command) => command.replace(/\.js/gm, ''));

CommandsRegistry.init();

for (const command of commands) {
    const current = CommandsRegistry.all[command];
    const example = `nfw ${current.command}`;

    let content = `
        # ${command.replace(/Command/gm, '')}

        ${current.describe}

        ## Usage:
        ${md.fencedShCodeBlock(example)}

        ## Alias(es):
        ${current.aliases.join(', ')}
    `;

    if(Object.keys(current.builder).length) {
        content += "## Options";
        for (const key in current.builder) {
            content += `
                ### --${key}
                - Description: ${current.builder[key].desc}
                - Type: ${current.builder[key].type}
            `;
            content += "- Default: ";
            if(current.builder[key].type === "boolean")
                content += current.builder[key].default || "false";
            else
                content += current.builder[key].default || "none";
        
            content += '\n- Example:\n' + md.fencedShCodeBlock(
                `${example} --${key} ${(current.builder[key].type === "boolean")? "" : `<${key}>`}`
            );
        }
    }
    
    content = content.replace(/^\s*/gm, '');
    
    writeFileSync(
        join(process.cwd(), "docs", command.replace(/Command/gm, ".md")), 
        content
    );
    console.log(chalk.green(`success: Doc of ${command} built.`));
}
