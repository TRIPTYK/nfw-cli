import { BaseCommand } from "./template";

export class NewCommand extends BaseCommand {
    public command = "new <name>";
    public describe = "Creates a new project.";
    public aliases = ["n"];
    
    builder = (yargs): any => {
        yargs.option('default', {
            desc: "Generate a project with default env variables",
            type: "boolean",
            default: false
        });
    };

    async handler (argv: any) {
        console.log(argv);
        
    }
}