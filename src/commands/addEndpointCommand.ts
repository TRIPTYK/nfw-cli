import { addEndpoint } from "@triptyk/nfw-core";
import { Logger as Log, methodList } from "../utils";
import { BaseCommand } from "./template";

export class AddEndpointCommand extends BaseCommand {
    public command: string | string[] = "add-endpoint <prefix> <endpoint> <method>";
    public aliases = ["adend"]
    public describe = "Add an endpoint to a specific route."

    public async handler(argv: any) {

        argv.method = argv.method.toUpperCase();

        if(!methodList.includes(argv.method))
            throw `The method "${argv.method}" is not valid, it must be one of these values: ${methodList}`;

        await addEndpoint(argv.prefix, argv.method, argv.endpoint);

        Log.success(`Endpoint /${argv.prefix}/${argv.endpoint} created !`);
    }
}