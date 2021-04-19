import { getRoutes } from "@triptyk/nfw-core";
import { join } from "path";
import { BaseCommand } from "./template";

export class ListCommand extends BaseCommand {
    public command: string = "list <kind>";
    public aliases: string[] = ["ls"];
    public describe: string = "List all objects of a given kind.";

    public async handler(argv: any) {
        const kinds = ["routes", "prefixes"];

        argv.kind = argv.kind.toLowerCase();

        if(!kinds.includes(argv.kind))
            throw `Unvalid kind. List of valid ones: ${kinds}`;
        
        console.log(
            (await getRoutes()).map(v => {
                let res = v[argv.kind];
                switch(argv.kind) {
                    case "routes":
                        res = res
                            .map(r => `[${r.requestMethod}] ${join(v.prefix, r.path)}`)
                            .join('\n');
                        return `\n${v.prefix}:\n${res}`;
                    case "prefixes":
                        return v.prefix;
                    default:
                        return "";
                }
            }).join('\n')
        );
    }
}