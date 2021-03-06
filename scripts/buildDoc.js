const { readdirSync, writeFileSync } = require("fs");
const { join } = require("path");
const { CommandsRegistry } = require("../dist/application/CommandsRegistry");
const md = require("md-writer");
const chalk = require("chalk");
const { execSync } = require("child_process");

try {
    const docPath = join(process.cwd(), "docs");
    const commands = readdirSync(join(process.cwd(), "./dist/commands"))
        .filter((command) => command.match(/.+\.js/gm) && command !== "index.js")
        .map((command) => command.replace(/\.js/gm, ''));

    for (const command of commands) {
        const current = CommandsRegistry.all[command];
        const example = `nfw ${current.command}`;

        let content = `
            # ${command.replace(/Command/gm, '')}

            ${current.describe}

        `;

        if(current.note) {
            content += `
               > ${current.note} 
               
            `;
        }
            
        content += `
            ## Usage:
            ${md.fencedShCodeBlock(example)}

            ## Alias(es):
            ${current.aliases.join(', ')}
        `;

        if(Object.keys(current.builder).length) {
            content += "## Options";
            for (const key in current.builder) {
                let option = `--${key}`;
                content += `
                    ### ${option}
                    - Description: ${current.builder[key].desc}
                    - Type: ${current.builder[key].type}
                `;
                if(current.builder[key].alias) {
                    content += `- Alias: -${current.builder[key].alias}\n`;
                    option += ` / -${current.builder[key].alias}`;
                }
                    
                content += "- Default: ";

                const defaultVal = (current.builder[key].type === "boolean")? "false" : "*none*";
                
                content += current.builder[key].default || defaultVal;
            
                content += '\n- Example:\n' + md.fencedShCodeBlock(
                    `${example} ${option} ${(current.builder[key].type === "boolean")? "" : `<value for ${key}>`}`
                );
            }
        }
        
        content = content.replace(/^\s*/gm, '');
        
        writeFileSync(
            join(docPath, command.replace(/Command/gm, ".md")), 
            content
        );
    }
    const readme = execSync("nfw --help");
    writeFileSync(
        join(docPath, "README.md"),
        md.fencedShCodeBlock(readme)
    );
    console.log(chalk.green(`Success: Doc built.`));
} catch (error) {
    console.log(error);
}
