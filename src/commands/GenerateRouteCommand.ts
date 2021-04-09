import { generateBasicRoute, save } from "@triptyk/nfw-core";
import { Logger as Log, methodList } from "../utils";
import { BaseCommand } from "./template";

export class GenerateRouteCommand extends BaseCommand {
    public command: string | string[] = "generate-route <prefix> [methods..]";
    public aliases = ["genroute"];
    public describe = "Generate a basic route.";

    public builder = {
        all: {
            desc: "Generate a route for each of all methods.",
            type: "boolean",
            default: false
        }
    }

    public async handler(argv: any) {
        argv.methods = argv.methods.map(v => v.toUpperCase());

        if(argv.all)
            argv.methods = methodList;
        
        if(argv.methods.find(v => !methodList.includes(v)))
            throw `One of the methods is not valid, methods must be in these values: ${methodList}`;
        
        if(!argv.methods.length)
            argv.methods = null;

        await generateBasicRoute(argv.prefix, argv.methods)
        await save();
        
        Log.success(`Route /${argv.prefix} created !`);
    }
}
